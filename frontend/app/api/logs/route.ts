import { NextResponse } from "next/server";
import { fetchLogs } from "@/lib/api";

export async function GET() {
  try {
    const logs = await fetchLogs();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load logs.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
