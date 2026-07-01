import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { domains } from "@/lib/mock";
import { Globe, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/domains")({
  head: () => ({ meta: [{ title: "Domains — Nimbus" }] }),
  component: DomainsPage,
});

function DomainsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Domains" }]}>
      <PageShell>
        <PageHeader
          title="Domains"
          description="DNS, TLS certificates, and redirects — managed for you."
          actions={<button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">Add domain</button>}
        />
        <Panel padded={false}>
          <ul className="divide-y divide-border">
            {domains.map((d) => (
              <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-medium text-foreground">{d.host}</div>
                    <div className="truncate text-[11.5px] text-muted-foreground">{d.project} · CNAME to edge.nimbus.app</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> SSL {d.ssl}
                  </span>
                  <span className="hidden md:inline text-[11px] text-muted-foreground">Expires {d.expires}</span>
                  <StatusBadge status={d.status} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
