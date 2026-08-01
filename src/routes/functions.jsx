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
import { Zap, X, Check, Play, Settings2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addFunction, triggerFunction } from "../store/index.js";

export const Route = createFileRoute("/functions")({
    head: () => ({ meta: [{ title: "Functions — Sharexpress Cloud" }] }),
    component: FunctionsPage,
});

function FunctionsPage() {
    const dispatch = useDispatch();
    const functions = useSelector((state) => state.functions.list);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [invokingId, setInvokingId] = useState(null);

    // Form fields
    const [name, setName] = useState("");
    const [runtime, setRuntime] = useState("Node 20");
    const [trigger, setTrigger] = useState("HTTP");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleCreateFunction = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        dispatch(addFunction({
            name: name.trim().toLowerCase().replace(/[^a-z0-9-]/g, ""),
            runtime,
            trigger,
        }));
        setName("");
        setIsCreateOpen(false);
        showToast(`Serverless function "${name}" deployed successfully.`);
    };

    const handleTrigger = (id, fName) => {
        setInvokingId(id);
        setTimeout(() => {
            dispatch(triggerFunction(id));
            setInvokingId(null);
            showToast(`Successfully invoked /${fName} (execution: 18ms, cold start: false)`);
        }, 500);
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Functions" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Serverless functions" description="Event-driven functions with global edge distribution." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
                New function
            </button>
        }/>
        
        {functions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <Zap className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No Functions</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Deploy serverless scripts triggered on-demand by API triggers, scheduler jobs, or storage events.</p>
          </div>
        ) : (
          <Panel padded={false}>
            <div className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_100px] gap-4 border-b border-border px-5 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <div>Name</div><div>Runtime</div><div>Trigger</div><div>Invocations</div><div>Errors</div><div>p95</div><div className="text-right">Action</div>
            </div>
            <ul className="divide-y divide-border">
              {functions.map((f) => (
                <li key={f.id} className="grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr_1fr_1fr_100px] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/40 transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-accent">
                      <Zap className="h-3.5 w-3.5"/>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-foreground">/{f.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">cold start · avg 12ms</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-muted-foreground">{f.runtime}</div>
                  <div className="text-[12px] text-muted-foreground">{f.trigger}</div>
                  <div className="text-[12px] text-foreground font-medium tabular-nums">{f.invocations}</div>
                  <div className="text-[12px] text-foreground font-medium tabular-nums">{f.errors}</div>
                  <div className="text-[12px] text-foreground font-medium tabular-nums">{f.p95}</div>
                  <div className="flex justify-end">
                    <button 
                        disabled={invokingId === f.id}
                        onClick={() => handleTrigger(f.id, f.name)}
                        className="h-7 rounded border border-border bg-background px-2.5 text-[11px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                        <Play className="h-2.5 w-2.5 fill-current" /> {invokingId === f.id ? "Running..." : "Test Run"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* New Function Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Deploy Serverless Function</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFunction} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Endpoint Path (e.g. hello-world)</label>
                <div className="flex mt-1 h-9 rounded-md border border-border bg-background overflow-hidden focus-within:border-accent">
                    <span className="grid place-items-center bg-surface px-2.5 border-r border-border text-[12px] text-muted-foreground font-mono">/api/</span>
                    <input 
                      type="text" required placeholder="send-email" value={name} onChange={(e) => setName(e.target.value)}
                      className="h-full w-full bg-background px-3 text-[13px] text-foreground focus:outline-none"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Runtime</label>
                  <select 
                    value={runtime} onChange={(e) => setRuntime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option>Node 20</option>
                    <option>Rust (wasm)</option>
                    <option>Bun</option>
                    <option>Go</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Trigger Trigger</label>
                  <select 
                    value={trigger} onChange={(e) => setTrigger(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option>HTTP</option>
                    <option>Queue Event</option>
                    <option>S3 Bucket Hook</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-[#5F6AD2] text-[12.5px] font-medium text-white hover:bg-[#4F5ABF] transition-all cursor-pointer">Deploy Function</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
