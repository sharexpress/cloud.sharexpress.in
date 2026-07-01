import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderGit2, Rocket, Cpu, Database, HardDrive, Zap,
  Globe, KeyRound, Network, Activity, ScrollText, Receipt, Users,
  Terminal, BookOpen, Settings, Cloud, ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/deployments", label: "Deployments", icon: Rocket },
];

const infra = [
  { to: "/compute", label: "Compute", icon: Cpu },
  { to: "/databases", label: "Databases", icon: Database },
  { to: "/storage", label: "Storage", icon: HardDrive },
  { to: "/functions", label: "Functions", icon: Zap },
  { to: "/domains", label: "Domains", icon: Globe },
  { to: "/secrets", label: "Secrets", icon: KeyRound },
  { to: "/networking", label: "Networking", icon: Network },
];

const observe = [
  { to: "/monitoring", label: "Monitoring", icon: Activity },
  { to: "/logs", label: "Logs", icon: ScrollText },
];

const account = [
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/team", label: "Team", icon: Users },
  { to: "/api-keys", label: "API Keys", icon: Terminal },
  { to: "/docs", label: "Documentation", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
];

function Section({ label, items }: { label?: string; items: typeof primary }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="px-3">
      {label && (
        <div className="px-2 pb-1.5 pt-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </div>
      )}
      <ul className="space-y-0.5">
        {items.map((it) => {
          const Icon = it.icon;
          const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={cn(
                  "group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-accent" : "text-muted-foreground group-hover:text-foreground")} />
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden md:flex h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-foreground text-background">
            <Cloud className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-foreground">Acme Inc</div>
            <div className="truncate text-[11px] text-muted-foreground">Enterprise · v2.4</div>
          </div>
        </div>
        <button className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground">
          <ChevronsUpDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mx-3 h-px bg-sidebar-border" />

      <nav className="flex-1 overflow-y-auto py-2">
        <Section items={primary} />
        <Section label="Infrastructure" items={infra} />
        <Section label="Observability" items={observe} />
        <Section label="Account" items={account} />
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2.5 rounded-md p-1.5 hover:bg-sidebar-accent/60">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/20 text-[11px] font-semibold text-accent">
            JL
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-medium text-foreground">Jordan Lee</div>
            <div className="truncate text-[11px] text-muted-foreground">jordan@acme.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
