import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, Panel, Metric, StatusBadge, AreaChart, Sparkline } from "@/components/app/primitives";
import { 
  Copy, ExternalLink, GitBranch, Rocket, ShieldCheck, Eye, EyeOff, 
  Trash2, Plus, X, Globe, Database, HardDrive, Cpu, Terminal, Play, 
  Pause, Check, Settings2, Trash, AlertTriangle, FileText, ArrowRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  addDeployment, triggerRollback, addSecret, deleteSecret,
  addDomain, verifyDomain, deleteDomain, addFunction, triggerFunction,
  deleteProject, uploadFile, deleteFile
} from "../store/index.js";

export const Route = createFileRoute("/projects/$id")({
    head: () => ({ meta: [{ title: "Project — Nimbus" }] }),
    component: ProjectDetailPage,
});

const TABS = ["Overview", "Deployments", "Environment", "Domains", "Storage", "Functions", "Analytics", "Logs", "Activity", "Settings"];

function ProjectDetailPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = Route.useParams();
    const projectSlug = params.id;

    // Redux selectors
    const projects = useSelector((state) => state.projects.list);
    const deployments = useSelector((state) => state.deployments.list);
    const secrets = useSelector((state) => state.secrets.list);
    const domains = useSelector((state) => state.domains.list);
    const functions = useSelector((state) => state.functions.list);
    const storeStorage = useSelector((state) => state.storage);
    const teamMembers = useSelector((state) => state.team.members);

    // Active project check
    const project = projects.find((p) => p.slug === projectSlug) || projects[0];
    
    const [tab, setTab] = useState("Overview");

    if (!project) {
        return (
            <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Projects" }]}>
                <PageShell>
                    <div className="text-center py-20">
                        <h2 className="text-lg font-semibold text-foreground">Project not found</h2>
                        <Link to="/projects" className="mt-4 inline-block text-accent hover:underline">Back to projects</Link>
                    </div>
                </PageShell>
            </AppShell>
        );
    }

    // Filter project-specific data
    const projectDeploys = deployments.filter((d) => d.project.toLowerCase() === project.name.toLowerCase());
    const projectSecrets = secrets.filter((s) => s.scope.toLowerCase() === project.name.toLowerCase() || s.scope.toLowerCase() === "all projects");
    const projectDomains = domains.filter((d) => d.project.toLowerCase() === project.name.toLowerCase());
    const projectFiles = storeStorage.files.filter((f) => f.bucketId === storeStorage.activeBucketId);

    // --- State for Interactive Features ---
    const [copiedText, setCopiedText] = useState("");
    
    // Toast Simulator
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

    // Helper functions for mock charts
    const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
        const out = [];
        for (let i = 0; i < len; i++) {
            const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
            out.push(Math.max(4, Math.min(100, Math.round(v))));
        }
        return out;
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Projects" }, { label: project.name }]}>
      <PageShell>
        
        {/* Dynamic Toast Indicator */}
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface text-[12px] font-semibold text-foreground">
              {project.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground">{project.name}</h1>
              <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                <StatusBadge status={project.status}/>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3"/>{project.repo}</span>
                <span>·</span>
                <button onClick={() => triggerCopy(project.domain)} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  {project.domain}<ExternalLink className="h-3 w-3"/>
                </button>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => window.open(`https://${project.domain}`, "_blank")} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong transition-colors cursor-pointer">Visit</button>
            <button 
                onClick={handleRedeploy}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Rocket className="h-3.5 w-3.5"/> Redeploy
            </button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border">
          {TABS.map((t) => (<button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-[12.5px] transition-colors cursor-pointer ${tab === t ? "border-foreground text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t}
            </button>))}
        </div>

        {/* --- TABS IMPLEMENTATIONS --- */}

        {/* OVERVIEW TAB */}
        {tab === "Overview" && (<>
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
                                            <div>Value: <span className="text-foreground">cname.nimbus-edge.app</span></div>
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

    const projectFunctions = functions.filter(f => 
        (project.name.includes("Marketing") && f.name.includes("signup")) ||
        (project.name.includes("Payments") && f.name.includes("stripe")) ||
        (project.name.includes("Image") && f.name.includes("resize")) ||
        (!project.name.includes("Marketing") && !project.name.includes("Payments") && !project.name.includes("Image") && f.name.includes("receipt"))
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
