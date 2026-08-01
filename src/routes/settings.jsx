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

import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme, updateNotifications } from "../store/index.js";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/settings")({
    head: () => ({ meta: [{ title: "Settings — Sharexpress Cloud" }] }),
    component: SettingsPage,
});

const TABS = ["General", "Security", "Notifications", "Account", "Appearance", "Danger zone"];

function SettingsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const settingsState = useSelector((state) => state.settings);
    const authState = useSelector((state) => state.auth);

    const [tab, setTab] = useState("General");
    const [wName, setWName] = useState("Acme Inc");
    const [wSlug, setWSlug] = useState("acme");
    const [wEmail, setWEmail] = useState("support@acme.com");
    
    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleSaveGeneral = (e) => {
        e.preventDefault();
        showToast("General workspace configurations saved successfully.");
    };

    const handleToggleNotification = (key, val) => {
        dispatch(updateNotifications({ [key]: !val }));
        showToast("Notification rules updated.");
    };

    const handleDeleteWorkspace = () => {
        if (confirm("WARNING: Are you sure you want to permanently delete the Acme Inc workspace? All running containers, clusters, and buckets will be terminated immediately. This action cannot be undone.")) {
            showToast("Workspace queue marked for deletion. Redirecting...");
            setTimeout(() => {
                window.location.href = "/register";
            }, 1500);
        }
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Settings" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Settings" description="Workspace, notification, and profile security preferences."/>

        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (<button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-[12.5px] transition-colors cursor-pointer ${tab === t ? "bg-surface text-foreground font-medium" : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"}`}>
                {t}
              </button>))}
          </nav>

          <div className="space-y-4">
            {tab === "General" && (<>
                <form onSubmit={handleSaveGeneral}>
                    <Panel title="Workspace" actions={
                        <button type="submit" className="h-7 rounded bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer">Save</button>
                    }>
                      <div className="space-y-4 max-w-md">
                        <div>
                            <label className="text-[11.5px] text-muted-foreground block">Name</label>
                            <input value={wName} onChange={(e) => setWName(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"/>
                        </div>
                        <div>
                            <label className="text-[11.5px] text-muted-foreground block">Slug</label>
                            <input value={wSlug} onChange={(e) => setWSlug(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"/>
                        </div>
                        <div>
                            <label className="text-[11.5px] text-muted-foreground block">Support email</label>
                            <input value={wEmail} onChange={(e) => setWEmail(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"/>
                        </div>
                      </div>
                    </Panel>
                </form>
                
                <Panel title="Default region">
                  <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground">
                    <option>US East · Ashburn (iad1)</option>
                    <option>US West · San Francisco (sfo1)</option>
                    <option>EU · Frankfurt (fra1)</option>
                  </select>
                </Panel>
              </>)}

            {tab === "Security" && (<Panel title="Authentication">
                <ToggleRow label="Require two-factor authentication" description="All members must set up 2FA to access this workspace." on={true} onChange={() => showToast("Two-factor authentication requirement enforced.")}/>
                <ToggleRow label="Single sign-on (SSO)" description="Connect your identity provider via SAML 2.0." on={false} onChange={() => showToast("SSO configuration dialog enabled.")}/>
                <ToggleRow label="IP allowlist" description="Restrict dashboard access to trusted IP ranges." on={false} onChange={() => showToast("IP allowlist rules updated.")}/>
              </Panel>)}

            {tab === "Notifications" && (<Panel title="Email notifications">
                <ToggleRow 
                    label="Deployment failures" 
                    on={settingsState.notifications.emailAlerts} 
                    onChange={() => handleToggleNotification("emailAlerts", settingsState.notifications.emailAlerts)}
                />
                <ToggleRow 
                    label="Security alerts" 
                    on={settingsState.notifications.securityAlerts} 
                    onChange={() => handleToggleNotification("securityAlerts", settingsState.notifications.securityAlerts)}
                />
                <ToggleRow 
                    label="Billing updates" 
                    on={settingsState.notifications.billingAlerts} 
                    onChange={() => handleToggleNotification("billingAlerts", settingsState.notifications.billingAlerts)}
                />
              </Panel>)}

            {tab === "Account" && (<Panel title="Profile" actions={
                <button onClick={() => showToast("User profile saved.")} className="h-7 rounded bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer">Save</button>
            }>
                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="text-[11.5px] text-muted-foreground block">Name</label>
                        <input defaultValue={authState.user?.name || "Jordan Lee"} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"/>
                    </div>
                    <div>
                        <label className="text-[11.5px] text-muted-foreground block">Email</label>
                        <input defaultValue={authState.user?.email || "jordan@acme.com"} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"/>
                    </div>
                </div>
              </Panel>)}

            {tab === "Appearance" && (<Panel title="Appearance">
                <p className="text-[13px] text-muted-foreground">Sharexpress Cloud is optimized for a focused, high-contrast workspace inspired by assets.sharexpress.in. Select active visual theme:</p>
                <div className="mt-4 flex gap-4">
                    <button 
                        onClick={() => dispatch(toggleTheme())}
                        className={`border rounded-lg p-4 flex-1 text-center cursor-pointer transition-colors ${settingsState.appearance.theme === "dark" ? "border-accent bg-accent/5" : "border-border bg-background hover:border-border-strong"}`}
                    >
                        <div className="h-24 bg-black border border-border rounded mb-3 flex items-center justify-center font-mono text-[10px] text-muted-foreground">Dark Control Plane</div>
                        <span className="text-[12.5px] font-semibold text-foreground">Dark (Default)</span>
                    </button>
                    <button 
                        onClick={() => dispatch(toggleTheme())}
                        className={`border rounded-lg p-4 flex-1 text-center cursor-pointer transition-colors ${settingsState.appearance.theme === "light" ? "border-accent bg-accent/5" : "border-border bg-background hover:border-border-strong"}`}
                    >
                        <div className="h-24 bg-slate-100 border border-border rounded mb-3 flex items-center justify-center font-mono text-[10px] text-slate-500">Light Control Plane</div>
                        <span className="text-[12.5px] font-semibold text-foreground">Light (Experimental)</span>
                    </button>
                </div>
              </Panel>)}

            {tab === "Danger zone" && (<Panel title="Danger zone" className="border-destructive/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">Delete workspace</div>
                    <div className="text-[12px] text-muted-foreground">Permanently remove Acme Inc and all associated compute clusters, containers, database instances, and backups.</div>
                  </div>
                  <button 
                    onClick={handleDeleteWorkspace}
                    className="h-8 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive hover:bg-destructive/15 cursor-pointer shrink-0 transition-colors"
                  >
                      Delete Workspace
                  </button>
                </div>
              </Panel>)}
          </div>
        </div>
      </PageShell>
    </AppShell>);
}

function ToggleRow({ label, description, on, onChange }) {
    const [checked, setChecked] = useState(!!on);
    
    const handleToggle = () => {
        setChecked(!checked);
        if (onChange) onChange();
    };

    return (<div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <div className="text-[13px] text-foreground">{label}</div>
        {description && <div className="text-[11.5px] text-muted-foreground">{description}</div>}
      </div>
      <button onClick={handleToggle} className={`relative h-5 w-9 shrink-0 rounded-full transition-colors cursor-pointer ${checked ? "bg-accent" : "bg-muted"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${checked ? "left-[18px]" : "left-0.5"}`}/>
      </button>
    </div>);
}
