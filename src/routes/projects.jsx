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

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { Filter, GitBranch, Grid3x3, List, Plus, Search, X } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProject, addDeployment } from "../store/index.js";

export const Route = createFileRoute("/projects")({
    head: () => ({ meta: [{ title: "Projects — Nimbus" }] }),
    component: ProjectsPage,
});

function ProjectsPage() {
    const dispatch = useDispatch();
    const projects = useSelector((state) => state.projects.list);
    
    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [framework, setFramework] = useState("Vite + React");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [domain, setDomain] = useState("");
    const [region, setRegion] = useState("iad1");

    const filtered = projects.filter((p) => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.framework.toLowerCase().includes(query.toLowerCase())
    );

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

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Projects" }]}>
      <PageShell>
        <PageHeader title="Projects" description={`${projects.length} projects across production and preview environments.`} actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5"/> New project
            </button>
        }/>

        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects…" className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"/>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong transition-colors">
              <Filter className="h-3.5 w-3.5"/> Filter
            </button>
            <div className="flex h-9 items-center rounded-md border border-border bg-surface">
              <button onClick={() => setView("grid")} className={`grid h-9 w-9 place-items-center rounded-l-md transition-colors ${view === "grid" ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"}`}><Grid3x3 className="h-3.5 w-3.5"/></button>
              <button onClick={() => setView("list")} className={`grid h-9 w-9 place-items-center rounded-r-md transition-colors ${view === "list" ? "bg-surface-elevated text-foreground" : "text-muted-foreground hover:text-foreground"}`}><List className="h-3.5 w-3.5"/></button>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <FolderGit2 className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No projects found</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Try adjusting your search terms or create a new project.</p>
          </div>
        ) : view === "grid" ? (<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (<Link to="/projects/$id" params={{ id: p.slug }} key={p.id} className="group rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong hover:bg-surface-elevated">
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
                  <StatusBadge status={p.status}/>
                </div>
                <div className="mt-4 space-y-1.5 text-[12px] text-muted-foreground">
                  <div className="flex items-center gap-1.5"><GitBranch className="h-3 w-3"/> {p.repo} · {p.branch}</div>
                  <div className="truncate">{p.domain}</div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span>{p.region.toUpperCase()}</span>
                  <span>Updated {p.updatedAt}</span>
                </div>
              </Link>))}
          </div>) : (<Panel padded={false}>
            <ul className="divide-y divide-border">
              {filtered.map((p) => (<li key={p.id}>
                  <Link to="/projects/$id" params={{ id: p.slug }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-elevated/40 transition-colors">
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
                      <StatusBadge status={p.status}/>
                      <span className="hidden md:inline text-[11px] text-muted-foreground">{p.updatedAt}</span>
                    </div>
                  </Link>
                </li>))}
            </ul>
          </Panel>)}
      </PageShell>

      {/* Interactive Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Create New Project</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Project Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. billing-dashboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Framework</label>
                  <select 
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
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
                  <label className="block text-[11.5px] text-muted-foreground">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
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
                <label className="block text-[11.5px] text-muted-foreground">Git Repository (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. acme/billing-dashboard"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Branch</label>
                  <input 
                    type="text" 
                    placeholder="main"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Production Domain (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="billing.acme.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-9 px-4 rounded-md border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="h-9 px-4 rounded-md bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer"
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
