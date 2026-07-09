import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel, StatusBadge } from "@/components/app/primitives";
import { Copy, Database, X, Check, RefreshCw, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addDatabase, restartDatabase, completeDatabaseRestart } from "../store/index.js";

export const Route = createFileRoute("/databases")({
    head: () => ({ meta: [{ title: "Databases — Nimbus" }] }),
    component: DatabasesPage,
});

function DatabasesPage() {
    const dispatch = useDispatch();
    const databases = useSelector((state) => state.databases.list);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [copiedId, setCopiedId] = useState("");
    
    // Form fields
    const [name, setName] = useState("");
    const [engine, setEngine] = useState("PostgreSQL 16");
    const [region, setRegion] = useState("iad1");
    const [size, setSize] = useState("8 GB");

    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    // Watch for restart completion
    useEffect(() => {
        databases.forEach(db => {
            if (db.status === "restarting") {
                const timer = setTimeout(() => {
                    dispatch(completeDatabaseRestart(db.id));
                    showToast(`Database cluster ${db.name} is now healthy.`);
                }, 2000);
                return () => clearTimeout(timer);
            }
        });
    }, [databases, dispatch]);

    const handleCopy = (id, text) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        showToast("Connection string copied to clipboard!");
        setTimeout(() => setCopiedId(""), 2000);
    };

    const handleRestart = (id, dbName) => {
        dispatch(restartDatabase(id));
        showToast(`Rebooting database cluster ${dbName}...`);
    };

    const handleCreateDb = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        dispatch(addDatabase({
            name: name.trim().toLowerCase(),
            engine,
            region,
            size,
            cpu: 0,
            storage: 0,
        }));

        setName("");
        setIsCreateOpen(false);
        showToast(`Database ${name} is being provisioned!`);
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Databases" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Databases" description="Managed PostgreSQL, Redis, MongoDB, and MySQL clusters." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer animate-in fade-in"
            >
                New database
            </button>
        }/>

        {databases.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <Database className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No Databases</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Provision managed high-availability SQL or NoSQL databases in seconds.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {databases.map((db) => {
              const connStr = `${db.engine.toLowerCase().startsWith("pg") ? "postgres" : db.engine.toLowerCase().startsWith("redis") ? "redis" : db.engine.toLowerCase().startsWith("mongo") ? "mongodb" : "mysql"}://nimbus_user:••••@${db.name}.acme-db.nimbus.host:5432/main`;
              return (
                <div key={db.id} className="rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                        <Database className="h-4 w-4"/>
                      </div>
                      <div>
                        <div className="text-[13.5px] font-semibold text-foreground">{db.name}</div>
                        <div className="text-[11px] text-muted-foreground">{db.engine} · {db.region.toUpperCase()}</div>
                      </div>
                    </div>
                    <StatusBadge status={db.status}/>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
                    <div>
                      <div className="text-[11.5px] text-muted-foreground">Size</div>
                      <div className="mt-0.5 font-semibold text-foreground">{db.size}</div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-muted-foreground">CPU</div>
                      <div className="mt-0.5 font-semibold text-foreground">{db.status === "restarting" ? "0%" : `${db.cpu}%`}</div>
                    </div>
                    <div>
                      <div className="text-[11.5px] text-muted-foreground">Storage</div>
                      <div className="mt-0.5 font-semibold text-foreground">{db.storage}%</div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-md border border-border bg-background px-3 py-2 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Connection string</div>
                      <div className="truncate font-mono text-[11.5px] text-foreground">{connStr}</div>
                    </div>
                    <button 
                        onClick={() => handleCopy(db.id, connStr)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer"
                    >
                      {copiedId === db.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5"/>}
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11.5px] text-muted-foreground">
                    <span>Last backup <span className="text-foreground font-medium">6h ago</span></span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleRestart(db.id, db.name)}
                        className="h-7 rounded border border-border bg-background px-2.5 text-[11px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" /> Restart
                      </button>
                      <button className="h-7 rounded border border-border bg-background px-2.5 text-[11px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Backups</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageShell>

      {/* Provision Database Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Launch Database Instance</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateDb} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Database Cluster Name</label>
                <input 
                  type="text" required placeholder="e.g. users-db" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Engine</label>
                  <select 
                    value={engine} onChange={(e) => setEngine(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option>PostgreSQL 16</option>
                    <option>Redis 7.2</option>
                    <option>MongoDB 7</option>
                    <option>MySQL 8</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] text-muted-foreground">Region</label>
                  <select 
                    value={region} onChange={(e) => setRegion(e.target.value)}
                    className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                  >
                    <option value="iad1">US East (iad1)</option>
                    <option value="sfo1">US West (sfo1)</option>
                    <option value="fra1">Europe (fra1)</option>
                    <option value="sin1">Asia Pacific (sin1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] text-muted-foreground">Storage Allocation</label>
                <select 
                  value={size} onChange={(e) => setSize(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                >
                  <option>1 GB (Micro Sandbox)</option>
                  <option>8 GB (Development Tier)</option>
                  <option>32 GB (Production Standby)</option>
                  <option>128 GB (High Speed IOPS)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Deploy Database</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AppShell>);
}
