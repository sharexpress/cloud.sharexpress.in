import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, Sparkline } from "@/components/app/primitives";
import { buckets, mediaFiles, metricSeries } from "@/lib/mock";
import { FileVideo, FileText, Folder, HardDrive, ImageIcon, Upload, Copy } from "lucide-react";

export const Route = createFileRoute("/storage")({
  head: () => ({ meta: [{ title: "Storage — Nimbus" }] }),
  component: StoragePage,
});

function StoragePage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Storage" }, { label: "acme-media" }]}>
      <PageShell>
        <PageHeader
          title="Object storage"
          description="Buckets, media library, and CDN-backed transformations."
          actions={
            <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90">
              <Upload className="h-3.5 w-3.5" /> Upload
            </button>
          }
        />

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total size" value="1.68 TB" hint="across 3 buckets" series={metricSeries(31)} icon={<HardDrive className="h-3.5 w-3.5" />} />
          <Metric label="Objects" value="1.6M" hint="+2.4k today" series={metricSeries(32)} />
          <Metric label="Egress" value="88 GB" hint="last 24h" delta={{ value: "+4.1%", positive: true }} series={metricSeries(33)} />
          <Metric label="CDN hit rate" value="97.4%" hint="global" delta={{ value: "+0.3%", positive: true }} series={metricSeries(34)} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Buckets" className="lg:col-span-1" padded={false}>
            <ul className="divide-y divide-border">
              {buckets.map((b) => (
                <li key={b.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3 hover:bg-surface-elevated/40">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-foreground">{b.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{b.objects} objects · {b.region}</div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{b.size}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Media library" description="acme-media / hero/" className="lg:col-span-2" padded={false}>
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
              {mediaFiles.slice(0, 8).map((f) => (
                <div key={f.id} className="group rounded-md border border-border bg-background p-2 transition-colors hover:border-border-strong">
                  <div className="grid aspect-square place-items-center rounded bg-gradient-to-br from-surface-elevated to-surface text-muted-foreground">
                    {f.type === "image" ? <ImageIcon className="h-5 w-5" /> : f.type === "video" ? <FileVideo className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  </div>
                  <div className="mt-2 truncate text-[11.5px] font-medium text-foreground">{f.name}</div>
                  <div className="text-[10.5px] text-muted-foreground">{f.size} · {f.updated}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Panel title="File details" description="hero-desktop.jpg">
            <div className="grid aspect-[16/9] place-items-center rounded-md border border-border bg-gradient-to-br from-surface-elevated to-background">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <Field label="Size" value="812 KB" />
              <Field label="Dimensions" value="2400 × 1350" />
              <Field label="Format" value="JPEG · auto" />
              <Field label="Uploaded" value="2m ago" />
            </div>
            <div className="mt-4 rounded-md border border-border bg-background px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CDN URL</div>
                  <div className="truncate font-mono text-[11.5px] text-foreground">https://cdn.acme.com/hero/hero-desktop.jpg</div>
                </div>
                <button className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </Panel>
          <Panel title="Transformations" description="On-the-fly image pipeline">
            <div className="space-y-3 font-mono text-[11.5px]">
              {[
                "w_1600,q_auto,f_avif",
                "w_800,q_80,f_webp",
                "w_400,c_thumb,g_face",
                "e_grayscale,q_auto",
              ].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
                  <span className="text-foreground">{t}</span>
                  <span className="text-[11px] text-muted-foreground">signed</span>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="text-[11px] text-muted-foreground">Transform requests</div>
              <Sparkline data={metricSeries(41, 40, 40, 60)} height={70} />
            </div>
          </Panel>
        </div>
      </PageShell>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[12.5px] font-medium text-foreground">{value}</div>
    </div>
  );
}
