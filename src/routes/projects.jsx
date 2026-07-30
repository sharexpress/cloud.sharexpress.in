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
import { PageShell, PageHeader, StatusBadge } from "@/components/app/primitives";
import { 
  GitBranch, Grid3x3, List, Plus, Search, X, FolderGit2, 
  Globe, ArrowRight 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, createProjectThunk } from "@/store";
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
    const projects = useSelector((state) => state.projects?.list || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";
    
    const [query, setQuery] = useState("");
    const [selectedFramework, setSelectedFramework] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [framework, setFramework] = useState("Vite + React");
    const [type, setType] = useState("web_service");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [domain, setDomain] = useState("");
    const [region, setRegion] = useState("iad1");

    const frameworksList = ["All", "Next.js", "Vite + React", "Astro", "Node.js", "Go", "Rust", "Bun"];

    useEffect(() => {
        dispatch(fetchProjects(activeWsId));
    }, [dispatch, activeWsId]);

    const filtered = projects.filter((p) => {
        const matchesQuery = (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
                             (p.framework || "").toLowerCase().includes(query.toLowerCase()) ||
                             (p.repo || "").toLowerCase().includes(query.toLowerCase());
        const matchesFramework = selectedFramework === "All" || (p.framework || "").toLowerCase() === selectedFramework.toLowerCase();
        return matchesQuery && matchesFramework;
    });

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const projectRepo = repo.trim() || `acme/${slug}`;
        const projectDomain = domain.trim() || `${slug}.acme.com`;

        try {
            await dispatch(createProjectThunk({
                projectData: {
                    name,
                    slug,
                    type,
                    framework,
                    repo: projectRepo,
                    repo_url: projectRepo,
                    branch,
                    domain: projectDomain,
                    region,
                },
                workspace_id: activeWsId
            })).unwrap();

            setName("");
            setRepo("");
            setDomain("");
            setIsCreateOpen(false);
        } catch (err) {
            alert(err || "Failed to create project");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Projects" }]}>
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
                                params={{ id: p.slug || p.id }} 
                                key={p.id || p.slug} 
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
                                                {p.framework || p.type || "Web Service"}
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status || "ready"}/>
                                    </div>

                                    {/* Body: Repository & Domain info */}
                                    <div className="mt-4 space-y-1.5 text-[11.5px] font-mono text-text-muted">
                                        <div className="flex items-center gap-1.5 truncate">
                                            <GitBranch className="h-3 w-3 shrink-0 opacity-60"/> 
                                            <span className="truncate">{p.repo || `acme/${p.slug}`}</span>
                                            <span className="opacity-30">·</span>
                                            <span className="text-text-muted/80">{p.branch || "main"}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 truncate">
                                            <Globe className="h-3 w-3 shrink-0 opacity-60"/> 
                                            <span className="truncate group-hover:text-text-primary transition-colors">{p.domain || `${p.slug}.acme.com`}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: Metadata */}
                                <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-3 text-[10.5px] text-text-muted font-mono">
                                    <span>Updated {p.updatedAt || "recently"}</span>
                                    <span className="flex items-center gap-1 text-text-muted group-hover:text-text-primary transition-colors">
                                        View <ArrowRight className="h-2.5 w-2.5"/>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-border bg-card overflow-hidden">
                        <table className="w-full text-left text-[12px]">
                            <thead className="border-b border-border bg-surface/50 font-mono text-[10.5px] text-text-muted uppercase">
                                <tr>
                                    <th className="px-4 py-2.5">Project</th>
                                    <th className="px-4 py-2.5">Framework</th>
                                    <th className="px-4 py-2.5">Repository</th>
                                    <th className="px-4 py-2.5">Domain</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map((p) => (
                                    <tr key={p.id || p.slug} className="hover:bg-surface/30 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-text-primary">{p.name}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{p.framework || p.type}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{p.repo || `acme/${p.slug}`}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{p.domain || `${p.slug}.acme.com`}</td>
                                        <td className="px-4 py-3"><StatusBadge status={p.status || "ready"}/></td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to="/projects/$id" params={{ id: p.slug || p.id }} className="text-text-primary hover:underline font-mono text-[11px]">Manage &rarr;</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create Project Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="absolute right-4 top-4 text-text-muted hover:text-text-primary"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <h3 className="text-sm font-bold text-text-primary mb-1">Create New Project</h3>
                            <p className="text-xs text-text-muted mb-4">Deploy a service or static site into {activeWsName}.</p>

                            <form onSubmit={handleCreateProject} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-text-primary mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. acme-web-service"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Framework</label>
                                        <select
                                            value={framework}
                                            onChange={(e) => setFramework(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                                        >
                                            <option value="Vite + React">Vite + React</option>
                                            <option value="Next.js">Next.js</option>
                                            <option value="Astro">Astro</option>
                                            <option value="Node.js">Node.js</option>
                                            <option value="Go">Go</option>
                                            <option value="Rust">Rust</option>
                                            <option value="Bun">Bun</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Branch</label>
                                        <input
                                            type="text"
                                            value={branch}
                                            onChange={(e) => setBranch(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono text-text-primary"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-3 py-1.5 border border-border rounded-md text-xs hover:bg-surface text-text-muted"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 bg-foreground text-background font-semibold rounded-md text-xs hover:opacity-90 disabled:opacity-50"
                                    >
                                        {submitting ? "Creating..." : "Create Project"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </PageShell>
        </AppShell>
    );
}
