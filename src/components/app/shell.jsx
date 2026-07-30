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
import { History, ChevronDown, Check } from "lucide-react";
import { SharexpressLogo } from "./logo";
import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

function BreadcrumbDropdown({ item, isLast }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        function handleClick(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const hasOptions = item.options && item.options.length > 0;

    return (
        <div className="relative inline-flex items-center" ref={ref}>
            {item.to ? (
                <div className="inline-flex items-center gap-0.5">
                    <Link
                        to={item.to}
                        params={item.params}
                        search={item.search}
                        className={cn(
                            "flex items-center gap-1 transition-colors rounded px-1.5 py-0.5 -mx-1 hover:bg-surface/80 cursor-pointer",
                            isLast ? "text-text-primary font-semibold" : "text-text-muted hover:text-text-primary"
                        )}
                    >
                        <span>{item.label}</span>
                    </Link>

                    {hasOptions && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpen((v) => !v);
                            }}
                            className="p-0.5 hover:text-text-primary text-text-muted/60 transition-colors cursor-pointer"
                        >
                            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
                        </button>
                    )}
                </div>
            ) : hasOptions ? (
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        "flex items-center gap-1 transition-colors rounded px-1.5 py-0.5 -mx-1 hover:bg-surface/80 cursor-pointer",
                        isLast ? "text-text-primary font-semibold" : "text-text-muted hover:text-text-primary"
                    )}
                >
                    <span>{item.label}</span>
                    <ChevronDown className={cn("h-3 w-3 text-text-muted/60 transition-transform", open && "rotate-180")} />
                </button>
            ) : (
                <span className={isLast ? "text-text-primary font-semibold" : "text-text-muted"}>
                    {item.label}
                </span>
            )}

            {/* Interactive Dropdown Menu */}
            {open && hasOptions && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[160px] max-w-[220px] rounded-xl border border-border bg-card/95 backdrop-blur-md p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-150 font-mono text-[11.5px]">
                    <div className="max-h-56 overflow-y-auto space-y-0.5">
                        {item.options.map((opt, idx) => {
                            const isSelected = opt.label === item.label;
                            return (
                                <Link
                                    key={idx}
                                    to={opt.to}
                                    params={opt.params}
                                    search={opt.search}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer",
                                        isSelected
                                            ? "bg-surface text-text-primary font-bold border border-border/60"
                                            : "text-text-muted hover:bg-surface/50 hover:text-text-primary border border-transparent"
                                    )}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {isSelected && <Check className="h-3 w-3 text-accent-purple shrink-0 ml-2" />}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

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
                                            {i > 0 && <span className="text-text-muted/40 font-mono text-[11px]">/</span>}
                                            <BreadcrumbDropdown item={b} isLast={i === breadcrumbs.length - 1} />
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

                    {/* Bottom Ask Sharexpress AI floating bar */}
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
