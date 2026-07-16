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

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, ArrowUpRight, Check, Shield, Globe, Zap, Code2, Key, Github, Cpu, Database, HardDrive, Terminal, Rocket, Server } from "lucide-react";

export const Route = createFileRoute("/")(
{
    head: () => ({
        meta: [
            { title: "Nimbus — The platform for modern cloud teams" },
            { name: "description", content: "Purpose-built for deploying, scaling, and securing applications at the edge. Designed for speed." },
        ],
    }),
    component: LandingPage,
});

/* ================================================================
   IntersectionObserver hook for scroll-reveal animations
   ================================================================ */
function useScrollReveal() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
        );

        // Observe the element and all reveal children
        const children = el.querySelectorAll(".reveal, .reveal-scale");
        children.forEach((child) => observer.observe(child));
        if (el.classList.contains("reveal") || el.classList.contains("reveal-scale")) {
            observer.observe(el);
        }

        return () => observer.disconnect();
    }, []);

    return ref;
}

/* ================================================================
   Geometric SVG Icons (Linear-style wireframe)
   ================================================================ */
function GeoPerformance() {
    return (
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.8">
            {/* Stacked layers - like Linear's isometric diagrams */}
            <ellipse cx="60" cy="90" rx="40" ry="12" opacity="0.3" />
            <ellipse cx="60" cy="75" rx="40" ry="12" opacity="0.4" />
            <ellipse cx="60" cy="60" rx="40" ry="12" opacity="0.6" />
            <line x1="20" y1="60" x2="20" y2="90" opacity="0.3" />
            <line x1="100" y1="60" x2="100" y2="90" opacity="0.3" />
            {/* Top hexagon */}
            <polygon points="60,25 80,37 80,57 60,69 40,57 40,37" strokeWidth="0.6" opacity="0.7" />
            <circle cx="60" cy="47" r="8" strokeWidth="0.5" opacity="0.5" />
        </svg>
    );
}

function GeoAgents() {
    return (
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.8">
            {/* Interconnected nodes */}
            <rect x="35" y="30" width="50" height="35" rx="4" opacity="0.5" />
            <rect x="42" y="38" width="36" height="20" rx="2" opacity="0.3" />
            <circle cx="40" cy="90" r="12" opacity="0.4" />
            <circle cx="80" cy="90" r="12" opacity="0.4" />
            <line x1="60" y1="65" x2="40" y2="78" opacity="0.3" />
            <line x1="60" y1="65" x2="80" y2="78" opacity="0.3" />
            <line x1="40" y1="90" x2="80" y2="90" opacity="0.2" strokeDasharray="3 3" />
            {/* Small connection dots */}
            <circle cx="60" cy="65" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="40" cy="78" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="80" cy="78" r="1.5" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

function GeoSpeed() {
    return (
        <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="0.8">
            {/* Horizontal stacked bars - like Linear's register/stack diagrams */}
            <rect x="25" y="30" width="70" height="8" rx="1" opacity="0.6" />
            <rect x="25" y="42" width="70" height="8" rx="1" opacity="0.5" />
            <rect x="25" y="54" width="70" height="8" rx="1" opacity="0.4" />
            <rect x="25" y="66" width="70" height="8" rx="1" opacity="0.3" />
            <rect x="25" y="78" width="70" height="8" rx="1" opacity="0.2" />
            {/* Speed indicator line */}
            <line x1="35" y1="95" x2="85" y2="95" opacity="0.3" />
            <polygon points="85,92 92,95 85,98" fill="currentColor" opacity="0.4" />
        </svg>
    );
}

/* ================================================================
   Product Mockup with Gradient Edge Glow
   ================================================================ */
function ProductMockup({ children, className = "" }) {
    return (
        <div className={`relative ${className}`}>
            {/* Left gradient edge glow */}
            <div className="absolute -left-8 top-1/4 bottom-1/4 w-24 bg-gradient-to-r from-[#5e6ad2]/15 via-[#5e6ad2]/5 to-transparent blur-2xl pointer-events-none" />
            {/* Right gradient edge glow */}
            <div className="absolute -right-8 top-1/4 bottom-1/4 w-24 bg-gradient-to-l from-[#5e6ad2]/15 via-[#5e6ad2]/5 to-transparent blur-2xl pointer-events-none" />
            {/* The mockup container */}
            <div className="relative rounded-lg border border-white/[0.06] bg-[#0c0c10] overflow-hidden shadow-2xl shadow-black/40">
                {children}
            </div>
        </div>
    );
}

/* ================================================================
   Company Logo Marquee
   ================================================================ */
function LogoMarquee() {
    const companies = [
        "Vercel", "Stripe", "OpenAI", "Coinbase", "Figma", "Notion", "Linear", "Supabase",
        "Vercel", "Stripe", "OpenAI", "Coinbase", "Figma", "Notion", "Linear", "Supabase",
    ];

    return (
        <div className="relative overflow-hidden py-8 border-y border-white/[0.04]">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />
            <div
                className="flex items-center gap-16 whitespace-nowrap"
                style={{ animation: "marquee-scroll 30s linear infinite", width: "max-content" }}
            >
                {companies.map((name, i) => (
                    <span key={i} className="text-[14px] font-semibold tracking-wide text-neutral-500 select-none">
                        {name}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ================================================================
   Main Landing Page
   ================================================================ */
function LandingPage() {
    const heroRef = useScrollReveal();
    const philosophyRef = useScrollReveal();
    const section1Ref = useScrollReveal();
    const section2Ref = useScrollReveal();
    const section3Ref = useScrollReveal();
    const benefitsRef = useScrollReveal();
    const ctaRef = useScrollReveal();

    // Code typing effect for the mockup
    const [typedCode, setTypedCode] = useState("");
    const mockCode = `export default async function handler(req) {
  const user = await db.users.find({
    id: req.query.id
  });

  return Response.json({
    status: "active",
    latency: "12ms",
    region: req.headers["x-edge-region"],
    user: user.name
  });
}`;

    const [codeStarted, setCodeStarted] = useState(false);

    useEffect(() => {
        if (!codeStarted) return;
        let i = 0;
        setTypedCode("");
        const interval = setInterval(() => {
            setTypedCode((prev) => prev + mockCode.charAt(i));
            i++;
            if (i >= mockCode.length) clearInterval(interval);
        }, 14);
        return () => clearInterval(interval);
    }, [codeStarted]);

    // Start typing when hero mockup comes into view
    useEffect(() => {
        const timer = setTimeout(() => setCodeStarted(true), 800);
        return () => clearTimeout(timer);
    }, []);

    // Live edge metrics
    const [edgeMetrics, setEdgeMetrics] = useState([
        { region: "us-east-1", city: "Virginia", latency: 11, status: "healthy" },
        { region: "eu-central-1", city: "Frankfurt", latency: 19, status: "healthy" },
        { region: "ap-southeast-1", city: "Singapore", latency: 34, status: "healthy" },
        { region: "ap-northeast-1", city: "Tokyo", latency: 28, status: "healthy" },
        { region: "sa-east-1", city: "São Paulo", latency: 42, status: "healthy" },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setEdgeMetrics(prev => prev.map(m => ({
                ...m,
                latency: Math.max(5, Math.min(80, m.latency + Math.floor((Math.random() - 0.5) * 4))),
            })));
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#000000] text-white font-sans antialiased selection:bg-accent/20 selection:text-white relative overflow-x-hidden">

            {/* Grain texture overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.025]"
                 style={{
                     backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                     backgroundRepeat: "repeat",
                     animation: "grain-shift 8s steps(10) infinite"
                 }}
            />

            {/* ─────────── HEADER ─────────── */}
            <header className="sticky top-0 z-40 bg-[#000000]/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] flex items-center justify-between px-6 h-14">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                        <svg viewBox="0 0 100 100" className="h-[16px] w-[16px] text-white fill-current">
                            <polygon points="50,8 95,88 5,88" />
                        </svg>
                        <span className="text-[14px] font-semibold tracking-tight text-white">Nimbus</span>
                    </div>

                    {/* Nav */}
                    <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors duration-200">Product</a>
                        <Link to="/docs" className="hover:text-white transition-colors duration-200">Resources</Link>
                        <Link to="/billing" className="hover:text-white transition-colors duration-200">Pricing</Link>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors duration-200">Contact</a>
                    </nav>

                    {/* Auth */}
                    <div className="flex items-center gap-1">
                        <Link to="/login" className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-200 px-3 py-1.5">
                            Log in
                        </Link>
                        <span className="text-neutral-700 mx-1 select-none hidden sm:inline">|</span>
                        <Link to="/register" className="text-[13px] font-medium text-white border border-white/10 hover:border-white/20 rounded-md px-3.5 py-1.5 transition-all duration-200 hover:bg-white/5">
                            Sign up
                        </Link>
                    </div>
                </div>
            </header>

            {/* ─────────── HERO ─────────── */}
            <section ref={heroRef} className="mx-auto max-w-[1200px] px-6 pt-24 md:pt-36 pb-4">
                <div className="max-w-[860px]">
                    <h1 className="reveal text-[48px] sm:text-[64px] md:text-[80px] font-medium tracking-[-0.04em] leading-[1.05] text-white">
                        The cloud platform{" "}
                        <span className="text-neutral-500">for modern teams</span>
                    </h1>
                    <p className="reveal delay-100 mt-6 text-[16px] sm:text-[18px] text-neutral-500 leading-[1.65] max-w-[520px]">
                        Purpose-built for deploying and scaling applications at the edge. Designed for the AI era.
                    </p>
                </div>

                {/* Hero Product Mockup */}
                <div className="reveal-scale delay-300 mt-16 md:mt-20">
                    <ProductMockup>
                        {/* Mockup Title Bar */}
                        <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0e] px-4 py-2.5">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <svg viewBox="0 0 100 100" className="h-[12px] w-[12px] text-accent fill-current opacity-70">
                                        <polygon points="50,10 93,85 7,85" />
                                    </svg>
                                    <span className="text-[12px] font-medium text-neutral-300">Nimbus</span>
                                    <span className="text-neutral-700 text-[11px]">›</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                    <span>Faster app launch</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[11px] text-neutral-600 font-mono">
                                <span>02 / 145</span>
                                <span>ENG-2703</span>
                            </div>
                        </div>

                        {/* Mockup Content — Two Panel Layout */}
                        <div className="grid md:grid-cols-[260px_1fr_280px] min-h-[380px]">
                            {/* Left sidebar-like panel */}
                            <div className="hidden md:flex flex-col border-r border-white/[0.06] p-4 text-[12px]">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.04] text-white">
                                        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                        <span className="font-medium">Inbox</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500 hover:text-neutral-300 transition-colors">
                                        <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                                        <span>My issues</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500">
                                        <span className="h-1.5 w-1.5 rounded-full bg-transparent" />
                                        <span>Reviews</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <div className="text-[10px] uppercase tracking-wider text-neutral-600 mb-2 px-2">Workspace</div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500">
                                            <span>Deployments</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500">
                                            <span>Functions</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-2 py-1.5 text-neutral-500">
                                            <span>Edge Network</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Center content */}
                            <div className="p-6 border-r border-white/[0.06]">
                                <h3 className="text-[16px] font-semibold text-white mb-1">Faster app launch</h3>
                                <p className="text-[12.5px] text-neutral-500 leading-relaxed">
                                    Render UI before <code className="px-1.5 py-0.5 bg-white/[0.06] rounded text-[11px] text-neutral-300 font-mono">vehicle_state</code> sync when minimum required state is present, instead of blocking on full refresh during startup.
                                </p>
                                <div className="mt-6 text-[11px] text-neutral-600 font-medium">Activity</div>
                                <div className="mt-3 space-y-3 text-[12px] text-neutral-500">
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-neutral-300 font-medium">karri</span>
                                            <span className="text-neutral-600"> · 4 min ago</span>
                                            <p className="mt-1 text-neutral-500">Right now we show a spinner forever, which makes it look like the car disappeared...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-neutral-300 font-medium">jori</span>
                                            <span className="text-neutral-600"> · just now</span>
                                            <p className="mt-1 text-neutral-500">@Nimbus can you take a stab at this?</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right detail panel */}
                            <div className="hidden md:block p-4 text-[12px] space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                                    <span className="text-neutral-300 font-medium">In Progress</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 0-2 2v1H4.5A1.5 1.5 0 0 0 3 5.5v7A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 4H10V3a2 2 0 0 0-2-2z"/></svg>
                                    <span>High</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <div className="h-4 w-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-600" />
                                    <span className="text-neutral-300">jori</span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-500">
                                    <svg viewBox="0 0 100 100" className="h-3 w-3 fill-current opacity-50">
                                        <polygon points="50,10 93,85 7,85" />
                                    </svg>
                                    <span className="text-neutral-300">Nimbus</span>
                                </div>
                                <div className="mt-4 border-t border-white/[0.06] pt-4">
                                    <div className="bg-[#0a0a0e] border border-white/[0.06] rounded-md p-3 text-[11px] font-mono text-neutral-500">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <svg viewBox="0 0 100 100" className="h-3 w-3 fill-current text-accent opacity-70">
                                                <polygon points="50,10 93,85 7,85" />
                                            </svg>
                                            <span className="text-neutral-300 text-[11px]">Nimbus</span>
                                            <span className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-neutral-500">Agent</span>
                                        </div>
                                        <p className="text-neutral-500 leading-relaxed">Examining the startup path...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ProductMockup>
                </div>
            </section>

            {/* ─────────── LOGO MARQUEE ─────────── */}
            <section className="mt-16 md:mt-24">
                <LogoMarquee />
            </section>

            {/* ─────────── PHILOSOPHY / 3 PILLARS ─────────── */}
            <section ref={philosophyRef} className="mx-auto max-w-[1200px] px-6 py-28 md:py-40">
                <h2 className="reveal text-[36px] sm:text-[48px] md:text-[56px] font-medium tracking-[-0.03em] leading-[1.1] max-w-[900px]">
                    A new breed of cloud platform.{" "}
                    <span className="text-neutral-500">
                        Purpose-built for speed with edge-native architectures, Nimbus sets a new standard for deploying and operating software.
                    </span>
                </h2>

                <div className="reveal delay-200 grid md:grid-cols-3 gap-0 mt-24 border-t border-white/[0.06]">
                    {/* Pillar 1 */}
                    <div className="reveal delay-100 border-r border-white/[0.06] last:border-r-0 pt-10 pr-8 pb-8">
                        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-6">FIG 0.2</div>
                        <div className="h-32 w-32 text-neutral-600 mb-8">
                            <GeoPerformance />
                        </div>
                        <h3 className="text-[15px] font-semibold text-white mb-2">Built for performance</h3>
                        <p className="text-[13px] text-neutral-500 leading-relaxed">
                            Nimbus is shaped by the principles of world-class infrastructure teams. Zero cold starts, global replication.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="reveal delay-200 border-r border-white/[0.06] last:border-r-0 pt-10 px-8 pb-8">
                        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-6">FIG 0.3</div>
                        <div className="h-32 w-32 text-neutral-600 mb-8">
                            <GeoAgents />
                        </div>
                        <h3 className="text-[15px] font-semibold text-white mb-2">Powered by automation</h3>
                        <p className="text-[13px] text-neutral-500 leading-relaxed">
                            Designed for workflows shared by humans and agents. From drafting configs to pushing live.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="reveal delay-300 pt-10 pl-8 pb-8">
                        <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mb-6">FIG 0.4</div>
                        <div className="h-32 w-32 text-neutral-600 mb-8">
                            <GeoSpeed />
                        </div>
                        <h3 className="text-[15px] font-semibold text-white mb-2">Designed for speed</h3>
                        <p className="text-[13px] text-neutral-500 leading-relaxed">
                            Reduces noise and restores momentum to help teams ship with high velocity and focus.
                        </p>
                    </div>
                </div>
            </section>

            {/* ─────────── SECTION 1.0 — DEVELOP ─────────── */}
            <section ref={section1Ref} id="features" className="border-t border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] px-6 py-28 md:py-40">
                    {/* Split header */}
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
                        <h2 className="reveal text-[36px] sm:text-[44px] md:text-[52px] font-medium tracking-[-0.03em] leading-[1.08]">
                            Write code,<br />deploy instantly
                        </h2>
                        <div className="reveal delay-100">
                            <p className="text-[16px] sm:text-[18px] text-neutral-500 leading-[1.65] max-w-[480px]">
                                Start coding with zero config. Nimbus reads standard frameworks, syncs environment variables, and launches local dev servers automatically.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[13px] text-neutral-400 hover:text-white transition-colors cursor-pointer group">
                                <span className="text-neutral-600 font-mono">1.0</span>
                                <span className="font-medium">Develop</span>
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Product mockup — Code Editor */}
                    <div className="reveal-scale delay-200 mt-16">
                        <ProductMockup>
                            <div className="flex items-center border-b border-white/[0.06] bg-[#0a0a0e] px-4 py-2.5 text-[11px]">
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-neutral-800" />
                                    <span className="h-2 w-2 rounded-full bg-neutral-800" />
                                    <span className="h-2 w-2 rounded-full bg-neutral-800" />
                                </div>
                                <span className="ml-4 text-neutral-500 font-mono">api/user.js</span>
                                <span className="ml-auto text-neutral-700 font-mono">UTF-8</span>
                            </div>
                            <div className="p-6 md:p-8 font-mono text-[12px] min-h-[280px] leading-relaxed">
                                <pre className="text-neutral-300 whitespace-pre-wrap select-text">
                                    {typedCode}
                                    <span className="inline-block h-3.5 w-[6px] bg-accent/80 animate-pulse ml-0.5 align-middle rounded-sm" />
                                </pre>
                            </div>
                        </ProductMockup>
                    </div>

                    {/* Sub-features list */}
                    <div className="reveal delay-300 grid sm:grid-cols-3 gap-8 mt-16">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>1.1</span>
                                <span className="text-neutral-400">Edge Functions</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Serverless handlers that spin up in milliseconds at the nearest edge node.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>1.2</span>
                                <span className="text-neutral-400">Framework Presets</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Next.js, Vite, Bun — auto-detected and configured with zero setup.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>1.3</span>
                                <span className="text-neutral-400">Secrets Vault</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Encrypted at rest, decrypted only in sandboxed runtime environments.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── SECTION 2.0 — DEPLOY ─────────── */}
            <section ref={section2Ref} className="border-t border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] px-6 py-28 md:py-40">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
                        <h2 className="reveal text-[36px] sm:text-[44px] md:text-[52px] font-medium tracking-[-0.03em] leading-[1.08]">
                            Ship with<br />confidence
                        </h2>
                        <div className="reveal delay-100">
                            <p className="text-[16px] sm:text-[18px] text-neutral-500 leading-[1.65] max-w-[480px]">
                                Every push triggers a preview deployment. Review builds, share feedback, and merge to production — all from one pipeline.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[13px] text-neutral-400 hover:text-white transition-colors cursor-pointer group">
                                <span className="text-neutral-600 font-mono">2.0</span>
                                <span className="font-medium">Deploy</span>
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Product mockup — Deploy Pipeline */}
                    <div className="reveal-scale delay-200 mt-16">
                        <ProductMockup>
                            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0e] px-4 py-2.5 text-[11px]">
                                <span className="text-neutral-500 font-mono">DEPLOY PIPELINE</span>
                                <span className="text-neutral-600 font-mono">BRANCH: feat/payments</span>
                            </div>
                            <div className="p-6 md:p-8 font-mono text-[12px] space-y-3 min-h-[280px]">
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                    <span>Cloning repository <span className="text-neutral-300">acme/marketing-site</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                    <span>Bundle compiled successfully <span className="text-neutral-600">(1.84 MB, 2.1s)</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                    <span>Edge endpoints configured <span className="text-neutral-600">(42 nodes)</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-neutral-400">
                                    <Check className="h-3.5 w-3.5 text-success" />
                                    <span>SSL certificate issued. Cache invalidation complete.</span>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                                    <div>
                                        <div className="text-[10px] text-success uppercase tracking-wider font-semibold">Preview URL</div>
                                        <div className="text-success text-[13px] mt-1 font-sans font-medium">https://preview-acme.nimbus.dev</div>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                                        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                        <span>Live · 48s ago</span>
                                    </div>
                                </div>

                                {/* Branch list */}
                                <div className="mt-6 pt-4 border-t border-white/[0.06] space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                            <span className="text-neutral-300 font-medium">feat/auth-system</span>
                                        </div>
                                        <span className="text-success text-[10px]">build success · 48s ago</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                            <span className="text-neutral-500">patch-update</span>
                                        </div>
                                        <span className="text-amber-400 text-[10px]">building · 2h ago</span>
                                    </div>
                                </div>
                            </div>
                        </ProductMockup>
                    </div>

                    <div className="reveal delay-300 grid sm:grid-cols-3 gap-8 mt-16">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>2.1</span>
                                <span className="text-neutral-400">Git Integration</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Every commit triggers distinct preview builds shared to teammates automatically.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>2.2</span>
                                <span className="text-neutral-400">Auto TLS/SSL</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Domains provisioned with Let's Encrypt certificates within seconds.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>2.3</span>
                                <span className="text-neutral-400">Rollback</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Instant rollback to any previous deployment. Zero downtime, always.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── SECTION 3.0 — SCALE ─────────── */}
            <section ref={section3Ref} className="border-t border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] px-6 py-28 md:py-40">
                    <div className="grid md:grid-cols-2 gap-12 md:gap-24 items-start">
                        <h2 className="reveal text-[36px] sm:text-[44px] md:text-[52px] font-medium tracking-[-0.03em] leading-[1.08]">
                            Scale globally,<br />deliver locally
                        </h2>
                        <div className="reveal delay-100">
                            <p className="text-[16px] sm:text-[18px] text-neutral-500 leading-[1.65] max-w-[480px]">
                                Route user traffic to the nearest edge instance automatically. 99.99% SLA uptime with automated failovers and DDoS protection.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[13px] text-neutral-400 hover:text-white transition-colors cursor-pointer group">
                                <span className="text-neutral-600 font-mono">3.0</span>
                                <span className="font-medium">Scale</span>
                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                        </div>
                    </div>

                    {/* Product mockup — Edge Network */}
                    <div className="reveal-scale delay-200 mt-16">
                        <ProductMockup>
                            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a0a0e] px-4 py-2.5 text-[11px]">
                                <span className="text-neutral-500 font-mono">GLOBAL EDGE NETWORK</span>
                                <div className="flex items-center gap-2 text-neutral-600 font-mono">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                                    <span>AVAILABILITY: 100%</span>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 min-h-[280px]">
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Edge PoPs */}
                                    <div className="space-y-3 font-mono text-[12px]">
                                        {edgeMetrics.map((m) => (
                                            <div key={m.region} className="flex items-center justify-between border-b border-white/[0.04] pb-2 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                                    <span className="text-neutral-300 font-medium">{m.city}</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-neutral-500 text-[11px]">
                                                    <span>{m.region}</span>
                                                    <span className={`font-semibold ${m.latency < 30 ? 'text-success' : 'text-amber-400'}`}>{m.latency}ms</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Stats panel */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#0a0a0e] border border-white/[0.06] rounded-md p-4 text-center">
                                            <div className="text-[24px] font-mono font-semibold text-accent tracking-tight">42</div>
                                            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">Edge Nodes</div>
                                        </div>
                                        <div className="bg-[#0a0a0e] border border-white/[0.06] rounded-md p-4 text-center">
                                            <div className="text-[24px] font-mono font-semibold text-accent tracking-tight">14.2<span className="text-[14px] text-neutral-500">ms</span></div>
                                            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">P95 Global</div>
                                        </div>
                                        <div className="bg-[#0a0a0e] border border-white/[0.06] rounded-md p-4 text-center">
                                            <div className="text-[24px] font-mono font-semibold text-success tracking-tight">99.99<span className="text-[14px] text-neutral-500">%</span></div>
                                            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">Uptime SLA</div>
                                        </div>
                                        <div className="bg-[#0a0a0e] border border-white/[0.06] rounded-md p-4 text-center">
                                            <div className="text-[24px] font-mono font-semibold text-white tracking-tight">2.4<span className="text-[14px] text-neutral-500">M</span></div>
                                            <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-wider mt-1">Req / 24h</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ProductMockup>
                    </div>

                    <div className="reveal delay-300 grid sm:grid-cols-3 gap-8 mt-16">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>3.1</span>
                                <span className="text-neutral-400">Edge Routing</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Smart request routing to the nearest healthy edge instance in under 15ms.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>3.2</span>
                                <span className="text-neutral-400">DDoS Shield</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Built-in protection at the network edge. Automatic traffic analysis and mitigation.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-600 uppercase tracking-wider">
                                <span>3.3</span>
                                <span className="text-neutral-400">Auto-Scale</span>
                            </div>
                            <p className="text-[13px] text-neutral-500 leading-relaxed">Compute scales from zero to thousands of instances based on real-time demand.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─────────── BENEFITS SECTION ─────────── */}
            <section ref={benefitsRef} className="border-t border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] px-6 py-28 md:py-40">
                    <h2 className="reveal text-[36px] sm:text-[44px] md:text-[52px] font-medium tracking-[-0.03em] leading-[1.08] max-w-[640px]">
                        Everything you need{" "}
                        <span className="text-neutral-500">to build, deploy, and operate.</span>
                    </h2>

                    <div className="reveal delay-200 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 mt-16">
                        {[
                            { icon: <Code2 className="h-4 w-4" />, title: "Edge Functions", desc: "Serverless handlers at the edge. Zero cold starts, automatic scaling." },
                            { icon: <Database className="h-4 w-4" />, title: "Managed Databases", desc: "Postgres, Redis, and key-value stores — provisioned in seconds." },
                            { icon: <HardDrive className="h-4 w-4" />, title: "Object Storage", desc: "S3-compatible storage with global CDN distribution." },
                            { icon: <Key className="h-4 w-4" />, title: "Secrets Management", desc: "Encrypted vault with automatic environment injection." },
                            { icon: <Shield className="h-4 w-4" />, title: "Security", desc: "TLS everywhere, DDoS protection, and SOC 2 compliance." },
                            { icon: <Terminal className="h-4 w-4" />, title: "CLI & API", desc: "Full control from your terminal. RESTful API for everything." },
                        ].map((item, i) => (
                            <div key={i} className={`reveal delay-${(i % 3 + 1) * 100} space-y-3 py-6 border-t border-white/[0.06]`}>
                                <div className="text-neutral-500">{item.icon}</div>
                                <h3 className="text-[14px] font-semibold text-white">{item.title}</h3>
                                <p className="text-[13px] text-neutral-500 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─────────── CTA ─────────── */}
            <section ref={ctaRef} className="border-t border-white/[0.04]">
                <div className="mx-auto max-w-[1200px] px-6 py-28 md:py-40 text-center">
                    <h2 className="reveal text-[36px] sm:text-[44px] md:text-[52px] font-medium tracking-[-0.03em] leading-[1.08]">
                        Get started with Nimbus
                    </h2>
                    <p className="reveal delay-100 mt-5 text-[16px] sm:text-[18px] text-neutral-500 leading-[1.65] max-w-[440px] mx-auto">
                        Join thousands of teams deploying high-performance applications at the edge.
                    </p>
                    <div className="reveal delay-200 mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/register"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-md bg-white text-black px-5 py-2.5 text-[13px] font-semibold hover:bg-neutral-200 transition-all duration-200 shadow-[0_1px_20px_rgba(255,255,255,0.06)]"
                        >
                            Start Deploying
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            to="/dashboard"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-md border border-white/10 bg-transparent px-5 py-2.5 text-[13px] font-medium text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─────────── FOOTER ─────────── */}
            <footer className="border-t border-white/[0.04] py-16 px-6">
                <div className="mx-auto max-w-[1200px]">
                    <div className="grid sm:grid-cols-4 gap-12">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <svg viewBox="0 0 100 100" className="h-[14px] w-[14px] text-neutral-400 fill-current">
                                    <polygon points="50,8 95,88 5,88" />
                                </svg>
                                <span className="text-[13px] font-semibold text-white">Nimbus</span>
                            </div>
                            <p className="text-[12px] text-neutral-600 leading-relaxed">
                                The cloud platform for modern teams.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Product</div>
                            <div className="space-y-2.5 text-[12.5px] text-neutral-600">
                                <Link to="/deployments" className="block hover:text-neutral-300 transition-colors">Deployments</Link>
                                <Link to="/compute" className="block hover:text-neutral-300 transition-colors">Compute</Link>
                                <Link to="/databases" className="block hover:text-neutral-300 transition-colors">Databases</Link>
                                <Link to="/storage" className="block hover:text-neutral-300 transition-colors">Storage</Link>
                                <Link to="/functions" className="block hover:text-neutral-300 transition-colors">Functions</Link>
                            </div>
                        </div>

                        {/* Resources */}
                        <div>
                            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Resources</div>
                            <div className="space-y-2.5 text-[12.5px] text-neutral-600">
                                <Link to="/docs" className="block hover:text-neutral-300 transition-colors">Documentation</Link>
                                <Link to="/billing" className="block hover:text-neutral-300 transition-colors">Pricing</Link>
                                <a href="#" className="block hover:text-neutral-300 transition-colors">Changelog</a>
                                <a href="#" className="block hover:text-neutral-300 transition-colors">Status</a>
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">Company</div>
                            <div className="space-y-2.5 text-[12.5px] text-neutral-600">
                                <a href="#" className="block hover:text-neutral-300 transition-colors">About</a>
                                <a href="#" className="block hover:text-neutral-300 transition-colors">Blog</a>
                                <a href="#" className="block hover:text-neutral-300 transition-colors">Careers</a>
                                <a href="#" className="block hover:text-neutral-300 transition-colors">Contact</a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-neutral-600">
                        <span>© 2026 Nimbus, Inc. All rights reserved.</span>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-neutral-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-neutral-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-neutral-400 transition-colors">Security</a>
                        </div>
                    </div>
                </div>
            </footer>

        </div>
    );
}
