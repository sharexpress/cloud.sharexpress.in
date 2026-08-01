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
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { GitBranch, Rocket, RefreshCw, Check, ArrowRight, User } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { triggerRollback, addDeployment } from "../store/index.js";

export const Route = createFileRoute("/deployments")({
    head: () => ({ meta: [{ title: "Deployments — Sharexpress Cloud" }] }),
    component: DeploymentsPage,
});

function DeploymentsPage() {
    const dispatch = useDispatch();
    const deployments = useSelector((state) => state.deployments?.list || []);
    const projects = useSelector((state) => state.projects?.list || []);

    const [filterEnv, setFilterEnv] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [selectedDpl, setSelectedDpl] = useState(null);

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const filteredDeploys = deployments.filter(d => {
        const envMatch = filterEnv === "all" || d.environment === filterEnv;
        const statusMatch = filterStatus === "all" || d.status === filterStatus;
        return envMatch && statusMatch;
    });

    const handleRollback = (dpl) => {
        dispatch(triggerRollback({
            deploymentId: dpl.id,
            projectName: dpl.project,
        }));
        setSelectedDpl(null);
        showToast(`Rollback to ${dpl.commit} initiated.`);
    };

    const handleManualDeploy = () => {
        const randomProj = projects[Math.floor(Math.random() * projects.length)] || { name: "Acme Marketing", branch: "main", domain: "acme.com" };
        const randomCommit = Math.random().toString(36).substring(2, 9);
        
        dispatch(addDeployment({
            project: randomProj.name,
            branch: randomProj.branch,
            commit: randomCommit,
            message: "Triggered from CLI terminal console",
            author: "Jordan Lee",
            authorAvatar: "JL",
            environment: "production",
            url: randomProj.domain,
        }));
        showToast(`Triggered deployment for ${randomProj.name}!`);
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Deployments" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Deployments" description="Real-time build logs, commit updates, and deployment pipelines." actions={
            <button 
                onClick={handleManualDeploy}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
                Trigger deployment
            </button>
        }/>

        <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-1.5">
            <span className="text-[11.5px] text-muted-foreground mr-1.5 uppercase tracking-wider font-semibold">Filters:</span>
            <select 
                value={filterEnv} onChange={(e) => setFilterEnv(e.target.value)}
                className="h-8 rounded border border-border bg-surface px-2.5 text-[11.5px] text-foreground focus:outline-none"
            >
                <option value="all">All environments</option>
                <option value="production">Production only</option>
                <option value="preview">Preview only</option>
            </select>
            <select 
                value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                className="h-8 rounded border border-border bg-surface px-2.5 text-[11.5px] text-foreground focus:outline-none"
            >
                <option value="all">All statuses</option>
                <option value="ready">Ready</option>
                <option value="building">Building</option>
                <option value="error">Error</option>
                <option value="queued">Queued</option>
            </select>
        </div>

        <Panel padded={false}>
            <ul className="divide-y divide-border">
                {filteredDeploys.map((d) => (
                    <li 
                        key={d.id} 
                        onClick={() => setSelectedDpl(d)}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-4 hover:bg-surface-elevated/40 transition-colors cursor-pointer"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                                <Rocket className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-[13.5px] font-semibold text-foreground">{d.project}</span>
                                    <span className="font-mono text-[10.5px] text-muted-foreground">{d.commit}</span>
                                    <span className="rounded border border-border bg-surface px-1.5 py-0.5 text-[9.5px] text-muted-foreground uppercase">{d.environment}</span>
                                </div>
                                <div className="truncate text-[12.5px] text-muted-foreground mt-0.5">{d.message}</div>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3.5">
                            <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
                                <div>{d.branch}</div>
                                <div>{d.createdAt} · {d.duration}</div>
                            </div>
                            <StatusBadge status={d.status}/>
                        </div>
                    </li>
                ))}
            </ul>
        </Panel>
      </PageShell>

      {/* Deployment Detail Overlay Dialog */}
      {selectedDpl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">Build {selectedDpl.id} Logs</h2>
                <p className="text-[11px] text-muted-foreground">{selectedDpl.project} · {selectedDpl.commit}</p>
              </div>
              <button onClick={() => setSelectedDpl(null)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2 text-[12.5px] text-muted-foreground">
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Author:</span>
                  <span className="text-foreground font-medium flex items-center gap-1">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-accent/20 text-[9px] font-semibold text-accent">{selectedDpl.authorAvatar}</span>
                    {selectedDpl.author}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Deployment Link:</span>
                  <a href={`https://${selectedDpl.url}`} target="_blank" className="text-accent hover:underline flex items-center gap-0.5">{selectedDpl.url} <ExternalLink className="h-3 w-3" /></a>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-1.5">
                  <span>Duration:</span>
                  <span className="text-foreground">{selectedDpl.duration}</span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span>Created:</span>
                  <span className="text-foreground">{selectedDpl.createdAt}</span>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-1.5">
                <span className="text-[11px] text-muted-foreground block font-mono">Build Outputs</span>
                <div className="bg-black p-3 rounded text-[10.5px] font-mono text-neutral-300 space-y-0.5 leading-relaxed overflow-x-auto max-h-[140px]">
                    <div>&gt; sharexpress cloud build --production</div>
                    <div>clone repository complete: 100%</div>
                    <div>running static checks: eslint/prettier passed</div>
                    <div>optimizing assets... ready</div>
                    {selectedDpl.status === "error" ? (
                        <div className="text-white font-bold">&gt; ERR_BUILD_FAILED: process exited with code 1</div>
                    ) : (
                        <div className="text-foreground">&gt; build complete. ready for delivery</div>
                    )}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button onClick={() => setSelectedDpl(null)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Close</button>
                {selectedDpl.status === "ready" && (
                    <button 
                        onClick={() => handleRollback(selectedDpl)}
                        className="h-9 px-4 rounded bg-blue-600 text-[12.5px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer"
                    >
                        Rollback
                    </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>);
}
