import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Nimbus" }] }),
  component: SettingsPage,
});

const TABS = ["General", "Security", "Notifications", "Account", "Appearance", "Danger zone"] as const;

function SettingsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("General");
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Settings" }]}>
      <PageShell>
        <PageHeader title="Settings" description="Workspace and account preferences." />

        <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <nav className="flex flex-row gap-1 overflow-x-auto lg:flex-col">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-left text-[12.5px] transition-colors ${
                  tab === t ? "bg-surface text-foreground" : "text-muted-foreground hover:bg-surface/60 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </nav>

          <div className="space-y-4">
            {tab === "General" && (
              <>
                <Panel title="Workspace">
                  <div className="space-y-4">
                    <Field label="Name" defaultValue="Acme Inc" />
                    <Field label="Slug" defaultValue="acme" />
                    <Field label="Support email" defaultValue="support@acme.com" />
                  </div>
                </Panel>
                <Panel title="Default region">
                  <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground">
                    <option>US East · Ashburn (iad1)</option>
                    <option>US West · San Francisco (sfo1)</option>
                    <option>EU · Frankfurt (fra1)</option>
                  </select>
                </Panel>
              </>
            )}
            {tab === "Security" && (
              <Panel title="Authentication">
                <ToggleRow label="Require two-factor authentication" description="All members must set up 2FA to access this workspace." on />
                <ToggleRow label="Single sign-on (SSO)" description="Connect your identity provider via SAML 2.0." />
                <ToggleRow label="IP allowlist" description="Restrict dashboard access to trusted IP ranges." />
              </Panel>
            )}
            {tab === "Notifications" && (
              <Panel title="Email notifications">
                <ToggleRow label="Deployment failures" on />
                <ToggleRow label="Security alerts" on />
                <ToggleRow label="Billing updates" on />
                <ToggleRow label="Weekly digest" />
              </Panel>
            )}
            {tab === "Account" && (
              <Panel title="Profile">
                <Field label="Name" defaultValue="Jordan Lee" />
                <Field label="Email" defaultValue="jordan@acme.com" />
              </Panel>
            )}
            {tab === "Appearance" && (
              <Panel title="Appearance">
                <p className="text-[13px] text-muted-foreground">Nimbus is optimized for a dark, focused workspace. A light theme is available for individual accounts.</p>
              </Panel>
            )}
            {tab === "Danger zone" && (
              <Panel title="Danger zone" className="border-destructive/30">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] font-medium text-foreground">Delete workspace</div>
                    <div className="text-[12px] text-muted-foreground">Permanently remove Acme Inc and all associated data.</div>
                  </div>
                  <button className="h-8 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive hover:bg-destructive/15">Delete</button>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </PageShell>
    </AppShell>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-[11.5px] text-muted-foreground">{label}</label>
      <input defaultValue={defaultValue} className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none" />
    </div>
  );
}

function ToggleRow({ label, description, on }: { label: string; description?: string; on?: boolean }) {
  const [checked, setChecked] = useState(!!on);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0 last:pb-0 first:pt-0">
      <div className="min-w-0">
        <div className="text-[13px] text-foreground">{label}</div>
        {description && <div className="text-[11.5px] text-muted-foreground">{description}</div>}
      </div>
      <button
        onClick={() => setChecked((c) => !c)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
