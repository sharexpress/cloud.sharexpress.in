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
  Copy, Database, Check, RefreshCw, Terminal, Play, 
  Trash2, ShieldCheck, HardDrive, Cpu, Activity, Clock, 
  Layers, Search, Filter, AlertTriangle, Eye, EyeOff, RotateCcw
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { restartDatabase, completeDatabaseRestart } from "../store/index.js";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/databases/$id")({
    validateSearch: (search) => ({
        tab: search.tab ? String(search.tab) : "Overview",
    }),
    head: () => ({ meta: [{ title: "Database Detail — Sharexpress Cloud" }] }),
    component: DatabaseDetailPage,
});

const DB_TABS = ["Overview", "Query Console", "Connections", "Backups", "Logs", "Settings"];

// Global chart series helper
const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
    const out = [];
    for (let i = 0; i < len; i++) {
        const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
        out.push(Math.max(4, Math.min(100, Math.round(v))));
    }
    return out;
};

function DatabaseDetailPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = Route.useParams();
    const search = Route.useSearch();
    const dbParam = params.id;

    // Redux selectors
    const databases = useSelector((state) => state.databases.list);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId);
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    // Active database check
    const database = databases.find((d) => d.id === dbParam || d.name.toLowerCase() === dbParam.toLowerCase()) || databases[0];

    // Tab state from search params
    const rawTab = search.tab || "Overview";
    const tab = DB_TABS.find((t) => t.toLowerCase() === rawTab.toLowerCase()) || "Overview";

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    if (!database) {
        return (
            <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Databases" }]}>
                <PageShell>
                    <div className="text-center py-20">
                        <h2 className="text-lg font-semibold text-text-primary">Database cluster not found</h2>
                        <Link to="/databases" className="mt-4 inline-block text-accent-purple hover:underline">Back to databases</Link>
                    </div>
                </PageShell>
            </AppShell>
        );
    }

    const connString = `postgres://sharexpress_user:••••••••••••@${database.name}.db.sharexpress.in:5432/main`;

    const handleCopyConn = () => {
        navigator.clipboard.writeText(`postgres://sharexpress_user:secret_token_prod_2026@${database.name}.db.sharexpress.in:5432/main`);
        showToast("Connection string copied to clipboard!");
    };

    const handleReboot = () => {
        dispatch(restartDatabase(database.id));
        showToast(`Rebooting database cluster ${database.name}...`);
        setTimeout(() => {
            dispatch(completeDatabaseRestart(database.id));
            showToast(`Database cluster ${database.name} is now healthy.`);
        }, 2000);
    };

    return (
        <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Databases" }, { label: database.name }, { label: tab }]}>
            <PageShell>
                {/* Dynamic Toast */}
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                        <Check className="h-4 w-4 text-status-success" />
                        {toastMessage}
                    </div>
                )}

                {/* Database Header Banner */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <h1 className="truncate text-[22px] font-bold tracking-tight text-text-primary">{database.name}</h1>
                            <StatusBadge status={database.status}/>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-muted font-mono">
                            <span className="rounded bg-surface px-1.5 py-0.5 text-[10.5px] border border-border/60">{database.engine}</span>
                            <span>·</span>
                            <span>Region: {database.region.toUpperCase()}</span>
                            <span>·</span>
                            <span>Size: {database.size}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button 
                            onClick={handleCopyConn} 
                            className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-[12px] font-medium text-text-primary hover:border-border-strong hover:bg-surface/80 transition-all cursor-pointer shadow-xs font-mono"
                        >
                            <Copy className="h-3.5 w-3.5" /> Copy URI
                        </button>
                        <button 
                            onClick={handleReboot}
                            className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-foreground px-3.5 text-[12px] font-semibold text-background hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                        >
                            <RefreshCw className="h-3.5 w-3.5"/> Restart Cluster
                        </button>
                    </div>
                </div>

                {/* Sub-nav Tab Bar */}
                <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-px font-mono">
                    {DB_TABS.map((t) => (
                        <Link 
                            key={t} 
                            to="/databases/$id"
                            params={{ id: database.id }}
                            search={{ tab: t }} 
                            className={cn(
                                "whitespace-nowrap border-b-2 px-3.5 py-2 text-[12.5px] font-medium transition-all cursor-pointer",
                                tab === t 
                                    ? "border-accent-purple text-text-primary font-semibold" 
                                    : "border-transparent text-text-muted hover:text-text-primary"
                            )}
                        >
                            {t}
                        </Link>
                    ))}
                </div>

                {/* --- TAB CONTENT IMPLEMENTATIONS --- */}

                {/* OVERVIEW TAB */}
                {tab === "Overview" && (
                    <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <Metric label="QPS (Queries / sec)" value="1,420" delta={{ value: "+8.5%", positive: true }} series={metricSeries(3)}/>
                            <Metric label="CPU Utilization" value={`${database.status === "restarting" ? 0 : database.cpu}%`} delta={{ value: "-2%", positive: true }} series={metricSeries(5)}/>
                            <Metric label="Memory Usage" value="3.4 GB / 8 GB" hint="42.5% provisioned" series={metricSeries(7)}/>
                            <Metric label="Storage Used" value={`${database.storage}%`} hint="14.2 GB of 50 GB" series={metricSeries(9)}/>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Panel title="Query Throughput" className="lg:col-span-2">
                                <AreaChart data={metricSeries(12, 48, 1200, 400)} unit="qps"/>
                            </Panel>

                            <Panel title="Connection Details" description="Use this connection string to connect your apps.">
                                <div className="space-y-3 font-mono text-[11.5px]">
                                    <div>
                                        <div className="text-[10px] text-text-muted uppercase">Connection URI</div>
                                        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-border bg-surface p-2.5 text-text-primary text-[11px] truncate">
                                            <span className="truncate">{connString}</span>
                                            <button onClick={handleCopyConn} className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded border border-border p-2 bg-surface/50">
                                            <div className="text-[9.5px] text-text-muted uppercase">Port</div>
                                            <div className="font-bold text-text-primary mt-0.5">5432</div>
                                        </div>
                                        <div className="rounded border border-border p-2 bg-surface/50">
                                            <div className="text-[9.5px] text-text-muted uppercase">SSL Mode</div>
                                            <div className="font-bold text-text-primary mt-0.5">require</div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                )}

                {/* QUERY CONSOLE TAB */}
                {tab === "Query Console" && (
                    <QueryConsoleTab database={database} showToast={showToast} />
                )}

                {/* CONNECTIONS TAB */}
                {tab === "Connections" && (
                    <ConnectionsTab database={database} showToast={showToast} />
                )}

                {/* BACKUPS TAB */}
                {tab === "Backups" && (
                    <BackupsTab database={database} showToast={showToast} />
                )}

                {/* LOGS TAB */}
                {tab === "Logs" && (
                    <LogsTab database={database} />
                )}

                {/* SETTINGS TAB */}
                {tab === "Settings" && (
                    <SettingsTab database={database} showToast={showToast} handleReboot={handleReboot} />
                )}

            </PageShell>
        </AppShell>
    );
}

/** 1. QUERY CONSOLE TAB */
function QueryConsoleTab({ database, showToast }) {
    const [query, setQuery] = useState("SELECT id, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5;");
    const [executing, setExecuting] = useState(false);
    const [result, setResult] = useState(null);

    const handleRun = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setExecuting(true);
        setTimeout(() => {
            setExecuting(false);
            setResult({
                executionTime: `${(Math.random() * 12 + 3).toFixed(2)} ms`,
                rowCount: 5,
                columns: ["id", "email", "role", "created_at"],
                rows: [
                    ["usr_01", "jordan@acme.com", "Owner", "2026-07-28 14:20:00"],
                    ["usr_02", "alex@acme.com", "Admin", "2026-07-29 09:15:30"],
                    ["usr_03", "sarah@acme.com", "Developer", "2026-07-29 11:45:12"],
                    ["usr_04", "dev@acme.com", "Member", "2026-07-30 08:02:44"],
                    ["usr_05", "bot@acme.com", "ServiceAccount", "2026-07-30 16:10:05"],
                ]
            });
            showToast("Query executed successfully.");
        }, 350);
    };

    return (
        <div className="space-y-4">
            <Panel title="Interactive SQL Console" description="Execute queries directly against cluster replicas safely.">
                <form onSubmit={handleRun} className="space-y-3">
                    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
                        <textarea
                            rows={4}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-transparent p-3.5 font-mono text-[12.5px] text-text-primary focus:outline-none resize-none"
                            placeholder="Type SQL query here…"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-text-muted">Target database: {database.name}/main</span>
                        <button
                            type="submit"
                            disabled={executing}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-[12px] font-semibold text-background hover:opacity-90 cursor-pointer disabled:opacity-50 transition-all font-mono"
                        >
                            <Play className="h-3.5 w-3.5" />
                            {executing ? "Executing…" : "Run Query (Ctrl+Enter)"}
                        </button>
                    </div>
                </form>

                {result && (
                    <div className="mt-5 border-t border-border/60 pt-4 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between mb-2 font-mono text-[11px] text-text-muted">
                            <span>Returned {result.rowCount} rows</span>
                            <span>Execution time: <strong className="text-text-primary font-semibold">{result.executionTime}</strong></span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-border/60 bg-surface">
                            <table className="w-full text-left font-mono text-[12px]">
                                <thead className="border-b border-border/60 bg-card text-[10.5px] text-text-muted uppercase tracking-wider">
                                    <tr>
                                        {result.columns.map((c) => (
                                            <th key={c} className="px-3.5 py-2 font-semibold">{c}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {result.rows.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-card/40 transition-colors">
                                            {row.map((cell, cidx) => (
                                                <td key={cidx} className="px-3.5 py-2 text-text-primary">{cell}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </Panel>
        </div>
    );
}

/** 2. CONNECTIONS TAB */
function ConnectionsTab({ database, showToast }) {
    const [clients, setClients] = useState([
        { id: "c_1", ip: "192.168.1.42", user: "sharexpress_user", app: "billing-api (iad1)", state: "active", duration: "4m 12s" },
        { id: "c_2", ip: "10.0.4.18", user: "sharexpress_user", app: "auth-service (sin1)", state: "idle", duration: "18m 05s" },
        { id: "c_3", ip: "10.0.9.99", user: "analytics_worker", app: "data-pipeline", state: "active", duration: "1h 40m" },
        { id: "c_4", ip: "172.16.0.5", user: "sharexpress_user", app: "admin-dashboard", state: "idle", duration: "2m 50s" },
    ]);

    const handleTerminate = (id, app) => {
        setClients(prev => prev.filter(c => c.id !== id));
        showToast(`Terminated connection for ${app}.`);
    };

    return (
        <Panel title="Active Client Connections" description={`${clients.length} connected client processes to ${database.name}.`}>
            <div className="overflow-x-auto rounded-lg border border-border/60 bg-surface">
                <table className="w-full text-left font-mono text-[12px]">
                    <thead className="border-b border-border/60 bg-card text-[10.5px] text-text-muted uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-2.5 font-semibold">Client Address</th>
                            <th className="px-4 py-2.5 font-semibold">User</th>
                            <th className="px-4 py-2.5 font-semibold">Application</th>
                            <th className="px-4 py-2.5 font-semibold">State</th>
                            <th className="px-4 py-2.5 font-semibold">Duration</th>
                            <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {clients.map((c) => (
                            <tr key={c.id} className="hover:bg-card/40 transition-colors">
                                <td className="px-4 py-3 text-text-primary font-bold">{c.ip}</td>
                                <td className="px-4 py-3 text-text-muted">{c.user}</td>
                                <td className="px-4 py-3 text-text-primary">{c.app}</td>
                                <td className="px-4 py-3">
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                                        c.state === "active" ? "bg-status-success/10 text-status-success" : "bg-surface text-text-muted border border-border"
                                    )}>
                                        {c.state}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-text-muted">{c.duration}</td>
                                <td className="px-4 py-3 text-right">
                                    <button 
                                        onClick={() => handleTerminate(c.id, c.app)}
                                        className="h-7 px-2.5 rounded border border-border bg-card text-[11px] text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer"
                                    >
                                        Kill
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Panel>
    );
}

/** 3. BACKUPS TAB */
function BackupsTab({ database, showToast }) {
    const [backups, setBackups] = useState([
        { id: "b_1", name: "daily-snapshot-2026-07-30", size: "14.1 GB", created: "Today at 03:00 AM", type: "Automated" },
        { id: "b_2", name: "daily-snapshot-2026-07-29", size: "13.9 GB", created: "Yesterday at 03:00 AM", type: "Automated" },
        { id: "b_3", name: "pre-migration-backup", size: "13.8 GB", created: "Jul 27, 2026 14:15", type: "Manual" },
    ]);

    const handleCreateSnapshot = () => {
        const newSnap = {
            id: `b_${Date.now()}`,
            name: `manual-snapshot-${Date.now().toString().slice(-4)}`,
            size: "14.2 GB",
            created: "Just now",
            type: "Manual",
        };
        setBackups([newSnap, ...backups]);
        showToast("New database snapshot created successfully.");
    };

    return (
        <Panel 
            title="Database Snapshots & Backups" 
            description="Point-in-time recovery & automated daily encrypted backups."
            actions={
                <button 
                    onClick={handleCreateSnapshot}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-[12px] font-semibold text-background hover:opacity-90 cursor-pointer font-mono"
                >
                    Create Snapshot
                </button>
            }
        >
            <div className="space-y-2">
                {backups.map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-surface p-3 font-mono text-[12px]">
                        <div>
                            <div className="font-bold text-text-primary">{b.name}</div>
                            <div className="text-[10.5px] text-text-muted mt-0.5">{b.type} · {b.size} · Created {b.created}</div>
                        </div>
                        <button 
                            onClick={() => showToast(`Restoring ${b.name}...`)}
                            className="h-7 px-3 rounded border border-border bg-card text-[11px] font-semibold text-text-primary hover:bg-surface/80 transition-colors cursor-pointer"
                        >
                            Restore
                        </button>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/** 4. LOGS TAB */
function LogsTab({ database }) {
    const [level, setLevel] = useState("ALL");
    const logs = [
        { time: "18:40:02", level: "INFO", msg: "checkpoint starting: time" },
        { time: "18:40:15", level: "INFO", msg: "checkpoint complete: wrote 412 buffers (0.8%); 0 WAL file(s) added" },
        { time: "18:41:00", level: "WARN", msg: "duration: 420.12 ms statement: SELECT * FROM audit_logs ORDER BY created_at DESC" },
        { time: "18:42:10", level: "INFO", msg: "connection authorized: user=sharexpress_user database=main" },
        { time: "18:43:05", level: "INFO", msg: "autovacuum: vacuum table main.public.orders: removed 142 tuples" },
    ];

    const filtered = level === "ALL" ? logs : logs.filter(l => l.level === level);

    return (
        <Panel 
            title="Database Engine Logs" 
            description="Live log output from cluster nodes."
            actions={
                <div className="flex gap-1 font-mono text-[10.5px]">
                    {["ALL", "INFO", "WARN"].map(l => (
                        <button 
                            key={l}
                            onClick={() => setLevel(l)}
                            className={cn(
                                "px-2 py-0.5 rounded cursor-pointer border transition-colors",
                                level === l ? "bg-surface border-border font-bold text-text-primary" : "text-text-muted border-transparent hover:text-text-primary"
                            )}
                        >
                            {l}
                        </button>
                    ))}
                </div>
            }
        >
            <div className="rounded-lg border border-border bg-card/90 p-4 font-mono text-[11.5px] space-y-2 text-text-muted max-h-96 overflow-y-auto">
                {filtered.map((l, i) => (
                    <div key={i} className="flex gap-3">
                        <span className="text-text-muted/60 shrink-0">{l.time}</span>
                        <span className={cn(
                            "px-1 rounded text-[9.5px] font-bold shrink-0 uppercase",
                            l.level === "WARN" ? "bg-status-warning/20 text-status-warning" : "bg-surface text-text-muted"
                        )}>
                            {l.level}
                        </span>
                        <span className="text-text-primary truncate">{l.msg}</span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/** 5. SETTINGS TAB */
function SettingsTab({ database, showToast, handleReboot }) {
    return (
        <div className="space-y-6">
            <Panel title="Database Configuration" description="Cluster engine parameters.">
                <div className="space-y-4 max-w-lg font-mono text-[12.5px]">
                    <div>
                        <label className="text-[11px] text-text-muted uppercase block mb-1">Max Connections</label>
                        <input type="number" defaultValue={200} className="h-9 w-full rounded-md border border-border bg-surface px-3 text-text-primary focus:outline-none" />
                    </div>
                    <div>
                        <label className="text-[11px] text-text-muted uppercase block mb-1">Shared Buffers</label>
                        <input type="text" defaultValue="2048MB" className="h-9 w-full rounded-md border border-border bg-surface px-3 text-text-primary focus:outline-none" />
                    </div>
                    <button onClick={() => showToast("Database configuration saved.")} className="h-8.5 px-4 rounded bg-foreground text-[12px] font-semibold text-background hover:opacity-90 cursor-pointer">
                        Save Changes
                    </button>
                </div>
            </Panel>

            <Panel title="Danger Zone" description="Irreversible database cluster operations.">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-status-danger/30 bg-status-danger/5">
                    <div>
                        <div className="font-bold text-text-primary text-[13px]">Delete Database Cluster</div>
                        <div className="text-[11px] text-text-muted mt-0.5">Permanently deletes database cluster {database.name} and all replicas.</div>
                    </div>
                    <button 
                        onClick={() => alert("Deletion blocked on demo cluster.")}
                        className="h-8.5 px-3.5 rounded bg-status-danger text-[12px] font-bold text-white hover:opacity-90 cursor-pointer"
                    >
                        Delete Database
                    </button>
                </div>
            </Panel>
        </div>
    );
}
