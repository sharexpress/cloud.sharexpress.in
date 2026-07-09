import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { KeyRound, RefreshCw, Trash2, X, Check, Copy } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { generateKey, rotateKey, revokeKey } from "../store/index.js";

export const Route = createFileRoute("/api-keys")({
    head: () => ({ meta: [{ title: "API Keys — Nimbus" }] }),
    component: ApiKeysPage,
});

function ApiKeysPage() {
    const dispatch = useDispatch();
    const apiKeys = useSelector((state) => state.apiKeys.list);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSecretOpen, setIsSecretOpen] = useState(false);
    
    const [keyName, setKeyName] = useState("");
    const [keyScope, setKeyScope] = useState("Deploy");
    const [generatedSecret, setGeneratedSecret] = useState("");
    
    // Toast Simulator
    const [toastMessage, setToastMessage] = useState("");
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleCreateKey = (e) => {
        e.preventDefault();
        if (!keyName.trim()) return;

        const secretToken = `sk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
        dispatch(generateKey({
            name: keyName.trim(),
            scope: keyScope,
        }));

        setGeneratedSecret(secretToken);
        setKeyName("");
        setIsCreateOpen(false);
        setIsSecretOpen(true);
    };

    const handleRotate = (id) => {
        if (confirm("Are you sure you want to rotate this key? Existing integrations using this token will break immediately.")) {
            dispatch(rotateKey(id));
            showToast("API Key rotated. New hash registered.");
        }
    };

    const handleRevoke = (id) => {
        if (confirm("Are you sure you want to revoke this API Key? This action is permanent.")) {
            dispatch(revokeKey(id));
            showToast("API Key revoked.");
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        showToast("Copied to clipboard!");
    };

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "API Keys" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="API Keys" description="Programmatic access to the Nimbus API and CLI." actions={
            <button 
                onClick={() => setIsCreateOpen(true)}
                className="h-8 rounded-md bg-accent px-3 text-[12px] font-medium text-accent-foreground hover:opacity-90 transition-opacity cursor-pointer"
            >
                Generate key
            </button>
        }/>

        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
            <KeyRound className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-[14px] font-semibold text-foreground">No API Keys</h3>
            <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">Generate programmatic keys to trigger deployments from your CI/CD pipelines.</p>
          </div>
        ) : (
          <Panel padded={false}>
            <ul className="divide-y divide-border">
              {apiKeys.map((k) => (<li key={k.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                      <KeyRound className="h-4 w-4"/>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[13.5px] font-medium text-foreground">{k.name}</div>
                      <div className="truncate font-mono text-[11px] text-muted-foreground">{k.prefix}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden md:inline rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground uppercase">{k.scope}</span>
                    <span className="hidden md:inline text-[11px] text-muted-foreground">used {k.lastUsed}</span>
                    <button 
                        onClick={() => handleRotate(k.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Rotate key"
                    >
                        <RefreshCw className="h-3.5 w-3.5"/>
                    </button>
                    <button 
                        onClick={() => handleRevoke(k.id)}
                        className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-destructive cursor-pointer transition-colors"
                        title="Revoke key"
                    >
                        <Trash2 className="h-3.5 w-3.5"/>
                    </button>
                  </div>
                </li>))}
            </ul>
          </Panel>
        )}
      </PageShell>

      {/* Generate API Key Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Generate API Key</h2>
              <button onClick={() => setIsCreateOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateKey} className="p-5 space-y-4">
              <div>
                <label className="block text-[11.5px] text-muted-foreground">Key Name</label>
                <input 
                  type="text" required placeholder="e.g. Jenkins CI/CD" value={keyName} onChange={(e) => setKeyName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11.5px] text-muted-foreground font-medium mb-1">Scope</label>
                <select 
                  value={keyScope} onChange={(e) => setKeyScope(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2 text-[12.5px] text-foreground focus:border-accent focus:outline-none"
                >
                  <option value="Admin">Full Admin Access</option>
                  <option value="Deploy">Deployments Trigger Only</option>
                  <option value="Read">Read-only Metadata</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
                <button type="submit" className="h-9 px-4 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer">Generate Key</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reveal Secret Token Modal */}
      {isSecretOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-success">API Key Created Successfully</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded border border-warning/20 bg-warning/5 p-3 text-[12px] text-warning">
                <strong>IMPORTANT:</strong> Copy this secret token now. You will not be able to view it again.
              </div>
              <div className="rounded-md border border-border bg-background px-3 py-2.5 flex items-center justify-between gap-4 font-mono text-[12px] text-foreground">
                <span className="truncate break-all">{generatedSecret}</span>
                <button 
                  onClick={() => handleCopy(generatedSecret)}
                  className="rounded border border-border p-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                <button 
                  onClick={() => {
                    setIsSecretOpen(false);
                    setGeneratedSecret("");
                  }} 
                  className="h-9 px-5 rounded bg-foreground text-[12.5px] font-medium text-background hover:opacity-90 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </AppShell>);
}
