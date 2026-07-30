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
import { PageShell, PageHeader, Panel, Metric, AreaChart } from "@/components/app/primitives";
import { CreditCard, Download, X, Check } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changePlan } from "../store/index.js";

export const Route = createFileRoute("/billing")({
    head: () => ({ meta: [{ title: "Billing — Sharexpress Cloud" }] }),
    component: BillingPage,
});

const pricingOptions = [
    { name: "Starter", price: "$20/mo", desc: "For hobbyists and early-stage prototypes.", limits: "500 GB bandwidth · 1,000 hrs compute" },
    { name: "Pro", price: "$120/mo", desc: "For scaling production apps and medium teams.", limits: "2 TB bandwidth · 5,000 hrs compute" },
    { name: "Enterprise", price: "$4,800/mo", desc: "For large enterprise clusters with dedicated SLAs.", limits: "10 TB bandwidth · Unlimited compute" },
];

function BillingPage() {
    const dispatch = useDispatch();
    const billing = useSelector((state) => state.billing);
    const invoices = useSelector((state) => state.billing.invoices);
    
    const [isPlanOpen, setIsPlanOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handlePlanSelect = (planName, amount) => {
        dispatch(changePlan({ plan: planName, amount }));
        setIsPlanOpen(false);
        showToast(`Successfully switched subscription to the ${planName} plan!`);
    };

    const handleDownload = (invoiceId) => {
        showToast(`Downloading invoice ${invoiceId}...`);
    };

    // Helper functions for mock charts
    const metricSeries = (seed, len = 32, base = 40, spread = 40) => {
        const out = [];
        for (let i = 0; i < len; i++) {
            const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
            out.push(Math.max(4, Math.min(100, Math.round(v))));
        }
        return out;
    };

    const breakdown = [
        { label: "Compute", amount: "$1,842.20", pct: 38 },
        { label: "Bandwidth", amount: "$942.10", pct: 20 },
        { label: "Storage", amount: "$612.44", pct: 13 },
        { label: "Databases", amount: "$742.10", pct: 15 },
        { label: "Functions", amount: "$310.80", pct: 6 },
        { label: "Add-ons", amount: "$362.80", pct: 8 },
    ];

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Billing" }]}>
      <PageShell>
        
        {toastMessage && (
            <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-md bg-foreground px-4 py-3 text-[12.5px] font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-5">
                <Check className="h-4 w-4 text-success" />
                {toastMessage}
            </div>
        )}

        <PageHeader title="Billing" description={`Current plan: ${billing.subscription.plan} · next bill due ${billing.subscription.nextBill}`} actions={
            <button 
                onClick={() => setIsPlanOpen(true)}
                className="h-8 rounded-md border border-border bg-surface px-3 text-[12px] text-foreground hover:border-border-strong cursor-pointer transition-colors"
            >
                Manage plan
            </button>
        }/>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Current month" value={billing.subscription.amount === "$4,800/mo" ? "$4,812" : "$142"} hint="Jun 2026 · projected" delta={{ value: "+9.1%", positive: false }}/>
          <Metric label="Last month" value="$4,412" hint="May 2026"/>
          <Metric label="Annual run rate" value={billing.subscription.plan === "Enterprise" ? "$52.8k" : "$1.7k"} hint="based on trailing 3 months"/>
          <Metric label="Payment method" value="•••• 4242" hint="Visa · exp 09/28" icon={<CreditCard className="h-3.5 w-3.5"/>}/>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Panel title="Usage · month to date" className="lg:col-span-2">
            <AreaChart data={metricSeries(81, 48, 60, 60)} unit="USD"/>
          </Panel>
          <Panel title="Cost breakdown">
            <div className="space-y-3">
              {breakdown.map((b) => (<div key={b.label}>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-foreground">{b.label}</span>
                    <span className="text-muted-foreground tabular-nums">{b.amount}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${b.pct}%` }}/>
                  </div>
                </div>))}
            </div>
          </Panel>
        </div>

        <Panel title="Invoices" className="mt-6" padded={false}>
          <ul className="divide-y divide-border">
            {invoices.map((inv) => (<li key={inv.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] items-center gap-4 px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">Invoice · {inv.period}</div>
                  <div className="truncate text-[11px] text-muted-foreground">{inv.id} · issued {inv.issued}</div>
                </div>
                <span className="text-[13px] font-medium text-foreground tabular-nums">{inv.amount}</span>
                <span className="rounded-full border border-success/25 bg-success/15 px-2 py-0.5 text-[11px] font-medium text-success capitalize">{inv.status}</span>
                <button 
                    onClick={() => handleDownload(inv.id)}
                    className="grid h-7 w-7 place-items-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                    <Download className="h-3.5 w-3.5"/>
                </button>
              </li>))}
          </ul>
        </Panel>
      </PageShell>

      {/* Subscription Plan Modal */}
      {isPlanOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg border border-border bg-surface rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-[14px] font-semibold text-foreground">Manage Subscription Plan</h2>
              <button onClick={() => setIsPlanOpen(false)} className="rounded p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid gap-3">
                {pricingOptions.map(opt => (
                    <div 
                        key={opt.name} 
                        className={`border rounded-lg p-4 cursor-pointer hover:border-accent hover:bg-background/40 transition-all flex justify-between items-start gap-4 ${billing.subscription.plan === opt.name ? "border-accent bg-accent/5" : "border-border bg-background"}`}
                        onClick={() => handlePlanSelect(opt.name, opt.price)}
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold text-foreground">{opt.name}</span>
                                {billing.subscription.plan === opt.name && (
                                    <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[9px] font-medium text-accent">Active</span>
                                )}
                            </div>
                            <p className="text-[11.5px] text-muted-foreground">{opt.desc}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{opt.limits}</p>
                        </div>
                        <div className="text-[15px] font-bold text-foreground shrink-0">{opt.price}</div>
                    </div>
                ))}
              </div>
              <div className="flex justify-end pt-2 border-t border-border">
                <button onClick={() => setIsPlanOpen(false)} className="h-9 px-4 rounded border border-border bg-surface text-[12.5px] text-foreground hover:bg-surface-elevated hover:border-border-strong cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>);
}
