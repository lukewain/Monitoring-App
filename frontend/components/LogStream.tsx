"use client";

import { useEffect, useMemo, useState } from "react";
import type { LogEntry } from "@/types";

type LogStreamProps = {
  initialLogs: LogEntry[];
  initialError: string;
};

const POLL_INTERVAL_MS = 5000;

export function LogStream({ initialLogs, initialError }: LogStreamProps) {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [loadError, setLoadError] = useState(initialError);
  const [liveEnabled, setLiveEnabled] = useState(true);
  const [levelFilter, setLevelFilter] = useState("all");

  const levels = useMemo(() => {
    const unique = new Set(logs.map((log) => log.level));
    return Array.from(unique).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (levelFilter === "all") {
      return logs;
    }
    return logs.filter((log) => log.level === levelFilter);
  }, [logs, levelFilter]);

  useEffect(() => {
    if (!liveEnabled) {
      return;
    }

    let canceled = false;

    const fetchLatest = async () => {
      try {
        const response = await fetch("/api/logs", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load logs.");
        }
        const data = (await response.json()) as LogEntry[];
        if (!canceled) {
          setLogs(data);
          setLoadError("");
        }
      } catch (error) {
        if (!canceled) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load logs."
          );
        }
      }
    };

    fetchLatest();
    const timer = setInterval(fetchLatest, POLL_INTERVAL_MS);

    return () => {
      canceled = true;
      clearInterval(timer);
    };
  }, [liveEnabled]);

  return (
    <>
      <div className="controls">
        <div className="filter-group">
          <span className="filter-label">Level</span>
          <div className="filter-pills">
            <button
              type="button"
              className={levelFilter === "all" ? "pill is-active" : "pill"}
              onClick={() => setLevelFilter("all")}
            >
              All
            </button>
            {levels.map((level) => (
              <button
                key={level}
                type="button"
                className={levelFilter === level ? "pill is-active" : "pill"}
                onClick={() => setLevelFilter(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          className={liveEnabled ? "toggle is-on" : "toggle"}
          onClick={() => setLiveEnabled((prev) => !prev)}
        >
          {liveEnabled ? "Live on" : "Live off"}
        </button>
      </div>

      <section className="grid">
        {loadError ? (
          <p className="empty">
            Unable to load logs right now. Check that the connector and backend
            are reachable.
          </p>
        ) : filteredLogs.length === 0 ? (
          <p className="empty">No logs match the selected filter.</p>
        ) : (
          filteredLogs.map((log) => (
            <article key={log.id} className="log-card">
              <div className="log-header">
                <span className="badge">{log.level}</span>
                <span className="hostname">{log.hostname}</span>
                <span className="source">{log.source}</span>
                <time dateTime={log.timestamp}>
                  {new Date(log.timestamp).toLocaleString()}
                </time>
              </div>
              <p className="message">{log.message}</p>
            </article>
          ))
        )}
      </section>
    </>
  );
}
