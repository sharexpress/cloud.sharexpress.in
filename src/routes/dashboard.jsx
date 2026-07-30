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

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, StatusBadge } from "@/components/app/primitives";
import { ArrowUpRight, Cpu, HardDrive, Network, Rocket, Zap, Database, FolderGit2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { setProjects, setDatabases, setStats } from "@/store";

export const Route = createFileRoute("/dashboard")({
    head: () => ({
        meta: [
            { title: "Overview — Sharexpress Cloud" },
            { name: "description", content: "Real-time status of your projects, deployments, compute, and usage across Sharexpress Cloud." },
        ],
    }),
    component: OverviewPage,
});

function OverviewPage() {
    const dispatch = useDispatch();
    const projects = useSelector((state) => state.projects?.list || []);
    const databases = useSelector((state) => state.databases?.list || []);
    const stats = useSelector((state) => state.stats?.metrics);
    const activeWsId = useSelector((s) => s.workspaces?.activeWorkspaceId || "ws_acme");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchDashboardData() {
            try {
                const [statsRes, projectsRes, dbsRes] = await Promise.allSettled([
                    api.getSystemStats(),
                    api.listProjects(activeWsId),
                    api.listDatabases(activeWsId)
                ]);

                if (isMounted) {
                    if (statsRes.status === "fulfilled") dispatch(setStats(statsRes.value.metrics));
                    if (projectsRes.status === "fulfilled") dispatch(setProjects(projectsRes.value));
                    if (dbsRes.status === "fulfilled") dispatch(setDatabases(dbsRes.value));
                    setLoading(false);
                }
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
                if (isMounted) setLoading(false);
            }
        }

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [dispatch, activeWsId]);

    const metrics = stats || {
        cpu_usage_percent: 24,
        memory_used_gb: 4.2,
        memory_total_gb: 16.0,
        memory_usage_percent: 26,
        active_containers: projects.length + databases.length,
        storage_used_gb: 88.4,
        cluster_health: "Healthy"
    };

    return (
        <AppShell>
            <PageShell>
                <PageHeader
                    title="Overview"
                    description="Real-time live operational overview of your projects, database clusters, and system telemetry."
                />

                {/* System Metrics Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Metric
                        title="Host CPU Utilization"
                        value={`${metrics.cpu_usage_percent}%`}
                        change={metrics.cpu_usage_percent > 80 ? "High Load" : "Optimal"}
                        trend={metrics.cpu_usage_percent > 80 ? "up" : "down"}
                        icon={Cpu}
                    />
                    <Metric
                        title="RAM Usage"
                        value={`${metrics.memory_used_gb} GB / ${metrics.memory_total_gb} GB`}
                        change={`${metrics.memory_usage_percent}%`}
                        trend="neutral"
                        icon={HardDrive}
                    />
                    <Metric
                        title="Active Containers"
                        value={metrics.active_containers || (projects.length + databases.length)}
                        change="Live Docker Engine"
                        trend="up"
                        icon={Rocket}
                    />
                    <Metric
                        title="Cluster Status"
                        value={metrics.cluster_health}
                        change="0 Incidents"
                        trend="up"
                        icon={Zap}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Projects Panel */}
                    <Panel title="Active Projects" icon={FolderGit2}>
                        {projects.length === 0 ? (
                            <div className="text-center py-10 text-text-muted">
                                <FolderGit2 className="h-8 w-8 mx-auto mb-2 opacity-50 text-text-muted" />
                                <p className="text-sm font-medium text-text-primary">No projects deployed yet.</p>
                                <p className="text-xs text-text-muted mt-1">Create a project from the Projects tab to get started.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-primary">
                                {projects.map((p) => (
                                    <div key={p.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">{p.name}</p>
                                            <p className="text-xs text-text-muted font-mono">{p.subdomain || `${p.slug}.project.sharexpress.in`}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono uppercase bg-bg-secondary border border-border-primary px-2 py-0.5 rounded text-text-muted">{p.framework || p.type}</span>
                                            <StatusBadge status={p.status || "ready"} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>

                    {/* Live Databases Panel */}
                    <Panel title="Database Containers" icon={Database}>
                        {databases.length === 0 ? (
                            <div className="text-center py-10 text-text-muted">
                                <Database className="h-8 w-8 mx-auto mb-2 opacity-50 text-text-muted" />
                                <p className="text-sm font-medium text-text-primary">No databases provisioned yet.</p>
                                <p className="text-xs text-text-muted mt-1">Provision PostgreSQL, MongoDB, or Redis in the Databases tab.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-primary">
                                {databases.map((db) => (
                                    <div key={db.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">{db.name}</p>
                                            <p className="text-xs text-text-muted font-mono">{db.host || `${db.name}.internal.sharexpress.in`}:{db.port || 5432}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono uppercase bg-bg-secondary border border-border-primary px-2 py-0.5 rounded text-text-muted">{db.engine}</span>
                                            <StatusBadge status={db.status || "healthy"} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>
                </div>
            </PageShell>
        </AppShell>
    );
}
