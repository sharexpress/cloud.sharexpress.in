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

import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderGit2, Rocket, Cpu, Database, HardDrive, Zap, Globe, KeyRound, Network,
  Activity, ScrollText, Receipt, Users, Terminal, BookOpen, Settings,
  ChevronDown, ChevronRight, Check, Plus, X, Building2, ArrowLeft, BarChart3, Key, Layers, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, createWorkspace, switchWorkspace } from "@/store";
import { Sun, Moon } from "lucide-react";
import { SharexpressLogo } from "./logo";
import { useState, useRef, useEffect } from "react";

const primary = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { to: "/projects", label: "Projects", icon: FolderGit2 },
    { to: "/deployments", label: "Deployments", icon: Rocket },
];
const infra = [
    { to: "/compute", label: "Compute", icon: Cpu },
    { to: "/databases", label: "Databases", icon: Database },
    { to: "/storage", label: "Storage", icon: HardDrive },
    { to: "/functions", label: "Functions", icon: Zap },
    { to: "/domains", label: "Domains", icon: Globe },
    { to: "/secrets", label: "Secrets", icon: KeyRound },
    { to: "/networking", label: "Networking", icon: Network },
];
const observe = [
    { to: "/monitoring", label: "Monitoring", icon: Activity },
    { to: "/logs", label: "Logs", icon: ScrollText },
];
const account = [
    { to: "/billing", label: "Billing", icon: Receipt },
    { to: "/team", label: "Team", icon: Users },
    { to: "/api-keys", label: "API Keys", icon: Terminal },
    { to: "/docs", label: "Documentation", icon: BookOpen },
    { to: "/settings", label: "Settings", icon: Settings },
];

// Isolated Project-Specific Sub-Navigation
const projectNavPrimary = [
    { tab: "Overview", label: "Overview", icon: LayoutDashboard },
    { tab: "Deployments", label: "Deployments", icon: Rocket },
    { tab: "Environment", label: "Environment", icon: Key },
    { tab: "Domains", label: "Domains", icon: Globe },
];

const projectNavInfra = [
    { tab: "Storage", label: "Storage", icon: HardDrive },
    { tab: "Functions", label: "Functions", icon: Zap },
];

const projectNavObserve = [
    { tab: "Analytics", label: "Analytics", icon: BarChart3 },
    { tab: "Logs", label: "Logs", icon: ScrollText },
    { tab: "Activity", label: "Activity", icon: Activity },
];

const projectNavSettings = [
    { tab: "Settings", label: "Settings", icon: Settings },
];

// Isolated Database-Specific Sub-Navigation
const dbNavPrimary = [
    { tab: "Overview", label: "Overview", icon: LayoutDashboard },
    { tab: "Data Explorer", label: "Data Explorer", icon: Layers },
    { tab: "Query Console", label: "Query Console", icon: Terminal },
    { tab: "Connections", label: "Connections", icon: Users },
];

const dbNavManagement = [
    { tab: "Backups", label: "Backups", icon: HardDrive },
    { tab: "Logs", label: "Logs", icon: ScrollText },
    { tab: "Settings", label: "Settings", icon: Settings },
];

// Isolated Storage-Specific Sub-Navigation
const storageNavPrimary = [
    { tab: "Overview", label: "Overview", icon: LayoutDashboard },
    { tab: "File Browser", label: "File Browser", icon: FolderGit2 },
    { tab: "API & Keys", label: "API & Keys", icon: Key },
];

const storageNavManagement = [
    { tab: "CORS & Policy", label: "CORS & Policy", icon: ShieldCheck },
    { tab: "Logs", label: "Logs", icon: ScrollText },
    { tab: "Settings", label: "Settings", icon: Settings },
];

// Isolated Service-Specific Sub-Navigation (Matching Render Screenshot)
const serviceNavPrimary = [
    { tab: "Events", label: "Events", icon: Activity },
    { tab: "Settings", label: "Settings", icon: Settings },
];

const serviceNavMonitor = [
    { tab: "Logs", label: "Logs", icon: ScrollText },
    { tab: "Metrics", label: "Metrics", icon: BarChart3 },
];

const serviceNavManage = [
    { tab: "Environment", label: "Environment", icon: Key },
    { tab: "Shell", label: "Shell", icon: Terminal },
    { tab: "Scaling", label: "Scaling", icon: Sliders },
    { tab: "Previews", label: "Previews", icon: Eye },
    { tab: "Disk", label: "Disk", icon: HardDrive },
    { tab: "One-Off Jobs", label: "One-Off Jobs", icon: Zap },
];

function Section({ label, items }) {
    const path = useRouterState({ select: (s) => s.location.pathname });
    return (<div className="px-2 mb-1">
      {label ? (<div className="px-2.5 pb-1 pt-3 text-[10px] font-medium text-text-muted/70 flex items-center justify-between cursor-pointer hover:text-text-muted transition-colors">
          <span>{label}</span>
          <ChevronRight className="h-3 w-3 opacity-60" />
        </div>) : null}
      <ul className="space-y-0.5">
        {items.map((it) => {
            const Icon = it.icon;
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (<li key={it.to}>
              <Link to={it.to} className={cn("group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors", active
                    ? "bg-surface text-text-primary font-semibold border border-border/50 shadow-xs"
                    : "text-text-secondary hover:bg-surface/60 hover:text-text-primary border border-transparent")}>
                <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")}/>
                <span className="truncate">{it.label}</span>
              </Link>
            </li>);
        })}
      </ul>
    </div>);
}

/** Workspace monochrome badge */
function WorkspaceBadge({ name }) {
    const letter = name?.charAt(0)?.toUpperCase() || "W";
    return (
        <span className="inline-flex items-center justify-center rounded-md h-4.5 w-4.5 text-[9.5px] font-mono font-bold bg-surface border border-border text-text-primary shrink-0 select-none shadow-2xs">
            {letter}
        </span>
    );
}

/** Linear-style Sharexpress + Workspace dropdown switcher */
function WorkspaceHeaderSwitcher() {
    const dispatch = useDispatch();
    const workspaces = useSelector((s) => s.workspaces?.list || []);
    const activeId = useSelector((s) => s.workspaces?.activeWorkspaceId);
    const activeWs = workspaces.find((w) => w.id === activeId) || workspaces[0] || { name: "Acme Inc", color: "#7C3AED" };

    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
                setCreating(false);
                setNewName("");
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    // Focus input when creating
    useEffect(() => {
        if (creating && inputRef.current) inputRef.current.focus();
    }, [creating]);

    function handleSwitch(id) {
        dispatch(switchWorkspace(id));
        setOpen(false);
    }

    function handleCreate(e) {
        e.preventDefault();
        const trimmed = newName.trim();
        if (!trimmed) return;
        dispatch(createWorkspace({
            name: trimmed,
            slug: trimmed.toLowerCase().replace(/\s+/g, "-"),
            color: ["#7C3AED", "#0891B2", "#059669", "#DC2626", "#D97706"][Math.floor(Math.random() * 5)],
        }));
        setNewName("");
        setCreating(false);
        setOpen(false);
    }

    return (
        <div className="relative w-full min-w-0" ref={dropdownRef}>
            {/* Main Header Trigger with Sharexpress Logo + Workspace Name */}
            <button
                onClick={() => { setOpen((v) => !v); setCreating(false); setNewName(""); }}
                className="flex items-center gap-1.5 w-full min-w-0 cursor-pointer group hover:bg-surface/60 rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors"
                title="Switch or create workspace"
            >
                <SharexpressLogo className="h-4.5 w-4.5" />
                <span className="truncate text-xs font-semibold text-text-primary tracking-tight shrink-0">sharexpress</span>
                <span className="text-text-muted/40 font-mono text-[11px] px-0.5 select-none shrink-0">/</span>
                <span className="truncate text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors min-w-0 flex-1 text-left">
                    {activeWs?.name}
                </span>
                <ChevronDown className={cn("h-3 w-3 text-text-muted group-hover:text-text-primary transition-all shrink-0 ml-0.5", open && "rotate-180")} />
            </button>

            {/* Floating Glassmorphism Dropdown */}
            {open && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-[230px] rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* Header */}
                    <div className="px-3 pt-3 pb-2 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Workspaces</span>
                        <span className="text-[9px] font-mono text-text-muted/60">{workspaces.length} active</span>
                    </div>

                    {/* Workspace list */}
                    <ul className="px-1.5 pb-1.5 space-y-0.5 max-h-56 overflow-y-auto">
                        {workspaces.map((ws) => (
                            <li key={ws.id}>
                                <button
                                    onClick={() => handleSwitch(ws.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all group",
                                        ws.id === activeId
                                            ? "bg-surface border border-border/60 shadow-xs"
                                            : "hover:bg-surface/60 border border-transparent"
                                    )}
                                >
                                    <WorkspaceBadge name={ws.name} />
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-[12px] font-medium text-text-primary">{ws.name}</div>
                                        <div className="text-[10px] text-text-muted">{ws.plan || "Free"} · {ws.slug}</div>
                                    </div>
                                    {ws.id === activeId && (
                                        <Check className="h-3.5 w-3.5 text-accent-purple shrink-0" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Divider */}
                    <div className="h-px bg-border mx-3" />

                    {/* Create new workspace */}
                    <div className="p-1.5">
                        {creating ? (
                            <form onSubmit={handleCreate} className="flex items-center gap-1.5 px-2 py-1.5 bg-surface/80 rounded-lg border border-border">
                                <Building2 className="h-3.5 w-3.5 text-text-muted shrink-0" />
                                <input
                                    ref={inputRef}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Workspace name…"
                                    className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted outline-none min-w-0 font-medium"
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") { setCreating(false); setNewName(""); }
                                    }}
                                />
                                <button type="submit" className="text-[11px] font-semibold text-accent-purple hover:opacity-80 shrink-0 transition-opacity cursor-pointer">
                                    Create
                                </button>
                                <button type="button" onClick={() => { setCreating(false); setNewName(""); }} className="text-text-muted hover:text-text-primary shrink-0 transition-colors cursor-pointer">
                                    <X className="h-3 w-3" />
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setCreating(true)}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-text-muted hover:text-text-primary hover:bg-surface/60 border border-transparent transition-colors cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5 text-text-muted" />
                                <span>Create new workspace</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/** ISOLATED PROJECT DETAILS SIDEBAR */
function ProjectDetailSidebar({ projectSlug }) {
    const projects = useSelector((s) => s.projects?.list || []);
    const project = projects.find((p) => p.slug === projectSlug) || projects[0];
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    const locationSearch = useRouterState({ select: (s) => s.location.search });

    const activeTab = locationSearch?.tab || "Overview";

    function renderProjectSection(label, items) {
        return (
            <div className="px-2 mb-1">
                {label && (
                    <div className="px-2.5 pb-1 pt-3 text-[10px] font-medium text-text-muted/70 flex items-center justify-between">
                        <span>{label}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                    </div>
                )}
                <ul className="space-y-0.5">
                    {items.map((it) => {
                        const Icon = it.icon;
                        const active = activeTab.toLowerCase() === it.tab.toLowerCase();
                        return (
                            <li key={it.tab}>
                                <Link
                                    to="/projects/$id"
                                    params={{ id: projectSlug }}
                                    search={{ tab: it.tab }}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                                        active
                                            ? "bg-surface text-text-primary font-semibold border border-border/50 shadow-xs"
                                            : "text-text-secondary hover:bg-surface/60 hover:text-text-primary border border-transparent"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")} />
                                    <span className="truncate">{it.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-text-secondary select-none relative z-20 transition-colors border-r border-border/50">
            {/* Back to Workspace link */}
            <div className="px-3 pt-3.5 pb-2">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Projects</span>
                </Link>
            </div>

            {/* Project Header Box */}
            <div className="mx-2.5 mb-2 p-2.5 rounded-lg bg-surface/80 border border-border/80 text-left shrink-0 shadow-xs">
                <div className="truncate text-[13px] font-bold text-text-primary leading-tight">{project?.name || "Project"}</div>
                <div className="truncate text-[10px] text-text-muted mt-0.5 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    <span>{project?.framework || "Web App"}</span>
                </div>
            </div>

            {/* Sub-nav */}
            <nav className="flex-1 overflow-y-auto py-1 space-y-1">
                {renderProjectSection("Project Context", projectNavPrimary)}
                {renderProjectSection("Resources", projectNavInfra)}
                {renderProjectSection("Observability", projectNavObserve)}
                {renderProjectSection("Management", projectNavSettings)}
            </nav>

            {/* Sidebar bottom footer */}
            <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between bg-sidebar shrink-0 text-text-muted">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="flex items-center gap-2 text-[11px] hover:text-text-primary transition-colors cursor-pointer"
                >
                    {currentTheme === "dark" ? (
                        <>
                            <Sun className="h-3.5 w-3.5 text-amber-400" />
                            <span>Light Theme</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-3.5 w-3.5 text-accent-purple" />
                            <span>Dark Theme</span>
                        </>
                    )}
                </button>
                <span className="font-mono text-[9px] text-text-muted opacity-60">v2.4</span>
            </div>
        </aside>
    );
}

/** ISOLATED DATABASE DETAILS SIDEBAR */
function DatabaseDetailSidebar({ dbId }) {
    const databases = useSelector((s) => s.databases?.list || []);
    const database = databases.find((d) => d.id === dbId || d.name.toLowerCase() === dbId.toLowerCase()) || databases[0];
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    const locationSearch = useRouterState({ select: (s) => s.location.search });

    const activeTab = locationSearch?.tab || "Overview";

    function renderDbSection(label, items) {
        return (
            <div className="px-2 mb-1">
                {label && (
                    <div className="px-2.5 pb-1 pt-3 text-[10px] font-medium text-text-muted/70 flex items-center justify-between font-mono">
                        <span>{label}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                    </div>
                )}
                <ul className="space-y-0.5">
                    {items.map((it) => {
                        const Icon = it.icon;
                        const active = activeTab.toLowerCase() === it.tab.toLowerCase();
                        return (
                            <li key={it.tab}>
                                <Link
                                    to="/databases/$id"
                                    params={{ id: dbId }}
                                    search={{ tab: it.tab }}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                                        active
                                            ? "bg-surface text-text-primary font-semibold border border-border/50 shadow-xs"
                                            : "text-text-secondary hover:bg-surface/60 hover:text-text-primary border border-transparent"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")} />
                                    <span className="truncate">{it.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-text-secondary select-none relative z-20 transition-colors border-r border-border/50">
            {/* Back to Databases link */}
            <div className="px-3 pt-3.5 pb-2">
                <Link
                    to="/databases"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Databases</span>
                </Link>
            </div>

            {/* Database Header Box */}
            <div className="mx-2.5 mb-2 p-2.5 rounded-lg bg-surface/80 border border-border/80 text-left shrink-0 shadow-xs">
                <div className="truncate text-[13px] font-bold text-text-primary leading-tight">{database?.name || "Database"}</div>
                <div className="truncate text-[10px] text-text-muted mt-0.5 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    <span>{database?.engine || "PostgreSQL"}</span>
                </div>
            </div>

            {/* Sub-nav */}
            <nav className="flex-1 overflow-y-auto py-1 space-y-1">
                {renderDbSection("Database Context", dbNavPrimary)}
                {renderDbSection("Management", dbNavManagement)}
            </nav>

            {/* Sidebar bottom footer */}
            <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between bg-sidebar shrink-0 text-text-muted">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="flex items-center gap-2 text-[11px] hover:text-text-primary transition-colors cursor-pointer"
                >
                    {currentTheme === "dark" ? (
                        <>
                            <Sun className="h-3.5 w-3.5 text-amber-400" />
                            <span>Light Theme</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-3.5 w-3.5 text-accent-purple" />
                            <span>Dark Theme</span>
                        </>
                    )}
                </button>
                <span className="font-mono text-[9px] text-text-muted opacity-60">v2.4</span>
            </div>
        </aside>
    );
}

/** ISOLATED STORAGE DETAILS SIDEBAR */
function StorageDetailSidebar({ bucketId }) {
    const buckets = useSelector((s) => s.storage?.buckets || []);
    const bucket = buckets.find((b) => b.id === bucketId || b.name.toLowerCase() === bucketId.toLowerCase()) || buckets[0];
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    const locationSearch = useRouterState({ select: (s) => s.location.search });

    const activeTab = locationSearch?.tab || "Overview";

    function renderStorageSection(label, items) {
        return (
            <div className="px-2 mb-1">
                {label && (
                    <div className="px-2.5 pb-1 pt-3 text-[10px] font-medium text-text-muted/70 flex items-center justify-between font-mono">
                        <span>{label}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                    </div>
                )}
                <ul className="space-y-0.5">
                    {items.map((it) => {
                        const Icon = it.icon;
                        const active = activeTab.toLowerCase() === it.tab.toLowerCase();
                        return (
                            <li key={it.tab}>
                                <Link
                                    to="/storage/$id"
                                    params={{ id: bucketId }}
                                    search={{ tab: it.tab }}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                                        active
                                            ? "bg-surface text-text-primary font-semibold border border-border/50 shadow-xs"
                                            : "text-text-secondary hover:bg-surface/60 hover:text-text-primary border border-transparent"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-text-primary" : "text-text-muted group-hover:text-text-primary")} />
                                    <span className="truncate">{it.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-text-secondary select-none relative z-20 transition-colors border-r border-border/50">
            {/* Back to Storage link */}
            <div className="px-3 pt-3.5 pb-2">
                <Link
                    to="/storage"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Storage</span>
                </Link>
            </div>

            {/* Bucket Header Box */}
            <div className="mx-2.5 mb-2 p-2.5 rounded-lg bg-surface/80 border border-border/80 text-left shrink-0 shadow-xs">
                <div className="truncate text-[13px] font-bold text-text-primary leading-tight">{bucket?.name || "Bucket"}</div>
                <div className="truncate text-[10px] text-text-muted mt-0.5 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    <span>S3 Bucket · {bucket?.visibility || "public"}</span>
                </div>
            </div>

            {/* Sub-nav */}
            <nav className="flex-1 overflow-y-auto py-1 space-y-1">
                {renderStorageSection("Storage Context", storageNavPrimary)}
                {renderStorageSection("Management", storageNavManagement)}
            </nav>

            {/* Sidebar bottom footer */}
            <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between bg-sidebar shrink-0 text-text-muted">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="flex items-center gap-2 text-[11px] hover:text-text-primary transition-colors cursor-pointer"
                >
                    {currentTheme === "dark" ? (
                        <>
                            <Sun className="h-3.5 w-3.5 text-amber-400" />
                            <span>Light Theme</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-3.5 w-3.5 text-accent-purple" />
                            <span>Dark Theme</span>
                        </>
                    )}
                </button>
                <span className="font-mono text-[9px] text-text-muted opacity-60">v2.4</span>
            </div>
        </aside>
    );
}

/** ISOLATED SERVICE DETAILS SIDEBAR (Render Screenshot Match) */
function ServiceDetailSidebar({ serviceId }) {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    const locationSearch = useRouterState({ select: (s) => s.location.search });

    const activeTab = locationSearch?.tab || "Events";

    function renderServiceSection(label, items) {
        return (
            <div className="px-2 mb-1">
                {label ? (
                    <div className="px-2.5 pb-1 pt-3 text-[10px] font-bold text-text-muted/70 flex items-center justify-between font-mono uppercase tracking-wider">
                        <span>{label}</span>
                        <ChevronRight className="h-3 w-3 opacity-60" />
                    </div>
                ) : null}
                <ul className="space-y-0.5">
                    {items.map((it) => {
                        const Icon = it.icon;
                        const active = (activeTab || "").toLowerCase() === it.tab.toLowerCase();
                        return (
                            <li key={it.tab}>
                                <Link
                                    to="/services/$id"
                                    params={{ id: serviceId }}
                                    search={{ tab: it.tab }}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors cursor-pointer",
                                        active
                                            ? "bg-[#5F6AD2]/15 text-[#5F6AD2] font-semibold border border-[#5F6AD2]/30 shadow-xs"
                                            : "text-text-secondary hover:bg-surface/60 hover:text-text-primary border border-transparent"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-[#5F6AD2]" : "text-text-muted group-hover:text-text-primary")} />
                                    <span className="truncate">{it.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    }

    return (
        <aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-text-secondary select-none relative z-20 transition-colors border-r border-border/50">
            {/* Back link */}
            <div className="px-3 pt-3.5 pb-2">
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-muted hover:text-text-primary transition-colors group"
                >
                    <ArrowLeft className="h-3.5 w-3.5 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Dashboard</span>
                </Link>
            </div>

            {/* Service Header Box */}
            <div className="mx-2.5 mb-2 p-2.5 rounded-lg bg-surface/80 border border-border/80 text-left shrink-0 shadow-xs">
                <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold text-muted-foreground uppercase mb-0.5">
                    <Globe className="h-3 w-3 text-[#5F6AD2]" />
                    <span>Web Service</span>
                </div>
                <div className="truncate text-[13px] font-bold text-text-primary leading-tight">{serviceId}</div>
                <div className="truncate text-[10px] text-text-muted mt-0.5 flex items-center gap-1 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-success shrink-0" />
                    <span>Node · Free</span>
                </div>
            </div>

            {/* Sub-nav */}
            <nav className="flex-1 overflow-y-auto py-1 space-y-1">
                {renderServiceSection("", serviceNavPrimary)}
                {renderServiceSection("MONITOR", serviceNavMonitor)}
                {renderServiceSection("MANAGE", serviceNavManage)}
            </nav>

            {/* Sidebar bottom footer */}
            <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between bg-sidebar shrink-0 text-text-muted">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="flex items-center gap-2 text-[11px] hover:text-text-primary transition-colors cursor-pointer"
                >
                    {currentTheme === "dark" ? (
                        <>
                            <Sun className="h-3.5 w-3.5 text-amber-400" />
                            <span>Light Theme</span>
                        </>
                    ) : (
                        <>
                            <Moon className="h-3.5 w-3.5 text-accent-purple" />
                            <span>Dark Theme</span>
                        </>
                    )}
                </button>
                <span className="font-mono text-[9px] text-text-muted opacity-60">v2.4</span>
            </div>
        </aside>
    );
}

export function AppSidebar() {
    const dispatch = useDispatch();
    const currentTheme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    const path = useRouterState({ select: (s) => s.location.pathname });

    // Detect if we are inside a specific service details route (/services/:id)
    const serviceMatch = path.match(/^\/services\/([^\/]+)/);
    const isServiceDetail = Boolean(serviceMatch && serviceMatch[1] !== "new");
    const serviceId = serviceMatch ? serviceMatch[1] : null;

    if (isServiceDetail && serviceId) {
        return <ServiceDetailSidebar serviceId={serviceId} />;
    }

    // Detect if we are inside a specific project details route (/projects/:id)
    const projectMatch = path.match(/^\/projects\/([^\/]+)/);
    const isProjectDetail = Boolean(projectMatch && projectMatch[1] !== "new");
    const projectSlug = projectMatch ? projectMatch[1] : null;

    if (isProjectDetail && projectSlug) {
        return <ProjectDetailSidebar projectSlug={projectSlug} />;
    }

    // Detect if we are inside a specific database details route (/databases/:id)
    const dbMatch = path.match(/^\/databases\/([^\/]+)/);
    const isDbDetail = Boolean(dbMatch && dbMatch[1] !== "new");
    const dbId = dbMatch ? dbMatch[1] : null;

    if (isDbDetail && dbId) {
        return <DatabaseDetailSidebar dbId={dbId} />;
    }

    // Detect if we are inside a specific storage details route (/storage/:id)
    const storageMatch = path.match(/^\/storage\/([^\/]+)/);
    const isStorageDetail = Boolean(storageMatch && storageMatch[1] !== "new");
    const bucketId = storageMatch ? storageMatch[1] : null;

    if (isStorageDetail && bucketId) {
        return <StorageDetailSidebar bucketId={bucketId} />;
    }

    return (<aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-sidebar text-text-secondary select-none relative z-20 transition-colors">

      {/* Header: Sharexpress Logo + Workspace Selector */}
      <div className="flex h-12 items-center justify-between px-3.5 pt-2 shrink-0">
        <WorkspaceHeaderSwitcher />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-1">
        <Section items={primary}/>
        <Section label="Workspace" items={infra}/>
        <Section label="Observability" items={observe}/>
        <Section label="Account" items={account}/>
      </nav>

      {/* "What's new" card matching Linear screenshot */}
      <div className="mx-2.5 mb-2.5 p-3 rounded-xl bg-surface border border-border/80 text-left shrink-0 shadow-xs">
        <span className="text-[10px] text-text-muted font-medium block">What's new</span>
        <span className="text-[11px] font-semibold text-text-primary mt-0.5 block leading-tight">
          Isolated workspaces with custom role permissions
        </span>
      </div>

      {/* Sidebar bottom footer with Theme toggle */}
      <div className="border-t border-border/60 px-3 py-2 flex items-center justify-between bg-sidebar shrink-0 text-text-muted">
        <button
          onClick={() => dispatch(toggleTheme())}
          className="flex items-center gap-2 text-[11px] hover:text-text-primary transition-colors cursor-pointer"
        >
          {currentTheme === "dark" ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span>Light Theme</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-accent-purple" />
              <span>Dark Theme</span>
            </>
          )}
        </button>
        <span className="font-mono text-[9px] text-text-muted opacity-60">v2.4</span>
      </div>
    </aside>);
}
