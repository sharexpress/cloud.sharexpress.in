import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { logLines } from "@/lib/mock";
import { Pause, Play, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/logs")({
  head: () => ({ meta: [{ title: "Logs — Nimbus" }] }),
  component: LogsPage,
});

const levelStyle: Record<string, string> = {
  info: "text-muted-foreground",
  warn: "text-warning",
  error: "text-destructive",
  debug: "text-info",
};

function LogsPage() {
  const [streaming, setStreaming] = useState(true);
  const [q, setQ] = useState("");
  const filtered = logLines.filter((l) => (l.msg + l.svc).toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Logs" }]}>
      <PageShell>
        <PageHeader
          title="Logs"
          description="Real-time streaming logs across all services."
          actions={
            <button
              onClick={() => setStreaming((s) => !s)}
              className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium ${streaming ? "bg-success/15 text-success" : "border border-border bg-surface text-foreground"}`}
            >
              {streaming ? <><Pause className="h-3.5 w-3.5" /> Streaming</> : <><Play className="h-3.5 w-3.5" /> Paused</>}
            </button>
          }
        />

        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search logs (e.g. status:500 svc:api-core)'
              className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none" />
          </div>
          <select className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground">
            <option>All services</option><option>web-edge</option><option>api-core</option><option>workers-images</option>
          </select>
          <select className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground">
            <option>All levels</option><option>info</option><option>warn</option><option>error</option>
          </select>
          <select className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground">
            <option>Last 15m</option><option>Last 1h</option><option>Last 24h</option>
          </select>
        </div>

        <Panel padded={false} className="overflow-hidden">
          <div className="max-h-[560px] overflow-auto bg-background font-mono text-[12px]">
            {filtered.map((l, i) => (
              <div key={i} className="grid grid-cols-[110px_60px_120px_1fr] gap-3 border-b border-border/40 px-4 py-1.5 hover:bg-surface-elevated/40">
                <span className="text-muted-foreground/70">{l.t}</span>
                <span className={`uppercase ${levelStyle[l.level]}`}>{l.level}</span>
                <span className="text-accent">{l.svc}</span>
                <span className="text-foreground">{l.msg}</span>
              </div>
            ))}
          </div>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
