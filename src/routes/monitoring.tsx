import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, AreaChart } from "@/components/app/primitives";
import { metricSeries } from "@/lib/mock";
import { AlertTriangle, Activity as ActivityIcon } from "lucide-react";

export const Route = createFileRoute("/monitoring")({
  head: () => ({ meta: [{ title: "Monitoring — Nimbus" }] }),
  component: MonitoringPage,
});

const incidents = [
  { id: "INC-244", title: "Elevated p95 latency in fra1", severity: "warning", status: "monitoring", opened: "18m ago" },
  { id: "INC-243", title: "Object storage 5xx spike", severity: "critical", status: "resolved", opened: "2d ago" },
  { id: "INC-242", title: "Auth JWKs cache miss", severity: "info", status: "resolved", opened: "5d ago" },
];

function MonitoringPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Monitoring" }]}>
      <PageShell>
        <PageHeader
          title="Monitoring"
          description="Health, performance, and alerts across every service."
          actions={<button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">Configure alerts</button>}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Uptime · 30d" value="99.982%" hint="SLA 99.95%" series={metricSeries(61)} icon={<ActivityIcon className="h-3.5 w-3.5" />} />
          <Metric label="Requests" value="42.1M" hint="24h" delta={{ value: "+8.4%", positive: true }} series={metricSeries(62)} />
          <Metric label="Errors" value="1,842" hint="0.04%" delta={{ value: "-12%", positive: true }} series={metricSeries(63)} />
          <Metric label="Alerts" value="2" hint="1 active" series={metricSeries(64)} icon={<AlertTriangle className="h-3.5 w-3.5" />} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="p95 latency" description="ms · 24h"><AreaChart data={metricSeries(71, 48, 80, 50)} /></Panel>
          <Panel title="Error rate" description="% · 24h"><AreaChart data={metricSeries(72, 48, 20, 30)} /></Panel>
          <Panel title="CPU · fleet-wide" description="% · 24h"><AreaChart data={metricSeries(73, 48, 40, 40)} /></Panel>
          <Panel title="Bandwidth" description="MB/s · 24h"><AreaChart data={metricSeries(74, 48, 60, 70)} /></Panel>
        </div>

        <Panel title="Incidents" className="mt-6" padded={false}>
          <ul className="divide-y divide-border">
            {incidents.map((i) => (
              <li key={i.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                <span className={`h-2 w-2 rounded-full ${i.severity === "critical" ? "bg-destructive" : i.severity === "warning" ? "bg-warning" : "bg-info"}`} />
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{i.title}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{i.id} · opened {i.opened}</div>
                </div>
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] capitalize text-muted-foreground">{i.status}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
