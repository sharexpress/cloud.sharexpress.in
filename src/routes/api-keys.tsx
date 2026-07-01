import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { apiKeys } from "@/lib/mock";
import { KeyRound, RefreshCw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/api-keys")({
  head: () => ({ meta: [{ title: "API Keys — Nimbus" }] }),
  component: ApiKeysPage,
});

function ApiKeysPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "API Keys" }]}>
      <PageShell>
        <PageHeader
          title="API Keys"
          description="Programmatic access to the Nimbus API and CLI."
          actions={<button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">Generate key</button>}
        />

        <Panel padded={false}>
          <ul className="divide-y divide-border">
            {apiKeys.map((k) => (
              <li key={k.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{k.name}</div>
                    <div className="truncate font-mono text-[11.5px] text-muted-foreground">{k.prefix}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden md:inline text-[11px] text-muted-foreground">{k.scope}</span>
                  <span className="hidden md:inline text-[11px] text-muted-foreground">used {k.lastUsed}</span>
                  <button className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"><RefreshCw className="h-3.5 w-3.5" /></button>
                  <button className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
