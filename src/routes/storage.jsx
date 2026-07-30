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
import { HardDrive, Plus, Search, X, Grid3x3, List, Lock, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { setBuckets, addBucket } from "../store/index.js";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/storage")({
    head: () => ({ meta: [{ title: "Storage — Sharexpress Cloud" }] }),
    component: StoragePage,
});

function StoragePage() {
    const path = useRouterState({ select: (s) => s.location.pathname });
    const isDetail = path !== "/storage" && path !== "/storage/";

    if (isDetail) {
        return <Outlet />;
    }

    const dispatch = useDispatch();
    const buckets = useSelector((state) => state.storage?.buckets || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");

    const [query, setQuery] = useState("");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [visibility, setVisibility] = useState("public");
    const [region, setRegion] = useState("iad1");

    useEffect(() => {
        let isMounted = true;
        async function loadBuckets() {
            try {
                setLoading(true);
                const res = await api.listBuckets(activeWsId);
                if (isMounted) {
                    dispatch(setBuckets(res));
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load buckets:", err);
                if (isMounted) setLoading(false);
            }
        }
        loadBuckets();
        return () => { isMounted = false; };
    }, [dispatch, activeWsId]);

    const handleCreateBucket = async (e) => {
        e.preventDefault();
        if (!name) return;
        setSubmitting(true);
        try {
            const res = await api.createBucket({
                name,
                visibility,
                region
            }, activeWsId);

            if (res.success && res.bucket) {
                dispatch(addBucket(res.bucket));
                setIsCreateOpen(false);
                setName("");
            }
        } catch (err) {
            alert(err.message || "Failed to create bucket");
        } finally {
            setSubmitting(false);
        }
    };

    const filtered = buckets.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));

    return (
        <AppShell>
            <PageShell>
                <PageHeader
                    title="Object Storage"
                    description="MinIO S3-compatible bucket management and presigned direct client uploads."
                    action={
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Create Bucket
                        </button>
                    }
                />

                {/* Filters */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input
                            type="text"
                            placeholder="Search buckets..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-accent/50 border border-border/60 rounded-md pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                        />
                    </div>
                </div>

                {/* Bucket Grid */}
                {loading ? (
                    <div className="text-center py-20 text-muted">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
                        <p className="text-xs">Loading MinIO buckets...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <Panel>
                        <div className="text-center py-16">
                            <HardDrive className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
                            <h3 className="text-sm font-semibold mb-1">No Storage Buckets</h3>
                            <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                                Create an S3-compatible MinIO bucket to store files and static assets.
                            </p>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-md"
                            >
                                <Plus className="h-3.5 w-3.5" /> Create Bucket
                            </button>
                        </div>
                    </Panel>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((b) => (
                            <Link key={b.id} to={`/storage/${b.id}`} className="group block">
                                <Panel className="h-full hover:border-primary/50 transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-bold text-xs">
                                                <HardDrive className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{b.name}</h4>
                                                <p className="text-xs text-muted font-mono">{b.region || "iad1"}</p>
                                            </div>
                                        </div>
                                        <span className="flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-accent text-muted">
                                            {b.visibility === "public" ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                                            {b.visibility}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted font-mono truncate mb-4">
                                        {b.endpoint || `https://${b.name}.s3.sharexpress.in`}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border/40">
                                        <span>{b.size || "0 GB"} · {b.objects_count || 0} objects</span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Browse &rarr;</span>
                                    </div>
                                </Panel>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Create Bucket Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="absolute right-4 top-4 text-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold mb-1">Create Storage Bucket</h3>
                            <p className="text-xs text-muted mb-4">Provision new MinIO S3 object storage bucket.</p>

                            <form onSubmit={handleCreateBucket} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Bucket Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. acme-uploads"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Visibility</label>
                                        <select
                                            value={visibility}
                                            onChange={(e) => setVisibility(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="public">Public Read</option>
                                            <option value="private">Private</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Region</label>
                                        <select
                                            value={region}
                                            onChange={(e) => setRegion(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="iad1">US East (N. Virginia)</option>
                                            <option value="fra1">EU Central (Frankfurt)</option>
                                            <option value="sin1">Asia Pacific (Singapore)</option>
                                        </select>
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
