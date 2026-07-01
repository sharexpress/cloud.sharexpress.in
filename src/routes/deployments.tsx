import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { deployments } from "@/lib/mock";
import { GitBranch, Rocket } from "lucide-react";

export const Route = createFileRoute("/deployments")({
  head: () => ({ meta: [{ title: "Deployments — Nimbus" }] }),
  component: DeploymentsPage,
});

function DeploymentsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Deployments" }]}>
      <PageShell>
        <PageHeader
          title="Deployments"
          description="Every build, across every project."
          actions={
            <>
              <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">All projects</button>
              <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">Last 7 days</button>
            </>
          }
        />

        <Panel padded={false}>
          <div className="grid grid-cols-[minmax(0,3fr)_1fr_1fr_120px_120px_100px] gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Commit</div>
            <div>Project</div>
            <div>Branch</div>
            <div>Author</div>
            <div>Duration</div>
            <div className="text-right">Status</div>
          </div>
          <ul className="divide-y divide-border">
            {deployments.map((d) => (
              <li key={d.id} className="grid grid-cols-[minmax(0,3fr)_1fr_1fr_120px_120px_100px] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    <Rocket className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{d.message}</span>
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{d.commit}</span>
                      {d.environment === "production" && (
                        <span className="rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">Production</span>
                      )}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{d.url} · {d.createdAt}</div>
                  </div>
                </div>
                <div className="min-w-0 truncate text-[12px] text-foreground">{d.project}</div>
                <div className="flex min-w-0 items-center gap-1 truncate text-[12px] text-muted-foreground">
                  <GitBranch className="h-3 w-3" />
                  <span className="truncate">{d.branch}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2 truncate">
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/15 text-[9px] font-semibold text-accent">{d.authorAvatar}</div>
                  <span className="truncate text-[12px] text-muted-foreground">{d.author}</span>
                </div>
                <div className="text-[12px] text-muted-foreground">{d.duration}</div>
                <div className="flex justify-end"><StatusBadge status={d.status} /></div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
