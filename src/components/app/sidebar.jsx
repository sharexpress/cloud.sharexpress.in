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

import { Link, useRouterState } from "@tanstack/react-router";
import { 
  LayoutDashboard, FolderGit2, Rocket, Cpu, Database, HardDrive, Zap, Globe, KeyRound, Network, 
  Activity, ScrollText, Receipt, Users, Terminal, BookOpen, Settings, 
  Search, SquarePen, ChevronDown, HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
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

function Section({ label, items }) {
    const path = useRouterState({ select: (s) => s.location.pathname });
    return (<div className="px-2">
      {label && (<div className="px-3 pb-1 pt-3 text-[9.5px] font-semibold uppercase tracking-wider text-neutral-600">
          {label}
        </div>)}
      <ul className="space-y-0.5">
        {items.map((it) => {
            const Icon = it.icon;
            const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
            return (<li key={it.to}>
              <Link to={it.to} className={cn("group flex items-center gap-2 rounded px-2.5 py-1 text-[12.5px] transition-colors", active
                    ? "bg-white/5 text-white font-medium"
                    : "text-neutral-450 hover:bg-white/5 hover:text-white")}>
                <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-white" : "text-neutral-500 group-hover:text-white")}/>
                <span className="truncate">{it.label}</span>
              </Link>
            </li>);
        })}
      </ul>
    </div>);
}

export function AppSidebar() {
    return (<aside className="hidden md:flex h-screen w-[220px] shrink-0 flex-col bg-[#000000] border-r border-white/[0.06]">
      
      {/* Top Workspace block */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          {/* Nimbus triangle logo */}
          <div className="grid h-[18px] w-[18px] place-items-center rounded bg-[#5e6ad2] shadow-sm">
            <svg viewBox="0 0 100 100" className="h-[10px] w-[10px] text-white fill-current">
              <polygon points="50,15 90,85 10,85" />
            </svg>
          </div>
          <div className="min-w-0 flex items-center gap-1 cursor-pointer group">
            <span className="truncate text-[12.5px] font-semibold text-white">Nimbus</span>
            <ChevronDown className="h-3 w-3 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-neutral-500">
          <button className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors cursor-pointer">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 hover:text-white hover:bg-white/[0.06] rounded transition-colors cursor-pointer">
            <SquarePen className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.06]"/>

      <nav className="flex-1 overflow-y-auto py-2 space-y-2">
        <Section items={primary}/>
        <Section label="Workspace" items={infra}/>
        <Section label="Observability" items={observe}/>
        <Section label="Account" items={account}/>
      </nav>

      {/* Sidebar bottom question icon */}
      <div className="mt-auto border-t border-white/[0.06] p-2 px-4 flex items-center justify-between text-neutral-600">
        <button className="hover:text-white transition-colors cursor-pointer">
          <HelpCircle className="h-4 w-4" />
        </button>
        <span className="text-[10px] font-mono text-neutral-700">v2.4</span>
      </div>
    </aside>);
}
