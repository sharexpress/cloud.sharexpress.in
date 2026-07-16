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
import { MoreHorizontal, UserPlus, X, Check, Users, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { inviteMember, cancelInvite, updateRole, removeMember } from "../store/index.js";

export const Route = createFileRoute("/team")({
    head: () => ({ meta: [{ title: "Team — Nimbus" }] }),
    component: TeamPage,
});

function TeamPage() {
    const dispatch = useDispatch();
    const members = useSelector((state) => state.team.members);
    const invitations = useSelector((state) => state.team.invitations);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Developer");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleInvite = (e) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        dispatch(inviteMember({
            email: inviteEmail.trim().toLowerCase(),
            role: inviteRole,
        }));
        
        setInviteEmail("");
        setIsCreateOpen(false);
        showToast(`Invitation sent to ${inviteEmail}.`);
    };

    const handleCancel = (id, email) => {
        if (confirm(`Revoke invitation for ${email}?`)) {
            dispatch(cancelInvite(id));
            showToast("Invitation revoked.");
        }
    };

    const handleRemoveMember = (id, name) => {
        if (id === "u_1") {
            showToast("Error: Cannot remove the organization Owner.");
            return;
        }
        if (confirm(`Are you sure you want to remove ${name} from this organization?`)) {
            dispatch(removeMember(id));
            showToast("Team member removed.");
        }
    };

    const handleRoleUpdate = (id, roleName) => {
        dispatch(updateRole({ id, role: roleName }));
        showToast(`Role updated successfully.`);
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Team" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Team" description="Members, invitations, and role-based permissions." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5"/> Invite member
            </button>
        }/>

        <Panel title="Members" description={`${members.length} members`} padded={false}>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-surface-elevated/10 transition-colors">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">{m.initials}</div>
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-foreground">{m.name}</div>
                    <div className="truncate text-[11.5px] text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                
                {m.id === "u_1" ? (
                    <span className="rounded-md border border-border bg-background px-2.5 py-0.5 text-[11px] text-muted-foreground font-semibold uppercase">{m.role}</span>
                ) : (
                    <select 
                        value={m.role} onChange={(e) => handleRoleUpdate(m.id, e.target.value)}
                        className="h-8 rounded border border-border bg-surface px-2.5 text-[11px] text-foreground focus:outline-none"
                    >
                        <option>Admin</option>
                        <option>Developer</option>
                        <option>Billing</option>
                        <option>Viewer</option>
                    </select>
                )}
                
                <span className="hidden md:inline text-[11.5px] text-muted-foreground">Active {m.lastActive}</span>
                <button 
                    onClick={() => handleRemoveMember(m.id, m.name)}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface hover:text-destructive transition-colors cursor-pointer"
                    title="Remove member"
                >
                    <X className="h-4 w-4"/>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        {invitations.length > 0 && (
          <Panel title="Pending invitations" className="mt-6" padded={false}>
            <ul className="divide-y divide-border animate-in fade-in">
              {invitations.map((inv) => (
                <li key={inv.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3 hover:bg-surface-elevated/10 transition-colors">
                  <div className="truncate text-[13px] font-medium text-foreground">{inv.email}</div>
                  <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground uppercase">{inv.role}</span>
                  <span className="text-[11px] text-muted-foreground">sent {inv.sent}</span>
                  <button 
                      onClick={() => handleCancel(inv.id, inv.email)}
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface hover:text-destructive cursor-pointer transition-colors"
                      title="Revoke invitation"
                  >
                      <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Invite Member Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Invite Team Member</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Work Email Address</label>
                <input 
                  type="email" required placeholder="collaborator@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11.5px] text-muted-foreground">Organization Role</label>
                <select 
                  value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="Admin">Admin (Full Control)</option>
                  <option value="Developer">Developer (Read/Write Code & Infra)</option>
                  <option value="Billing">Billing (View & Pay Invoices)</option>
                  <option value="Viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Send Invitation</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
