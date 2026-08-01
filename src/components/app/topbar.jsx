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

import { Search, Bell, Command, Plus, HelpCircle } from "lucide-react";
export function Topbar({ title, breadcrumbs, actions }) {
    return (<header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 ? (<nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            {breadcrumbs.map((b, i) => (<span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/40">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-foreground" : ""}>{b.label}</span>
              </span>))}
          </nav>) : title ? (<h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>) : null}
      </div>

      <button className="hidden md:flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
        <Search className="h-3.5 w-3.5"/>
        <span>Search…</span>
        <kbd className="ml-6 flex items-center gap-0.5 rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
          <Command className="h-2.5 w-2.5"/> K
        </kbd>
      </button>

      {actions}

      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <HelpCircle className="h-4 w-4"/>
      </button>
      <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <Bell className="h-4 w-4"/>
      </button>
      <button className="flex h-8 items-center gap-1.5 rounded-md bg-[#5F6AD2] px-3 text-[12px] font-medium text-white shadow-sm transition-all hover:bg-[#4F5ABF] cursor-pointer">
        <Plus className="h-3.5 w-3.5"/> New
      </button>
    </header>);
}
