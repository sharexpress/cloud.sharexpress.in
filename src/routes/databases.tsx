import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { databases } from "@/lib/mock";
import { Copy, Database } from "lucide-react";

export const Route = createFileRoute("/databases")({
  head: () => ({ meta: [{ title: "Databases — Nimbus" }] }),
  component: DatabasesPage,
});

function DatabasesPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Databases" }]}>
      <PageShell>
        <PageHeader
          title="Databases"
          description="Managed PostgreSQL, Redis, MongoDB, and MySQL clusters."
          actions={<button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">New database</button>}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {databases.map((db) => (
            <div key={db.id} className="rounded-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">{db.name}</div>
                    <div className="text-[11px] text-muted-foreground">{db.engine} · {db.region}</div>
                  </div>
                </div>
                <StatusBadge status={db.status} />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                <div>
                  <div className="text-[11px] text-muted-foreground">Size</div>
                  <div className="mt-0.5 font-semibold text-foreground">{db.size}</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">CPU</div>
                  <div className="mt-0.5 font-semibold text-foreground">{db.cpu}%</div>
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Storage</div>
                  <div className="mt-0.5 font-semibold text-foreground">{db.storage}%</div>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-border bg-background px-3 py-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Connection string</div>
                    <div className="truncate font-mono text-[11.5px] text-foreground">postgres://user:••••@{db.name}.acme.db:5432/prod</div>
                  </div>
                  <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span>Last backup <span className="text-foreground">6h ago</span></span>
                <div className="flex items-center gap-2">
                  <button className="h-7 rounded border border-border bg-background px-2.5 text-[11px] hover:border-border-strong">Metrics</button>
                  <button className="h-7 rounded border border-border bg-background px-2.5 text-[11px] hover:border-border-strong">Backups</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    </AppShell>
  );
}
