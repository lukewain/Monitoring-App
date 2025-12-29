import type { LogEntry } from "@/types";

export async function fetchLogs(): Promise<LogEntry[]> {
  const baseUrl = process.env.BACKEND_URL || "http://localhost:8000";
  const response = await fetch(`${baseUrl}/logs?limit=200`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Failed to load logs");
  }

  return response.json();
}
