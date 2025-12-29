import os
import socket
import time
from datetime import datetime, timezone

import requests


def read_offset(path: str) -> int:
    try:
        with open(path, "r", encoding="ascii") as handle:
            return int(handle.read().strip())
    except (FileNotFoundError, ValueError):
        return 0


def write_offset(path: str, offset: int) -> None:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="ascii") as handle:
        handle.write(str(offset))


def ship_logs():
    backend_url = os.getenv("BACKEND_URL", "http://localhost:8000").rstrip("/")
    log_path = os.getenv("LOG_PATH", "/var/log/syslog")
    state_path = os.getenv("STATE_PATH", "/var/lib/monitoring/log-offset.state")
    hostname = os.getenv("HOSTNAME", socket.gethostname())
    source = os.getenv("LOG_SOURCE", "syslog")
    level = os.getenv("LOG_LEVEL", "info")
    batch_size = int(os.getenv("BATCH_SIZE", "50"))
    poll_seconds = float(os.getenv("POLL_SECONDS", "2"))

    offset = read_offset(state_path)

    while True:
        if not os.path.exists(log_path):
            time.sleep(poll_seconds)
            continue

        with open(log_path, "r", encoding="utf-8", errors="ignore") as handle:
            handle.seek(offset)
            lines = handle.readlines()
            offset = handle.tell()

        if lines:
            now = datetime.now(timezone.utc).isoformat()
            payload = [
                {
                    "hostname": hostname,
                    "source": source,
                    "level": level,
                    "message": line.strip(),
                    "timestamp": now,
                }
                for line in lines if line.strip()
            ]

            if payload:
                response = requests.post(f"{backend_url}/ingest", json=payload, timeout=10)
                response.raise_for_status()
                write_offset(state_path, offset)

        time.sleep(poll_seconds)


if __name__ == "__main__":
    ship_logs()
