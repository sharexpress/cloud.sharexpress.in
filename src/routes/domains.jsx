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
import { Globe, ShieldCheck, X, Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDomain, verifyDomain, deleteDomain } from "../store/index.js";

export const Route = createFileRoute("/domains")({
    head: () => ({ meta: [{ title: "Domains — Nimbus" }] }),
    component: DomainsPage,
});

function DomainsPage() {
    const dispatch = useDispatch();
    const domains = useSelector((state) => state.domains.list);
    const projects = useSelector((state) => state.projects.list);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [host, setHost] = useState("");
    const [selectedProject, setSelectedProject] = useState(projects[0]?.name || "Acme Marketing");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!host.trim()) return;

        dispatch(addDomain({
            host: host.trim(),
            project: selectedProject,
        }));
        setHost("");
        setIsCreateOpen(false);
        showToast("Domain configuration added.");
    };

    const handleVerify = (id, domainName) => {
        dispatch(verifyDomain(id));
        showToast(`Domain ${domainName} is active and SSL verified!`);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to remove this domain?")) {
            dispatch(deleteDomain(id));
            showToast("Domain removed.");
        }
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Domains" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Domains" description="DNS, TLS certificates, and redirects — managed for you." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
                Add domain
            </button>
        }/>

        {domains.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <Globe className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No Domains</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Add domain aliases to direct traffic to your serverless compute and containers.</p>
          </div>
        ) : (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {domains.map((d) => (
                <li key={d.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 hover:bg-surface-elevated/10 transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                      <Globe className="h-4 w-4"/>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-semibold text-foreground">{d.host}</div>
                      <div className="truncate text-[11.5px] text-muted-foreground">{d.project} · CNAME to edge.nimbus-cloud.app</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10.5px] text-muted-foreground font-mono">
                      <ShieldCheck className="h-3 w-3 text-success"/> SSL {d.ssl}
                    </span>
                    <span className="hidden md:inline text-[11px] text-muted-foreground">Expires {d.expires}</span>
                    <StatusBadge status={d.status}/>
                    
                    {d.status === "pending" && (
                        <button 
                            onClick={() => handleVerify(d.id, d.host)}
                            className="h-7 rounded border border-accent bg-accent/15 px-2.5 text-[11px] font-medium text-accent hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                        >
                            Verify
                        </button>
                    )}
                    <button 
                        onClick={() => handleDelete(d.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Add Custom Domain Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Add Custom Domain</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Domain Name</label>
                <input 
                  type="text" required placeholder="www.example.com" value={host} onChange={(e) => setHost(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11.5px] text-muted-foreground">Assign Project</label>
                <select 
                  value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                >
                  {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Configure Domain</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
