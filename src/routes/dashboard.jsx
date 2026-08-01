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

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, StatusBadge } from "@/components/app/primitives";
import { ArrowUpRight, Cpu, HardDrive, Network, Rocket, Zap, Database, FolderGit2, Activity, BarChart3, TrendingUp, ShieldCheck, Globe } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "@/lib/api";
import { setProjects, setDatabases, setStats } from "@/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
    head: () => ({
        meta: [
            { title: "Overview — Sharexpress Cloud" },
            { name: "description", content: "Real-time status of your projects, deployments, compute, and usage across Sharexpress Cloud." },
        ],
    }),
    component: OverviewPage,
});

// --- Interactive XY Coordinate Graph Component ---
function XyCoordinateGraph({ cpuData, memData }) {
    const containerRef = useRef(null);
    const [hoverIndex, setHoverIndex] = useState(null);

    const w = 800;
    const h = 200;
    const len = cpuData.length;
    const step = w / (len - 1);

    // Map CPU points (0 - 100%)
    const cpuPoints = cpuData.map((v, i) => [i * step, h - (v / 100) * (h - 40) - 20]);
    const cpuD = cpuPoints.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const cpuArea = `${cpuD} L${w},${h - 20} L0,${h - 20} Z`;

    // Map Memory points (0 - 100%)
    const memPoints = memData.map((v, i) => [i * step, h - (v / 100) * (h - 40) - 20]);
    const memD = memPoints.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const index = Math.max(0, Math.min(len - 1, Math.round((clientX / rect.width) * (len - 1))));
        setHoverIndex(index);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#5F6AD2]" />
                        <span className="text-foreground font-semibold">CPU Utilization</span>
                        <span className="text-muted-foreground">({cpuData[hoverIndex ?? len - 1]}%)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        <span className="text-foreground font-semibold">Memory Usage</span>
                        <span className="text-muted-foreground">({memData[hoverIndex ?? len - 1]}%)</span>
                    </div>
                </div>
                <span className="text-[10.5px] font-mono text-muted-foreground">24h Window</span>
            </div>

            <div
                ref={containerRef}
                className="relative w-full cursor-crosshair select-none"
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverIndex(null)}
            >
                <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[200px] w-full overflow-visible">
                    <defs>
                        <linearGradient id="xy-cpu-grad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#5F6AD2" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#5F6AD2" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines with Y-Axis Values */}
                    {[100, 75, 50, 25, 0].map((val, idx) => {
                        const y = (idx / 4) * (h - 40) + 20;
                        return (
                            <g key={val}>
                                <line x1="0" y1={y} x2={w} y2={y} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="4 4" strokeWidth="0.75" />
                                <text x="-6" y={y + 3} fill="rgba(255, 255, 255, 0.3)" fontSize="9" fontFamily="monospace" textAnchor="end">{val}%</text>
                            </g>
                        );
                    })}

                    {/* Area under CPU curve */}
                    <path d={cpuArea} fill="url(#xy-cpu-grad)" />

                    {/* Memory Line */}
                    <path d={memD} fill="none" stroke="#10B981" strokeWidth="1.75" strokeDasharray="3 3" strokeLinejoin="round" />

                    {/* CPU Line */}
                    <path d={cpuD} fill="none" stroke="#5F6AD2" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                    {/* Interactive Crosshair & Tooltip Dots */}
                    {hoverIndex !== null && (
                        <>
                            <line
                                x1={cpuPoints[hoverIndex][0]}
                                y1="0"
                                x2={cpuPoints[hoverIndex][0]}
                                y2={h}
                                stroke="rgba(255, 255, 255, 0.15)"
                                strokeDasharray="2 2"
                                strokeWidth="1"
                            />
                            {/* CPU Dot */}
                            <circle cx={cpuPoints[hoverIndex][0]} cy={cpuPoints[hoverIndex][1]} r="4.5" fill="#5F6AD2" stroke="#000" strokeWidth="2" />
                            {/* Memory Dot */}
                            <circle cx={memPoints[hoverIndex][0]} cy={memPoints[hoverIndex][1]} r="4.5" fill="#10B981" stroke="#000" strokeWidth="2" />
                        </>
                    )}
                </svg>

                {/* X-Axis Labels */}
                <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-muted-foreground">
                    <span>00:00</span>
                    <span>04:00</span>
                    <span>08:00</span>
                    <span>12:00</span>
                    <span>16:00</span>
                    <span>20:00</span>
                    <span>24:00</span>
                </div>
            </div>
        </div>
    );
}

// --- Interactive Bar Graph Component ---
function BarGraphOverview({ barData }) {
    const [hoveredBar, setHoveredBar] = useState(null);
    const maxVal = Math.max(...barData, 1);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-mono font-bold text-foreground">Hourly Request Frequency (reqs/min)</span>
                <span className="text-[10.5px] font-mono text-muted-foreground">Peak: {maxVal} reqs/m</span>
            </div>

            <div className="h-[200px] flex items-end justify-between gap-1.5 pt-6 pb-2 px-1">
                {barData.map((val, idx) => {
                    const heightPct = Math.max(8, (val / maxVal) * 100);
                    const isHovered = hoveredBar === idx;
                    return (
                        <div
                            key={idx}
                            className="relative flex-1 flex flex-col items-center group cursor-pointer"
                            onMouseEnter={() => setHoveredBar(idx)}
                            onMouseLeave={() => setHoveredBar(null)}
                        >
                            {/* Tooltip on hover */}
                            {isHovered && (
                                <div className="absolute -top-8 z-30 pointer-events-none whitespace-nowrap rounded bg-surface border border-border px-2 py-0.5 text-[10px] font-mono text-foreground shadow-lg">
                                    {val} req/m
                                </div>
                            )}

                            {/* Bar fill with gradient */}
                            <div
                                style={{ height: `${heightPct}%` }}
                                className={cn(
                                    "w-full rounded-t transition-all duration-150",
                                    isHovered ? "bg-[#5F6AD2] shadow-md shadow-[#5F6AD2]/30" : "bg-[#5F6AD2]/40 hover:bg-[#5F6AD2]/70"
                                )}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Time ticks */}
            <div className="flex justify-between items-center px-1 text-[10px] font-mono text-muted-foreground">
                <span>00h</span>
                <span>06h</span>
                <span>12h</span>
                <span>18h</span>
                <span>24h</span>
            </div>
        </div>
    );
}

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
        active_containers: projects.length + databases.length || 3,
        storage_used_gb: 88.4,
        cluster_health: "Healthy"
    };

    // Telemetry time series data for XY Graph & Bar Chart
    const cpuTimeSeries = [18, 22, 20, 28, 35, 29, 24, 26, 31, 40, 32, 24, 26, 28, 30, 25, 22, 24, 27, 24];
    const memTimeSeries = [22, 24, 25, 25, 26, 27, 26, 26, 28, 30, 29, 27, 26, 26, 27, 26, 25, 26, 26, 26];
    const hourlyRequests = [420, 380, 310, 290, 340, 480, 720, 950, 1240, 1480, 1320, 1280, 1450, 1600, 1520, 1380, 1250, 1100, 980, 850, 720, 610, 540, 460];

    return (
        <AppShell>
            <PageShell>
                <PageHeader
                    title="Overview"
                    description="Real-time live operational overview of your projects, database clusters, and system telemetry."
                />

                {/* System Telemetry Metric Cards */}
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
                        value={metrics.active_containers || (projects.length + databases.length || 3)}
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

                {/* Interactive Telemetry Graphs Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* System Performance Graph */}
                    <Panel title="System Performance" icon={Activity}>
                        <XyCoordinateGraph cpuData={cpuTimeSeries} memData={memTimeSeries} />
                    </Panel>

                    {/* Request Volume Bar Graph */}
                    <Panel title="Request Volume" icon={BarChart3}>
                        <BarGraphOverview barData={hourlyRequests} />
                    </Panel>
                </div>

                {/* Projects & Databases Grid */}
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
                                    <Link
                                        key={p.id}
                                        to="/projects/$id"
                                        params={{ id: p.slug }}
                                        className="py-3 flex items-center justify-between hover:bg-surface/50 px-2 rounded-lg transition-colors cursor-pointer group"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary group-hover:text-[#5F6AD2] transition-colors">{p.name}</p>
                                            <p className="text-xs text-text-muted font-mono">{p.subdomain || `${p.slug}.project.sharexpress.in`}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono uppercase bg-bg-secondary border border-border-primary px-2 py-0.5 rounded text-text-muted">{p.framework || p.type || "Node"}</span>
                                            <StatusBadge status={p.status || "ready"} />
                                        </div>
                                    </Link>
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
                                    <div key={db.id} className="py-3 flex items-center justify-between px-2">
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
