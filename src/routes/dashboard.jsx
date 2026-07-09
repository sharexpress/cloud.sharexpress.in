import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, StatusBadge, Sparkline, AreaChart } from "@/components/app/primitives";
import { ArrowUpRight, Cpu, HardDrive, Network, Rocket, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export const Route = createFileRoute("/dashboard")({
    head: () => ({
        meta: [
            { title: "Overview — Nimbus" },
            { name: "description", content: "Real-time status of your projects, deployments, compute, and usage." },
        ],
    }),
    component: OverviewPage,
});

function OverviewPage() {
    // Select from Redux state
    const projects = useSelector((state) => state.projects.list);
    const deployments = useSelector((state) => state.deployments.list);
    const billing = useSelector((state) => state.billing);
    
    // Live metric fluctuations for higher fidelity
    const [liveCpu, setLiveCpu] = useState(34);
    const [liveMem, setLiveMem] = useState(12.4);
    const [liveNet, setLiveNet] = useState(184);
    const [liveReqs, setLiveReqs] = useState(2.41);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setLiveCpu(prev => Math.max(10, Math.min(95, Math.round(prev + (Math.random() - 0.5) * 6))));
            setLiveMem(prev => Math.max(8.0, Math.min(30.0, parseFloat((prev + (Math.random() - 0.5) * 0.4).toFixed(1)))));
            setLiveNet(prev => Math.max(100, Math.min(450, Math.round(prev + (Math.random() - 0.5) * 20))));
            setLiveReqs(prev => Math.max(1.5, Math.min(5.0, parseFloat((prev + (Math.random() - 0.5) * 0.05).toFixed(2)))));
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    // Helper functions for mock charts
    const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
        const out = [];
        for (let i = 0; i < len; i++) {
            const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
            out.push(Math.max(4, Math.min(100, Math.round(v))));
        }
        return out;
    };

    // Construct mock activity log from current redux states
    const mockActivity = [
        { id: 1, who: "Jordan Lee", initials: "JL", verb: "deployed", target: projects[0]?.name || "Acme Marketing", meta: `production · ${deployments[0]?.commit || "a1b2c3d"}`, time: "2m ago" },
        { id: 2, who: "Priya Shah", initials: "PS", verb: "invited", target: "sam@acme.com", meta: "as Developer", time: "1h ago" },
        { id: 3, who: "Marcus Chen", initials: "MC", verb: "updated secrets", target: "STRIPE_SECRET_KEY", meta: "for Payments API", time: "3h ago" },
        { id: 4, who: "Nina Park", initials: "NP", verb: "added custom domain", target: "admin.acme.com", meta: "SSL issued", time: "yesterday" },
        { id: 5, who: "Sam Rivera", initials: "SR", verb: "resolved alert", target: "High Latency P99", meta: "auto-scale event", time: "2d ago" },
    ];

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Overview" }]}>
      <PageShell>
        <PageHeader title="Overview" description="Everything that's running, right now." actions={<>
              <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong transition-colors">Last 24h</button>
              <button onClick={() => window.location.href='/projects'} className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer">New Project</button>
            </>}/>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Metric label="CPU" value={`${liveCpu}%`} hint="8 vCPU · 4 regions" delta={{ value: "-2.1%", positive: true }} series={metricSeries(1)} icon={<Cpu className="h-3.5 w-3.5"/>}/>
          <Metric label="Memory" value={`${liveMem} GB`} hint="of 32 GB provisioned" delta={{ value: "+1.4%", positive: false }} series={metricSeries(3)} icon={<HardDrive className="h-3.5 w-3.5"/>}/>
          <Metric label="Network" value={`${liveNet} MB/s`} hint="edge egress · p95" delta={{ value: "+8.2%", positive: true }} series={metricSeries(5)} icon={<Network className="h-3.5 w-3.5"/>}/>
          <Metric label="Requests" value={`${liveReqs}M`} hint="last 24 hours" delta={{ value: "+12.4%", positive: true }} series={metricSeries(7)} icon={<Zap className="h-3.5 w-3.5"/>}/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Requests" description="Global edge · past 24 hours" className="lg:col-span-2" actions={<button className="text-[11px] text-muted-foreground hover:text-foreground">View all</button>}>
            <AreaChart data={metricSeries(11, 48, 60, 60)} unit="M reqs"/>
            <div className="mt-4 grid grid-cols-4 gap-4 border-t border-border pt-4 text-[12px]">
              <Stat label="p50 latency" value="42ms"/>
              <Stat label="p95 latency" value="118ms"/>
              <Stat label="Error rate" value="0.04%"/>
              <Stat label="Cache hit" value="94.2%"/>
            </div>
          </Panel>

          <Panel title="Monthly usage" description="Jun 2026 · to date">
            <div className="space-y-4">
              <UsageRow label="Bandwidth" used={`${billing.usage.bandwidth.current} ${billing.usage.bandwidth.unit}`} total={`${billing.usage.bandwidth.limit} ${billing.usage.bandwidth.unit}`} pct={(billing.usage.bandwidth.current / billing.usage.bandwidth.limit) * 100}/>
              <UsageRow label="Compute" used={`${billing.usage.compute.current} ${billing.usage.compute.unit}`} total={`${billing.usage.compute.limit} ${billing.usage.compute.unit}`} pct={(billing.usage.compute.current / billing.usage.compute.limit) * 100}/>
              <UsageRow label="Storage" used={`${billing.usage.storage.current} ${billing.usage.storage.unit}`} total={`${billing.usage.storage.limit} ${billing.usage.storage.unit}`} pct={(billing.usage.storage.current / billing.usage.storage.limit) * 100}/>
              <UsageRow label="Function invocations" used={`${billing.usage.functions.current} ${billing.usage.functions.unit}`} total={`${billing.usage.functions.limit} ${billing.usage.functions.unit}`} pct={(billing.usage.functions.current / billing.usage.functions.limit) * 100}/>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
              <div>
                <div className="text-[11px] text-muted-foreground">Projected bill ({billing.subscription.plan})</div>
                <div className="text-[15px] font-semibold text-foreground">$4,812</div>
              </div>
              <a className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline" href="/billing">
                View billing <ArrowUpRight className="h-3 w-3"/>
              </a>
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Recent deployments" className="lg:col-span-2" actions={<a href="/deployments" className="text-[11px] text-muted-foreground hover:text-foreground">All deployments</a>} padded={false}>
            <ul className="divide-y divide-border">
              {deployments.slice(0, 6).map((d) => (<li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                      <Rocket className="h-3.5 w-3.5"/>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-foreground">{d.project}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{d.commit}</span>
                      </div>
                      <div className="truncate text-[12px] text-muted-foreground">{d.message}</div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={d.status}/>
                    <span className="hidden md:inline text-[11px] text-muted-foreground">{d.createdAt}</span>
                  </div>
                </li>))}
            </ul>
          </Panel>

          <Panel title="Team activity" padded={false}>
            <ul className="divide-y divide-border">
              {mockActivity.slice(0, 6).map((a) => (<li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent">{a.initials}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.5px] text-foreground">
                      <span className="font-medium">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.verb}</span>{" "}
                      <span className="font-medium">{a.target}</span>
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{a.meta} · {a.time}</p>
                  </div>
                </li>))}
            </ul>
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Running applications" className="lg:col-span-2" padded={false}>
            <ul className="divide-y divide-border">
              {projects.slice(0, 5).map((p) => (<li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{p.name}</span>
                      <span className="text-[11px] text-muted-foreground">· {p.framework}</span>
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground">{p.repo} · {p.branch} · {p.region}</div>
                  </div>
                  <StatusBadge status={p.status}/>
                </li>))}
            </ul>
          </Panel>
          <Panel title="Storage" description="acme-media · global">
            <Sparkline data={metricSeries(13, 40, 50, 50)} height={80}/>
            <div className="mt-4 grid grid-cols-2 gap-4 text-[12px]">
              <Stat label="Objects" value="1.28M"/>
              <Stat label="Size" value="412.8 GB"/>
              <Stat label="Transformations" value="88.2k"/>
              <Stat label="CDN hit" value="97.4%"/>
            </div>
          </Panel>
        </div>
      </PageShell>
    </AppShell>);
}

function Stat({ label, value }) {
    return (<div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[13px] font-semibold text-foreground">{value}</div>
    </div>);
}

function UsageRow({ label, used, total, pct }) {
    return (<div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-foreground">{label}</span>
        <span className="text-muted-foreground">
          <span className="text-foreground">{used}</span> / {total}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }}/>
      </div>
    </div>);
}
