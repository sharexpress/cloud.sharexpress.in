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
  Copy, HardDrive, Check, RefreshCw, Terminal, Play, 
  Trash2, ShieldCheck, Cpu, Activity, Clock, 
  Layers, Search, Filter, AlertTriangle, Eye, EyeOff, RotateCcw,
  Plus, Edit3, Code, Table, FileJson, FolderPlus, X, Save,
  Upload, Folder, FileText, ImageIcon, FileVideo, Globe, Key, Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/storage/$id")({
    validateSearch: (search) => ({
        tab: search.tab ? String(search.tab) : "Overview",
    }),
    head: () => ({ meta: [{ title: "Storage Detail — Sharexpress Cloud" }] }),
    component: StorageDetailPage,
});

const STORAGE_TABS = ["Overview", "File Browser", "API & Keys", "CORS & Policy", "Logs", "Settings"];

// Global chart series helper
const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
    const out = [];
    for (let i = 0; i < len; i++) {
        const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
        out.push(Math.max(4, Math.min(100, Math.round(v))));
    }
    return out;
};

// Initial S3 Bucket Objects Mock Data
const INITIAL_OBJECTS = [
    { id: "o_1", name: "avatars/hero-user.png", size: "412 KB", type: "image/png", modified: "Today at 14:20", etag: '"a4b8c9d1e2f3"' },
    { id: "o_2", name: "documents/terms-v2.pdf", size: "1.2 MB", type: "application/pdf", modified: "Yesterday at 09:15", etag: '"b5c9d0e1f2a3"' },
    { id: "o_3", name: "videos/intro-demo.mp4", size: "24.5 MB", type: "video/mp4", modified: "Jul 28, 2026", etag: '"c6d0e1f2a3b4"' },
    { id: "o_4", name: "assets/logo-dark.svg", size: "18 KB", type: "image/svg+xml", modified: "Jul 27, 2026", etag: '"d7e1f2a3b4c5"' },
    { id: "o_5", name: "backups/db-dump-0726.tar.gz", size: "142.8 MB", type: "application/gzip", modified: "Jul 26, 2026", etag: '"e8f2a3b4c5d6"' },
];

function StorageDetailPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = Route.useParams();
    const search = Route.useSearch();
    const bucketParam = params.id;

    // Redux selectors
    const buckets = useSelector((state) => state.storage?.buckets || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId);
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    // Active bucket check
    const bucket = buckets.find((b) => b.id === bucketParam || b.name.toLowerCase() === bucketParam.toLowerCase()) || buckets[0] || {
        id: "b_1",
        name: "media-assets",
        region: "iad1",
        visibility: "public",
        size: "42.8 GB",
        objectsCount: 12480,
    };

    // Tab state from search params
    const rawTab = search.tab || "Overview";
    const tab = STORAGE_TABS.find((t) => t.toLowerCase() === rawTab.toLowerCase()) || "Overview";

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const endpointUri = `https://${bucket.name}.s3.sharexpress.in`;

    const handleCopyEndpoint = () => {
        navigator.clipboard.writeText(endpointUri);
        showToast("S3 Endpoint URI copied to clipboard!");
    };

    return (
        <AppShell breadcrumbs={[
            { label: activeWsName, to: "/dashboard" },
            { label: "Storage", to: "/storage" },
            { 
                label: bucket.name, 
                to: "/storage/$id", 
                params: { id: bucket.id },
                search: { tab: tab },
                options: buckets.map((b) => ({
                    label: b.name,
                    to: "/storage/$id",
                    params: { id: b.id },
                    search: { tab: tab }
                }))
            },
            { 
                label: tab, 
                options: STORAGE_TABS.map((t) => ({
                    label: t,
                    to: "/storage/$id",
                    params: { id: bucket.id },
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

                {/* Bucket Header Banner */}
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                            <h1 className="truncate text-[22px] font-bold tracking-tight text-text-primary">{bucket.name}</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10.5px] font-mono font-bold uppercase",
                                bucket.visibility === "public" ? "bg-status-success/10 text-status-success border border-status-success/30" : "bg-surface text-text-muted border border-border"
                            )}>
                                {bucket.visibility || "private"}
                            </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-text-muted font-mono">
                            <span>Region: {(bucket.region || "iad1").toUpperCase()}</span>
                            <span>·</span>
                            <span>Storage: {bucket.size || "42.8 GB"}</span>
                            <span>·</span>
                            <span>Objects: {(bucket.objectsCount || 12480).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <button 
                            onClick={handleCopyEndpoint} 
                            className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 text-[12px] font-medium text-text-primary hover:border-border-strong hover:bg-surface/80 transition-all cursor-pointer shadow-xs font-mono"
                        >
                            <Copy className="h-3.5 w-3.5" /> Copy S3 URI
                        </button>
                    </div>
                </div>

                {/* Sub-nav Tab Bar */}
                <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border/60 pb-px font-mono">
                    {STORAGE_TABS.map((t) => (
                        <Link 
                            key={t} 
                            to="/storage/$id"
                            params={{ id: bucket.id }}
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
                            <Metric label="Bandwidth Out" value="1.42 TB" delta={{ value: "+12.4%", positive: true }} series={metricSeries(4)}/>
                            <Metric label="Requests / sec" value="840 QPS" delta={{ value: "+4.1%", positive: true }} series={metricSeries(6)}/>
                            <Metric label="Storage Used" value={bucket.size || "42.8 GB"} hint="42.8 GB of 500 GB" series={metricSeries(8)}/>
                            <Metric label="Total Objects" value={(bucket.objectsCount || 12480).toLocaleString()} hint="Standard S3 Storage" series={metricSeries(10)}/>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            <Panel title="Egress Bandwidth (GB/h)" className="lg:col-span-2">
                                <AreaChart data={metricSeries(14, 48, 140, 50)} unit="GB"/>
                            </Panel>

                            <Panel title="Bucket Properties" description="S3 Endpoint & Global CDN setup.">
                                <div className="space-y-3 font-mono text-[11.5px]">
                                    <div>
                                        <div className="text-[10px] text-text-muted uppercase">S3 Endpoint URI</div>
                                        <div className="mt-1 flex items-center justify-between gap-2 rounded-md border border-border bg-surface p-2.5 text-text-primary text-[11px] truncate">
                                            <span className="truncate">{endpointUri}</span>
                                            <button onClick={handleCopyEndpoint} className="text-text-muted hover:text-text-primary shrink-0 cursor-pointer">
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded border border-border p-2 bg-surface/50">
                                            <div className="text-[9.5px] text-text-muted uppercase">Storage Class</div>
                                            <div className="font-bold text-text-primary mt-0.5">STANDARD</div>
                                        </div>
                                        <div className="rounded border border-border p-2 bg-surface/50">
                                            <div className="text-[9.5px] text-text-muted uppercase">Versioning</div>
                                            <div className="font-bold text-text-primary mt-0.5">Enabled</div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                )}

                {/* FILE BROWSER TAB (S3 EXPLORER & CRUD) */}
                {tab === "File Browser" && (
                    <FileBrowserTab bucket={bucket} showToast={showToast} />
                )}

                {/* API & KEYS TAB */}
                {tab === "API & Keys" && (
                    <ApiKeysTab bucket={bucket} showToast={showToast} />
                )}

                {/* CORS & POLICY TAB */}
                {tab === "CORS & Policy" && (
                    <CorsPolicyTab bucket={bucket} showToast={showToast} />
                )}

                {/* LOGS TAB */}
                {tab === "Logs" && (
                    <LogsTab bucket={bucket} />
                )}

                {/* SETTINGS TAB */}
                {tab === "Settings" && (
                    <SettingsTab bucket={bucket} showToast={showToast} />
                )}

            </PageShell>
        </AppShell>
    );
}

/** 1. FILE BROWSER TAB (S3 GUI & CRUD) */
function FileBrowserTab({ bucket, showToast }) {
    const [objects, setObjects] = useState(INITIAL_OBJECTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newFileName, setNewFileName] = useState("");

    const filteredObjects = objects.filter((o) => 
        o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.type.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUploadSubmit = (e) => {
        e.preventDefault();
        if (!newFileName.trim()) return;

        setUploading(true);
        setTimeout(() => {
            const newObj = {
                id: `o_${Date.now()}`,
                name: newFileName.trim().startsWith("uploads/") ? newFileName.trim() : `uploads/${newFileName.trim()}`,
                size: "820 KB",
                type: "application/octet-stream",
                modified: "Just now",
                etag: `"${Math.random().toString(36).substring(2, 12)}"`,
            };
            setObjects([newObj, ...objects]);
            setUploading(false);
            setNewFileName("");
            setIsUploadOpen(false);
            showToast(`Uploaded '${newObj.name}' to ${bucket.name}`);
        }, 600);
    };

    const handleDeleteObject = (id, name) => {
        setObjects(prev => prev.filter(o => o.id !== id));
        showToast(`Deleted '${name}' from bucket.`);
    };

    const handleCopyUri = (name) => {
        navigator.clipboard.writeText(`s3://${bucket.name}/${name}`);
        showToast(`Copied s3://${bucket.name}/${name}`);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="rounded-xl border border-border bg-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"/>
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search objects by prefix or file name…"
                        className="h-8.5 w-full rounded-md border border-border bg-surface pl-9 pr-3 font-mono text-[12px] text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 font-mono text-[11.5px]">
                    <button
                        onClick={() => setIsUploadOpen(true)}
                        className="inline-flex h-8.5 items-center gap-1.5 rounded-md bg-foreground px-3.5 font-semibold text-background hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                    >
                        <Upload className="h-3.5 w-3.5" /> Upload File
                    </button>
                </div>
            </div>

            {/* Objects Table */}
            {filteredObjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center font-mono">
                    <HardDrive className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                    <div className="text-[13px] font-bold text-text-primary">No objects found</div>
                    <div className="text-[11px] text-text-muted mt-0.5">Upload a file to get started with '{bucket.name}'.</div>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
                    <table className="w-full text-left font-mono text-[12px]">
                        <thead className="border-b border-border bg-surface text-[10.5px] text-text-muted uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Object Name</th>
                                <th className="px-4 py-3 font-semibold">Size</th>
                                <th className="px-4 py-3 font-semibold">Content Type</th>
                                <th className="px-4 py-3 font-semibold">Last Modified</th>
                                <th className="px-4 py-3 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                            {filteredObjects.map((obj) => (
                                <tr key={obj.id} className="hover:bg-surface/50 transition-colors group">
                                    <td className="px-4 py-3 text-text-primary font-bold flex items-center gap-2 truncate">
                                        <Folder className="h-3.5 w-3.5 text-text-muted shrink-0" />
                                        <span className="truncate">{obj.name}</span>
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">{obj.size}</td>
                                    <td className="px-4 py-3 text-text-muted">{obj.type}</td>
                                    <td className="px-4 py-3 text-text-muted">{obj.modified}</td>
                                    <td className="px-4 py-3 text-right shrink-0">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button onClick={() => handleCopyUri(obj.name)} className="h-7 px-2 rounded border border-border bg-surface text-[10.5px] text-text-muted hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1">
                                                <Copy className="h-3 w-3" /> S3 URI
                                            </button>
                                            <button onClick={() => handleDeleteObject(obj.id, obj.name)} className="h-7 px-2 rounded border border-border bg-surface text-[10.5px] text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer">
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* UPLOAD MODAL */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-mono">
                    <div className="w-full max-w-md border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                            <h2 className="text-[13.5px] font-bold text-text-primary">Upload Object to '{bucket.name}'</h2>
                            <button onClick={() => setIsUploadOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
                            <div>
                                <label className="block text-[11px] text-text-muted uppercase mb-1">File Key / Path</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="uploads/avatar-2026.png"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none"
                                />
                            </div>

                            <div className="rounded-lg border border-dashed border-border bg-surface/50 p-6 text-center">
                                <Upload className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-60" />
                                <div className="text-[12px] font-bold text-text-primary">Drag and drop file here</div>
                                <div className="text-[10px] text-text-muted mt-0.5">Or type object key path above</div>
                            </div>

                            <div className="pt-2 flex justify-end gap-2 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] text-text-primary hover:bg-surface/80 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="h-8.5 px-4 rounded-md bg-foreground text-[12px] font-bold text-background hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                                >
                                    {uploading ? "Uploading…" : "Upload Object"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

/** 2. API & KEYS TAB */
function ApiKeysTab({ bucket, showToast }) {
    const accessKey = "AKIA_PROD_SHAREXPRESS_2026_KEYS";
    const secretKey = "••••••••••••••••••••••••••••••••";

    return (
        <div className="space-y-6 font-mono">
            <Panel title="S3 API Credentials" description="Access Key ID & Secret Access Key for bucket programmatic access.">
                <div className="space-y-4 max-w-lg text-[12px]">
                    <div>
                        <div className="text-[11px] text-text-muted uppercase mb-1">Access Key ID</div>
                        <div className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5 text-text-primary font-bold">
                            <span>{accessKey}</span>
                            <button onClick={() => { navigator.clipboard.writeText(accessKey); showToast("Access Key ID copied."); }} className="text-text-muted hover:text-text-primary cursor-pointer">
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                    <div>
                        <div className="text-[11px] text-text-muted uppercase mb-1">Secret Access Key</div>
                        <div className="flex items-center justify-between rounded-md border border-border bg-surface p-2.5 text-text-primary font-bold">
                            <span>{secretKey}</span>
                            <button onClick={() => { navigator.clipboard.writeText("sk_secret_sharexpress_prod_894102931"); showToast("Secret Access Key copied."); }} className="text-text-muted hover:text-text-primary cursor-pointer">
                                <Copy className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </Panel>
        </div>
    );
}

/** 3. CORS & POLICY TAB */
function CorsPolicyTab({ bucket, showToast }) {
    const [policy, setPolicy] = useState(`[
  {
    "AllowedOrigins": ["https://*.acme.com"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]`);

    return (
        <Panel title="CORS Configuration" description="Configure Cross-Origin Resource Sharing policy for browser uploads.">
            <div className="space-y-3 font-mono">
                <textarea
                    rows={8}
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface p-3 text-[12px] text-text-primary focus:outline-none resize-none"
                />
                <button onClick={() => showToast("CORS policy saved successfully.")} className="h-8.5 px-4 rounded bg-foreground text-[12px] font-bold text-background hover:opacity-90 cursor-pointer">
                    Save Policy
                </button>
            </div>
        </Panel>
    );
}

/** 4. LOGS TAB */
function LogsTab({ bucket }) {
    const logs = [
        { time: "18:50:01", verb: "GET", path: "/avatars/hero-user.png", status: 200, size: "412 KB" },
        { time: "18:51:14", verb: "PUT", path: "/uploads/doc-2026.pdf", status: 201, size: "1.2 MB" },
        { time: "18:52:30", verb: "GET", path: "/videos/intro-demo.mp4", status: 200, size: "24.5 MB" },
        { time: "18:53:05", verb: "DELETE", path: "/temp/scratch.tmp", status: 204, size: "0 B" },
    ];

    return (
        <Panel title="S3 Bucket Access Logs" description="HTTP requests processed by S3 CDN edge servers.">
            <div className="rounded-lg border border-border bg-card/90 p-4 font-mono text-[11.5px] space-y-2 text-text-muted">
                {logs.map((l, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-text-muted/60 shrink-0">{l.time}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-surface border border-border text-text-primary uppercase shrink-0">{l.verb}</span>
                        <span className="text-text-primary font-bold truncate">{l.path}</span>
                        <span className="text-status-success font-bold shrink-0">{l.status}</span>
                        <span className="text-text-muted/80 shrink-0">{l.size}</span>
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/** 5. SETTINGS TAB */
function SettingsTab({ bucket, showToast }) {
    return (
        <div className="space-y-6 font-mono">
            <Panel title="Danger Zone" description="Irreversible bucket actions.">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-status-danger/30 bg-status-danger/5">
                    <div>
                        <div className="font-bold text-text-primary text-[13px]">Delete S3 Bucket</div>
                        <div className="text-[11px] text-text-muted mt-0.5">Permanently deletes bucket {bucket.name} and all contained objects.</div>
                    </div>
                    <button 
                        onClick={() => alert("Deletion blocked on demo bucket.")}
                        className="h-8.5 px-3.5 rounded bg-status-danger text-[12px] font-bold text-white hover:opacity-90 cursor-pointer"
                    >
                        Delete Bucket
                    </button>
                </div>
            </Panel>
        </div>
    );
}
