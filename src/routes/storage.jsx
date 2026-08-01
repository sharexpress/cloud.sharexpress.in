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
import { HardDrive, Plus, Search, Grid3x3, List, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBuckets, createBucketThunk } from "@/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/storage")({
    head: () => ({ meta: [{ title: "Storage — Sharexpress Cloud" }] }),
    component: StoragePage,
});

function StoragePage() {
    const path = useRouterState({ select: (s) => s.location.pathname });
    const isDetail = path !== "/storage" && path !== "/storage/";

    const dispatch = useDispatch();
    const buckets = useSelector((state) => state.storage?.buckets || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    const [query, setQuery] = useState("");
    const [selectedVis, setSelectedVis] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [region, setRegion] = useState("iad1");

    const visList = ["All", "public", "private"];

    useEffect(() => {
        if (!isDetail) {
            dispatch(fetchBuckets(activeWsId));
        }
    }, [dispatch, activeWsId, isDetail]);

    if (isDetail) {
        return <Outlet />;
    }

    const filtered = buckets.filter((b) => {
        const matchesQuery = (b.name || "").toLowerCase().includes(query.toLowerCase());
        const matchesVis = selectedVis === "All" || (b.visibility || "public").toLowerCase() === selectedVis.toLowerCase();
        return matchesQuery && matchesVis;
    });

    const handleCreateBucket = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            await dispatch(createBucketThunk({
                bucketData: {
                    name,
                    visibility,
                    region,
                    size: "0 GB",
                    objectsCount: 0,
                },
                workspace_id: activeWsId
            })).unwrap();

            setName("");
            setIsCreateOpen(false);
        } catch (err) {
            alert(err || "Failed to create bucket");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Storage" }]}>
            <PageShell>
                <PageHeader 
                    title="Storage" 
                    description={`Managed S3 bucket storage & CDN running in ${activeWsName}.`} 
                    actions={
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-blue-600 px-3.5 text-[12px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
                        >
                            <Plus className="h-3.5 w-3.5"/> New bucket
                        </button>
                    }
                />

                {/* Filter Bar */}
                <div className="mb-5 space-y-3">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                        <div className="relative min-w-0">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"/>
                            <input 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                placeholder="Search storage buckets by name…" 
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

                    {/* Visibility pill tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
                        {visList.map((v) => (
                            <button
                                key={v}
                                onClick={() => setSelectedVis(v)}
                                className={cn(
                                    "rounded px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap",
                                    selectedVis === v
                                        ? "bg-surface text-text-primary border border-border font-semibold shadow-2xs"
                                        : "text-text-muted hover:text-text-primary hover:bg-surface/50 border border-transparent"
                                )}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bucket List / Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                        <HardDrive className="h-9 w-9 text-text-muted mb-3 opacity-60" />
                        <h3 className="text-[13.5px] font-semibold text-text-primary">No storage buckets found</h3>
                        <p className="mt-1 max-w-sm text-[12px] text-text-muted">Create S3 storage buckets for files, images, and videos.</p>
                    </div>
                ) : view === "grid" ? (
                    <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((b) => (
                            <Link 
                                to="/storage/$id"
                                params={{ id: b.id || b.name }}
                                key={b.id || b.name} 
                                className="group relative rounded-lg border border-border bg-card p-4.5 transition-all duration-150 hover:border-border-strong hover:bg-surface/30 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Bar: Name + Visibility Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-[13.5px] font-semibold text-text-primary group-hover:text-text-primary transition-colors">
                                                {b.name}
                                            </div>
                                            <div className="truncate text-[10.5px] text-text-muted font-mono mt-0.5">
                                                {(b.region || "iad1").toUpperCase()} · Standard S3
                                            </div>
                                        </div>
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase",
                                            (b.visibility || "public") === "public" ? "bg-status-success/10 text-status-success border border-status-success/30" : "bg-surface text-text-muted border border-border"
                                        )}>
                                            {b.visibility || "public"}
                                        </span>
                                    </div>

                                    {/* Body: Specs */}
                                    <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] text-text-muted border-t border-b border-border/40 py-2.5 my-2">
                                        <div>
                                            <div className="text-[9.5px] uppercase">Size Used</div>
                                            <div className="mt-0.5 font-bold text-text-primary">{b.size || "42.8 GB"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9.5px] uppercase">Objects</div>
                                            <div className="mt-0.5 font-bold text-text-primary">{(b.objectsCount || b.objects_count || 12480).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer: View Details link */}
                                <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-muted font-mono">
                                    <span>CDN Enabled</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Bucket <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5"/>
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
                                    <th className="px-4 py-2.5">Bucket Name</th>
                                    <th className="px-4 py-2.5">Region</th>
                                    <th className="px-4 py-2.5">Visibility</th>
                                    <th className="px-4 py-2.5">Size</th>
                                    <th className="px-4 py-2.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map((b) => (
                                    <tr key={b.id || b.name} className="hover:bg-surface/30 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-text-primary">{b.name}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{(b.region || "iad1").toUpperCase()}</td>
                                        <td className="px-4 py-3 font-mono uppercase text-text-muted">{b.visibility || "public"}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{b.size || "42.8 GB"}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to="/storage/$id" params={{ id: b.id || b.name }} className="text-text-primary hover:underline font-mono text-[11px]">Manage &rarr;</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Create Bucket Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative">
                            <h3 className="text-sm font-bold text-text-primary mb-1">Create Storage Bucket</h3>
                            <p className="text-xs text-text-muted mb-4">Provision S3 bucket into {activeWsName}.</p>

                            <form onSubmit={handleCreateBucket} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-text-primary mb-1">Bucket Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. acme-uploads"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Visibility</label>
                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                                        >
                                            <option value="public">Public Read</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Region</label>
                                        <select
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                                        >
                                            <option value="iad1">iad1 (US East)</option>
                                            <option value="fra1">fra1 (EU Central)</option>
                                            <option value="sin1">sin1 (Asia Pacific)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-3 py-1.5 border border-border rounded-md text-xs text-text-muted hover:bg-surface"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-1.5 bg-blue-600 text-white font-medium rounded-md text-xs hover:bg-blue-500 transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {submitting ? "Creating..." : "Create Bucket"}
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
