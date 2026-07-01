import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, StatusBadge, AreaChart } from "@/components/app/primitives";
import { deployments, metricSeries, projects } from "@/lib/mock";
import { ExternalLink, GitBranch, Rocket, Settings2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects/$id")({
  head: () => ({ meta: [{ title: "Project — Nimbus" }] }),
  component: ProjectDetailPage,
});

const TABS = ["Overview", "Deployments", "Environment", "Domains", "Storage", "Functions", "Analytics", "Logs", "Activity", "Settings"] as const;

function ProjectDetailPage() {
  const { id } = useParams({ from: "/projects/$id" });
  const project = projects.find((p) => p.slug === id) ?? projects[0];
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const projectDeploys = deployments.filter((d) => d.project === project.name);

  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Projects" }, { label: project.name }]}>
      <PageShell>
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-[12px] font-semibold text-foreground">
              {project.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground">{project.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                <StatusBadge status={project.status} />
                <span>·</span>
                <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{project.repo}</span>
                <span>·</span>
                <a className="inline-flex items-center gap-1 hover:text-foreground" href="#">{project.domain}<ExternalLink className="h-3 w-3" /></a>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">Visit</button>
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">
              <Rocket className="h-3.5 w-3.5" /> Redeploy
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] transition-colors ${
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Requests / min" value="12.4k" delta={{ value: "+4.2%", positive: true }} series={metricSeries(2)} />
              <Metric label="Avg latency" value="118ms" delta={{ value: "-6ms", positive: true }} series={metricSeries(4)} />
              <Metric label="Error rate" value="0.04%" delta={{ value: "-0.01%", positive: true }} series={metricSeries(6)} />
              <Metric label="Bandwidth" value="188 MB" hint="last hour" series={metricSeries(8)} />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Panel title="Requests" className="lg:col-span-2">
                <AreaChart data={metricSeries(9, 48, 60, 60)} />
              </Panel>
              <Panel title="Latest deployments" padded={false}>
                <ul className="divide-y divide-border">
                  {projectDeploys.slice(0, 4).map((d) => (
                    <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-[12.5px] text-foreground">{d.message}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{d.branch} · {d.commit} · {d.author}</div>
                      </div>
                      <StatusBadge status={d.status} />
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </>
        )}

        {tab === "Deployments" && (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {projectDeploys.map((d) => (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13px] font-medium text-foreground">{d.message}</span>
                      <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{d.commit}</span>
                    </div>
                    <div className="truncate text-[11.5px] text-muted-foreground">{d.branch} · {d.author} · {d.duration} · {d.createdAt}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge status={d.status} />
                    <button className="h-7 rounded-md border border-border bg-background px-2.5 text-[11px] text-foreground hover:border-border-strong">Rollback</button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "Environment" && (
          <Panel title="Environment variables" actions={<button className="h-7 rounded-md bg-foreground px-2.5 text-[11px] font-medium text-background">Add variable</button>}>
            <div className="space-y-2">
              {["DATABASE_URL", "STRIPE_SECRET_KEY", "SENTRY_DSN", "NEXT_PUBLIC_APP_URL", "REDIS_URL"].map((k) => (
                <div key={k} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
                  <div className="min-w-0">
                    <div className="font-mono text-[12px] text-foreground">{k}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">•••••••••••••••••••</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="rounded border border-border px-1.5 py-0.5">production</span>
                    <button className="rounded-md p-1 hover:bg-surface hover:text-foreground"><Settings2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {tab !== "Overview" && tab !== "Deployments" && tab !== "Environment" && (
          <Panel title={tab}>
            <p className="text-[13px] text-muted-foreground">
              {tab} content for <span className="text-foreground">{project.name}</span> is available in the {tab.toLowerCase()} view.
              Use the top-level <Link to="/monitoring" className="text-accent hover:underline">Monitoring</Link>, {" "}
              <Link to="/logs" className="text-accent hover:underline">Logs</Link>, and {" "}
              <Link to="/storage" className="text-accent hover:underline">Storage</Link> pages for platform-wide views.
            </p>
          </Panel>
        )}
      </PageShell>
    </AppShell>
  );
}
