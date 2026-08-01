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
import { PageShell, PageHeader } from "@/components/app/primitives";
import { 
  GitBranch, Plus, Search, X, FolderPlus, ArrowRight,
  Globe, Cpu, UserPlus, MoreHorizontal, CheckCircle2, AlertCircle, Clock, ExternalLink, RefreshCw, Layers, Shield
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjects, createProjectThunk } from "@/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
    head: () => ({ meta: [{ title: "Overview — Sharexpress Cloud" }] }),
    component: ProjectsPage,
});

function ProjectsPage() {
    const path = useRouterState({ select: (s) => s.location.pathname });
    const isDetail = path !== "/projects" && path !== "/projects/";

    const dispatch = useDispatch();
    const projects = useSelector((state) => state.projects?.list || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";
    
    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("active"); // active | suspended | all
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Developer");
    const [inviteSuccess, setInviteSuccess] = useState(false);

    // Form fields for Project Creation
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [environment, setEnvironment] = useState("Production");
    const [region, setRegion] = useState("iad1");

    useEffect(() => {
        if (!isDetail) {
            dispatch(fetchProjects(activeWsId));
        }
    }, [dispatch, activeWsId, isDetail]);

    if (isDetail) {
        return <Outlet />;
    }

    // Default mock grouped projects if none exist
    const defaultGroupedProjects = [
        {
            id: "proj_default",
            name: "Default project",
            activeServicesCount: projects.length,
            environment: "Production",
            updated: "Just now",
        }
    ];

    const activeServices = projects.filter(p => (p.status || "ready") !== "suspended");
    const suspendedServices = projects.filter(p => p.status === "suspended");

    const displayedServices = projects.filter((p) => {
        const matchesSearch = (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.framework || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (p.repo || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        if (statusFilter === "active") {
            return matchesSearch && (p.status || "ready") !== "suspended";
        }
        if (statusFilter === "suspended") {
            return matchesSearch && p.status === "suspended";
        }
        return matchesSearch;
    });

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        setSubmitting(true);

        const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

        try {
            await dispatch(createProjectThunk({
                projectData: {
                    name: projectName,
                    slug,
                    type: "web_service",
                    framework: "Vite + React",
                    repo: `acme/${slug}`,
                    branch: "main",
                    domain: `${slug}.sharexpress.in`,
                    region,
                },
                workspace_id: activeWsId
            })).unwrap();

            setProjectName("");
            setProjectDesc("");
            setIsCreateOpen(false);
        } catch (err) {
            alert(err || "Failed to create project");
        } finally {
            setSubmitting(false);
        }
    };

    const handleInviteSubmit = (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviteSuccess(true);
        setTimeout(() => {
            setInviteSuccess(false);
            setInviteEmail("");
            setIsInviteOpen(false);
        }, 1500);
    };

    return (
        <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Projects" }]}>
            <PageShell>
                <div className="mx-auto max-w-6xl space-y-8">
                    {/* Header */}
                    <PageHeader
                        title="Projects"
                        description={`Managed services, deployment pipelines & environments in ${activeWsName}.`}
                        actions={
                            <>
                                <button
                                    onClick={() => setIsInviteOpen(true)}
                                    className="h-9 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-elevated active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                                >
                                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                                    Invite Team
                                </button>

                                <Link
                                    to="/projects/new"
                                    className="h-9 px-4 inline-flex items-center gap-2 rounded-lg bg-[#5F6AD2] text-xs font-semibold text-white shadow-xs hover:bg-[#4F5ABF] active:scale-[0.98] transition-all cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Resource
                                </Link>
                            </>
                        }
                    />

                    {/* Projects Cards Grid (Render Screenshot 2) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-foreground tracking-tight">Projects</h2>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="text-xs text-[#5F6AD2] hover:underline font-medium cursor-pointer"
                            >
                                + Create new project
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Existing Projects */}
                            {defaultGroupedProjects.map((proj) => (
                                <Link
                                    key={proj.id}
                                    to="/projects/$id"
                                    params={{ id: proj.id || "p_acme_web" }}
                                    search={{ tab: "Overview" }}
                                    className="group rounded-xl border border-border bg-card p-5 hover:border-border-strong hover:shadow-md transition-all flex flex-col justify-between h-36 cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-foreground group-hover:text-[#5F6AD2] transition-colors">
                                                {proj.name}
                                            </h3>
                                            <span className="rounded bg-surface px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                                                {proj.environment}
                                            </span>
                                        </div>
                                        <div className="mt-3">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                {projects.length > 0 ? `${projects.length} active service${projects.length > 1 ? "s" : ""}` : "No active services"}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground flex items-center justify-between border-t border-border/50 pt-3">
                                        <span>Updated {proj.updated}</span>
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-[#5F6AD2] transition-all" />
                                    </div>
                                </Link>
                            ))}

                            {/* + Create New Project Dashed Card */}
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="rounded-xl border border-dashed border-border hover:border-[#5F6AD2] bg-surface/40 hover:bg-[#5F6AD2]/5 p-5 transition-all flex flex-col items-center justify-center text-center h-36 cursor-pointer group"
                            >
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground group-hover:border-[#5F6AD2] group-hover:text-[#5F6AD2] transition-colors mb-2">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-semibold text-foreground group-hover:text-[#5F6AD2] transition-colors">
                                    Create new project
                                </span>
                                <span className="text-[11px] text-muted-foreground mt-0.5">
                                    Group related services & environments
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Ungrouped Services Section */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-bold text-foreground tracking-tight">Ungrouped Services</h2>
                        </div>

                        {/* Filter Tabs & Search Bar */}
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 text-xs font-medium">
                                    <button
                                        onClick={() => setStatusFilter("active")}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                                            statusFilter === "active" ? "bg-[#5F6AD2] text-white font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Active ({activeServices.length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("suspended")}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                                            statusFilter === "suspended" ? "bg-[#5F6AD2] text-white font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        Suspended ({suspendedServices.length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("all")}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                                            statusFilter === "all" ? "bg-[#5F6AD2] text-white font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        All ({projects.length})
                                    </button>
                                </div>

                                <div className="relative flex-1 max-w-md">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search services…"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Services Table (Matching Render Screenshot 2) */}
                            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center border-b border-border bg-surface px-4 py-2.5 font-mono text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                                    <div>Service Name</div>
                                    <div>Status</div>
                                    <div>Runtime</div>
                                    <div>Region</div>
                                    <div>Updated</div>
                                    <div className="text-right">Actions</div>
                                </div>

                                <div className="divide-y divide-border">
                                    {displayedServices.map((service) => {
                                        const isSuspended = service.status === "suspended";
                                        return (
                                            <div
                                                key={service.id}
                                                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] items-center px-4 py-3 hover:bg-surface/60 transition-colors"
                                            >
                                                {/* Service Name */}
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground">
                                                        <Globe className="h-3.5 w-3.5 text-[#5F6AD2]" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <Link
                                                            to="/services/$id"
                                                            params={{ id: service.name || service.slug || service.id || "backend-setup-portfolio" }}
                                                            search={{ tab: "Events" }}
                                                            className="truncate font-semibold text-xs text-foreground hover:text-[#5F6AD2] transition-colors block cursor-pointer"
                                                        >
                                                            {service.name}
                                                        </Link>
                                                        <span className="font-mono text-[10.5px] text-muted-foreground truncate block">
                                                            {service.domain || `${service.slug || service.name}.sharexpress.in`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status */}
                                                <div>
                                                    {isSuspended ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-amber-500">
                                                            <Clock className="h-3 w-3" /> Suspended
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                                                            <CheckCircle2 className="h-3 w-3" /> Deployed
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Runtime */}
                                                <div>
                                                    <span className="rounded bg-surface px-2 py-0.5 font-mono text-[11px] text-foreground border border-border">
                                                        {service.framework || "Node"}
                                                    </span>
                                                </div>

                                                {/* Region */}
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {service.region === "iad1" ? "Ashburn (iad1)" : service.region === "fra1" ? "Frankfurt" : "US East"}
                                                </div>

                                                {/* Updated */}
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    1y
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center justify-end gap-1">
                                                    <Link
                                                        to="/services/$id"
                                                        params={{ id: service.name || service.slug || service.id || "backend-setup-portfolio" }}
                                                        search={{ tab: "Events" }}
                                                        className="rounded p-1.5 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer"
                                                        title="Manage Service"
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {displayedServices.length === 0 && (
                                        <div className="p-12 text-center">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground mb-3">
                                                <Layers className="h-5 w-5" />
                                            </div>
                                            <h3 className="text-xs font-semibold text-foreground">No services found</h3>
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Try adjusting your search query or status filter.
                                            </p>
                                            <div className="mt-4">
                                                <Link
                                                    to="/projects/new"
                                                    className="inline-flex items-center gap-1.5 rounded bg-[#5F6AD2] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#4F5ABF] transition-all"
                                                >
                                                    <Plus className="h-3.5 w-3.5" /> Deploy service
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modular Create Project Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Create Project</h3>
                                    <p className="mt-0.5 text-xs text-muted-foreground">Group environment resources into an isolated container.</p>
                                </div>
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateProject} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-foreground mb-1">Project Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. E-Commerce Suite"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Environment</label>
                                        <select
                                            value={environment}
                                            onChange={(e) => setEnvironment(e.target.value)}
                                            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                        >
                                            <option value="Production">Production</option>
                                            <option value="Staging">Staging</option>
                                            <option value="Development">Development</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Primary Region</label>
                                        <select
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                        >
                                            <option value="iad1">US East (iad1)</option>
                                            <option value="fra1">Europe (fra1)</option>
                                            <option value="sin1">Asia Pacific (sin1)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-3 flex justify-end gap-2 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="h-9 px-4 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-surface-elevated cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="h-9 px-5 rounded bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {submitting ? "Creating..." : "Create Project"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modular Invite Team Modal */}
                {isInviteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-border pb-4">
                                <div>
                                    <h3 className="text-base font-bold text-foreground">Invite Team Member</h3>
                                    <p className="mt-0.5 text-xs text-muted-foreground">Grant workspace access to developers or administrators.</p>
                                </div>
                                <button
                                    onClick={() => setIsInviteOpen(false)}
                                    className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {inviteSuccess ? (
                                <div className="py-8 text-center space-y-2">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <h4 className="text-sm font-bold text-foreground">Invitation Sent!</h4>
                                    <p className="text-xs text-muted-foreground">An invitation email has been sent to {inviteEmail}.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleInviteSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="developer@company.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Role</label>
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value)}
                                            className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                        >
                                            <option value="Admin">Administrator (Full Access)</option>
                                            <option value="Developer">Developer (Deploy & Read/Write)</option>
                                            <option value="Viewer">Viewer (Read Only)</option>
                                        </select>
                                    </div>

                                    <div className="pt-3 flex justify-end gap-2 border-t border-border">
                                        <button
                                            type="button"
                                            onClick={() => setIsInviteOpen(false)}
                                            className="h-9 px-4 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-surface-elevated cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="h-9 px-5 rounded bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] transition-all cursor-pointer"
                                        >
                                            Send Invitation
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </PageShell>
        </AppShell>
    );
}
