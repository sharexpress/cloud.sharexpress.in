import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/* ---------------- Layout containers ---------------- */

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[1400px] px-6 py-8">{children}</div>;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
      <div className="min-w-0">
        <h1 className="truncate text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-surface", className)}>
      {(title || actions) && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="truncate text-[13px] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

/* ---------------- Status / badges ---------------- */

const statusStyles: Record<string, string> = {
  ready: "bg-success/15 text-success border-success/25",
  healthy: "bg-success/15 text-success border-success/25",
  active: "bg-success/15 text-success border-success/25",
  valid: "bg-success/15 text-success border-success/25",
  paid: "bg-success/15 text-success border-success/25",
  building: "bg-info/15 text-info border-info/25",
  scaling: "bg-info/15 text-info border-info/25",
  issuing: "bg-info/15 text-info border-info/25",
  queued: "bg-muted text-muted-foreground border-border",
  idle: "bg-muted text-muted-foreground border-border",
  pending: "bg-warning/15 text-warning border-warning/25",
  degraded: "bg-warning/15 text-warning border-warning/25",
  error: "bg-destructive/15 text-destructive border-destructive/25",
  canceled: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const cls = statusStyles[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground", className)}>
      {children}
    </span>
  );
}

/* ---------------- Metric card ---------------- */

export function Metric({
  label,
  value,
  hint,
  delta,
  series,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; positive?: boolean };
  series?: number[];
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[22px] font-semibold tracking-tight text-foreground">{value}</span>
        {delta && (
          <span className={cn("text-[11px] font-medium", delta.positive ? "text-success" : "text-destructive")}>
            {delta.value}
          </span>
        )}
      </div>
      {hint && <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>}
      {series && <Sparkline data={series} className="mt-4" />}
    </div>
  );
}

/* ---------------- Sparkline / chart ---------------- */

export function Sparkline({ data, className, height = 40 }: { data: number[]; className?: string; height?: number }) {
  const w = 200;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 4) - 2] as const);
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={cn("h-10 w-full", className)}>
      <defs>
        <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#spark)" />
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function AreaChart({ data, height = 180 }: { data: number[]; height?: number }) {
  const w = 800;
  const h = height;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * (h - 20) - 10] as const);
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-[180px] w-full">
      <defs>
        <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
        <pattern id="grid" width="80" height="30" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width={w} height={h} fill="url(#grid)" />
      <path d={area} fill="url(#area)" />
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Empty state ---------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full border border-border bg-background text-muted-foreground">
        {icon}
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
