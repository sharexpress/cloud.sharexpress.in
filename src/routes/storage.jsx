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
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { 
  HardDrive, Plus, Search, Grid3x3, List, ArrowRight, X, Check 
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addBucket } from "../store/index.js";
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
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId);
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    const [query, setQuery] = useState("");
    const [selectedVis, setSelectedVis] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form fields
    const [bucketName, setBucketName] = useState("");
    const [bucketVis, setBucketVis] = useState("public");
    const [region, setRegion] = useState("iad1");

    const visList = ["All", "Public", "Private"];

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const filtered = buckets.filter((b) => {
        const matchesQuery = b.name.toLowerCase().includes(query.toLowerCase());
        const matchesVis = selectedVis === "All" || (b.visibility || "public").toLowerCase() === selectedVis.toLowerCase();
        return matchesQuery && matchesVis;
    });

    const handleCreateBucket = (e) => {
        e.preventDefault();
        if (!bucketName.trim()) return;

        const name = bucketName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
        dispatch(addBucket({
            name,
            visibility: bucketVis,
            region,
            size: "0 GB",
            objectsCount: 0,
        }));
        setBucketName("");
        setIsCreateOpen(false);
        showToast(`Bucket "${name}" created successfully!`);
    };

    return (<AppShell breadcrumbs={[{ label: activeWsName }, { label: "Storage" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-status-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader 
            title="Storage" 
            description={`Managed S3 bucket storage & CDN running in ${activeWsName}.`} 
            actions={
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-[12px] font-semibold text-background hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
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
                params={{ id: b.id }}
                key={b.id} 
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
                      <div className="mt-0.5 font-bold text-text-primary">{(b.objectsCount || 12480).toLocaleString()}</div>
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
          <Panel padded={false}>
            <ul className="divide-y divide-border/60">
              {filtered.map((b) => (
                <li key={b.id}>
                  <Link 
                    to="/storage/$id"
                    params={{ id: b.id }}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 hover:bg-surface/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-text-primary">
                        {b.name}
                      </div>
                      <div className="truncate text-[11px] text-text-muted font-mono mt-0.5">
                        {(b.region || "iad1").toUpperCase()} · {b.size || "42.8 GB"} · {(b.objectsCount || 12480).toLocaleString()} objects
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3.5 text-[11px]">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-border/60 uppercase">
                        {b.visibility || "public"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all"/>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 font-mono">
          <div className="w-full max-w-md border border-border bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
              <h2 className="text-[13.5px] font-bold text-text-primary">Create New Storage Bucket</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-text-muted hover:bg-surface hover:text-text-primary transition-colors cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBucket} className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] text-text-muted uppercase mb-1">Bucket Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. media-assets"
                  value={bucketName}
                  onChange={(e) => setBucketName(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-surface px-3 text-[12.5px] font-medium text-text-primary focus:border-border-strong focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-text-muted uppercase mb-1">Visibility</label>
                  <select 
                    value={bucketVis}
                    onChange={(e) => setBucketVis(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[12px] font-medium text-text-primary focus:border-border-strong focus:outline-none cursor-pointer"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-text-muted uppercase mb-1">Region</label>
                  <select 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="h-9 w-full rounded-md border border-border bg-surface px-2.5 text-[12px] font-medium text-text-primary focus:border-border-strong focus:outline-none cursor-pointer"
                  >
                    <option value="iad1">US East (iad1)</option>
                    <option value="sfo1">US West (sfo1)</option>
                    <option value="fra1">Europe (fra1)</option>
                    <option value="sin1">Asia Pacific (sin1)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="h-8.5 px-3.5 rounded-md border border-border bg-surface text-[12px] font-medium text-text-primary hover:bg-surface/80 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="h-8.5 px-3.5 rounded-md bg-foreground text-[12px] font-semibold text-background hover:opacity-90 cursor-pointer transition-opacity"
                >
                  Create Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>);
}
