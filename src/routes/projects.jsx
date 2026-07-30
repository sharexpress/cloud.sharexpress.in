/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { 
  GitBranch, Grid3x3, List, Plus, Search, X, FolderGit2, 
  ExternalLink, Globe, ArrowRight, Sparkles 
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProject, addDeployment } from "../store/index.js";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
    head: () => ({ meta: [{ title: "Projects — Sharexpress Cloud" }] }),
    component: ProjectsPage,
});

function ProjectsPage() {
    const path = useRouterState({ select: (s) => s.location.pathname });
    const isDetail = path !== "/projects" && path !== "/projects/";

    if (isDetail) {
        return <Outlet />;
    }
    const dispatch = useDispatch();
    const projects = useSelector((state) => state.projects.list);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId);
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";
    
    const [query, setQuery] = useState("");
    const [selectedFramework, setSelectedFramework] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [framework, setFramework] = useState("Vite + React");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [domain, setDomain] = useState("");
    const [region, setRegion] = useState("iad1");

    const frameworksList = ["All", "Next.js", "Vite + React", "Astro", "Node.js", "Go", "Rust", "Bun"];

    const filtered = projects.filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) ||
                             p.framework.toLowerCase().includes(query.toLowerCase()) ||
                             p.repo.toLowerCase().includes(query.toLowerCase());
        const matchesFramework = selectedFramework === "All" || p.framework.toLowerCase() === selectedFramework.toLowerCase();
        return matchesQuery && matchesFramework;
    });

    const handleCreateProject = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const projectRepo = repo.trim() || `acme/${slug}`;
        const projectDomain = domain.trim() || `${slug}.acme.com`;

        const newProj = {
            name,
            slug,
            framework,
            repo: projectRepo,
            branch,
            domain: projectDomain,
            region,
            status: "ready",
            updatedAt: "Just now",
        };

        dispatch(addProject(newProj));
        dispatch(addDeployment({
            project: name,
            branch,
            commit: Math.random().toString(36).substring(2, 9),
            message: "Initial commit",
            author: "Jordan Lee",
            authorAvatar: "JL",
            environment: "production",
            url: projectDomain,
        }));

        // Reset
        setName("");
        setRepo("");
        setDomain("");
        setIsCreateOpen(false);
    };

    return (<AppShell breadcrumbs={[{ label: activeWsName }, { label: "Projects" }]}>
      <PageShell>
        <PageHeader 
            title="Projects" 
            description={`${projects.length} services & applications running in ${activeWsName}.`} 
            actions={
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-[12px] font-medium text-background hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5"/> New project
                </button>
            }
        />

        {/* Filter bar */}
        <div className="mb-5 space-y-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <div className="relative min-w-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"/>
              <input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Search projects by name, framework, or repository…" 
                className="h-9 w-full rounded-md border border-border bg-card/60 pl-9 pr-3 text-[12.5px] text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex h-9 items-center rounded-md border border-border bg-card p-0.5">
                <button 
                  onClick={() => setView("grid")} 
                  className={cn("grid h-8 w-8 place-items-center rounded transition-colors cursor-pointer", view === "grid" ? "bg-surface text-text-primary font-semibold" : "text-text-muted hover:text-text-primary")}
                  title="Grid view"
                >
                  <Grid3x3 className="h-3.5 w-3.5"/>
                </button>
                <button 
                  onClick={() => setView("list")} 
                  className={cn("grid h-8 w-8 place-items-center rounded transition-colors cursor-pointer", view === "list" ? "bg-surface text-text-primary font-semibold" : "text-text-muted hover:text-text-primary")}
                  title="List view"
                >
                  <List className="h-3.5 w-3.5"/>
                </button>
              </div>
            </div>
          </div>

          {/* Framework pill tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
            {frameworksList.map((fw) => (
                <button
                    key={fw}
                    onClick={() => setSelectedFramework(fw)}
                    className={cn(
                        "rounded px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap",
                        selectedFramework === fw
                            ? "bg-surface text-text-primary border border-border font-semibold shadow-2xs"
                            : "text-text-muted hover:text-text-primary hover:bg-surface/50 border border-transparent"
                    )}
                >
                    {fw}
                </button>
            ))}
          </div>
        </div>

        {/* Project Cards Grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
            <FolderGit2 className="h-9 w-9 text-text-muted mb-3 opacity-60" />
            <h3 className="text-[13.5px] font-semibold text-text-primary">No projects found</h3>
            <p className="mt-1 max-w-sm text-[12px] text-text-muted">Try adjusting your search query or framework filter.</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link 
                to="/projects/$id" 
                params={{ id: p.slug }} 
                key={p.id} 
                className="group relative rounded-lg border border-border bg-card p-4.5 transition-all duration-150 hover:border-border-strong hover:bg-surface/30 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Simple Name + Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-semibold text-text-primary group-hover:text-text-primary transition-colors">
                        {p.name}
                      </div>
                      <div className="truncate text-[10.5px] text-text-muted font-mono mt-0.5">
                        {p.framework}
                      </div>
                    </div>
                    <StatusBadge status={p.status}/>
                  </div>

                  {/* Body: Repository & Domain info */}
                  <div className="mt-4 space-y-1.5 text-[11.5px] font-mono text-text-muted">
                    <div className="flex items-center gap-1.5 truncate">
                      <GitBranch className="h-3 w-3 shrink-0 opacity-60"/> 
                      <span className="truncate">{p.repo}</span>
                      <span className="opacity-30">·</span>
                      <span className="text-text-muted/80">{p.branch}</span>
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <Globe className="h-3 w-3 shrink-0 opacity-60"/> 
                      <span className="truncate group-hover:text-text-primary transition-colors">{p.domain}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Region, Updated time & View Link */}
                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-2.5 text-[10.5px] text-text-muted font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-surface border border-border/60 uppercase text-[9.5px]">
                      {p.region}
                    </span>
                    <span>{p.updatedAt}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5"/>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <Panel padded={false}>
            <ul className="divide-y divide-border/60">
              {filtered.map((p) => (
                <li key={p.id}>
                  <Link 
                    to="/projects/$id" 
                    params={{ id: p.slug }} 
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-surface/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-text-primary">
                        {p.name}
                      </div>
                      <div className="truncate text-[11px] text-text-muted font-mono mt-0.5">
                        {p.repo} · {p.branch} · {p.domain}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3.5 text-[11px]">
                      <span className="hidden md:inline font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border/60 text-text-muted">
                        {p.framework}
                      </span>
                      <StatusBadge status={p.status}/>
                      <span className="hidden md:inline text-[11px] text-text-muted font-mono">{p.updatedAt}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all"/>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Interactive Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-[13.5px] font-semibold text-text-primary">Create New Project</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. billing-dashboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Framework</label>
                  <select 
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[12px] font-medium text-text-primary focus:border-border-strong focus:outline-none cursor-pointer"
                  >
                    <option>Next.js</option>
                    <option>Vite + React</option>
                    <option>Astro</option>
                    <option>Node.js</option>
                    <option>Go</option>
                    <option>Rust</option>
                    <option>Bun</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[12px] font-medium text-text-primary focus:border-border-strong focus:outline-none cursor-pointer"
                  >
                    <option value="iad1">US East (iad1)</option>
                    <option value="sfo1">US West (sfo1)</option>
                    <option value="fra1">Europe (fra1)</option>
                    <option value="sin1">Asia Pacific (sin1)</option>
                    <option value="syd1">Australia (syd1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Git Repository (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. acme/billing-dashboard"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Branch</label>
                  <input 
                    type="text" 
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-text-muted uppercase mb-1">Production Domain</label>
                  <input 
                    type="text" 
                    placeholder="billing.acme.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] font-medium text-text-primary hover:bg-surface/80 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="h-8.5 px-3.5 rounded-md bg-foreground text-[12px] font-semibold text-background hover:opacity-90 cursor-pointer transition-opacity"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>);
}
