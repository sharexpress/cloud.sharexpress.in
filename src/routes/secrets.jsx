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
import { Eye, EyeOff, KeyRound, Trash2, X, Check, Plus } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSecret, deleteSecret } from "../store/index.js";

export const Route = createFileRoute("/secrets")({
    head: () => ({ meta: [{ title: "Secrets — Sharexpress Cloud" }] }),
    component: SecretsPage,
});

function SecretsPage() {
    const dispatch = useDispatch();
    const secrets = useSelector((state) => state.secrets.list);
    const projects = useSelector((state) => state.projects.list);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [reveal, setReveal] = useState({});

    // Form inputs
    const [key, setKey] = useState("");
    const [value, setValue] = useState("");
    const [scope, setScope] = useState("All projects");
    const [env, setEnv] = useState("production");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!key.trim() || !value.trim()) return;

        dispatch(addSecret({
            key: key.trim().toUpperCase(),
            value: value.trim(),
            scope,
            environment: env,
        }));

        setKey("");
        setValue("");
        setIsCreateOpen(false);
        showToast("Encrypted secret registered successfully.");
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this secret key?")) {
            dispatch(deleteSecret(id));
            showToast("Secret deleted.");
        }
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Secrets" }]}>
      <PageShell>
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Secrets" description="Encrypted environment variables shared across projects." actions={<>
              <button onClick={() => showToast("Parsing configurations...")} className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong cursor-pointer transition-colors">Import</button>
              <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
              >
                  New secret
              </button>
            </>}/>

        {secrets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <KeyRound className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No Secrets</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Add encrypted key-value credentials safely injected into your edge containers.</p>
          </div>
        ) : (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {secrets.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-elevated/10 transition-colors">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                      <KeyRound className="h-3.5 w-3.5"/>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-mono text-[12.5px] font-semibold text-foreground">{s.key}</div>
                      <div className="truncate text-[11px] text-muted-foreground truncate max-w-lg mt-0.5">
                        {reveal[s.id] ? (s.value || "sk_live_stripe_default_key") : "•••••••••••••••••••••••••"}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">{s.scope}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[10.5px] text-muted-foreground uppercase">{s.environment}</span>
                    <button 
                        onClick={() => setReveal(prev => ({...prev, [s.id]: !prev[s.id]}))}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    >
                        {reveal[s.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5"/>}
                    </button>
                    <button 
                        onClick={() => handleDelete(s.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Create New Secret Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Create Encrypted Secret</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Secret Key (Capital letters & underscores)</label>
                <input 
                  type="text" required placeholder="STRIPE_API_KEY" value={key} onChange={(e) => setKey(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[11.5px] text-muted-foreground">Secret Value</label>
                <input 
                  type="password" required placeholder="•••••••••••••••••" value={value} onChange={(e) => setValue(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Scope Project</label>
                  <select 
                    value={scope} onChange={(e) => setScope(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="All projects">All projects</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Environment</label>
                  <select 
                    value={env} onChange={(e) => setEnv(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="production">Production</option>
                    <option value="preview">Preview</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Register Secret</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
