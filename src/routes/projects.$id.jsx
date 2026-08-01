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

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, Panel, Metric, StatusBadge, AreaChart, Sparkline } from "@/components/app/primitives";
import { 
  Copy, ExternalLink, GitBranch, Rocket, ShieldCheck, Eye, EyeOff, 
  Trash2, Plus, X, Globe, Database, HardDrive, Cpu, Terminal, Play, 
  Pause, Check, Settings2, Trash, AlertTriangle, FileText, ArrowRight, Layers
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  addDeployment, triggerRollback, addSecret, deleteSecret,
  addDomain, verifyDomain, deleteDomain, addFunction, triggerFunction,
  deleteProject, uploadFile, deleteFile
} from "../store/index.js";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/$id")({
    validateSearch: (search) => ({
        tab: search.tab ? String(search.tab) : "Overview",
    }),
    head: () => ({ meta: [{ title: "Project Detail — Sharexpress Cloud" }] }),
    component: ProjectDetailPage,
});

// Global helper function for chart data generation
const TABS = ["Overview", "Deployments", "Environment", "Domains", "Storage", "Functions", "Analytics", "Logs", "Activity", "Settings"];

const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
    const out = [];
    for (let i = 0; i < len; i++) {
        const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
        out.push(Math.max(4, Math.min(100, Math.round(v))));
    }
    return out;
};

function ProjectDetailPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = Route.useParams();
    const search = Route.useSearch();
    const projectSlug = params.id;

    // Redux selectors with null-safety
    const projects = useSelector((state) => state.projects?.list || []);
    const deployments = useSelector((state) => state.deployments?.list || []);
    const secrets = useSelector((state) => state.secrets?.list || []);
    const domains = useSelector((state) => state.domains?.list || []);
    const functions = useSelector((state) => state.functions?.list || []);
    const storeStorage = useSelector((state) => state.storage || {});
    const teamMembers = useSelector((state) => state.team?.members || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId);
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    // Active project check
    const project = projects.find((p) => p.slug === projectSlug) || projects[0];
    
    // Derive active tab from URL search state
    const rawTab = search.tab || "Overview";
    const tab = TABS.find((t) => t.toLowerCase() === rawTab.toLowerCase()) || "Overview";

    if (!project) {
        return (
            <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Projects" }]}>
                <PageShell>
                    <div className="text-center py-20">
                        <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
                        <Link to="/projects" className="mt-4 inline-block text-accent hover:underline">Back to projects</Link>
                    </div>
                </PageShell>
            </AppShell>
        );
    }

    // Filter project-specific data with 100% null-safety
    const rawProjectDeploys = (deployments || []).filter((d) => (d.project || "").toLowerCase() === (project.name || "").toLowerCase() || (d.project || "").toLowerCase().includes((project.name || "").toLowerCase()));
    const defaultDeploys = [
        { id: "dep-1", message: "Initial production deployment", branch: project.branch || "main", commit: "a4f892c", author: "santusht06", duration: "42s", createdAt: "10 mins ago", status: "ready" },
        { id: "dep-2", message: "Update environment variables and database config", branch: project.branch || "main", commit: "b89e10f", author: "santusht06", duration: "38s", createdAt: "2 hours ago", status: "ready" },
        { id: "dep-3", message: "Optimize bundle size and static assets", branch: project.branch || "main", commit: "c71a39d", author: "santusht06", duration: "45s", createdAt: "1 day ago", status: "ready" },
    ];
    const projectDeploys = rawProjectDeploys.length > 0 ? rawProjectDeploys : defaultDeploys;

    const projectSecrets = (secrets || []).filter((s) => (s.scope || "").toLowerCase() === (project.name || "").toLowerCase() || (s.scope || "").toLowerCase() === "all projects");
    const projectDomains = (domains || []).filter((d) => (d.project || "").toLowerCase() === (project.name || "").toLowerCase());
    const projectFiles = (storeStorage.currentObjects || storeStorage.files || []).filter((f) => f.bucketId === storeStorage.activeBucketId || true);

    // --- State for Interactive Features ---
    const [copiedText, setCopiedText] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const triggerCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedText(text);
        showToast("Copied to clipboard!");
        setTimeout(() => setCopiedText(""), 2000);
    };

    // Redeploy Simulator
    const handleRedeploy = () => {
        const randomCommit = Math.random().toString(36).substring(2, 9);
        dispatch(addDeployment({
            project: project.name,
            branch: project.branch,
            commit: randomCommit,
            message: "Manual redeployment triggered",
            author: "Jordan Lee",
            authorAvatar: "JL",
            environment: "production",
            url: project.domain,
        }));
        showToast("Redeployment triggered successfully!");
    };

    // Rollback Simulator
    const handleRollback = (dpl) => {
        dispatch(triggerRollback({
            deploymentId: dpl.id,
            projectName: project.name,
        }));
        showToast(`Triggering rollback to commit ${dpl.commit}...`);
    };

    // --- State for Interactive Services Inside Project Container ---
    const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
    const [newServiceType, setNewServiceType] = useState("web_service");
    const [newServiceName, setNewServiceName] = useState("");
    const [newServiceFramework, setNewServiceFramework] = useState("Node.js");
    
    // Project services stack (Frontend, Backend, DB, etc inside this project container)
    const [projectServices, setProjectServices] = useState([
        { id: "s1", name: `${project.name}-frontend`, type: "Frontend Site", framework: project.framework || "Vite + React", status: "ready", url: project.domain, region: "Ashburn (iad1)" },
        { id: "s2", name: `${project.name}-api`, type: "Web Service", framework: "Node.js Express", status: "ready", url: `api-${project.domain}`, region: "Ashburn (iad1)" },
        { id: "s3", name: `${project.name}-db`, type: "PostgreSQL Database", framework: "Postgres 16", status: "ready", url: `postgres://${project.name}:***@db.sharexpress.in:5432`, region: "Ashburn (iad1)" },
    ]);

    const handleAddServiceToProject = (e) => {
        e.preventDefault();
        if (!newServiceName.trim()) return;

        const newSvc = {
            id: `s_${Date.now()}`,
            name: newServiceName.trim(),
            type: newServiceType === "web_service" ? "Web Service" : newServiceType === "static" ? "Frontend Site" : newServiceType === "postgres" ? "PostgreSQL Database" : "Background Worker",
            framework: newServiceFramework,
            status: "ready",
            url: `${newServiceName.trim().toLowerCase()}.sharexpress.in`,
            region: "Ashburn (iad1)",
        };

        setProjectServices([...projectServices, newSvc]);
        setNewServiceName("");
        setIsAddServiceModalOpen(false);
        showToast(`Added ${newSvc.name} to project folder`);
    };

    return (<AppShell breadcrumbs={[
        { label: activeWsName, to: "/dashboard" },
        { label: "Projects", to: "/projects" },
        { 
            label: project.name, 
            to: "/projects/$id", 
            params: { id: projectSlug },
            search: { tab: tab },
            options: projects.map((p) => ({
                label: p.name,
                to: "/projects/$id",
                params: { id: p.slug },
                search: { tab: tab }
            }))
        },
        { 
            label: tab, 
            options: TABS.map((t) => ({
                label: t,
                to: "/projects/$id",
                params: { id: projectSlug },
                search: { tab: t }
            }))
        }
    ]}>
      <PageShell>
        
        {/* Dynamic Toast Indicator */}
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        {/* Clean, Elegant Header (Vercel / Render Style) */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground">{project.name}</h1>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
              <span className="text-foreground/80">{project.framework || "Node.js"}</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5"/>{project.repo} ({project.branch})</span>
              <span>·</span>
              <button onClick={() => triggerCopy(project.domain)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer group">
                <Globe className="h-3.5 w-3.5 text-[#5F6AD2]"/>
                <span>{project.domain}</span>
                <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100"/>
              </button>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button 
                onClick={() => setIsAddServiceModalOpen(true)}
                className="h-9 px-4 inline-flex items-center gap-2 rounded-lg bg-[#5F6AD2] text-xs font-semibold text-white shadow-xs hover:bg-[#4F5ABF] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Service
            </button>
            <button onClick={() => window.open(`https://${project.domain}`, "_blank")} className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-elevated active:scale-[0.98] transition-all cursor-pointer shadow-xs">
              <ExternalLink className="h-3.5 w-3.5" /> Visit Site
            </button>
            <button 
                onClick={handleRedeploy}
                className="h-9 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface text-xs font-medium text-foreground hover:bg-surface-elevated active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              <Rocket className="h-3.5 w-3.5 text-[#5F6AD2]"/> Redeploy
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-px">
          {TABS.map((t) => (
            <Link 
              key={t} 
              to="/projects/$id"
              params={{ id: projectSlug }}
              search={{ tab: t }} 
              className={cn(
                "whitespace-nowrap border-b-2 px-3.5 py-2 text-xs font-medium transition-all cursor-pointer relative",
                tab === t 
                  ? "border-[#5F6AD2] text-foreground font-semibold" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* --- TABS IMPLEMENTATIONS --- */}

        {/* OVERVIEW TAB */}
        {tab === "Overview" && (<>
            {/* Services Grid (Flat & Clean) */}
            <div className="mb-8 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-foreground tracking-tight">Project Services ({projectServices.length})</h2>
                    <button
                        onClick={() => setIsAddServiceModalOpen(true)}
                        className="text-xs text-[#5F6AD2] hover:underline font-semibold cursor-pointer"
                    >
                        + Add Service
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {projectServices.map((svc) => (
                        <Link 
                            key={svc.id} 
                            to="/services/$id"
                            params={{ id: svc.name || svc.slug || "backend-setup-portfolio" }}
                            search={{ tab: "Events" }}
                            className="rounded-xl border border-border bg-card p-4.5 hover:border-[#5F6AD2]/60 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {svc.type.includes("Frontend") ? <Globe className="h-4 w-4 text-[#5F6AD2] shrink-0" /> :
                                         svc.type.includes("Database") ? <Database className="h-4 w-4 text-emerald-400 shrink-0" /> :
                                         <Cpu className="h-4 w-4 text-sky-400 shrink-0" />}
                                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-[#5F6AD2] transition-colors">{svc.name}</span>
                                    </div>
                                    <span className="rounded bg-surface px-2 py-0.5 font-mono text-[9.5px] text-muted-foreground border border-border shrink-0">
                                        {svc.type}
                                    </span>
                                </div>

                                <div className="font-mono text-[11px] text-muted-foreground truncate my-3">
                                    {svc.url}
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[11px] font-mono border-t border-border/50 pt-2.5">
                                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Deployed
                                </span>
                                <span className="text-muted-foreground">{svc.region}</span>
                            </div>
                        </Link>
                    ))}

                    {/* Dashed Add Service Card */}
                    <button
                        onClick={() => setIsAddServiceModalOpen(true)}
                        className="rounded-xl border border-dashed border-border hover:border-[#5F6AD2] bg-surface/30 hover:bg-[#5F6AD2]/5 p-4.5 transition-all flex flex-col items-center justify-center text-center cursor-pointer group min-h-[120px]"
                    >
                        <Plus className="h-4 w-4 text-muted-foreground group-hover:text-[#5F6AD2] transition-colors mb-1" />
                        <span className="text-xs font-semibold text-foreground group-hover:text-[#5F6AD2] transition-colors">
                            Add Service to Project
                        </span>
                        <span className="text-[10.5px] text-muted-foreground mt-0.5">
                            Frontend, API, Postgres, or Worker
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <Metric label="Requests / min" value="12.4k" delta={{ value: "+4.2%", positive: true }} series={metricSeries(2)}/>
              <Metric label="Avg latency" value="118ms" delta={{ value: "-6ms", positive: true }} series={metricSeries(4)}/>
              <Metric label="Error rate" value="0.04%" delta={{ value: "-0.01%", positive: true }} series={metricSeries(6)}/>
              <Metric label="Bandwidth" value="188 MB" hint="last hour" series={metricSeries(8)}/>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <Panel title="Requests" className="lg:col-span-2">
                <AreaChart data={metricSeries(9, 48, 60, 60)} unit="reqs/min"/>
              </Panel>
              <Panel title="Latest deployments" padded={false} actions={<button onClick={() => setTab("Deployments")} className="text-[11px] text-muted-foreground hover:text-foreground">View all</button>}>
                {projectDeploys.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground text-[12.5px]">No deployments found.</div>
                ) : (
                  <ul className="divide-y divide-border">
                    {projectDeploys.slice(0, 4).map((d) => (<li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-5 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-[12.5px] font-medium text-foreground">{d.message}</div>
                          <div className="truncate text-[11px] text-muted-foreground">{d.branch} · {d.commit} · {d.author}</div>
                        </div>
                        <StatusBadge status={d.status}/>
                      </li>))}
                  </ul>
                )}
              </Panel>
            </div>
          </>)}

        {/* DEPLOYMENTS TAB */}
        {tab === "Deployments" && (<Panel padded={false}>
            {projectDeploys.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-[13px]">No deployments found for this project.</div>
            ) : (
              <ul className="divide-y divide-border animate-in fade-in duration-200">
                {projectDeploys.map((d) => (<li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 hover:bg-surface-elevated/20 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-foreground">{d.message}</span>
                        <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{d.commit}</span>
                      </div>
                      <div className="truncate text-[11.5px] text-muted-foreground">{d.branch} · {d.author} · {d.duration} · {d.createdAt}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={d.status}/>
                      <button 
                        onClick={() => handleRollback(d)}
                        className="h-7 rounded-md border border-border bg-background px-2.5 text-[11px] text-foreground hover:border-border-strong transition-colors cursor-pointer"
                      >
                        Rollback
                      </button>
                    </div>
                  </li>))}
              </ul>
            )}
          </Panel>)}

        {/* ENVIRONMENT VARIABLES TAB */}
        {tab === "Environment" && (<EnvironmentTab project={project} secrets={projectSecrets} dispatch={dispatch} showToast={showToast} />)}

        {/* DOMAINS TAB */}
        {tab === "Domains" && (<DomainsTab project={project} domains={projectDomains} dispatch={dispatch} showToast={showToast} />)}

        {/* STORAGE TAB */}
        {tab === "Storage" && (<StorageTab project={project} files={projectFiles} buckets={storeStorage.buckets} activeBucketId={storeStorage.activeBucketId} dispatch={dispatch} showToast={showToast} triggerCopy={triggerCopy} />)}

        {/* FUNCTIONS TAB */}
        {tab === "Functions" && (<FunctionsTab project={project} functions={functions} dispatch={dispatch} showToast={showToast} />)}

        {/* ANALYTICS TAB */}
        {tab === "Analytics" && (<AnalyticsTab metricSeries={metricSeries} />)}

        {/* LOGS TAB */}
        {tab === "Logs" && (<LogsTab project={project} />)}

        {/* ACTIVITY TAB */}
        {tab === "Activity" && (<ActivityTab project={project} />)}

        {/* SETTINGS TAB */}
        {tab === "Settings" && (<SettingsTab project={project} dispatch={dispatch} router={router} showToast={showToast} />)}

        {/* Modular Add Service to Project Modal */}
        {isAddServiceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
                <div className="w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Project Folder: {project.name}</span>
                            <h3 className="text-base font-bold text-foreground">Add New Service</h3>
                        </div>
                        <button
                            onClick={() => setIsAddServiceModalOpen(false)}
                            className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <form onSubmit={handleAddServiceToProject} className="mt-4 space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-foreground mb-2">Select Service Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { id: "web_service", label: "Web Service / API", icon: Cpu, desc: "Node, Express, FastAPI, Go" },
                                    { id: "static", label: "Frontend Site", icon: Globe, desc: "Vite, React, Next.js, Astro" },
                                    { id: "postgres", label: "Database", icon: Database, desc: "Postgres 16, Redis, Mongo" },
                                    { id: "worker", label: "Background Worker", icon: Terminal, desc: "Queue processing, Cron" },
                                ].map((t) => {
                                    const Icon = t.icon;
                                    const isSel = newServiceType === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setNewServiceType(t.id)}
                                            className={cn(
                                                "p-3 rounded-lg border text-left transition-all cursor-pointer",
                                                isSel ? "border-[#5F6AD2] bg-[#5F6AD2]/10" : "border-border bg-background hover:border-border-strong"
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Icon className={cn("h-4 w-4", isSel ? "text-[#5F6AD2]" : "text-muted-foreground")} />
                                                <span className="text-xs font-bold text-foreground">{t.label}</span>
                                            </div>
                                            <p className="text-[10.5px] text-muted-foreground font-mono">{t.desc}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Service Identifier</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. auth-api or checkout-frontend"
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-foreground mb-1">Framework / Runtime</label>
                            <select
                                value={newServiceFramework}
                                onChange={(e) => setNewServiceFramework(e.target.value)}
                                className="h-9 w-full rounded-md border border-border bg-background px-2 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                            >
                                <option value="Node.js">Node.js Express / NestJS</option>
                                <option value="Vite + React">Vite + React / Vue</option>
                                <option value="Next.js">Next.js App Router</option>
                                <option value="Python FastAPI">Python FastAPI / Django</option>
                                <option value="Go API">Go Fiber / Gin</option>
                                <option value="Postgres 16">Managed PostgreSQL 16</option>
                                <option value="Redis 7">Managed Redis Cache</option>
                            </select>
                        </div>

                        <div className="pt-3 flex justify-end gap-2 border-t border-border">
                            <button
                                type="button"
                                onClick={() => setIsAddServiceModalOpen(false)}
                                className="h-9 px-4 rounded border border-border bg-background text-xs font-medium text-foreground hover:bg-surface-elevated cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="h-9 px-5 rounded bg-[#5F6AD2] text-xs font-semibold text-white hover:bg-[#4F5ABF] transition-all cursor-pointer"
                            >
                                Provision Service in {project.name}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </PageShell>
    </AppShell>);
}

// ==========================================
// --- ENVIRONMENT TAB COMPONENT ---
// ==========================================
function EnvironmentTab({ project, secrets, dispatch, showToast }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const [env, setEnv] = useState("production");
    const [reveal, setReveal] = useState({});

    const handleAdd = (e) => {
        e.preventDefault();
        if (!key.trim() || !value.trim()) return;

        dispatch(addSecret({
            key: key.trim().toUpperCase(),
            value: value.trim(),
            scope: project.name,
            environment: env,
        }));

        setKey("");
        setValue("");
        setIsAddOpen(false);
        showToast("Environment variable added successfully.");
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this environment variable?")) {
            dispatch(deleteSecret(id));
            showToast("Environment variable deleted.");
        }
    };

    return (
        <Panel title="Environment Variables" description="Define encrypted environment variables for your application environments." actions={
            <button onClick={() => setIsAddOpen(true)} className="inline-flex h-7 items-center gap-1 rounded bg-foreground px-2.5 text-[11px] font-medium text-background hover:opacity-90 cursor-pointer">
                <Plus className="h-3 w-3" /> Add variable
            </button>
        }>
            {isAddOpen && (
                <form onSubmit={handleAdd} className="mb-4 border border-border p-4 rounded-md bg-surface-elevated space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[11px] text-muted-foreground">Key</label>
                            <input 
                                type="text" required placeholder="API_SECRET_KEY" value={key} onChange={(e) => setKey(e.target.value)}
                                className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[12px] font-mono text-foreground focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[11px] text-muted-foreground">Value</label>
                            <input 
                                type="password" required placeholder="••••••••••••••" value={value} onChange={(e) => setValue(e.target.value)}
                                className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[12px] font-mono text-foreground focus:border-accent focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/60 pt-3">
                        <select 
                            value={env} onChange={(e) => setEnv(e.target.value)}
                            className="h-8 rounded border border-border bg-background px-2 text-[11px] text-foreground focus:outline-none"
                        >
                            <option value="production">Production</option>
                            <option value="preview">Preview</option>
                            <option value="all">All environments</option>
                        </select>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAddOpen(false)} className="h-8 px-3 rounded border border-border text-[11px] text-foreground hover:bg-background">Cancel</button>
                            <button type="submit" className="h-8 px-3 rounded bg-foreground text-[11px] font-medium text-background hover:opacity-90">Save</button>
                        </div>
                    </div>
                </form>
            )}

            {secrets.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-[12.5px]">No secrets defined for this project.</div>
            ) : (
                <div className="space-y-2">
                    {secrets.map((s) => (
                        <div key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
                            <div className="min-w-0">
                                <div className="font-mono text-[12px] font-medium text-foreground">{s.key}</div>
                                <div className="font-mono text-[11.5px] text-muted-foreground truncate max-w-md mt-0.5">
                                    {reveal[s.id] ? (s.value || "sk_live_prod_stripe_token_2026") : "•••••••••••••••••••••••••"}
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[9.5px] font-medium text-muted-foreground uppercase">{s.environment}</span>
                                <button 
                                    onClick={() => setReveal(prev => ({...prev, [s.id]: !prev[s.id]}))}
                                    className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {reveal[s.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.id)}
                                    className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-destructive transition-colors cursor-pointer"
                                >
                                    <Trash className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
}

// ==========================================
// --- DOMAINS TAB COMPONENT ---
// ==========================================
function DomainsTab({ project, domains, dispatch, showToast }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [host, setHost] = useState("");

    const handleAdd = (e) => {
        e.preventDefault();
        if (!host.trim()) return;

        dispatch(addDomain({
            host: host.trim(),
            project: project.name,
        }));
        setHost("");
        setIsAddOpen(false);
        showToast("Domain added. Configure DNS settings to verify.");
    };

    const handleVerify = (id, hostName) => {
        dispatch(verifyDomain(id));
        showToast(`Domain ${hostName} verified and SSL issued!`);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this custom domain?")) {
            dispatch(deleteDomain(id));
            showToast("Custom domain deleted.");
        }
    };

    return (
        <div className="space-y-4">
            <Panel title="Domains" description="Point custom domains to this project and configure automatic TLS certificates." actions={
                <button onClick={() => setIsAddOpen(true)} className="inline-flex h-7 items-center gap-1 rounded bg-foreground px-2.5 text-[11px] font-medium text-background hover:opacity-90 cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Domain
                </button>
            }>
                {isAddOpen && (
                    <form onSubmit={handleAdd} className="mb-4 border border-border p-4 rounded-md bg-surface-elevated flex items-end gap-3 animate-in slide-in-from-top-2 duration-150">
                        <div className="flex-1">
                            <label className="text-[11px] text-muted-foreground block mb-1">Domain Name</label>
                            <input 
                                type="text" required placeholder="www.acme.com" value={host} onChange={(e) => setHost(e.target.value)}
                                className="h-8 w-full rounded border border-border bg-background px-2.5 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setIsAddOpen(false)} className="h-8 px-3 rounded border border-border text-[11px] text-foreground hover:bg-background">Cancel</button>
                            <button type="submit" className="h-8 px-3 rounded bg-foreground text-[11px] font-medium text-background hover:opacity-90">Add</button>
                        </div>
                    </form>
                )}

                {domains.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-[12.5px]">No custom domains configured.</div>
                ) : (
                    <ul className="divide-y divide-border">
                        {domains.map((d) => (
                            <li key={d.id} className="py-3.5 first:pt-0 last:pb-0 grid md:grid-cols-[1fr_auto] items-start gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-[13.5px] font-medium text-foreground">{d.host}</span>
                                        <StatusBadge status={d.status} />
                                    </div>
                                    
                                    {d.status === "pending" ? (
                                        <div className="rounded border border-border bg-surface-elevated/40 p-3 text-[11px] space-y-2 text-muted-foreground font-mono">
                                            <div className="text-foreground font-semibold">DNS Configuration Required:</div>
                                            <div>Type: <span className="text-foreground">CNAME</span></div>
                                            <div>Name: <span className="text-foreground">@</span></div>
                                            <div>Value: <span className="text-foreground">cname.sharexpress.in</span></div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                                            <span className="flex items-center gap-1 text-foreground font-medium">
                                                <ShieldCheck className="h-3.5 w-3.5" /> SSL Issued (Let's Encrypt)
                                            </span>
                                            <span>·</span>
                                            <span>Expires {d.expires}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {d.status === "pending" && (
                                        <button 
                                            onClick={() => handleVerify(d.id, d.host)}
                                            className="h-7 rounded border border-border bg-background px-3 text-[11px] font-medium text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                                        >
                                            Verify DNS
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(d.id)}
                                        className="h-7 rounded border border-border bg-background p-1.5 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </div>
    );
}

// ==========================================
// --- STORAGE TAB COMPONENT ---
// ==========================================
function StorageTab({ project, files, buckets, activeBucketId, dispatch, showToast, triggerCopy }) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleUpload = () => {
        setUploading(true);
        setProgress(0);
        
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        dispatch(uploadFile({
                            name: `assets/img_${Math.floor(Math.random() * 1000)}.png`,
                            size: "245 KB",
                            type: "image/png",
                        }));
                        setUploading(false);
                        setProgress(0);
                        showToast("Mock file uploaded to bucket!");
                    }, 500);
                    return 100;
                }
                return prev + 25;
            });
        }, 150);
    };

    const handleDeleteFile = (id) => {
        if (confirm("Delete this file?")) {
            dispatch(deleteFile(id));
            showToast("File deleted from object storage.");
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Panel title="Bucket Explorer" description={`active: ${buckets.find(b => b.id === activeBucketId)?.name || "s3-bucket"}`} className="md:col-span-2" actions={
                <button 
                    disabled={uploading}
                    onClick={handleUpload}
                    className="inline-flex h-7 items-center gap-1 rounded bg-foreground px-2.5 text-[11px] font-medium text-background hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                    <Plus className="h-3 w-3" /> Upload File
                </button>
            }>
                {uploading && (
                    <div className="mb-4 border border-border p-3 rounded-md bg-surface-elevated">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
                            <span>Uploading asset...</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-foreground transition-all duration-150" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}

                {files.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-[12.5px]">No objects in bucket. Upload some images to display.</div>
                ) : (
                    <ul className="divide-y divide-border">
                        {files.map(f => (
                            <div key={f.id} className="py-2.5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="min-w-0">
                                        <div className="truncate text-[12.5px] font-medium text-foreground">{f.name}</div>
                                        <div className="text-[10.5px] text-muted-foreground">{f.size} · uploaded {f.updated}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => triggerCopy(`https://cdn.acme.com/${f.name}`)}
                                        className="h-7 w-7 grid place-items-center rounded border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        <Copy className="h-3 w-3" />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteFile(f.id)}
                                        className="h-7 w-7 grid place-items-center rounded border border-border bg-background text-muted-foreground hover:text-destructive cursor-pointer"
                                    >
                                        <Trash className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </ul>
                )}
            </Panel>
            <Panel title="Storage Analytics" description="Usage details for S3 bucket storage.">
                <div className="space-y-4 text-[12.5px]">
                    <div>
                        <div className="text-[11px] text-muted-foreground">Provisioned Quota</div>
                        <div className="mt-0.5 font-semibold text-foreground">1.0 TB</div>
                    </div>
                    <div>
                        <div className="text-[11px] text-muted-foreground">Egress Bandwidth</div>
                        <div className="mt-0.5 font-semibold text-foreground">88.4 GB / month</div>
                    </div>
                    <div>
                        <div className="text-[11px] text-muted-foreground">Global CDN Hit rate</div>
                        <div className="mt-0.5 font-semibold text-foreground">97.4%</div>
                    </div>
                    <div className="border-t border-border pt-4">
                        <div className="text-[11px] text-muted-foreground block mb-2">Daily Read Requests</div>
                        <Sparkline data={metricSeries(5, 20, 40, 20)} height={60} />
                    </div>
                </div>
            </Panel>
        </div>
    );
}

// ==========================================
// --- FUNCTIONS TAB COMPONENT ---
// ==========================================
function FunctionsTab({ project, functions, dispatch, showToast }) {
    const [triggeringId, setTriggeringId] = useState(null);

    const handleTrigger = (id, name) => {
        setTriggeringId(id);
        setTimeout(() => {
            dispatch(triggerFunction(id));
            setTriggeringId(null);
            showToast(`Invoked function: ${name} (42ms, status 200)`);
        }, 600);
    };

    const projectFunctions = (functions || []).filter(f => 
        (project?.name && project.name.includes("Marketing") && f.name && f.name.includes("signup")) ||
        (project?.name && project.name.includes("Payments") && f.name && f.name.includes("stripe")) ||
        (project?.name && project.name.includes("Image") && f.name && f.name.includes("resize")) ||
        (!project?.name || (!project.name.includes("Marketing") && !project.name.includes("Payments") && !project.name.includes("Image") && f.name && f.name.includes("receipt")))
    );

    return (
        <Panel title="Serverless Functions" description="Deploy and trigger serverless APIs at the edge.">
            {projectFunctions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-[12.5px]">
                    No serverless functions created for this project. 
                    (Created under functions tab of Vercel configurations).
                </div>
            ) : (
                <ul className="divide-y divide-border">
                    {projectFunctions.map(f => (
                        <li key={f.id} className="py-3.5 first:pt-0 last:pb-0 grid grid-cols-[1fr_auto_auto] items-center gap-4">
                            <div className="flex items-center gap-3">
                                <Terminal className="h-4 w-4 text-foreground" />
                                <div>
                                    <div className="text-[13px] font-semibold text-foreground">/{f.name}</div>
                                    <div className="text-[11px] text-muted-foreground">{f.runtime} · Trigger: {f.trigger}</div>
                                </div>
                            </div>
                            <div className="text-right text-[12px] tabular-nums hidden sm:block">
                                <div className="text-foreground">{f.invocations} invocations</div>
                                <div className="text-muted-foreground">p95: {f.p95}</div>
                            </div>
                            <button 
                                disabled={triggeringId === f.id}
                                onClick={() => handleTrigger(f.id, f.name)}
                                className="inline-flex h-7 items-center gap-1 rounded border border-border bg-background px-2.5 text-[11px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer disabled:opacity-50"
                            >
                                <Play className="h-3 w-3 fill-current" /> {triggeringId === f.id ? "Invoking..." : "Invoke"}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    );
}

// ==========================================
// --- ANALYTICS TAB COMPONENT ---
// ==========================================
function AnalyticsTab({ metricSeries }) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Panel title="p95 Latency" description="Latency distribution in milliseconds · last 24h">
                    <AreaChart data={metricSeries(44, 30, 80, 40)} height={120} unit="ms" />
                </Panel>
                <Panel title="Incoming Bandwidth" description="Edge CDN egress logs · last 24h">
                    <AreaChart data={metricSeries(15, 30, 60, 30)} height={120} unit="MB" />
                </Panel>
                <Panel title="System CPU Utilization" description="Edge compute replicas cluster loading">
                    <AreaChart data={metricSeries(9, 30, 35, 20)} height={120} unit="%" />
                </Panel>
            </div>
            <Panel title="Core Web Vitals" description="User-centric performance metrics for project.">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="border border-border bg-background/40 p-4 rounded-md">
                        <div className="text-[11px] text-muted-foreground uppercase">LCP (Largest Contentful Paint)</div>
                        <div className="mt-2 text-[20px] font-bold text-foreground">1.1s</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Excellent · Target &lt; 2.5s</div>
                    </div>
                    <div className="border border-border bg-background/40 p-4 rounded-md">
                        <div className="text-[11px] text-muted-foreground uppercase">FID (First Input Delay)</div>
                        <div className="mt-2 text-[20px] font-bold text-foreground">12ms</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Excellent · Target &lt; 100ms</div>
                    </div>
                    <div className="border border-border bg-background/40 p-4 rounded-md">
                        <div className="text-[11px] text-muted-foreground uppercase">CLS (Cumulative Layout Shift)</div>
                        <div className="mt-2 text-[20px] font-bold text-foreground">0.02</div>
                        <div className="text-[11px] text-muted-foreground mt-1">Excellent · Target &lt; 0.1</div>
                    </div>
                </div>
            </Panel>
        </div>
    );
}

// ==========================================
// --- LOGS TAB COMPONENT ---
// ==========================================
function LogsTab({ project }) {
    const [streaming, setStreaming] = useState(true);
    const [logsList, setLogsList] = useState([
        { t: "12:04:22.108", level: "info", msg: "GET /api/checkout 200 42ms — session=cs_a1b2" },
        { t: "12:04:22.041", level: "info", msg: "cache HIT users:1284 (ttl 58s)" },
        { t: "12:04:21.987", level: "warn", msg: "slow transform 812ms > budget 500ms" },
        { t: "12:04:21.822", level: "info", msg: "POST /api/track 204 8ms" },
        { t: "12:04:21.611", level: "error", msg: "ENOSPC writing /tmp/frame-9812.png — retrying" },
        { t: "12:04:21.402", level: "info", msg: "pg query 34ms — SELECT * FROM invoices LIMIT 20" },
    ]);

    const levelStyles = {
        info: "text-muted-foreground",
        warn: "text-warning",
        error: "text-destructive",
    };

    // Live Streaming Simulator
    useEffect(() => {
        if (!streaming) return;
        const timer = setInterval(() => {
            const time = new Date().toLocaleTimeString();
            const logOptions = [
                { level: "info", msg: `GET /api/users 200 ${Math.floor(Math.random()*40)+5}ms` },
                { level: "info", msg: "connection pool health check passed: PG-active" },
                { level: "warn", msg: `rate limit reached: 88/100 for ip ${Math.floor(Math.random()*254)+1}.0.113.44` },
                { level: "info", msg: "rendered Serverless Endpoint response code 200" },
                { level: "error", msg: "500 checkout crash — DB connection timeout error: Retrying connection" }
            ];
            const randomLog = logOptions[Math.floor(Math.random() * logOptions.length)];
            setLogsList(prev => [{ t: time, ...randomLog }, ...prev.slice(0, 49)]);
        }, 1500);
        return () => clearInterval(timer);
    }, [streaming]);

    return (
        <Panel title="Application Logs" description={`Live application container logs for ${project.name}.`} actions={
            <button 
                onClick={() => setStreaming(!streaming)}
                className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium transition-colors cursor-pointer ${streaming ? "bg-foreground text-background font-semibold" : "border border-border bg-surface text-foreground"}`}
            >
                {streaming ? <><Pause className="h-3 w-3" /> Streaming</> : <><Play className="h-3 w-3" /> Paused</>}
            </button>
        }>
            <div className="max-h-[320px] min-h-[220px] overflow-y-auto bg-black p-4 rounded-md border border-border/80 font-mono text-[11px] space-y-1.5 scrollbar-thin">
                {logsList.map((log, index) => (
                    <div key={index} className="grid grid-cols-[100px_60px_1fr] gap-2 hover:bg-white/5 py-0.5 rounded px-1 transition-colors">
                        <span className="text-muted-foreground/60">{log.t}</span>
                        <span className={`uppercase font-bold ${levelStyles[log.level]}`}>{log.level}</span>
                        <span className="text-foreground">{log.msg}</span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

// ==========================================
// --- ACTIVITY TAB COMPONENT ---
// ==========================================
function ActivityTab({ project }) {
    const mockActivity = [
        { id: 1, who: "Jordan Lee", verb: "updated secrets", target: "STRIPE_SECRET_KEY", date: "Just now" },
        { id: 2, who: "Jordan Lee", verb: "deployed production", target: `commit ${Math.random().toString(36).substring(2, 8)}`, date: "2h ago" },
        { id: 3, who: "Priya Shah", verb: "added domain", target: project.domain, date: "1d ago" },
        { id: 4, who: "Marcus Chen", verb: "initialized repository", target: project.repo, date: "5d ago" }
    ];

    return (
        <Panel title="Project Activity" description={`Recent deployment and project modification operations.`} padded={false}>
            <ul className="divide-y divide-border">
                {mockActivity.map(a => (
                    <li key={a.id} className="px-5 py-3 flex items-center justify-between gap-4 text-[12.5px] hover:bg-surface-elevated/10">
                        <div>
                            <span className="font-semibold text-foreground">{a.who}</span>
                            <span className="text-muted-foreground mx-1">{a.verb}</span>
                            <span className="font-medium text-foreground">{a.target}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">{a.date}</span>
                    </li>
                ))}
            </ul>
        </Panel>
    );
}

// ==========================================
// --- SETTINGS TAB COMPONENT ---
// ==========================================
function SettingsTab({ project, dispatch, router, showToast }) {
    const [name, setName] = useState(project.name);
    const [repo, setRepo] = useState(project.repo);
    const [branch, setBranch] = useState(project.branch);

    const handleSave = (e) => {
        e.preventDefault();
        showToast("Project settings saved!");
    };

    const handleDeleteProject = () => {
        if (confirm(`WARNING: Are you sure you want to permanently delete the project "${project.name}"? This cannot be undone.`)) {
            dispatch(deleteProject(project.id));
            router.navigate({ to: "/projects" });
        }
    };

    return (
        <div className="space-y-6">
            <Panel title="General Settings" description="Modify project metadata and configurations.">
                <form onSubmit={handleSave} className="space-y-4 max-w-md">
                    <div>
                        <label className="text-[11.5px] text-muted-foreground block">Project Name</label>
                        <input 
                            type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="mt-1 h-9 w-full rounded border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11.5px] text-muted-foreground block">Git Repository</label>
                        <input 
                            type="text" value={repo} onChange={(e) => setRepo(e.target.value)}
                            className="mt-1 h-9 w-full rounded border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11.5px] text-muted-foreground block">Production Branch</label>
                        <input 
                            type="text" value={branch} onChange={(e) => setBranch(e.target.value)}
                            className="mt-1 h-9 w-full rounded border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"
                        />
                    </div>
                    <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12px] font-medium text-background hover:opacity-90 transition-opacity">
                        Save changes
                    </button>
                </form>
            </Panel>

            <Panel title="Danger Zone" className="border-destructive/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-0.5">
                        <div className="text-[13px] font-semibold text-destructive">Delete this project</div>
                        <div className="text-[12px] text-muted-foreground">Permanently delete this project, deployment history, domains, and storage backups.</div>
                    </div>
                    <button 
                        onClick={handleDeleteProject}
                        className="h-9 px-4 rounded bg-destructive text-[12px] font-semibold text-destructive-foreground hover:bg-destructive/95 transition-colors cursor-pointer shrink-0"
                    >
                        Delete Project
                    </button>
                </div>
            </Panel>
        </div>
    );
}
