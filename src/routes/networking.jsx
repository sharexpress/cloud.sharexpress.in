import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric } from "@/components/app/primitives";
import { metricSeries } from "@/lib/mock";
import { Globe2, Shield } from "lucide-react";
export const Route = createFileRoute("/networking")({
    head: () => ({ meta: [{ title: "Networking — Nimbus" }] }),
    component: NetworkingPage,
});
const regions = [
    { code: "iad1", name: "US East · Ashburn", latency: "12ms", nodes: 8 },
    { code: "sfo1", name: "US West · San Francisco", latency: "22ms", nodes: 6 },
    { code: "fra1", name: "EU · Frankfurt", latency: "31ms", nodes: 5 },
    { code: "sin1", name: "APAC · Singapore", latency: "48ms", nodes: 3 },
    { code: "syd1", name: "APAC · Sydney", latency: "62ms", nodes: 2 },
];
function NetworkingPage() {
    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Networking" }]}>
      <PageShell>
        <PageHeader title="Networking" description="Global edge, private networking, and DDoS protection."/>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Edge PoPs" value="42" hint="worldwide" series={metricSeries(51)} icon={<Globe2 className="h-3.5 w-3.5"/>}/>
          <Metric label="Requests blocked" value="18.2k" hint="WAF · 24h" series={metricSeries(52)} icon={<Shield className="h-3.5 w-3.5"/>}/>
          <Metric label="Bandwidth in" value="212 GB" hint="24h" series={metricSeries(53)}/>
          <Metric label="Bandwidth out" value="88 GB" hint="24h" series={metricSeries(54)}/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="Regions" padded={false}>
            <ul className="divide-y divide-border">
              {regions.map((r) => (<li key={r.code} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{r.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{r.code} · {r.nodes} nodes</div>
                  </div>
                  <span className="text-[12px] text-muted-foreground tabular-nums">{r.latency}</span>
                </li>))}
            </ul>
          </Panel>
          <Panel title="Private networks">
            <div className="space-y-3">
              {["vpc-prod (10.0.0.0/16)", "vpc-staging (10.10.0.0/16)", "vpc-analytics (10.20.0.0/16)"].map((v) => (<div key={v} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 font-mono text-[12px]">
                  <span className="text-foreground">{v}</span>
                  <span className="text-[11px] text-muted-foreground">peered · 2 routes</span>
                </div>))}
            </div>
          </Panel>
        </div>
      </PageShell>
    </AppShell>);
}
