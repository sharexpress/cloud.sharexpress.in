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

import { Search, Bell, Command, Plus, HelpCircle, Globe, Cpu, Lock, Terminal, Clock, Database, Layers, HardDrive, FolderPlus, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";

export function Topbar({ title, breadcrumbs, actions }) {
    const [isNewOpen, setIsNewOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsNewOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const newMenuItems = [
        { label: "Static Site", desc: "Fast frontend sites from Git", icon: Globe, href: "/projects/new?type=static" },
        { label: "Web Service", desc: "Fullstack apps & APIs", icon: Cpu, href: "/projects/new?type=web_service" },
        { label: "Private Service", desc: "Internal isolated microservices", icon: Lock, href: "/projects/new?type=private" },
        { label: "Background Worker", desc: "Async task & queue processors", icon: Terminal, href: "/projects/new?type=worker" },
        { label: "Cron Job", desc: "Scheduled periodic tasks", icon: Clock, href: "/projects/new?type=cron" },
        { divider: true },
        { label: "Postgres Database", desc: "Managed relational DB", icon: Database, href: "/databases?create=true" },
        { label: "Key Value (Redis)", desc: "In-memory cache & store", icon: Layers, href: "/databases?create=true&type=redis" },
        { label: "Storage Bucket", desc: "S3 compatible object storage", icon: HardDrive, href: "/storage?create=true" },
        { divider: true },
        { label: "Project", desc: "Group related services & DBs", icon: FolderPlus, href: "/projects?create=true" },
    ];

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
            <div className="min-w-0 flex-1">
                {breadcrumbs && breadcrumbs.length > 0 ? (
                    <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                        {breadcrumbs.map((b, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                {i > 0 && <span className="text-muted-foreground/40">/</span>}
                                <span className={i === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>{b.label}</span>
                            </span>
                        ))}
                    </nav>
                ) : title ? (
                    <h1 className="truncate text-[15px] font-semibold text-foreground">{title}</h1>
                ) : null}
            </div>

            <button className="hidden md:flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground">
                <Search className="h-3.5 w-3.5" />
                <span>Search…</span>
                <kbd className="ml-6 flex items-center gap-0.5 rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px]">
                    <Command className="h-2.5 w-2.5" /> K
                </kbd>
            </button>

            {actions}

            <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer">
                <HelpCircle className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground cursor-pointer">
                <Bell className="h-4 w-4" />
            </button>

            {/* + New Dropdown Menu */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setIsNewOpen(!isNewOpen)}
                    className="flex h-8 items-center gap-1.5 rounded-md bg-[#5F6AD2] px-3 text-[12px] font-medium text-white shadow-sm transition-all hover:bg-[#4F5ABF] cursor-pointer"
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>New</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isNewOpen ? "rotate-180" : ""}`} />
                </button>

                {isNewOpen && (
                    <div className="absolute right-0 top-10 z-50 w-64 rounded-lg border border-border bg-surface shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-150">
                        {newMenuItems.map((item, index) => {
                            if (item.divider) {
                                return <div key={index} className="my-1 border-t border-border/50" />;
                            }
                            const IconComponent = item.icon;
                            return (
                                <Link
                                    key={item.label}
                                    to={item.href}
                                    onClick={() => setIsNewOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-left hover:bg-surface-elevated transition-colors group"
                                >
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground group-hover:border-[#5F6AD2]/50 group-hover:text-[#5F6AD2] transition-colors">
                                        <IconComponent className="h-3.5 w-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-[12.5px] font-medium text-foreground group-hover:text-[#5F6AD2] transition-colors">
                                            {item.label}
                                        </div>
                                        <div className="truncate text-[10.5px] text-muted-foreground">
                                            {item.desc}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </header>
    );
}
