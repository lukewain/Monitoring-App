import os
from datetime import datetime, timezone
from typing import List, Union

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from db import SessionLocal, engine
from models import Base, LogEntry
from schemas import LogEntryIn, LogEntryOut


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Monitoring Log API")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","
    )
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/ingest", response_model=List[LogEntryOut])
async def ingest_logs(
    payload: Union[List[LogEntryIn], LogEntryIn],
    db: Session = Depends(get_db),
):
    if isinstance(payload, LogEntryIn):
        entries = [payload]
    else:
        entries = payload

    if not entries:
        raise HTTPException(status_code=400, detail="No log entries provided")

    now = datetime.now(timezone.utc)
    db_entries = []
    for entry in entries:
        db_entry = LogEntry(
            hostname=entry.hostname,
            source=entry.source,
            message=entry.message,
            level=entry.level or "info",
            timestamp=entry.timestamp or now,
        )
        db_entries.append(db_entry)

    db.add_all(db_entries)
    db.commit()
    for item in db_entries:
        db.refresh(item)

    return db_entries


@app.get("/logs", response_model=List[LogEntryOut])
async def list_logs(
    limit: int = 200,
    offset: int = 0,
    hostname: str | None = None,
    source: str | None = None,
    db: Session = Depends(get_db),
):
    stmt = select(LogEntry)
    if hostname:
        stmt = stmt.where(LogEntry.hostname == hostname)
    if source:
        stmt = stmt.where(LogEntry.source == source)

    stmt = stmt.order_by(LogEntry.timestamp.desc()).limit(limit).offset(offset)
    results = db.execute(stmt).scalars().all()
    return results