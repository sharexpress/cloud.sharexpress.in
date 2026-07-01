import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { functions } from "@/lib/mock";
import { Zap } from "lucide-react";

export const Route = createFileRoute("/functions")({
  head: () => ({ meta: [{ title: "Functions — Nimbus" }] }),
  component: FunctionsPage,
});

function FunctionsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Functions" }]}>
      <PageShell>
        <PageHeader
          title="Serverless functions"
          description="Event-driven functions with global edge distribution."
          actions={<button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">New function</button>}
        />
        <Panel padded={false}>
          <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Name</div><div>Runtime</div><div>Trigger</div><div>Invocations</div><div>Errors</div><div>p95</div>
          </div>
          <ul className="divide-y divide-border">
            {functions.map((f) => (
              <li key={f.id} className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-accent">
                    <Zap className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{f.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">cold start · avg 12ms</div>
                  </div>
                </div>
                <div className="text-[12px] text-muted-foreground">{f.runtime}</div>
                <div className="text-[12px] text-muted-foreground">{f.trigger}</div>
                <div className="text-[12px] text-foreground tabular-nums">{f.invocations}</div>
                <div className="text-[12px] text-foreground tabular-nums">{f.errors}</div>
                <div className="text-[12px] text-foreground tabular-nums">{f.p95}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
