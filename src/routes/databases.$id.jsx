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
  Layers, Search, Filter, AlertTriangle, Eye, EyeOff, RotateCcw,
  Plus, Edit3, Code, Table, FileJson, FolderPlus, X, Save
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

const DB_TABS = ["Overview", "Data Explorer", "Query Console", "Connections", "Backups", "Logs", "Settings"];

// Global chart series helper
const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
    const out = [];
    for (let i = 0; i < len; i++) {
        const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
        out.push(Math.max(4, Math.min(100, Math.round(v))));
    }
    return out;
};

// Initial MongoDB Atlas Mock Collections Data
const INITIAL_COLLECTIONS = {
    users: [
        { _id: "66a8b12f48e2a1b94c000001", name: "Jordan Lee", email: "jordan@acme.com", role: "admin", status: "active", createdAt: "2026-07-28T14:20:00Z" },
        { _id: "66a8b12f48e2a1b94c000002", name: "Alex Chen", email: "alex@acme.com", role: "developer", status: "active", createdAt: "2026-07-29T09:15:30Z" },
        { _id: "66a8b12f48e2a1b94c000003", name: "Sarah Connor", email: "sarah@acme.com", role: "member", status: "pending", createdAt: "2026-07-29T11:45:12Z" },
        { _id: "66a8b12f48e2a1b94c000004", name: "Dev Ops Bot", email: "bot@acme.com", role: "service_account", status: "active", createdAt: "2026-07-30T08:02:44Z" },
    ],
    orders: [
        { _id: "66a8c44d19f8b2c12a000001", orderId: "ORD-94102", amount: 149.00, currency: "USD", customer: "jordan@acme.com", status: "completed" },
        { _id: "66a8c44d19f8b2c12a000002", orderId: "ORD-94103", amount: 499.00, currency: "USD", customer: "alex@acme.com", status: "completed" },
        { _id: "66a8c44d19f8b2c12a000003", orderId: "ORD-94104", amount: 29.00, currency: "USD", customer: "sarah@acme.com", status: "processing" },
    ],
    products: [
        { _id: "66a8d88e72c3d4a56b000001", sku: "PROD-CLOUD-PRO", title: "Enterprise Cloud Hosting", price: 149, stock: 999 },
        { _id: "66a8d88e72c3d4a56b000002", sku: "PROD-DB-CLUSTER", title: "Managed Postgres Cluster", price: 499, stock: 50 },
        { _id: "66a8d88e72c3d4a56b000003", sku: "PROD-STORAGE-TB", title: "Encrypted S3 Storage 1TB", price: 29, stock: 5000 },
    ],
    audit_logs: [
        { _id: "66a8e99f83d4e5f67a000001", action: "CLUSTER_RESTART", actor: "jordan@acme.com", ip: "192.168.1.42", timestamp: "2026-07-30T16:10:05Z" },
        { _id: "66a8e99f83d4e5f67a000002", action: "API_KEY_CREATED", actor: "alex@acme.com", ip: "10.0.4.18", timestamp: "2026-07-30T17:22:19Z" },
    ]
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
        <AppShell breadcrumbs={[
            { label: activeWsName, to: "/dashboard" },
            { label: "Databases", to: "/databases" },
            { 
                label: database.name, 
                to: "/databases/$id", 
                params: { id: database.id },
                search: { tab: tab },
                options: databases.map((d) => ({
                    label: d.name,
                    to: "/databases/$id",
                    params: { id: d.id },
                    search: { tab: tab }
                }))
            },
            { 
                label: tab, 
                options: DB_TABS.map((t) => ({
                    label: t,
                    to: "/databases/$id",
                    params: { id: database.id },
                    search: { tab: t }
                }))
            }
        ]}>
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

                {/* DATA EXPLORER TAB (MONGODB ATLAS STYLE CRUD) */}
                {tab === "Data Explorer" && (
                    <DataExplorerTab database={database} showToast={showToast} />
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

/** 0. MONGODB ATLAS STYLE DATA EXPLORER & CRUD TAB */
function DataExplorerTab({ database, showToast }) {
    const [collectionsData, setCollectionsData] = useState(INITIAL_COLLECTIONS);
    const [activeCol, setActiveCol] = useState("users");
    const [colSearch, setColSearch] = useState("");
    const [filterQuery, setFilterQuery] = useState("");
    const [viewMode, setViewMode] = useState("json"); // "json" | "table"

    // Modal state for Insert / Edit
    const [isInsertOpen, setIsInsertOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editDoc, setEditDoc] = useState(null);
    const [jsonInput, setJsonInput] = useState("");
    const [jsonError, setJsonError] = useState("");

    // Create New Collection state
    const [isNewColOpen, setIsNewColOpen] = useState(false);
    const [newColName, setNewColName] = useState("");

    const docs = collectionsData[activeCol] || [];

    // Filter documents by query string
    const filteredDocs = docs.filter((doc) => {
        if (!filterQuery.trim()) return true;
        const str = JSON.stringify(doc).toLowerCase();
        return str.includes(filterQuery.toLowerCase());
    });

    // Handle Create Collection
    const handleCreateCollection = (e) => {
        e.preventDefault();
        const trimmed = newColName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_");
        if (!trimmed || collectionsData[trimmed]) return;

        setCollectionsData({
            ...collectionsData,
            [trimmed]: []
        });
        setActiveCol(trimmed);
        setNewColName("");
        setIsNewColOpen(false);
        showToast(`Created new collection '${trimmed}'`);
    };

    // Open Insert Modal
    const openInsertModal = () => {
        const template = {
            _id: `66a${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-10)}`,
            title: "New Document",
            createdAt: new Date().toISOString(),
        };
        setJsonInput(JSON.stringify(template, null, 2));
        setJsonError("");
        setIsInsertOpen(true);
    };

    // Submit Insert Document
    const handleInsertDocument = (e) => {
        e.preventDefault();
        try {
            const parsed = JSON.parse(jsonInput);
            if (!parsed._id) {
                parsed._id = `66a${Math.random().toString(16).slice(2, 10)}${Date.now().toString(16).slice(-10)}`;
            }
            setCollectionsData({
                ...collectionsData,
                [activeCol]: [parsed, ...docs]
            });
            setIsInsertOpen(false);
            showToast(`Inserted 1 document into '${activeCol}'`);
        } catch (err) {
            setJsonError(err.message);
        }
    };

    // Open Edit Modal
    const openEditModal = (doc) => {
        setEditDoc(doc);
        setJsonInput(JSON.stringify(doc, null, 2));
        setJsonError("");
        setIsEditOpen(true);
    };

    // Submit Edit Document
    const handleSaveEdit = (e) => {
        e.preventDefault();
        try {
            const parsed = JSON.parse(jsonInput);
            setCollectionsData({
                ...collectionsData,
                [activeCol]: docs.map((d) => d._id === editDoc._id ? parsed : d)
            });
            setIsEditOpen(false);
            setEditDoc(null);
            showToast(`Updated document ${editDoc._id.slice(0, 8)}...`);
        } catch (err) {
            setJsonError(err.message);
        }
    };

    // Delete Document
    const handleDeleteDoc = (id) => {
        setCollectionsData({
            ...collectionsData,
            [activeCol]: docs.filter((d) => d._id !== id)
        });
        showToast(`Deleted document ${id.slice(0, 8)}...`);
    };

    // Copy JSON to clipboard
    const handleCopyDoc = (doc) => {
        navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
        showToast("Copied JSON payload to clipboard!");
    };

    return (
        <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] items-start">
            
            {/* Left Collections Sidebar */}
            <div className="rounded-xl border border-border bg-card p-3 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold uppercase text-text-muted">Collections</span>
                    <button 
                        onClick={() => setIsNewColOpen(true)}
                        className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer"
                        title="Create collection"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Collection Filter Input */}
                <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-text-muted"/>
                    <input 
                        value={colSearch}
                        onChange={(e) => setColSearch(e.target.value)}
                        placeholder="Filter collections…" 
                        className="h-7.5 w-full rounded-md border border-border bg-surface pl-7 pr-2 font-mono text-[11px] text-text-primary placeholder:text-text-muted focus:outline-none"
                    />
                </div>

                {/* Collections List */}
                <ul className="space-y-1 font-mono text-[11.5px]">
                    {Object.keys(collectionsData)
                        .filter(col => col.toLowerCase().includes(colSearch.toLowerCase()))
                        .map((colName) => {
                            const count = collectionsData[colName].length;
                            const active = activeCol === colName;
                            return (
                                <li key={colName}>
                                    <button
                                        onClick={() => setActiveCol(colName)}
                                        className={cn(
                                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer",
                                            active
                                                ? "bg-surface text-text-primary font-bold border border-border/80 shadow-2xs"
                                                : "text-text-muted hover:bg-surface/50 hover:text-text-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <FolderPlus className="h-3.5 w-3.5 opacity-60 shrink-0" />
                                            <span className="truncate">{colName}</span>
                                        </div>
                                        <span className="text-[10px] text-text-muted/60 bg-surface/80 px-1 rounded border border-border/40 shrink-0">{count}</span>
                                    </button>
                                </li>
                            );
                        })}
                </ul>
            </div>

            {/* Right Main Atlas Explorer View */}
            <div className="space-y-4">
                
                {/* Atlas Filter & Action Bar */}
                <div className="rounded-xl border border-border bg-card p-3 space-y-3 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Collection title info */}
                        <div className="flex items-center gap-2">
                            <h3 className="font-mono text-[14px] font-bold text-text-primary">{activeCol}</h3>
                            <span className="font-mono text-[11px] text-text-muted">({filteredDocs.length} documents)</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* View Switcher */}
                            <div className="flex h-8 items-center rounded-md border border-border bg-surface p-0.5">
                                <button
                                    onClick={() => setViewMode("json")}
                                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer", viewMode === "json" ? "bg-card text-text-primary font-bold shadow-2xs" : "text-text-muted hover:text-text-primary")}
                                >
                                    <FileJson className="h-3 w-3" /> JSON
                                </button>
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer", viewMode === "table" ? "bg-card text-text-primary font-bold shadow-2xs" : "text-text-muted hover:text-text-primary")}
                                >
                                    <Table className="h-3 w-3" /> Table
                                </button>
                            </div>

                            {/* Insert Document Button */}
                            <button
                                onClick={openInsertModal}
                                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 font-mono text-[11.5px] font-semibold text-background hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                            >
                                <Plus className="h-3.5 w-3.5" /> Insert Document
                            </button>
                        </div>
                    </div>

                    {/* Filter Query Input Bar */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"/>
                            <input
                                value={filterQuery}
                                onChange={(e) => setFilterQuery(e.target.value)}
                                placeholder='Filter e.g. { "role": "admin" } or keyword query…'
                                className="h-8.5 w-full rounded-md border border-border bg-surface pl-9 pr-3 font-mono text-[12px] text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none transition-all"
                            />
                        </div>
                        {filterQuery && (
                            <button onClick={() => setFilterQuery("")} className="h-8.5 px-2.5 rounded border border-border bg-surface text-[11px] font-mono text-text-muted hover:text-text-primary">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Documents Display */}
                {filteredDocs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center font-mono">
                        <FileJson className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                        <div className="text-[13px] font-bold text-text-primary">No documents found</div>
                        <div className="text-[11px] text-text-muted mt-0.5">Click 'Insert Document' to add your first JSON document to '{activeCol}'.</div>
                    </div>
                ) : viewMode === "json" ? (
                    <div className="space-y-3">
                        {filteredDocs.map((doc) => (
                            <div key={doc._id} className="rounded-xl border border-border bg-card p-4 transition-all hover:border-border-strong group shadow-xs">
                                {/* Doc Header */}
                                <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3 font-mono text-[11.5px]">
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="text-text-muted">_id:</span>
                                        <span className="font-bold text-text-primary truncate">{doc._id}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5">
                                        <button 
                                            onClick={() => openEditModal(doc)}
                                            className="h-7 px-2 rounded border border-border bg-surface text-[10.5px] font-semibold text-text-primary hover:bg-surface/80 transition-colors cursor-pointer flex items-center gap-1"
                                            title="Edit Document"
                                        >
                                            <Edit3 className="h-3 w-3" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleCopyDoc(doc)}
                                            className="h-7 px-2 rounded border border-border bg-surface text-[10.5px] text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1"
                                            title="Copy JSON"
                                        >
                                            <Copy className="h-3 w-3" /> Copy
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteDoc(doc._id)}
                                            className="h-7 px-2 rounded border border-border bg-surface text-[10.5px] text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer flex items-center gap-1"
                                            title="Delete Document"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* JSON Tree Syntax Display */}
                                <pre className="font-mono text-[12px] text-text-primary bg-surface/70 p-3 rounded-lg border border-border/40 overflow-x-auto leading-relaxed">
                                    {JSON.stringify(doc, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View Mode */
                    <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                        <table className="w-full text-left font-mono text-[12px]">
                            <thead className="border-b border-border bg-surface text-[10.5px] text-text-muted uppercase tracking-wider">
                                <tr>
                                    {Object.keys(filteredDocs[0] || {}).map((key) => (
                                        <th key={key} className="px-4 py-3 font-semibold">{key}</th>
                                    ))}
                                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {filteredDocs.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-surface/50 transition-colors">
                                        {Object.keys(filteredDocs[0] || {}).map((key) => (
                                            <td key={key} className="px-4 py-3 text-text-primary max-w-[200px] truncate">
                                                {typeof doc[key] === "object" ? JSON.stringify(doc[key]) : String(doc[key])}
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right shrink-0">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => openEditModal(doc)} className="p-1 rounded text-text-muted hover:text-text-primary cursor-pointer"><Edit3 className="h-3.5 w-3.5" /></button>
                                                <button onClick={() => handleDeleteDoc(doc._id)} className="p-1 rounded text-status-danger hover:bg-status-danger/10 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* INSERT DOCUMENT MODAL */}
            {isInsertOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <div className="flex items-center gap-2 font-mono text-[13.5px] font-bold text-text-primary">
                                <Code className="h-4 w-4 text-accent-purple" />
                                <span>Insert Document into '{activeCol}'</span>
                            </div>
                            <button onClick={() => setIsInsertOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleInsertDocument} className="p-5 space-y-3 font-mono">
                            <div>
                                <label className="block text-[11px] text-text-muted uppercase mb-1">JSON Payload</label>
                                <textarea
                                    rows={8}
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    className="w-full rounded-md border border-border bg-surface p-3 text-[12px] text-text-primary focus:border-border-strong focus:outline-none resize-none font-mono"
                                />
                            </div>

                            {jsonError && (
                                <div className="text-[11px] text-status-danger bg-status-danger/10 p-2 rounded border border-status-danger/30">
                                    Syntax Error: {jsonError}
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsInsertOpen(false)}
                                    className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] font-medium text-text-primary hover:bg-surface/80 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-8.5 px-4 rounded-md bg-foreground text-[12px] font-bold text-background hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" /> Insert
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT DOCUMENT MODAL */}
            {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <div className="flex items-center gap-2 font-mono text-[13.5px] font-bold text-text-primary">
                                <Edit3 className="h-4 w-4 text-accent-purple" />
                                <span>Edit Document {editDoc?._id?.slice(0, 8)}…</span>
                            </div>
                            <button onClick={() => setIsEditOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveEdit} className="p-5 space-y-3 font-mono">
                            <div>
                                <label className="block text-[11px] text-text-muted uppercase mb-1">JSON Payload</label>
                                <textarea
                                    rows={9}
                                    value={jsonInput}
                                    onChange={(e) => setJsonInput(e.target.value)}
                                    className="w-full rounded-md border border-border bg-surface p-3 text-[12px] text-text-primary focus:border-border-strong focus:outline-none resize-none font-mono"
                                />
                            </div>

                            {jsonError && (
                                <div className="text-[11px] text-status-danger bg-status-danger/10 p-2 rounded border border-status-danger/30">
                                    Syntax Error: {jsonError}
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsEditOpen(false)}
                                    className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] font-medium text-text-primary hover:bg-surface/80 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-8.5 px-4 rounded-md bg-foreground text-[12px] font-bold text-background hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                                >
                                    <Save className="h-3.5 w-3.5" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* CREATE NEW COLLECTION MODAL */}
            {isNewColOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <h2 className="text-[13.5px] font-bold text-text-primary">New Collection</h2>
                            <button onClick={() => setIsNewColOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCollection} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] text-text-muted uppercase mb-1">Collection Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. payment_intents"
                                    value={newColName}
                                    onChange={(e) => setNewColName(e.target.value)}
                                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none"
                                />
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsNewColOpen(false)}
                                    className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] text-text-primary hover:bg-surface/80 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="h-8.5 px-3.5 rounded-md bg-foreground text-[12px] font-bold text-background hover:opacity-90 cursor-pointer"
                                >
                                    Create Collection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
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
