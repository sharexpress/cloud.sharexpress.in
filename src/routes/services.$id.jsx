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

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell } from "@/components/app/primitives";
import { 
  Globe, Copy, ExternalLink, GitBranch, Check, AlertTriangle, 
  ChevronDown, Settings, FileText, Activity, Shield, Terminal, 
  Sliders, Eye, HardDrive, Zap, RefreshCw, Lock, ArrowLeft, Plus, Play, Pause, Trash2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/services/$id")({
    validateSearch: (search) => ({
        tab: search?.tab ? String(search.tab) : "Events",
    }),
    head: () => ({ meta: [{ title: "Service Detail — Sharexpress Cloud" }] }),
    component: ServiceDetailPage,
});

function ServiceDetailPage() {
    const navigate = useNavigate();
    const params = Route.useParams();
    const search = Route.useSearch();
    const serviceId = params.id;
    const activeTab = search.tab || "Events";

    // Toast state
    const [toastMsg, setToastMsg] = useState("");
    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(""), 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
    };

    // Dropdown states
    const [isConnectOpen, setIsConnectOpen] = useState(false);
    const [isDeployOpen, setIsDeployOpen] = useState(false);
    const [isDeploying, setIsDeploying] = useState(false);

    // Mock Events Data (Matching Render Screenshot)
    const [events, setEvents] = useState([
        {
            id: "e1",
            type: "success",
            title: "Service recovered",
            desc: "Recently failed instances are now reporting healthy.",
            time: "May 31, 2026 at 11:19 PM",
        },
        {
            id: "e2",
            type: "error",
            title: "Instance failed: jxh4h",
            desc: "Exited with status 1 while running your code. Check your service logs for more information.",
            time: "May 31, 2026 at 11:19 PM",
            hasDebug: true,
        },
        {
            id: "e3",
            type: "success",
            title: "Deploy succeeded for commit 8f92a10",
            desc: "feat: add production-grade resource creation onboarding flow",
            time: "May 31, 2026 at 10:45 PM",
        },
        {
            id: "e4",
            type: "info",
            title: "Environment variables updated",
            desc: "Updated DATABASE_URL and SECRET_KEY",
            time: "May 30, 2026 at 04:12 PM",
        }
    ]);

    const handleManualDeploy = (clearCache = false) => {
        setIsDeploying(true);
        setIsDeployOpen(false);
        showToast(clearCache ? "Triggering build with clear cache..." : "Triggering manual deploy...");
        
        setTimeout(() => {
            setIsDeploying(false);
            const newEvt = {
                id: `e_${Date.now()}`,
                type: "success",
                title: clearCache ? "Deploy succeeded (Cache Cleared)" : "Deploy succeeded for latest commit",
                desc: "Manual deployment completed successfully.",
                time: "Just now",
            };
            setEvents([newEvt, ...events]);
            showToast("Deployment completed successfully!");
        }, 2500);
    };

    // Navigation sections in Render sidebar
    const NAV_ITEMS = [
        { label: "Events", icon: Activity, group: "main" },
        { label: "Settings", icon: Settings, group: "main" },
        { label: "Logs", icon: FileText, group: "MONITOR" },
        { label: "Metrics", icon: Activity, group: "MONITOR" },
        { label: "Environment", icon: Lock, group: "MANAGE" },
        { label: "Shell", icon: Terminal, group: "MANAGE" },
        { label: "Scaling", icon: Sliders, group: "MANAGE" },
        { label: "Previews", icon: Eye, group: "MANAGE" },
        { label: "Disk", icon: HardDrive, group: "MANAGE" },
        { label: "One-Off Jobs", icon: Zap, group: "MANAGE" },
    ];

    const mainNav = NAV_ITEMS.filter(i => i.group === "main");
    const monitorNav = NAV_ITEMS.filter(i => i.group === "MONITOR");
    const manageNav = NAV_ITEMS.filter(i => i.group === "MANAGE");

    return (
        <AppShell breadcrumbs={[{ label: "Projects", to: "/projects" }, { label: serviceId }]}>
            <PageShell>
                {/* Toast Notification */}
                {toastMsg && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-xs font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                        <Check className="h-4 w-4 text-emerald-400" />
                        {toastMsg}
                    </div>
                )}

                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                        {/* Left Sub-Navigation Sidebar (Matching Render Screenshot) */}
                        <div className="space-y-6 border-r border-border/60 pr-6">
                            <div>
                                <Link
                                    to="/projects"
                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Overview
                                </Link>

                                <div className="flex items-center gap-2 font-bold text-sm text-foreground truncate">
                                    <Globe className="h-4 w-4 text-[#5F6AD2]" />
                                    <span className="truncate">{serviceId}</span>
                                </div>
                            </div>

                            {/* Main Nav */}
                            <nav className="space-y-1">
                                {mainNav.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab.toLowerCase() === item.label.toLowerCase();
                                    return (
                                        <Link
                                            key={item.label}
                                            to="/services/$id"
                                            params={{ id: serviceId }}
                                            search={{ tab: item.label }}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                isActive 
                                                    ? "bg-[#5F6AD2]/15 text-[#5F6AD2] font-semibold border-l-2 border-[#5F6AD2]" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            {/* Monitor Nav */}
                            <div className="space-y-1">
                                <span className="px-3 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                    MONITOR
                                </span>
                                {monitorNav.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab.toLowerCase() === item.label.toLowerCase();
                                    return (
                                        <Link
                                            key={item.label}
                                            to="/services/$id"
                                            params={{ id: serviceId }}
                                            search={{ tab: item.label }}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                isActive 
                                                    ? "bg-[#5F6AD2]/15 text-[#5F6AD2] font-semibold border-l-2 border-[#5F6AD2]" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Manage Nav */}
                            <div className="space-y-1">
                                <span className="px-3 font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                                    MANAGE
                                </span>
                                {manageNav.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab.toLowerCase() === item.label.toLowerCase();
                                    return (
                                        <Link
                                            key={item.label}
                                            to="/services/$id"
                                            params={{ id: serviceId }}
                                            search={{ tab: item.label }}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer",
                                                isActive 
                                                    ? "bg-[#5F6AD2]/15 text-[#5F6AD2] font-semibold border-l-2 border-[#5F6AD2]" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-surface/50"
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Main Content Panel */}
                        <div className="space-y-6">
                            {/* Service Header Section (Matching Render Screenshot) */}
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/60 pb-5">
                                <div className="space-y-2 min-w-0">
                                    <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                        <Globe className="h-3.5 w-3.5 text-[#5F6AD2]" />
                                        <span>WEB SERVICE</span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                                            {serviceId}
                                        </h1>
                                        <span className="rounded bg-surface px-2 py-0.5 font-mono text-xs font-medium text-foreground border border-border">
                                            Node
                                        </span>
                                        <span className="rounded bg-[#5F6AD2]/15 text-[#5F6AD2] border border-[#5F6AD2]/30 px-2 py-0.5 font-mono text-xs font-semibold">
                                            Free
                                        </span>
                                        <button className="text-xs font-medium text-[#5F6AD2] hover:underline cursor-pointer">
                                            Upgrade your instance →
                                        </button>
                                    </div>

                                    {/* Service ID & Metadata */}
                                    <div className="space-y-1 font-mono text-xs text-muted-foreground pt-1">
                                        <div className="flex items-center gap-2">
                                            <span>Service ID: <span className="text-foreground font-semibold">srv-{serviceId.replace(/[^a-z0-9]/g, "")}</span></span>
                                            <button 
                                                onClick={() => copyToClipboard(`srv-${serviceId.replace(/[^a-z0-9]/g, "")}`)}
                                                className="hover:text-foreground transition-colors cursor-pointer"
                                                title="Copy Service ID"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <GitBranch className="h-3.5 w-3.5" />
                                            <span>santusht06 / {serviceId}</span>
                                            <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] border border-border">main</span>
                                        </div>

                                        <div className="flex items-center gap-2 pt-0.5">
                                            <button
                                                onClick={() => copyToClipboard(`https://${serviceId}.sharexpress.in`)}
                                                className="inline-flex items-center gap-1.5 text-[#5F6AD2] hover:underline font-semibold cursor-pointer"
                                            >
                                                <span>https://{serviceId}.sharexpress.in</span>
                                                <Copy className="h-3 w-3 opacity-80" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side Actions: Connect & Manual Deploy */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {/* Connect Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsConnectOpen(!isConnectOpen)}
                                            className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface text-xs font-semibold text-foreground hover:bg-surface-elevated active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                                        >
                                            Connect <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        </button>

                                        {isConnectOpen && (
                                            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border bg-surface p-3 shadow-2xl z-50 animate-in fade-in duration-150">
                                                <h4 className="text-xs font-bold text-foreground mb-2">Connection String</h4>
                                                <div className="bg-background p-2 rounded border border-border font-mono text-[11px] text-muted-foreground truncate mb-2">
                                                    ssh service@{serviceId}.sharexpress.in
                                                </div>
                                                <button
                                                    onClick={() => { copyToClipboard(`ssh service@${serviceId}.sharexpress.in`); setIsConnectOpen(false); }}
                                                    className="w-full h-8 rounded bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] transition-all"
                                                >
                                                    Copy SSH Command
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Manual Deploy Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsDeployOpen(!isDeployOpen)}
                                            disabled={isDeploying}
                                            className="h-9 px-4 inline-flex items-center gap-2 rounded-lg bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                        >
                                            {isDeploying ? (
                                                <>
                                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Deploying...
                                                </>
                                            ) : (
                                                <>
                                                    Manual Deploy <ChevronDown className="h-3.5 w-3.5 opacity-80" />
                                                </>
                                            )}
                                        </button>

                                        {isDeployOpen && (
                                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-surface py-1 shadow-2xl z-50 animate-in fade-in duration-150">
                                                <button
                                                    onClick={() => handleManualDeploy(false)}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-elevated flex items-center gap-2 cursor-pointer"
                                                >
                                                    <RefreshCw className="h-3.5 w-3.5 text-[#5F6AD2]" />
                                                    Deploy latest commit
                                                </button>
                                                <button
                                                    onClick={() => handleManualDeploy(true)}
                                                    className="w-full px-4 py-2 text-left text-xs font-medium text-foreground hover:bg-surface-elevated flex items-center gap-2 cursor-pointer border-t border-border/50"
                                                >
                                                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                                                    Clear build cache & deploy
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Service Notice Card (Matching Render Screenshot) */}
                            <div className="rounded-xl border border-[#5F6AD2]/30 bg-[#5F6AD2]/10 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-foreground">
                                <div className="flex items-center gap-2.5">
                                    <Zap className="h-4 w-4 text-[#5F6AD2] shrink-0" />
                                    <span>Your free instance will spin down with inactivity, which can delay requests by 50 seconds or more.</span>
                                </div>
                                <button className="text-xs font-bold text-[#5F6AD2] hover:underline shrink-0 cursor-pointer">
                                    Upgrade now
                                </button>
                            </div>

                            {/* --- TAB CONTENT: EVENTS --- */}
                            {activeTab.toLowerCase() === "events" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <button className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors cursor-pointer">
                                                Filter events <span className="rounded bg-background px-1.5 py-0.2 font-mono text-[10px] border border-border">{events.length}</span> <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Events List (Matching Render Screenshot) */}
                                    <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
                                        {events.map((evt) => (
                                            <div key={evt.id} className="p-5 flex items-start justify-between gap-4 hover:bg-surface/30 transition-colors">
                                                <div className="flex items-start gap-3.5">
                                                    {evt.type === "success" ? (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                                                            <Check className="h-4 w-4" />
                                                        </div>
                                                    ) : evt.type === "error" ? (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mt-0.5">
                                                            <AlertTriangle className="h-4 w-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5F6AD2]/10 text-[#5F6AD2] mt-0.5">
                                                            <Activity className="h-4 w-4" />
                                                        </div>
                                                    )}

                                                    <div className="space-y-1 min-w-0">
                                                        <h4 className="text-xs font-bold text-foreground">{evt.title}</h4>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">{evt.desc}</p>
                                                        <span className="font-mono text-[11px] text-muted-foreground block pt-1">{evt.time}</span>
                                                    </div>
                                                </div>

                                                {evt.hasDebug && (
                                                    <button className="h-7 px-3 inline-flex items-center gap-1 rounded border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0">
                                                        Debug <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB CONTENT: LOGS --- */}
                            {activeTab.toLowerCase() === "logs" && (
                                <div className="rounded-xl border border-border bg-background p-4 font-mono text-xs space-y-2 text-muted-foreground min-h-[300px]">
                                    <div className="text-emerald-400">[2026-08-01 15:22:10] ==&gt; Starting service with 'node server.js'</div>
                                    <div>[2026-08-01 15:22:11] ==&gt; App listening on port 8000</div>
                                    <div>[2026-08-01 15:22:12] ==&gt; Connected to PostgreSQL database</div>
                                    <div className="text-emerald-400">[2026-08-01 15:22:15] ==&gt; Health check OK (200 OK - 12ms)</div>
                                </div>
                            )}

                            {/* --- TAB CONTENT: SETTINGS --- */}
                            {activeTab.toLowerCase() === "settings" && (
                                <div className="rounded-xl border border-border bg-card p-6 space-y-4">
                                    <h3 className="text-sm font-bold text-foreground">Service Settings</h3>
                                    <div>
                                        <label className="block text-xs font-medium text-foreground mb-1">Service Name</label>
                                        <input
                                            type="text"
                                            defaultValue={serviceId}
                                            className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                        />
                                    </div>
                                    <div className="pt-2">
                                        <button
                                            onClick={() => showToast("Settings updated successfully!")}
                                            className="h-9 px-4 rounded-lg bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] transition-all cursor-pointer"
                                        >
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </PageShell>
        </AppShell>
    );
}
