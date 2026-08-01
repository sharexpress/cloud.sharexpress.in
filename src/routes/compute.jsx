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
import { PageShell, PageHeader, Panel, StatusBadge, Metric } from "@/components/app/primitives";
import { Cpu, MemoryStick, RefreshCw, Server, X, Check, Sliders, Play, Square } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { scaleReplicas, completeScaling, restartContainer, completeRestart } from "../store/index.js";

export const Route = createFileRoute("/compute")({
    head: () => ({ meta: [{ title: "Compute — Sharexpress Cloud" }] }),
    component: ComputePage,
});

function ComputePage() {
    const dispatch = useDispatch();
    const compute = useSelector((state) => state.compute.list);
    
    const [selectedService, setSelectedService] = useState(null);
    const [replicasVal, setReplicasVal] = useState(1);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [type, setType] = useState("Container");
    const [replicas, setReplicas] = useState(2);
    const [region, setRegion] = useState("iad1");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // Watch for scaling transitions
    useEffect(() => {
        compute.forEach(c => {
            if (c.status === "scaling") {
                const timer = setTimeout(() => {
                    dispatch(completeScaling(c.id));
                    showToast(`Successfully scaled ${c.name} replicas.`);
                }, 2000);
                return () => clearTimeout(timer);
            }
            if (c.status === "restarting") {
                const timer = setTimeout(() => {
                    dispatch(completeRestart(c.id));
                    showToast(`Successfully restarted container ${c.name}.`);
                }, 2000);
                return () => clearTimeout(timer);
            }
        });
    }, [compute, dispatch]);

    const handleSelect = (service) => {
        setSelectedService(service);
        setReplicasVal(service.replicas);
    };

    const handleScale = () => {
        if (!selectedService) return;
        dispatch(scaleReplicas({ id: selectedService.id, replicas: replicasVal }));
        setSelectedService(null);
    };

    const handleRestart = (id, sName) => {
        dispatch(restartContainer(id));
        setSelectedService(null);
        showToast(`Restarting compute cluster ${sName}...`);
    };

    const handleCreateService = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Custom action for adding new compute item
        dispatch({
            type: "compute/addCompute",
            payload: {
                id: `c_${Date.now()}`,
                name: name.trim(),
                type,
                replicas: parseInt(replicas) || 1,
                region,
                cpu: Math.floor(Math.random() * 50) + 10,
                memory: Math.floor(Math.random() * 50) + 20,
                status: "healthy",
            }
        });

        // Reset
        setName("");
        setIsCreateOpen(false);
        showToast(`Compute service ${name} created!`);
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

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Compute" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Compute" description="Containers, edge workers, and scheduled jobs across all regions." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
                New service
            </button>
        }/>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total vCPU" value="128" hint="24 nodes · 5 regions" series={metricSeries(21)} icon={<Cpu className="h-3.5 w-3.5"/>}/>
          <Metric label="Memory" value="384 GB" hint="182 GB in use" series={metricSeries(22)} icon={<MemoryStick className="h-3.5 w-3.5"/>}/>
          <Metric label="Containers" value={compute.length.toString()} hint="all systems normal" series={metricSeries(23)} icon={<Server className="h-3.5 w-3.5"/>}/>
          <Metric label="Auto-scale events" value="14" hint="last 24h" series={metricSeries(24)} icon={<RefreshCw className="h-3.5 w-3.5"/>}/>
        </div>

        <Panel title="Running services" className="mt-6" padded={false}>
          <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_120px_120px] gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div>Service</div><div>Type</div><div>Region</div><div>Replicas</div><div>CPU</div><div>Memory</div><div className="text-right">Status</div>
          </div>
          <ul className="divide-y divide-border">
            {compute.map((c) => (<li 
                key={c.id} 
                onClick={() => handleSelect(c)}
                className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_120px_120px] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40 transition-colors cursor-pointer"
            >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">{c.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">auto-scale · min 2 · max 20</div>
                </div>
                <div className="text-[12px] text-muted-foreground">{c.type}</div>
                <div className="text-[12px] text-muted-foreground">{c.region}</div>
                <div className="text-[12px] text-foreground font-semibold">{c.replicas}</div>
                <Bar value={c.cpu}/>
                <Bar value={c.memory}/>
                <div className="flex justify-end"><StatusBadge status={c.status}/></div>
              </li>))}
          </ul>
        </Panel>
      </PageShell>

      {/* Scale & Control Drawer Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">{selectedService.name} Settings</h2>
                <p className="text-[11px] text-muted-foreground">Type: {selectedService.type} · Region: {selectedService.region}</p>
              </div>
              <button onClick={() => setSelectedService(null)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-muted-foreground">Replicas Count:</span>
                  <span className="font-bold text-foreground text-[14px]">{replicasVal}</span>
                </div>
                <input 
                  type="range" min="1" max="24" value={replicasVal} onChange={(e) => setReplicasVal(parseInt(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <span className="text-[10px] text-muted-foreground block text-center">Sharexpress Cloud automatically balances replicas across availability zones.</span>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <span className="text-[11.5px] text-muted-foreground block">Service Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleRestart(selectedService.id, selectedService.name)}
                    className="flex h-8 items-center justify-center gap-1.5 rounded border border-border bg-background text-[11.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Restart Replicas
                  </button>
                  <button 
                    className="flex h-8 items-center justify-center gap-1.5 rounded border border-border bg-background text-[11.5px] text-muted-foreground hover:text-foreground cursor-not-allowed"
                    title="Already Running"
                    disabled
                  >
                    <Play className="h-3.5 w-3.5 fill-current text-success" /> Running
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button onClick={() => setSelectedService(null)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button onClick={handleScale} className="h-9 px-4 rounded bg-blue-600 text-[12.5px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer">Scale Cluster</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Service Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Launch Compute Service</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateService} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Service Name</label>
                <input 
                  type="text" required placeholder="e.g. notifications-worker" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Service Type</label>
                  <select 
                    value={type} onChange={(e) => setType(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option>Container</option>
                    <option>Edge</option>
                    <option>Job</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Region</label>
                  <select 
                    value={region} onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="global">Global Edge</option>
                    <option value="iad1">US East (iad1)</option>
                    <option value="fra1">Europe (fra1)</option>
                    <option value="sin1">Asia Pacific (sin1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] text-muted-foreground">Replicas</label>
                <input 
                  type="number" min="1" max="20" required value={replicas} onChange={(e) => setReplicas(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-blue-600 text-[12.5px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer">Deploy Service</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}

function Bar({ value }) {
    return (<div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-accent" style={{ width: `${value}%` }}/>
      </div>
      <span className="text-[11px] text-muted-foreground tabular-nums">{value}%</span>
    </div>);
}
