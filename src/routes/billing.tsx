import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, AreaChart } from "@/components/app/primitives";
import { invoices, metricSeries } from "@/lib/mock";
import { CreditCard, Download } from "lucide-react";

export const Route = createFileRoute("/billing")({
  head: () => ({ meta: [{ title: "Billing — Nimbus" }] }),
  component: BillingPage,
});

const breakdown = [
  { label: "Compute", amount: "$1,842.20", pct: 38 },
  { label: "Bandwidth", amount: "$942.10", pct: 20 },
  { label: "Storage", amount: "$612.44", pct: 13 },
  { label: "Databases", amount: "$742.10", pct: 15 },
  { label: "Functions", amount: "$310.80", pct: 6 },
  { label: "Add-ons", amount: "$362.80", pct: 8 },
];

function BillingPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Billing" }]}>
      <PageShell>
        <PageHeader
          title="Billing"
          description="Enterprise plan · billed monthly."
          actions={<button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">Manage plan</button>}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Current month" value="$4,812" hint="Jun 2026 · projected" delta={{ value: "+9.1%", positive: false }} />
          <Metric label="Last month" value="$4,412" hint="May 2026" />
          <Metric label="Annual run rate" value="$52.8k" hint="based on trailing 3 months" />
          <Metric label="Payment method" value="•••• 4242" hint="Visa · exp 09/28" icon={<CreditCard className="h-3.5 w-3.5" />} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Usage · month to date" className="lg:col-span-2"><AreaChart data={metricSeries(81, 48, 60, 60)} /></Panel>
          <Panel title="Cost breakdown">
            <div className="space-y-3">
              {breakdown.map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground">{b.label}</span>
                    <span className="text-muted-foreground tabular-nums">{b.amount}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${b.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Invoices" className="mt-6" padded={false}>
          <ul className="divide-y divide-border">
            {invoices.map((inv) => (
              <li key={inv.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">Invoice · {inv.period}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{inv.id} · issued {inv.issued}</div>
                </div>
                <span className="text-[13px] font-medium text-foreground tabular-nums">{inv.amount}</span>
                <span className="rounded-full border border-success/25 bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success capitalize">{inv.status}</span>
                <button className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"><Download className="h-3.5 w-3.5" /></button>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
