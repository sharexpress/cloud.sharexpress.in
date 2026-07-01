import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge, Metric } from "@/components/app/primitives";
import { compute, metricSeries } from "@/lib/mock";
import { Cpu, MemoryStick, RefreshCw, Server } from "lucide-react";

export const Route = createFileRoute("/compute")({
  head: () => ({ meta: [{ title: "Compute — Nimbus" }] }),
  component: ComputePage,
});

function ComputePage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Compute" }]}>
      <PageShell>
        <PageHeader
          title="Compute"
          description="Containers, edge workers, and scheduled jobs across all regions."
          actions={<button className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">New service</button>}
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total vCPU" value="128" hint="24 nodes · 5 regions" series={metricSeries(21)} icon={<Cpu className="h-3.5 w-3.5" />} />
          <Metric label="Memory" value="384 GB" hint="182 GB in use" series={metricSeries(22)} icon={<MemoryStick className="h-3.5 w-3.5" />} />
          <Metric label="Containers" value="23" hint="all healthy" series={metricSeries(23)} icon={<Server className="h-3.5 w-3.5" />} />
          <Metric label="Auto-scale events" value="14" hint="last 24h" series={metricSeries(24)} icon={<RefreshCw className="h-3.5 w-3.5" />} />
        </div>

        <Panel title="Running services" className="mt-6" padded={false}>
          <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_120px_120px] gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Service</div><div>Type</div><div>Region</div><div>Replicas</div><div>CPU</div><div>Memory</div><div className="text-right">Status</div>
          </div>
          <ul className="divide-y divide-border">
            {compute.map((c) => (
              <li key={c.id} className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_120px_120px] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{c.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">auto-scale · min 2 · max 20</div>
                </div>
                <div className="text-[12px] text-muted-foreground">{c.type}</div>
                <div className="text-[12px] text-muted-foreground">{c.region}</div>
                <div className="text-[12px] text-foreground">{c.replicas}</div>
                <Bar value={c.cpu} />
                <Bar value={c.memory} />
                <div className="flex justify-end"><StatusBadge status={c.status} /></div>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}

function Bar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }} />
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums">{value}%</span>
    </div>
  );
}
