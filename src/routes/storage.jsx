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

import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, Metric, Sparkline } from "@/components/app/primitives";
import { 
  FileVideo, FileText, Folder, HardDrive, ImageIcon, Upload, 
  Copy, X, Check, Eye, Trash, Key, RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  setActiveBucket, addBucket, uploadFile, deleteFile, 
  selectMediaFile, updateTransformations, addMediaFile
} from "../store/index.js";

export const Route = createFileRoute("/storage")({
    head: () => ({ meta: [{ title: "Storage & CDN — Sharexpress Cloud" }] }),
    component: StoragePage,
});

function StoragePage() {
    const dispatch = useDispatch();
    
    // Selectors
    const buckets = useSelector((state) => state.storage.buckets);
    const activeBucketId = useSelector((state) => state.storage.activeBucketId);
    const files = useSelector((state) => state.storage.files);
    const mediaFiles = useSelector((state) => state.media.files);
    const activeFileId = useSelector((state) => state.media.transformations.activeFileId);
    const transformations = useSelector((state) => state.media.transformations);

    // Active items
    const activeBucket = buckets.find(b => b.id === activeBucketId) || buckets[0];
    const filteredFiles = files.filter(f => f.bucketId === activeBucketId);
    const activeFile = mediaFiles.find(f => f.id === activeFileId) || mediaFiles[0];

    // Dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSignedOpen, setIsSignedOpen] = useState(false);
    
    // Form inputs
    const [bucketName, setBucketName] = useState("");
    const [bucketVis, setBucketVis] = useState("private");
    const [signedHours, setSignedHours] = useState("24");
    const [generatedSignedUrl, setGeneratedSignedUrl] = useState("");

    // Upload simulation
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleCreateBucket = (e) => {
        e.preventDefault();
        if (!bucketName.trim()) return;

        const name = bucketName.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
        dispatch(addBucket({
            name,
            visibility: bucketVis,
        }));
        setBucketName("");
        setIsCreateOpen(false);
        showToast(`Bucket "${name}" created successfully!`);
    };

    const handleUpload = () => {
        setUploading(true);
        setUploadProgress(0);

        const timer = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(() => {
                        const randomNames = ["hero_banner.png", "pricing_tier.pdf", "avatar_active.jpg", "product_mockup.mp4"];
                        const name = randomNames[Math.floor(Math.random() * randomNames.length)];
                        const type = name.endsWith(".png") || name.endsWith(".jpg") ? "image" : name.endsWith(".mp4") ? "video" : "doc";
                        
                        // Add to files list
                        dispatch(uploadFile({
                            name: `uploads/${name}`,
                            size: type === "video" ? "12 MB" : "412 KB",
                            type: type === "image" ? "image/png" : type === "video" ? "video/mp4" : "application/pdf",
                        }));

                        // Add to media gallery
                        dispatch(addMediaFile({
                            name,
                            type,
                            size: type === "video" ? "12 MB" : "412 KB",
                        }));

                        setUploading(false);
                        setUploadProgress(0);
                        showToast(`Uploaded ${name} to bucket!`);
                    }, 500);
                    return 100;
                }
                return prev + 20;
            });
        }, 150);
    };

    const handleDeleteFile = (id) => {
        if (confirm("Are you sure you want to delete this file?")) {
            dispatch(deleteFile(id));
            showToast("Object deleted from bucket.");
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Copied CDN link!");
    };

    const handleGenerateSignedUrl = () => {
        const signature = Math.random().toString(36).substring(2, 12);
        const url = `https://cdn.acme.com/bucket-${activeBucketId}/${activeFile.name}?expires=${Date.now() + parseInt(signedHours) * 3600000}&signature=${signature}`;
        setGeneratedSignedUrl(url);
        setIsSignedOpen(true);
    };

    // Calculate CDN Url with transformations
    const transformedUrl = `https://cdn.acme.com/hero/${activeFile.name}?w=${transformations.width}&h=${transformations.height}&q=${transformations.quality}&fmt=${transformations.format}&comp=${transformations.compression}`;

    // Helper functions for mock charts
    const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
        const out = [];
        for (let i = 0; i < len; i++) {
            const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
            out.push(Math.max(4, Math.min(100, Math.round(v))));
        }
        return out;
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Storage" }, { label: activeBucket.name }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Object storage" description="Buckets, media library, and CDN-backed transformations." actions={
            <div className="flex gap-2">
                <button 
                    onClick={() => setIsCreateOpen(true)}
                    className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong cursor-pointer transition-colors"
                >
                    New bucket
                </button>
                <button 
                    disabled={uploading}
                    onClick={handleUpload}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                >
                    <Upload className="h-3.5 w-3.5"/> {uploading ? "Uploading..." : "Upload File"}
                </button>
            </div>
        }/>

        {uploading && (
            <div className="mb-4 border border-border p-4 rounded-md bg-surface-elevated animate-in slide-in-from-top-2 duration-150 max-w-xl">
                <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-2">
                    <span>Uploading static file assets to S3 edge...</span>
                    <span className="font-bold text-foreground">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                </div>
            </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total size" value="1.68 TB" hint="across 3 buckets" series={metricSeries(31)} icon={<HardDrive className="h-3.5 w-3.5"/>}/>
          <Metric label="Objects" value={files.length.toString()} hint="+2.4k today" series={metricSeries(32)}/>
          <Metric label="Egress" value="88 GB" hint="last 24h" delta={{ value: "+4.1%", positive: true }} series={metricSeries(33)}/>
          <Metric label="CDN hit rate" value="97.4%" hint="global" delta={{ value: "+0.3%", positive: true }} series={metricSeries(34)}/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          
          {/* BUCKETS LIST */}
          <Panel title="Buckets" className="lg:col-span-1" padded={false}>
            <ul className="divide-y divide-border">
              {buckets.map((b) => (
                <li 
                    key={b.id} 
                    onClick={() => dispatch(setActiveBucket(b.id))}
                    className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 transition-colors cursor-pointer ${b.id === activeBucketId ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-surface-elevated/40"}`}
                >
                  <Folder className={`h-4 w-4 ${b.id === activeBucketId ? "text-accent" : "text-muted-foreground"}`}/>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">{b.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{b.objects} objects · {b.region.toUpperCase()}</div>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{b.size}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {/* ACTIVE BUCKET OBJECTS / GALLERY */}
          <Panel title={`Bucket Assets: ${activeBucket.name}`} description={`${activeBucket.name} / uploads/`} className="lg:col-span-2" padded={false}>
            {filteredFiles.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-[13px]">
                    No files found in bucket. Upload assets to get started.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-4">
                    {filteredFiles.map((f) => (
                        <div 
                            key={f.id} 
                            onClick={() => {
                                // Find matching media file or select
                                const mediaMatch = mediaFiles.find(mf => mf.name.includes(f.name.split("/")[1]));
                                if (mediaMatch) dispatch(selectMediaFile(mediaMatch.id));
                            }}
                            className={`group rounded-md border p-2.5 transition-all cursor-pointer ${activeFile.name.includes(f.name.split("/")[1]) ? "border-accent bg-accent/5 shadow-sm" : "border-border bg-background hover:border-border-strong"}`}
                        >
                            <div className="grid aspect-square place-items-center rounded bg-gradient-to-br from-surface-elevated to-surface text-muted-foreground">
                                {f.type.startsWith("image") ? <ImageIcon className="h-5 w-5 text-accent"/> : f.type.startsWith("video") ? <FileVideo className="h-5 w-5 text-info"/> : <FileText className="h-5 w-5 text-muted-foreground"/>}
                            </div>
                            <div className="mt-2 truncate text-[11.5px] font-medium text-foreground">{f.name.replace("uploads/", "")}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{f.size}</div>
                        </div>
                    ))}
                </div>
            )}
          </Panel>
        </div>

        {/* DETAILS AND TRANSFORMATIONS */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          
          {/* FILE DETAILS */}
          <Panel title="File details" description={activeFile.name}>
            <div className="grid aspect-[16/9] place-items-center rounded-md border border-border bg-gradient-to-br from-surface-elevated to-background">
                {activeFile.type === "image" ? <ImageIcon className="h-8 w-8 text-accent"/> : activeFile.type === "video" ? <FileVideo className="h-8 w-8 text-info"/> : <FileText className="h-8 w-8 text-muted-foreground"/>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
              <Field label="Size" value={activeFile.size}/>
              <Field label="Type" value={activeFile.type === "image" ? "PNG/JPEG Image" : activeFile.type === "video" ? "MP4 Video" : "Static PDF Document"}/>
              <Field label="Dimensions" value={activeFile.type === "image" ? `${transformations.width} × ${transformations.height}` : "—"}/>
              <Field label="Format Option" value={activeFile.type === "image" ? `${transformations.format.toUpperCase()} compression` : "Direct Stream"}/>
            </div>
            <div className="mt-4 rounded-md border border-border bg-background px-3 py-2 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">CDN URL</div>
                <div className="truncate font-mono text-[11.5px] text-foreground">{transformedUrl}</div>
              </div>
              <button 
                onClick={() => handleCopy(transformedUrl)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground cursor-pointer transition-colors"
              >
                <Copy className="h-3.5 w-3.5"/>
              </button>
            </div>
          </Panel>

          {/* TRANSFORMATIONS GENERATOR */}
          <Panel title="On-the-fly Image pipeline" description="Configure real-time asset cropping and scaling parameters.">
            <div className="space-y-4 text-[12.5px]">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Width (px)</label>
                        <input 
                            type="number" value={transformations.width} onChange={(e) => dispatch(updateTransformations({ width: parseInt(e.target.value) || 800 }))}
                            className="h-8 w-full rounded border border-border bg-background px-2 text-[12px] text-foreground focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Height (px)</label>
                        <input 
                            type="number" value={transformations.height} onChange={(e) => dispatch(updateTransformations({ height: parseInt(e.target.value) || 600 }))}
                            className="h-8 w-full rounded border border-border bg-background px-2 text-[12px] text-foreground focus:outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Format</label>
                        <select 
                            value={transformations.format} onChange={(e) => dispatch(updateTransformations({ format: e.target.value }))}
                            className="h-8 w-full rounded border border-border bg-background px-2 text-[11.5px] text-foreground focus:outline-none"
                        >
                            <option value="webp">WebP (Optimized)</option>
                            <option value="avif">AVIF (Ultra Lossless)</option>
                            <option value="png">PNG (Lossless)</option>
                            <option value="jpg">JPEG (Standard)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[11px] text-muted-foreground block mb-1">Quality</label>
                        <input 
                            type="range" min="10" max="100" value={transformations.quality} onChange={(e) => dispatch(updateTransformations({ quality: parseInt(e.target.value) }))}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-accent mt-3"
                        />
                    </div>
                </div>

                <div className="border-t border-border pt-4 flex justify-between items-center gap-3">
                    <div>
                        <span className="text-[11px] text-muted-foreground block">Signed CDN Access URL</span>
                        <span className="text-[12px] text-foreground font-medium">Require signature parameters</span>
                    </div>
                    <button 
                        onClick={handleGenerateSignedUrl}
                        className="inline-flex h-8 items-center gap-1 rounded border border-border bg-background px-3 text-[11.5px] font-semibold text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer transition-colors"
                    >
                        <Key className="h-3.5 w-3.5" /> Sign URL
                    </button>
                </div>
            </div>
          </Panel>
        </div>
      </PageShell>

      {/* New Bucket Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Create Storage Bucket</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBucket} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Bucket Name (Lowercase, hyphens only)</label>
                <input 
                  type="text" required placeholder="e.g. static-assets-prod" value={bucketName} onChange={(e) => setBucketName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11.5px] text-muted-foreground mb-1">Access Control Visibility</label>
                <select 
                  value={bucketVis} onChange={(e) => setBucketVis(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="private">Private (Signed URLs only)</option>
                  <option value="public">Public Read (Open CDN-cacheable)</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Create Bucket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Signed URL Modal */}
      {isSignedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Generate Signed Access URL</h2>
              <button onClick={() => setIsSignedOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-[12.5px] text-muted-foreground">
                Generate a temporary URL that grants read-only visibility access to the private file <span className="font-semibold text-foreground">{activeFile.name}</span>.
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Expiration time (Hours)</label>
                  <select 
                    value={signedHours} onChange={(e) => setSignedHours(e.target.value)}
                    className="h-9 w-full rounded border border-border bg-background px-2 text-[12px] text-foreground"
                  >
                    <option value="1">1 hour</option>
                    <option value="24">24 hours</option>
                    <option value="168">7 days (max)</option>
                  </select>
                </div>
                <button 
                  onClick={handleGenerateSignedUrl}
                  className="h-9 px-4 rounded bg-foreground text-[12px] font-medium text-background hover:opacity-90 cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Code
                </button>
              </div>
              {generatedSignedUrl && (
                <div className="rounded-md border border-border bg-background px-3 py-2 flex items-center justify-between gap-4 font-mono text-[11px] text-foreground mt-3">
                  <span className="truncate break-all">{generatedSignedUrl}</span>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(generatedSignedUrl);
                        showToast("Copied signed URL!");
                    }}
                    className="rounded border border-border p-1 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}
              <div className="flex justify-end pt-2 border-t border-border">
                <button onClick={() => setIsSignedOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>);
}

function Field({ label, value }) {
    return (<div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[12.5px] font-semibold text-foreground">{value}</div>
    </div>);
}
