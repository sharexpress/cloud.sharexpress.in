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

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
/* ---------------- Layout containers ---------------- */
export function PageShell({ children }) {
    return <div className="mx-auto w-full max-w-[1400px] px-2 py-4 md:px-4 md:py-6">{children}</div>;
}
export function PageHeader({ title, description, actions, action }) {
    const actionContent = actions ?? action;
    return (<div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-4">
      <div className="min-w-0">
        <h1 className="text-[18px] font-bold tracking-tight text-text-primary">{title}</h1>
        {description && (<p className="mt-1 text-xs text-text-muted">{description}</p>)}
      </div>
      {actionContent && <div className="flex shrink-0 items-center gap-2">{actionContent}</div>}
    </div>);
}
function renderIcon(icon, className = "h-4 w-4") {
    if (!icon) return null;
    if (typeof icon === "function" || (typeof icon === "object" && icon && icon.render)) {
        const IconComp = icon;
        return <IconComp className={className} />;
    }
    return icon;
}

export function Panel({ title, description, actions, icon, children, className, padded = true, }) {
    return (<section className={cn("rounded-lg border border-border-primary bg-bg-card shadow-sm", className)}>
      {(title || actions || icon) && (<header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border-primary px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-text-muted shrink-0">{renderIcon(icon, "h-4 w-4")}</span>}
            <div className="min-w-0">
              {title && <h2 className="truncate text-[11px] font-bold tracking-wider uppercase font-mono text-text-secondary">{title}</h2>}
              {description && <p className="mt-0.5 truncate text-[11px] text-text-muted">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>)}
      <div className={padded ? "p-4" : ""}>{children}</div>
    </section>);
}
/* ---------------- Status / badges ---------------- */
const statusStyles = {
    ready: "bg-status-success/10 text-status-success border-status-success/20 font-semibold px-2 py-0.5",
    healthy: "bg-status-success/10 text-status-success border-status-success/20 font-semibold px-2 py-0.5",
    active: "bg-status-success/10 text-status-success border-status-success/20 font-semibold px-2 py-0.5",
    valid: "bg-status-success/10 text-status-success border-status-success/20 font-semibold px-2 py-0.5",
    paid: "bg-status-success/10 text-status-success border-status-success/20 font-semibold px-2 py-0.5",
    building: "bg-status-info/10 text-status-info border-status-info/20 px-2 py-0.5 animate-pulse",
    scaling: "bg-status-info/10 text-status-info border-status-info/20 px-2 py-0.5",
    issuing: "bg-status-info/10 text-status-info border-status-info/20 px-2 py-0.5",
    queued: "bg-bg-secondary text-text-muted border-border-primary px-2 py-0.5",
    idle: "bg-bg-secondary text-text-muted border-border-primary px-2 py-0.5",
    pending: "bg-status-warning/10 text-status-warning border-status-warning/20 px-2 py-0.5",
    degraded: "bg-status-warning/10 text-status-warning border-status-warning/20 px-2 py-0.5",
    error: "bg-status-danger/10 text-status-danger border-status-danger/20 font-bold px-2 py-0.5",
    canceled: "bg-bg-secondary text-text-muted border-border-primary px-2 py-0.5",
};
export function StatusBadge({ status, label }) {
    const cls = statusStyles[status] ?? "bg-bg-secondary text-text-muted border-border-primary";
    return (<span className={cn("inline-flex items-center gap-1.5 rounded-full border text-[10px] tracking-tight uppercase", cls)}>
      <span className="h-1 w-1 rounded-full bg-current"/>
      {label ?? status}
    </span>);
}
export function Tag({ children, className }) {
    return (<span className={cn("inline-flex items-center gap-1 rounded-md border border-border-primary bg-bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-text-muted", className)}>
      {children}
    </span>);
}
/* ---------------- Metric card ---------------- */
export function Metric({ title, label, value, change, trend, hint, delta, series, icon, }) {
    const displayLabel = title ?? label;
    return (<div className="rounded-lg border border-border-primary bg-bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted font-medium">{displayLabel}</span>
        {icon && <span className="text-text-muted">{renderIcon(icon, "h-4 w-4")}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[22px] font-semibold tracking-tight text-text-primary">{value}</span>
        {change && (
          <span className={cn("text-[11px] font-medium", trend === 'up' ? "text-status-success" : trend === 'down' ? "text-status-danger" : "text-text-muted")}>
            {change}
          </span>
        )}
        {delta && (<span className={cn("text-[11px] font-medium", delta.positive ? "text-status-success" : "text-status-danger")}>
            {delta.value}
          </span>)}
      </div>
      {hint && <div className="mt-1 text-[11px] text-text-muted">{hint}</div>}
      {series && <Sparkline data={series} className="mt-4"/>}
    </div>);
}
/* ---------------- Sparkline / chart ---------------- */
export function Sparkline({ data, className, height = 40 }) {
    const w = 200;
    const h = height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2]);
    const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${d} L${w},${h} L0,${h} Z`;
    
    // Unique ID for gradients to prevent overlap
    const gradientId = `spark-${Math.random().toString(36).substr(2, 9)}`;

    return (<svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-10 w-full overflow-visible", className)}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0"/>
        </linearGradient>
        <filter id="spark-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={area} fill={`url(#${gradientId})`}/>
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" filter="url(#spark-glow)" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>);
}

export function AreaChart({ data, height = 180, unit = "units" }) {
    const containerRef = useRef(null);
    const [hoverState, setHoverState] = useState({ active: false, x: 0, y: 0, index: 0 });

    const w = 800;
    const h = height;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const step = w / (data.length - 1);
    
    // Coordinates mapping
    const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 30) - 15]);
    const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const area = `${d} L${w},${h} L0,${h} Z`;

    const handleMouseMove = (e) => {
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const relativeX = (clientX / rect.width) * w;
        
        // Find closest point index
        let activeIndex = Math.round(relativeX / step);
        activeIndex = Math.max(0, Math.min(data.length - 1, activeIndex));
        
        const activePoint = points[activeIndex];
        
        // Position tooltips relative to original container ClientBoundingRect
        const tooltipX = (activePoint[0] / w) * rect.width;
        const tooltipY = (activePoint[1] / h) * rect.height;

        setHoverState({
            active: true,
            x: tooltipX,
            y: tooltipY,
            index: activeIndex
        });
    };

    const handleMouseLeave = () => {
        setHoverState({ active: false, x: 0, y: 0, index: 0 });
    };

    // Calculate active value formatting
    const currentValue = data[hoverState.index];
    const hoursAgo = (data.length - 1 - hoverState.index) * 0.5; // each point = 30min
    const timeLabel = hoursAgo === 0 
        ? "Just now" 
        : hoursAgo < 1 
            ? "30m ago" 
            : `${Math.floor(hoursAgo)}h ${hoursAgo % 1 ? "30m" : ""} ago`;

    // Unique gradient ID
    const gradientId = `area-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div 
            ref={containerRef}
            className="relative w-full group select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[180px] w-full overflow-visible">
                <defs>
                    <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.08"/>
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0"/>
                    </linearGradient>
                    <filter id="glow-filter" x="-10%" y="-10%" width="120%" height="120%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Subtly dashed horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <line
                        key={ratio}
                        x1="0"
                        y1={ratio * (h - 30) + 15}
                        x2={w}
                        y2={ratio * (h - 30) + 15}
                        stroke="rgba(255, 255, 255, 0.03)"
                        strokeDasharray="4 4"
                        strokeWidth="0.75"
                    />
                ))}

                {/* Area under line */}
                <path d={area} fill={`url(#${gradientId})`}/>

                {/* Main line path */}
                <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" filter="url(#glow-filter)" strokeLinejoin="round" strokeLinecap="round"/>

                {/* Interactive cursor elements */}
                {hoverState.active && (
                    <>
                        {/* Vertical line crosshair */}
                        <line
                            x1={points[hoverState.index][0]}
                            y1="0"
                            x2={points[hoverState.index][0]}
                            y2={h}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                        />
                        {/* Glowing Active Dot */}
                        <circle
                            cx={points[hoverState.index][0]}
                            cy={points[hoverState.index][1]}
                            r="5"
                            fill="var(--color-accent)"
                            stroke="#08080c"
                            strokeWidth="2"
                        />
                        <circle
                            cx={points[hoverState.index][0]}
                            cy={points[hoverState.index][1]}
                            r="10"
                            fill="var(--color-accent)"
                            fillOpacity="0.15"
                        />
                    </>
                )}
            </svg>

            {/* Time labels axis */}
            <div className="flex justify-between items-center mt-2 px-1 text-[10px] font-mono text-neutral-600 tracking-wider">
                <span>12 AM</span>
                <span>4 AM</span>
                <span>8 AM</span>
                <span>12 PM</span>
                <span>4 PM</span>
                <span>8 PM</span>
            </div>

            {/* Floating Tooltip */}
            {hoverState.active && (
                <div 
                    className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+12px)] bg-[#09090b]/90 backdrop-blur-md border border-white/[0.08] px-2.5 py-1.5 rounded shadow-2xl transition-all duration-75 text-left"
                    style={{ left: hoverState.x, top: hoverState.y }}
                >
                    <div className="text-[10px] text-neutral-500 font-mono font-medium tracking-wide uppercase">{timeLabel}</div>
                    <div className="text-[13px] font-mono font-bold text-white mt-0.5">
                        {currentValue} <span className="text-[9.5px] font-normal text-neutral-400">{unit}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
/* ---------------- Empty state ---------------- */
export function EmptyState({ icon, title, description, action, }) {
    return (<div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>);
}
