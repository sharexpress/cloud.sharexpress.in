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
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { setProjects, addProject } from "../store/index.js";
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
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");
    
    const [query, setQuery] = useState("");
    const [selectedFramework, setSelectedFramework] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [framework, setFramework] = useState("nextjs");
    const [type, setType] = useState("web_service");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [buildCommand, setBuildCommand] = useState("npm run build");
    const [startCommand, setStartCommand] = useState("npm start");
    const [port, setPort] = useState(3000);

    const frameworksList = ["All", "nextjs", "react", "node", "python", "go", "static"];

    useEffect(() => {
        let isMounted = true;
        async function loadProjects() {
            try {
                setLoading(true);
                const res = await api.listProjects(activeWsId);
                if (isMounted) {
                    dispatch(setProjects(res));
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to list projects:", err);
                if (isMounted) setLoading(false);
            }
        }
        loadProjects();
        return () => { isMounted = false; };
    }, [dispatch, activeWsId]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!name) return;
        setSubmitting(true);
        try {
            const res = await api.createProject({
                name,
                type,
                framework,
                repo_url: repo,
                branch,
                build_command: buildCommand,
                start_command: startCommand,
                port: Number(port)
            }, activeWsId);

            if (res.success && res.project) {
                dispatch(addProject(res.project));
                setIsCreateOpen(false);
                setName("");
                setRepo("");
            }
        } catch (err) {
            alert(err.message || "Failed to create project");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredProjects = projects.filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase()) || 
                             (p.slug && p.slug.toLowerCase().includes(query.toLowerCase()));
        const matchesFw = selectedFramework === "All" || p.framework === selectedFramework;
        return matchesQuery && matchesFw;
    });

    return (
        <AppShell>
            <PageShell>
                <PageHeader
                    title="Projects"
                    description="Deploy, isolate, and manage live container web services and static applications."
                    action={
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Create Project
                        </button>
                    }
                />

                {/* Filter and View Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                placeholder="Filter projects..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-accent/50 border border-border/60 rounded-md pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <select
                            value={selectedFramework}
                            onChange={(e) => setSelectedFramework(e.target.value)}
                            className="bg-accent/50 border border-border/60 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        >
                            {frameworksList.map((fw) => (
                                <option key={fw} value={fw}>{fw.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center border border-border/60 rounded-md bg-accent/40 p-0.5">
                        <button
                            onClick={() => setView("grid")}
                            className={cn("p-1.5 rounded text-xs transition-colors", view === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted hover:text-foreground")}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={cn("p-1.5 rounded text-xs transition-colors", view === "list" ? "bg-background text-foreground shadow-xs" : "text-muted hover:text-foreground")}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Projects Display */}
                {loading ? (
                    <div className="text-center py-20 text-muted">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
                        <p className="text-xs">Fetching projects from live server...</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <Panel>
                        <div className="text-center py-16">
                            <FolderGit2 className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
                            <h3 className="text-sm font-semibold mb-1">No Projects Found</h3>
                            <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                                {query ? "No projects match your filter criteria." : "You haven't created any projects in this workspace yet."}
                            </p>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-md"
                            >
                                <Plus className="h-3.5 w-3.5" /> Create Project
                            </button>
                        </div>
                    </Panel>
                ) : view === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProjects.map((p) => (
                            <Link key={p.id} to={`/projects/${p.id}`} className="group block">
                                <Panel className="h-full hover:border-primary/50 transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-bold text-xs">
                                                {p.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{p.name}</h4>
                                                <p className="text-xs text-muted font-mono">{p.framework || p.type}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={p.status || "ready"} />
                                    </div>
                                    <p className="text-xs text-muted font-mono truncate mb-4">
                                        🔗 {p.subdomain || `${p.slug}.project.sharexpress.in`}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border/40">
                                        <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" /> {p.branch || "main"}</span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">View &rarr;</span>
                                    </div>
                                </Panel>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Panel className="p-0 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-accent/40 text-muted uppercase text-[10px] font-semibold border-b border-border/60">
                                <tr>
                                    <th className="px-4 py-3">Project</th>
                                    <th className="px-4 py-3">Framework</th>
                                    <th className="px-4 py-3">Branch</th>
                                    <th className="px-4 py-3">Subdomain</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filteredProjects.map((p) => (
                                    <tr key={p.id} className="hover:bg-accent/20 transition-colors">
                                        <td className="px-4 py-3 font-semibold">{p.name}</td>
                                        <td className="px-4 py-3 text-muted font-mono">{p.framework}</td>
                                        <td className="px-4 py-3 text-muted">{p.branch || "main"}</td>
                                        <td className="px-4 py-3 font-mono text-muted">{p.subdomain}</td>
                                        <td className="px-4 py-3"><StatusBadge status={p.status || "ready"} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/projects/${p.id}`} className="text-primary hover:underline font-medium">Manage</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                )}

                {/* Create Project Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="absolute right-4 top-4 text-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold mb-1">Create New Project</h3>
                            <p className="text-xs text-muted mb-4">Provision isolated container build pipeline for your service.</p>

                            <form onSubmit={handleCreateProject} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. acme-web-service"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Service Type</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="web_service">Web Service</option>
                                            <option value="static">Static Site</option>
                                            <option value="private_service">Private Service</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Tech Stack</label>
                                        <select
                                            value={framework}
                                            onChange={(e) => setFramework(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="nextjs">Next.js / React</option>
                                            <option value="node">Node.js</option>
                                            <option value="python">Python</option>
                                            <option value="go">Go</option>
                                            <option value="static">Static HTML/JS</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Build Command</label>
                                        <input
                                            type="text"
                                            value={buildCommand}
                                            onChange={(e) => setBuildCommand(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Container Port</label>
                                        <input
                                            type="number"
                                            value={port}
                                            onChange={(e) => setPort(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-3 py-1.5 border border-border rounded text-xs hover:bg-accent"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {submitting ? "Deploying..." : "Create & Deploy"}
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
