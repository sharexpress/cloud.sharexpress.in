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
import { PageShell, PageHeader, StatusBadge } from "@/components/app/primitives";
import { 
  Database, Check, Plus, Search, 
  Grid3x3, List, ArrowRight 
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDatabases, createDatabaseThunk } from "@/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/databases")({
    head: () => ({ meta: [{ title: "Databases — Sharexpress Cloud" }] }),
    component: DatabasesPage,
});

function DatabasesPage() {
    const path = useRouterState({ select: (s) => s.location.pathname });
    const isDetail = path !== "/databases" && path !== "/databases/";

    if (isDetail) {
        return <Outlet />;
    }

    const dispatch = useDispatch();
    const databases = useSelector((state) => state.databases?.list || []);
    const workspaces = useSelector((state) => state.workspaces?.list || []);
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");
    const activeWsName = workspaces.find((w) => w.id === activeWsId)?.name || "Workspace";

    const [query, setQuery] = useState("");
    const [selectedEngine, setSelectedEngine] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    // Form state
    const [name, setName] = useState("");
    const [engine, setEngine] = useState("PostgreSQL 16");
    const [size, setSize] = useState("8 GB");
    const [region, setRegion] = useState("iad1");

    const enginesList = ["All", "PostgreSQL", "Redis", "MongoDB", "MySQL"];

    useEffect(() => {
        dispatch(fetchDatabases(activeWsId));
    }, [dispatch, activeWsId]);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const filtered = databases.filter((db) => {
        const matchesQuery = (db.name || "").toLowerCase().includes(query.toLowerCase()) ||
                             (db.engine || "").toLowerCase().includes(query.toLowerCase());
        const matchesEngine = selectedEngine === "All" || (db.engine || "").toLowerCase().includes(selectedEngine.toLowerCase());
        return matchesQuery && matchesEngine;
    });

    const handleCreateDatabase = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            await dispatch(createDatabaseThunk({
                dbData: {
                    name,
                    engine,
                    size,
                    region,
                    status: "healthy",
                    cpu: 12,
                    storage: 24,
                },
                workspace_id: activeWsId
            })).unwrap();

            setName("");
            setIsCreateOpen(false);
            showToast(`Database cluster ${name} is being provisioned!`);
        } catch (err) {
            alert(err || "Failed to provision database cluster");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppShell breadcrumbs={[{ label: activeWsName }, { label: "Databases" }]}>
            <PageShell>
                {toastMessage && (
                    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                        <Check className="h-4 w-4 text-status-success" />
                        {toastMessage}
                    </div>
                )}

                <PageHeader 
                    title="Databases" 
                    description={`Managed database clusters running in ${activeWsName}.`} 
                    actions={
                        <button 
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-[12px] font-semibold text-background hover:opacity-90 transition-opacity cursor-pointer shadow-2xs"
                        >
                            <Plus className="h-3.5 w-3.5"/> New database
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
                                placeholder="Search databases by cluster name or engine…" 
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

                    {/* Engine pill tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-mono">
                        {enginesList.map((eng) => (
                            <button
                                key={eng}
                                onClick={() => setSelectedEngine(eng)}
                                className={cn(
                                    "rounded px-2.5 py-1 transition-all cursor-pointer whitespace-nowrap",
                                    selectedEngine === eng
                                        ? "bg-surface text-text-primary border border-border font-semibold shadow-2xs"
                                        : "text-text-muted hover:text-text-primary hover:bg-surface/50 border border-transparent"
                                )}
                            >
                                {eng}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Database List / Grid */}
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center">
                        <Database className="h-9 w-9 text-text-muted mb-3 opacity-60" />
                        <h3 className="text-[13.5px] font-semibold text-text-primary">No database clusters found</h3>
                        <p className="mt-1 max-w-sm text-[12px] text-text-muted">Provision managed high-availability database clusters in seconds.</p>
                    </div>
                ) : view === "grid" ? (
                    <div className="grid gap-3.5 md:grid-cols-2">
                        {filtered.map((db) => (
                            <Link 
                                to="/databases/$id"
                                params={{ id: db.id || db.name }}
                                key={db.id || db.name} 
                                className="group relative rounded-lg border border-border bg-card p-4.5 transition-all duration-150 hover:border-border-strong hover:bg-surface/30 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Bar: Name + Status */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-[13.5px] font-semibold text-text-primary group-hover:text-text-primary transition-colors">
                                                {db.name}
                                            </div>
                                            <div className="truncate text-[10.5px] text-text-muted font-mono mt-0.5">
                                                {db.engine} · {(db.region || "iad1").toUpperCase()}
                                            </div>
                                        </div>
                                        <StatusBadge status={db.status || "healthy"}/>
                                    </div>

                                    {/* Body: Specs */}
                                    <div className="mt-4 grid grid-cols-3 gap-2 font-mono text-[11px] text-text-muted border-t border-b border-border/40 py-2.5 my-2">
                                        <div>
                                            <div className="text-[9.5px] uppercase">RAM Size</div>
                                            <div className="mt-0.5 font-bold text-text-primary">{db.size || "8 GB"}</div>
                                        </div>
                                        <div>
                                            <div className="text-[9.5px] uppercase">CPU Load</div>
                                            <div className="mt-0.5 font-bold text-text-primary">{db.cpu ?? 22}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[9.5px] uppercase">Storage</div>
                                            <div className="mt-0.5 font-bold text-text-primary">{db.storage ?? 41}%</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-2 flex items-center justify-between text-[10.5px] text-text-muted font-mono">
                                    <span>SSL Encrypted</span>
                                    <span className="flex items-center gap-1 text-text-muted group-hover:text-text-primary transition-colors">
                                        Manage <ArrowRight className="h-2.5 w-2.5"/>
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
                                    <th className="px-4 py-2.5">Database</th>
                                    <th className="px-4 py-2.5">Engine</th>
                                    <th className="px-4 py-2.5">Region</th>
                                    <th className="px-4 py-2.5">RAM Size</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map((db) => (
                                    <tr key={db.id || db.name} className="hover:bg-surface/30 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-text-primary">{db.name}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{db.engine}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{(db.region || "iad1").toUpperCase()}</td>
                                        <td className="px-4 py-3 font-mono text-text-muted">{db.size || "8 GB"}</td>
                                        <td className="px-4 py-3"><StatusBadge status={db.status || "healthy"}/></td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to="/databases/$id" params={{ id: db.id || db.name }} className="text-text-primary hover:underline font-mono text-[11px]">Manage &rarr;</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Provision Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative">
                            <h3 className="text-sm font-bold text-text-primary mb-1">Provision Managed Database</h3>
                            <p className="text-xs text-text-muted mb-4">Deploy high-availability database cluster into {activeWsName}.</p>

                            <form onSubmit={handleCreateDatabase} className="space-y-3.5">
                                <div>
                                    <label className="block text-xs font-semibold text-text-primary mb-1">Cluster Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. primary-pg"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-strong"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Engine</label>
                                        <select
                                            value={engine}
                                            onChange={(e) => setEngine(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                                        >
                                            <option value="PostgreSQL 16">PostgreSQL 16</option>
                                            <option value="Redis 7.2">Redis 7.2</option>
                                            <option value="MongoDB 7">MongoDB 7</option>
                                            <option value="MySQL 8">MySQL 8</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-text-primary mb-1">Instance Size</label>
                                        <select
                                            value={size}
                                            onChange={(e) => setSize(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none"
                                        >
                                            <option value="2 GB">2 GB RAM</option>
                                            <option value="8 GB">8 GB RAM</option>
                                            <option value="16 GB">16 GB RAM</option>
                                            <option value="32 GB">32 GB RAM</option>
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
                                        className="px-4 py-1.5 bg-foreground text-background font-semibold rounded-md text-xs hover:opacity-90 disabled:opacity-50"
                                    >
                                        {submitting ? "Provisioning..." : "Provision Cluster"}
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
