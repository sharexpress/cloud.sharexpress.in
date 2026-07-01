import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { secrets } from "@/lib/mock";
import { Eye, KeyRound } from "lucide-react";

export const Route = createFileRoute("/secrets")({
  head: () => ({ meta: [{ title: "Secrets — Nimbus" }] }),
  component: SecretsPage,
});

function SecretsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Secrets" }]}>
      <PageShell>
        <PageHeader
          title="Secrets"
          description="Encrypted environment variables shared across projects."
          actions={
            <>
              <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">Import</button>
              <button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">New secret</button>
            </>
          }
        />
        <Panel padded={false}>
          <ul className="divide-y divide-border">
            {secrets.map((s) => (
              <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    <KeyRound className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-mono text-[12.5px] text-foreground">{s.key}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{s.scope} · updated {s.updated}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10.5px] text-muted-foreground">{s.environment}</span>
                  <button className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"><Eye className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
