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

import { AppSidebar } from "./sidebar";
import { History } from "lucide-react";
import { SharexpressLogo } from "./logo";

export function AppShell({ breadcrumbs, title, actions, children }) {
    return (
        <div className="flex h-screen w-full bg-background text-text-primary overflow-hidden font-sans transition-colors">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Pane Container matching Linear's padded rounded-xl card layout */}
            <div className="flex flex-1 flex-col p-2 md:p-2.5 overflow-hidden">
                <div className="flex flex-1 flex-col rounded-xl border border-border bg-card overflow-hidden relative shadow-sm transition-colors">
                    
                    {/* Header inside the rounded container */}
                    <div className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4 bg-card">
                        <div className="min-w-0 flex-1">
                            {breadcrumbs && breadcrumbs.length > 0 ? (
                                <nav className="flex items-center gap-1.5 text-[12px] font-medium text-text-muted">
                                    {breadcrumbs.map((b, i) => (
                                        <span key={i} className="flex items-center gap-1.5">
                                            {i > 0 && <span className="text-text-muted/40">/</span>}
                                            <span className={i === breadcrumbs.length - 1 ? "text-text-primary font-semibold" : "hover:text-text-primary cursor-pointer transition-colors"}>{b.label}</span>
                                        </span>
                                    ))}
                                </nav>
                            ) : title ? (
                                <h1 className="truncate text-[13px] font-semibold text-text-primary">{title}</h1>
                            ) : null}
                        </div>

                        {/* Top bar right actions */}
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    </div>

                    {/* Content Area inside rounded container */}
                    <div className="flex-1 overflow-y-auto p-5 bg-card">
                        {children}
                    </div>

                    {/* Bottom Ask Sharexpress AI floating bar matching Linear screenshot */}
                    <div className="absolute bottom-3 right-4 z-40 flex items-center gap-2 bg-card/90 backdrop-blur border border-border px-3.5 py-1.5 rounded-full text-[11.5px] text-text-secondary hover:text-text-primary transition-all shadow-md hover:border-border-strong cursor-pointer select-none">
                        <SharexpressLogo className="h-3.5 w-3.5" />
                        <span className="font-medium">Ask Sharexpress AI</span>
                        <span className="text-text-muted/40">|</span>
                        <History className="h-3.5 w-3.5 text-text-muted hover:text-text-primary transition-colors" />
                    </div>

                </div>
            </div>
        </div>
    );
}
