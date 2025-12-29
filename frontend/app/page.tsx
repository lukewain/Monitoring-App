import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchLogs } from "@/lib/api";
import { SignInButton } from "@/components/SignInButton";
import { SignOutButton } from "@/components/SignOutButton";

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

  const logs = await fetchLogs();

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
      <section className="grid">
        {logs.length === 0 ? (
          <p className="empty">No logs yet. Start the connector to ingest.</p>
        ) : (
          logs.map((log) => (
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
    </main>
  );
}
