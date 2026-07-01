import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { projects } from "@/lib/mock";
import { Filter, GitBranch, Grid3x3, List, Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Projects — Nimbus" }] }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const filtered = projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Projects" }]}>
      <PageShell>
        <PageHeader
          title="Projects"
          description={`${projects.length} projects across production and preview environments.`}
          actions={
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">
              <Plus className="h-3.5 w-3.5" /> New project
            </button>
          }
        />

        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <div className="flex h-9 items-center rounded-md border border-border bg-surface">
              <button onClick={() => setView("grid")} className={`grid h-9 w-9 place-items-center rounded-l-md ${view === "grid" ? "bg-surface-elevated text-foreground" : "text-muted-foreground"}`}><Grid3x3 className="h-3.5 w-3.5" /></button>
              <button onClick={() => setView("list")} className={`grid h-9 w-9 place-items-center rounded-r-md ${view === "list" ? "bg-surface-elevated text-foreground" : "text-muted-foreground"}`}><List className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        {view === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                to="/projects/$id"
                params={{ id: p.slug }}
                key={p.id}
                className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-elevated"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background text-[11px] font-semibold text-foreground">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-foreground">{p.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{p.framework}</div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                  <div className="flex items-center gap-1.5"><GitBranch className="h-3 w-3" /> {p.repo} · {p.branch}</div>
                  <div className="truncate">{p.domain}</div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>{p.region.toUpperCase()}</span>
                  <span>Updated {p.updatedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/projects/$id"
                    params={{ id: p.slug }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-elevated/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-[10px] font-semibold text-foreground">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-foreground">{p.name}</div>
                        <div className="truncate text-[11px] text-muted-foreground">{p.repo} · {p.branch} · {p.domain}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden md:inline text-[11px] text-muted-foreground">{p.framework}</span>
                      <StatusBadge status={p.status} />
                      <span className="hidden md:inline text-[11px] text-muted-foreground">{p.updatedAt}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>
    </AppShell>
  );
}
