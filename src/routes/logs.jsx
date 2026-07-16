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
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { Pause, Play, Search, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addLogLine, clearLogs, toggleStreaming, setFilterLevel, setSearchQuery } from "../store/index.js";

export const Route = createFileRoute("/logs")({
    head: () => ({ meta: [{ title: "Logs — Nimbus" }] }),
    component: LogsPage,
});

const levelStyle = {
    info: "text-muted-foreground",
    warn: "text-warning font-semibold",
    error: "text-destructive font-bold",
    debug: "text-info",
};

function LogsPage() {
    const dispatch = useDispatch();
    const { lines: logLines, isStreaming, filterLevel, searchQuery } = useSelector((state) => state.logs);

    const [selectedService, setSelectedService] = useState("all");
    const [localQuery, setLocalQuery] = useState(searchQuery);

    // Live Stream Simulator
    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            const time = new Date().toLocaleTimeString();
            const logEntries = [
                { level: "info", svc: "web-edge", msg: `GET /api/users 200 ${Math.floor(Math.random() * 30) + 5}ms` },
                { level: "info", svc: "api-core", msg: "connection pool health check passed: PG-active" },
                { level: "warn", svc: "workers-images", msg: `slow transform 812ms > budget 500ms for image#${Math.floor(Math.random() * 100)}` },
                { level: "info", svc: "web-edge", msg: `POST /api/events 204 ${Math.floor(Math.random() * 10) + 2}ms` },
                { level: "error", svc: "workers-images", msg: "ENOSPC writing /tmp/cache-img-8812.png — retrying write" },
                { level: "debug", svc: "auth", msg: `authorized token for user_id=${Math.floor(Math.random()*800)+100}` }
            ];
            const entry = logEntries[Math.floor(Math.random() * logEntries.length)];
            dispatch(addLogLine({ t: time, ...entry }));
        }, 1200);

        return () => clearInterval(interval);
    }, [isStreaming, dispatch]);

    const handleSearchChange = (val) => {
        setLocalQuery(val);
        dispatch(setSearchQuery(val));
    };

    const handleFilterChange = (level) => {
        dispatch(setFilterLevel(level));
    };

    // Filter logs
    const filteredLines = logLines.filter(l => {
        const matchesSvc = selectedService === "all" || l.svc === selectedService;
        const matchesLevel = filterLevel === "all" || l.level === filterLevel;
        const matchesSearch = 
            (l.msg + l.svc).toLowerCase().includes(localQuery.toLowerCase()) ||
            l.level.toLowerCase().includes(localQuery.toLowerCase());
        return matchesSvc && matchesLevel && matchesSearch;
    });

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Logs" }]}>
      <PageShell>
        <PageHeader title="Logs" description="Real-time streaming logs across all edge networks and services." actions={
            <div className="flex gap-2">
                <button 
                    onClick={() => dispatch(clearLogs())}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[11.5px] text-foreground hover:bg-surface-elevated cursor-pointer transition-colors"
                >
                    <Trash className="h-3.5 w-3.5" /> Clear logs
                </button>
                <button 
                    onClick={() => dispatch(toggleStreaming())} 
                    className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-medium transition-colors cursor-pointer ${isStreaming ? "bg-foreground text-background font-semibold" : "border border-border bg-surface text-foreground"}`}
                >
                    {isStreaming ? <><Pause className="h-3.5 w-3.5"/> Streaming</> : <><Play className="h-3.5 w-3.5"/> Paused</>}
                </button>
            </div>
        }/>

        <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"/>
            <input 
                value={localQuery} 
                onChange={(e) => handleSearchChange(e.target.value)} 
                placeholder='Search logs (e.g. status:500 svc:api-core)' 
                className="h-9 w-full rounded-md border border-border bg-surface pl-8 pr-3 font-mono text-[12px] text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <select 
            value={selectedService} onChange={(e) => setSelectedService(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground"
          >
            <option value="all">All services</option>
            <option value="web-edge">web-edge</option>
            <option value="api-core">api-core</option>
            <option value="workers-images">workers-images</option>
            <option value="auth">auth</option>
          </select>
          <select 
            value={filterLevel} onChange={(e) => handleFilterChange(e.target.value)}
            className="h-9 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground"
          >
            <option value="all">All levels</option>
            <option value="info">info</option>
            <option value="warn">warn</option>
            <option value="error">error</option>
            <option value="debug">debug</option>
          </select>
        </div>

        <Panel padded={false} className="overflow-hidden">
          <div className="max-h-[500px] min-h-[300px] overflow-auto bg-black p-4 font-mono text-[11.5px] leading-relaxed scrollbar-thin">
            {filteredLines.length === 0 ? (
                <div className="text-center text-muted-foreground py-20 font-sans text-[13px]">
                    No matching log events. Waiting for streams...
                </div>
            ) : (
                filteredLines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[100px_60px_125px_1fr] gap-3 border-b border-border/10 py-1 hover:bg-white/5 transition-colors">
                        <span className="text-muted-foreground/60">{l.t}</span>
                        <span className={`uppercase font-semibold ${levelStyle[l.level]}`}>{l.level}</span>
                        <span className="text-accent">{l.svc}</span>
                        <span className="text-foreground">{l.msg}</span>
                    </div>
                ))
            )}
          </div>
        </Panel>
      </PageShell>
    </AppShell>);
}
