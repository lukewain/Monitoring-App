import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchLogs } from "@/lib/api";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";
import type { LogEntry } from "@/types";
import { LogStream } from "@/components/LogStream";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <main className="page">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Centralized telemetry</p>
            <h1>Monitor your Ubuntu fleet in one place.</h1>
            <p className="lead">
              Stream logs into a local Postgres core and surface insights in a
              focused dashboard.
            </p>
            <SignInButton />
          </div>
          <div className="hero-panel">
            <div className="stat">
              <span>Hosts</span>
              <strong>Live</strong>
            </div>
            <div className="stat">
              <span>Ingest</span>
              <strong>FastAPI</strong>
            </div>
            <div className="stat">
              <span>Store</span>
              <strong>Postgres</strong>
            </div>
          </div>
        </section>
      </main>
    );
  }

  let logs: LogEntry[] = [];
  let loadError = "";

  try {
    logs = await fetchLogs();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Failed to load logs.";
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Monitoring dashboard</p>
          <h1>Log stream</h1>
        </div>
        <div className="topbar-actions">
          <span className="user-pill">{session.user?.email}</span>
          <SignOutButton />
        </div>
      </header>
      <LogStream initialLogs={logs} initialError={loadError} />
    </main>
  );
}
