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
import { PageShell, PageHeader, Panel, Metric, AreaChart } from "@/components/app/primitives";
import { AlertTriangle, Activity as ActivityIcon, Check, X, Bell } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleAlert, addAlert } from "../store/index.js";

export const Route = createFileRoute("/monitoring")({
    head: () => ({ meta: [{ title: "Monitoring — Sharexpress Cloud" }] }),
    component: MonitoringPage,
});

function MonitoringPage() {
    const dispatch = useDispatch();
    const { alerts, incidents } = useSelector((state) => state.monitoring);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [alertName, setAlertName] = useState("");
    const [alertMetric, setAlertMetric] = useState("latency");
    const [alertThreshold, setAlertThreshold] = useState("> 200ms");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleCreateAlert = (e) => {
        e.preventDefault();
        if (!alertName.trim()) return;

        dispatch(addAlert({
            name: alertName.trim(),
            metric: alertMetric,
            threshold: alertThreshold,
        }));
        setAlertName("");
        setIsCreateOpen(false);
        showToast("Custom alert threshold rule configured.");
    };

    const handleToggle = (id, ruleName) => {
        dispatch(toggleAlert(id));
        const rule = alerts.find(a => a.id === id);
        if (rule) {
            showToast(`${ruleName} rule ${rule.enabled ? "disabled" : "enabled"}.`);
        }
    };

    // Helper functions for mock charts
    const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
        const out = [];
        for (let i = 0; i < len; i++) {
            const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
            out.push(Math.max(4, Math.min(100, Math.round(v))));
        }
        return out;
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Monitoring" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Monitoring" description="Health, performance, and alerts across every service." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong cursor-pointer transition-colors"
            >
                Configure alerts
            </button>
        }/>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Uptime · 30d" value="99.982%" hint="SLA 99.95%" series={metricSeries(61)} icon={<ActivityIcon className="h-3.5 w-3.5"/>}/>
          <Metric label="Requests" value="42.1M" hint="24h" delta={{ value: "+8.4%", positive: true }} series={metricSeries(62)}/>
          <Metric label="Errors" value="1,842" hint="0.04%" delta={{ value: "-12%", positive: true }} series={metricSeries(63)}/>
          <Metric label="Active Alerts" value={alerts.filter(a => a.enabled).length.toString()} hint={`${alerts.length} total rules`} series={metricSeries(64)} icon={<AlertTriangle className="h-3.5 w-3.5"/>}/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="p95 latency" description="ms · 24h"><AreaChart data={metricSeries(71, 48, 80, 50)} unit="ms"/></Panel>
          <Panel title="Error rate" description="% · 24h"><AreaChart data={metricSeries(72, 48, 20, 30)} unit="%"/></Panel>
          <Panel title="CPU · fleet-wide" description="% · 24h"><AreaChart data={metricSeries(73, 48, 40, 40)} unit="%"/></Panel>
          <Panel title="Bandwidth" description="MB/s · 24h"><AreaChart data={metricSeries(74, 48, 60, 70)} unit="MB/s"/></Panel>
        </div>

        {/* ALERTS SECTION */}
        <Panel title="Configured Alert Rules" description="Alert triggers configured for your platform instances." className="mt-6">
            <div className="grid gap-3 sm:grid-cols-3">
                {alerts.map(rule => (
                    <div key={rule.id} className="border border-border rounded-md bg-background/50 p-4 space-y-3 flex flex-col justify-between">
                        <div>
                            <div className="text-[13px] font-semibold text-foreground">{rule.name}</div>
                            <div className="text-[11px] text-muted-foreground mt-1">If {rule.metric} goes {rule.threshold}</div>
                        </div>
                        <div className="flex items-center justify-between border-t border-border/40 pt-3">
                            <span className="text-[11px] text-muted-foreground">Status: <span className={rule.enabled ? "text-foreground font-bold" : "text-muted-foreground"}>{rule.enabled ? "Active" : "Disabled"}</span></span>
                            <button 
                                onClick={() => handleToggle(rule.id, rule.name)}
                                className={`h-6 px-2.5 rounded text-[10px] font-semibold transition-colors cursor-pointer ${rule.enabled ? "bg-neutral-800 text-neutral-300 border border-neutral-700" : "bg-foreground text-background font-semibold border border-foreground"}`}
                            >
                                {rule.enabled ? "Disable" : "Enable"}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>

        <Panel title="Incidents" className="mt-6" padded={false}>
          <ul className="divide-y divide-border">
            {incidents.map((i) => (<li key={i.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5">
                <span className={`h-2 w-2 rounded-full ${i.status === "monitoring" ? "bg-neutral-400" : "bg-foreground"}`}/>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{i.title}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{i.id} · opened {i.time}</div>
                </div>
                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] capitalize text-muted-foreground font-medium">{i.status}</span>
              </li>))}
          </ul>
        </Panel>
      </PageShell>

      {/* Configure Alert Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Configure Health Alert</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAlert} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Alert Rule Name</label>
                <input 
                  type="text" required placeholder="e.g. Critical API Latency" value={alertName} onChange={(e) => setAlertName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Metric Type</label>
                  <select 
                    value={alertMetric} onChange={(e) => setAlertMetric(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="latency">p95 Latency</option>
                    <option value="cpu">CPU Usage</option>
                    <option value="memory">Memory Usage</option>
                    <option value="errors">Error Rate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Threshold Limit</label>
                  <input 
                    type="text" required placeholder="> 500ms" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-blue-600 text-[12.5px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer">Save Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
