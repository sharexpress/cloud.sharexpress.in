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

export function AppShell({ breadcrumbs, title, actions, children }) {
    return (
        <div className="flex h-screen w-full bg-[#000000] text-foreground overflow-hidden font-sans">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Pane Container */}
            <div className="flex flex-1 flex-col p-2.5 md:p-3 overflow-hidden">
                <div className="flex flex-1 flex-col rounded-lg border border-white/[0.06] bg-[#0a0a0c] overflow-hidden relative">
                    
                    {/* Header inside the rounded container */}
                    <div className="flex h-11 shrink-0 items-center justify-between border-b border-white/[0.06] px-4 bg-[#0a0a0c]/80">
                        <div className="min-w-0 flex-1">
                            {breadcrumbs && breadcrumbs.length > 0 ? (
                                <nav className="flex items-center gap-1 text-[12.5px] font-semibold text-neutral-400">
                                    {breadcrumbs.map((b, i) => (
                                        <span key={i} className="flex items-center gap-1">
                                            {i > 0 && <span className="text-neutral-700">/</span>}
                                            <span className={i === breadcrumbs.length - 1 ? "text-white" : "hover:text-neutral-200 cursor-pointer"}>{b.label}</span>
                                        </span>
                                    ))}
                                </nav>
                            ) : title ? (
                                <h1 className="truncate text-[13.5px] font-bold text-white">{title}</h1>
                            ) : null}
                        </div>

                        {/* Top bar right actions matching Linear */}
                        <div className="flex items-center gap-2">
                            {actions}
                        </div>
                    </div>

                    {/* Content Area inside rounded container */}
                    <div className="flex-1 overflow-y-auto p-5">
                        {children}
                    </div>

                    {/* Bottom ask-bar similar to "Ask Linear" */}
                    <div className="absolute bottom-3 right-4 z-40 flex items-center gap-2.5 bg-black/60 backdrop-blur border border-white/[0.06] px-3 py-1.5 rounded-full text-[11px] text-neutral-500 hover:text-white transition-all shadow-lg hover:border-white/[0.1] cursor-pointer select-none">
                        <svg viewBox="0 0 100 100" className="h-3 w-3 fill-current text-accent">
                            <polygon points="50,15 90,85 10,85" />
                        </svg>
                        <span>Ask Nimbus</span>
                        <span className="text-neutral-700">|</span>
                        <History className="h-3.5 w-3.5 text-neutral-500" />
                    </div>

                </div>
            </div>
        </div>
    );
}
