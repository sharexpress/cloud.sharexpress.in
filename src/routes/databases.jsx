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
import { 
  Database, X, Plus, Search, Grid3x3, List
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { setDatabases, addDatabase } from "../store/index.js";
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
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");

    const [query, setQuery] = useState("");
    const [selectedEngine, setSelectedEngine] = useState("All");
    const [view, setView] = useState("grid");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [engine, setEngine] = useState("PostgreSQL");
    const [version, setVersion] = useState("16");
    const [region, setRegion] = useState("iad1");

    useEffect(() => {
        let isMounted = true;
        async function loadDatabases() {
            try {
                setLoading(true);
                const res = await api.listDatabases(activeWsId);
                if (isMounted) {
                    dispatch(setDatabases(res));
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load databases:", err);
                if (isMounted) setLoading(false);
            }
        }
        loadDatabases();
        return () => { isMounted = false; };
    }, [dispatch, activeWsId]);

    const handleCreateDatabase = async (e) => {
        e.preventDefault();
        if (!name) return;
        setSubmitting(true);
        try {
            const res = await api.createDatabase({
                name,
                engine,
                version,
                region
            }, activeWsId);

            if (res.success && res.database) {
                dispatch(addDatabase(res.database));
                setIsCreateOpen(false);
                setName("");
            }
        } catch (err) {
            alert(err.message || "Failed to provision database cluster");
        } finally {
            setSubmitting(false);
        }
    };

    const engines = ["All", "PostgreSQL", "MongoDB", "MySQL", "Redis"];

    const filtered = databases.filter((db) => {
        const matchesQuery = db.name.toLowerCase().includes(query.toLowerCase());
        const matchesEngine = selectedEngine === "All" || db.engine.toLowerCase().includes(selectedEngine.toLowerCase());
        return matchesQuery && matchesEngine;
    });

    return (
        <AppShell>
            <PageShell>
                <PageHeader
                    title="Databases"
                    description="Provision isolated PostgreSQL, MongoDB, MySQL, and Redis container clusters."
                    action={
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-md hover:bg-primary/90 transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Provision Database
                        </button>
                    }
                />

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                            <input
                                type="text"
                                placeholder="Filter databases..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-accent/50 border border-border/60 rounded-md pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50"
                            />
                        </div>
                        <select
                            value={selectedEngine}
                            onChange={(e) => setSelectedEngine(e.target.value)}
                            className="bg-accent/50 border border-border/60 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                        >
                            {engines.map((eng) => (
                                <option key={eng} value={eng}>{eng}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center border border-border/60 rounded-md bg-accent/40 p-0.5">
                        <button
                            onClick={() => setView("grid")}
                            className={cn("p-1.5 rounded text-xs transition-colors", view === "grid" ? "bg-background text-foreground shadow-xs" : "text-muted hover:text-foreground")}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={cn("p-1.5 rounded text-xs transition-colors", view === "list" ? "bg-background text-foreground shadow-xs" : "text-muted hover:text-foreground")}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Database Grid / List */}
                {loading ? (
                    <div className="text-center py-20 text-muted">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
                        <p className="text-xs">Loading database clusters...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <Panel>
                        <div className="text-center py-16">
                            <Database className="h-10 w-10 text-muted mx-auto mb-3 opacity-40" />
                            <h3 className="text-sm font-semibold mb-1">No Database Clusters Found</h3>
                            <p className="text-xs text-muted max-w-sm mx-auto mb-4">
                                Provision a new isolated database cluster to store project data.
                            </p>
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-2 rounded-md"
                            >
                                <Plus className="h-3.5 w-3.5" /> Provision Database
                            </button>
                        </div>
                    </Panel>
                ) : view === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((db) => (
                            <Link key={db.id} to={`/databases/${db.id}`} className="group block">
                                <Panel className="h-full hover:border-primary/50 transition-all hover:shadow-md">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center font-bold text-xs">
                                                <Database className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{db.name}</h4>
                                                <p className="text-xs text-muted font-mono">{db.engine} {db.version}</p>
                                            </div>
                                        </div>
                                        <StatusBadge status={db.status || "running"} />
                                    </div>
                                    <p className="text-xs text-muted font-mono truncate mb-4">
                                        {db.host || `${db.name}.internal.sharexpress.in`}:{db.port || 5432}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border/40">
                                        <span className="font-mono">DB: {db.database_name || "main_db"}</span>
                                        <span className="group-hover:translate-x-0.5 transition-transform">Manage &rarr;</span>
                                    </div>
                                </Panel>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Panel className="p-0 overflow-hidden">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-accent/40 text-muted uppercase text-[10px] font-semibold border-b border-border/60">
                                <tr>
                                    <th className="px-4 py-3">Database</th>
                                    <th className="px-4 py-3">Engine</th>
                                    <th className="px-4 py-3">Host & Port</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {filtered.map((db) => (
                                    <tr key={db.id} className="hover:bg-accent/20 transition-colors">
                                        <td className="px-4 py-3 font-semibold">{db.name}</td>
                                        <td className="px-4 py-3 font-mono text-muted">{db.engine} {db.version}</td>
                                        <td className="px-4 py-3 font-mono text-muted">{db.host}:{db.port}</td>
                                        <td className="px-4 py-3"><StatusBadge status={db.status || "running"} /></td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/databases/${db.id}`} className="text-primary hover:underline font-medium">Manage</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Panel>
                )}

                {/* Provision Database Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                        <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="absolute right-4 top-4 text-muted hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <h3 className="text-base font-bold mb-1">Provision Database Cluster</h3>
                            <p className="text-xs text-muted mb-4">Deploy isolated database container with dedicated persistent volume.</p>

                            <form onSubmit={handleCreateDatabase} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold mb-1">Database Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. primary-pg"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Engine</label>
                                        <select
                                            value={engine}
                                            onChange={(e) => setEngine(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
                                        >
                                            <option value="PostgreSQL">PostgreSQL</option>
                                            <option value="MongoDB">MongoDB</option>
                                            <option value="MySQL">MySQL</option>
                                            <option value="Redis">Redis</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1">Version</label>
                                        <input
                                            type="text"
                                            value={version}
                                            onChange={(e) => setVersion(e.target.value)}
                                            className="w-full bg-accent/40 border border-border rounded px-3 py-1.5 text-xs font-mono"
                                        />
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
                                        {submitting ? "Provisioning..." : "Provision Container"}
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
