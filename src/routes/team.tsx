import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { team } from "@/lib/mock";
import { MoreHorizontal, UserPlus } from "lucide-react";

export const Route = createFileRoute("/team")({
  head: () => ({ meta: [{ title: "Team — Nimbus" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Team" }]}>
      <PageShell>
        <PageHeader
          title="Team"
          description="Members, invitations, and role-based permissions."
          actions={
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">
              <UserPlus className="h-3.5 w-3.5" /> Invite member
            </button>
          }
        />

        <Panel title="Members" description={`${team.length} members`} padded={false}>
          <ul className="divide-y divide-border">
            {team.map((m) => (
              <li key={m.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-[11px] font-semibold text-accent">{m.initials}</div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{m.name}</div>
                    <div className="truncate text-[11.5px] text-muted-foreground">{m.email}</div>
                  </div>
                </div>
                <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{m.role}</span>
                <span className="hidden md:inline text-[11px] text-muted-foreground">Active {m.lastActive}</span>
                <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-surface hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Pending invitations" className="mt-6" padded={false}>
          <ul className="divide-y divide-border">
            {[
              { email: "riley@acme.com", role: "Developer", sent: "2h ago" },
              { email: "casey@acme.com", role: "Viewer", sent: "yesterday" },
            ].map((inv) => (
              <li key={inv.email} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-3">
                <div className="truncate text-[13px] text-foreground">{inv.email}</div>
                <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{inv.role}</span>
                <span className="text-[11px] text-muted-foreground">sent {inv.sent}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
