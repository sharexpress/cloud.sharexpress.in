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
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { ArrowRight, BookOpen, Code2, Rocket, Terminal, X, Check } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/docs")({
    head: () => ({ meta: [{ title: "Documentation — Nimbus" }] }),
    component: DocsPage,
});

const docGuides = {
    "Quickstart": {
        title: "Quickstart Guide",
        content: (
            <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground">Get started on the Nimbus cloud control plane by installing our CLI, authenticating, and launching your first application cluster.</p>
                <div className="rounded-md border border-border bg-background p-4 font-mono text-[12.5px] text-foreground">
                    <div className="text-muted-foreground"># Install global Nimbus Command Line CLI</div>
                    <div><span className="text-accent">$</span> npm i -g @nimbus/cli</div>
                    <div className="mt-3 text-muted-foreground"># Login to authenticate with your organization credentials</div>
                    <div><span className="text-accent">$</span> nimbus login</div>
                    <div className="mt-3 text-muted-foreground"># Trigger a live edge deploy directly from codebase directory</div>
                    <div><span className="text-accent">$</span> nimbus deploy --prod</div>
                    <div className="mt-3 text-success font-semibold">✓ Deployment active at https://acme.com (edge version v1.0.0)</div>
                </div>
            </div>
        )
    },
    "Concepts": {
        title: "Platform Concepts",
        content: (
            <div className="space-y-3 text-[13px] text-muted-foreground">
                <p>Nimbus matches Vercel's developer experience with AWS's robust service catalog. Here are the core abstractions:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong className="text-foreground">Projects:</strong> Code bases tied directly to GitHub repos that deploy automatically on git push events.</li>
                    <li><strong className="text-foreground">Compute:</strong> High-performance Dockerized edge container instances scaled on-demand.</li>
                    <li><strong className="text-foreground">Databases:</strong> Fully managed multi-region relational (PostgreSQL) and key-value (Redis) clusters.</li>
                    <li><strong className="text-foreground">Object Storage:</strong> Cloudinary-optimized media pipelines paired with AWS S3 block storage buckets.</li>
                </ul>
            </div>
        )
    },
    "CLI setup": {
        title: "CLI Setup Guide",
        content: (
            <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground">Setup the CLI securely using environment variables or configuration files for automated Jenkins/GitHub Actions pipelines.</p>
                <div className="rounded-md border border-border bg-background p-4 font-mono text-[12.5px] text-foreground">
                    <div className="text-muted-foreground"># Authenticate headless using API Key tokens</div>
                    <div><span className="text-accent">$</span> export NIMBUS_TOKEN=sk_live_jenkins_token_2026</div>
                    <div><span className="text-accent">$</span> nimbus whoami</div>
                    <div className="mt-2 text-muted-foreground">Logged in as Acme Jenkins CI (Organization: Acme Inc)</div>
                </div>
            </div>
        )
    },
    "Projects": {
        title: "API Reference: Projects API",
        content: (
            <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground">Create, list, or terminate Vercel-style deployment projects programmatically.</p>
                <div className="rounded-md border border-border bg-background p-4 font-mono text-[12.5px] text-foreground">
                    <div className="text-muted-foreground">POST https://api.nimbus.com/v1/projects</div>
                    <div className="text-muted-foreground">Headers: Authorization: Bearer sk_live_...</div>
                    <div className="text-accent mt-2">Request Body:</div>
                    <div className="text-muted-foreground">{`{ "name": "docs-api", "repo": "acme/docs", "region": "fra1" }`}</div>
                </div>
            </div>
        )
    },
    "TypeScript": {
        title: "SDK Reference: TypeScript / Node",
        content: (
            <div className="space-y-3">
                <p className="text-[13px] text-muted-foreground">Official TypeScript client library to manage serverless functions and object storage files.</p>
                <div className="rounded-md border border-border bg-background p-4 font-mono text-[12.5px] text-foreground">
                     <div><span className="text-accent font-semibold">import</span> {`{ Nimbus }`} <span className="text-accent font-semibold">from</span> <span className="text-success font-semibold">"@nimbus/sdk"</span>;</div>
                    <div className="mt-1"><span className="text-accent font-semibold">const</span> nimbus = <span className="text-accent font-semibold">new</span> Nimbus({`{ token: "sk_live_..." }`});</div>
                    <div className="mt-2 text-muted-foreground">// trigger a serverless function invocation</div>
                    <div><span className="text-accent font-semibold">await</span> nimbus.functions.invoke(<span className="text-success font-semibold">"resize-image"</span>, {`{ fileId: "f_12" }`});</div>
                </div>
            </div>
        )
    }
};

const sections = [
    { icon: Rocket, title: "Getting started", desc: "Deploy your first project in under 60 seconds.", links: ["Quickstart", "Concepts", "CLI setup"] },
    { icon: Code2, title: "API reference", desc: "Every endpoint, typed and documented.", links: ["Projects", "Deployments"] },
    { icon: Terminal, title: "CLI", desc: "Ship from your terminal with `nimbus deploy`.", links: ["Install", "Auth"] },
    { icon: BookOpen, title: "SDKs", desc: "Official clients for modern tech stacks.", links: ["TypeScript", "Go"] },
];

function DocsPage() {
    const [selectedGuide, setSelectedGuide] = useState("Quickstart");
    const activeGuide = docGuides[selectedGuide] || docGuides["Quickstart"];

    return (<AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Documentation" }]}>
      <PageShell>
        <PageHeader title="Documentation" description="Everything you need to build and scale containers on Nimbus."/>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (<div key={s.title} className="rounded-lg border border-border bg-surface p-5 hover:border-border-strong transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground">
                  <s.icon className="h-4 w-4 text-accent"/>
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">{s.title}</div>
                  <div className="text-[12px] text-muted-foreground">{s.desc}</div>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-1">
                {s.links.map((l) => (<li key={l}>
                    <button 
                        onClick={() => setSelectedGuide(l)}
                        className={`group flex w-full items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] text-left transition-colors cursor-pointer ${selectedGuide === l ? "bg-surface-elevated text-foreground font-semibold" : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"}`}
                    >
                      {l}
                      <ArrowRight className={`h-3 w-3 transition-all ${selectedGuide === l ? "opacity-100 translate-x-0.5" : "opacity-0 group-hover:opacity-100"}`}/>
                    </button>
                  </li>))}
              </ul>
            </div>))}
        </div>

        <Panel title={activeGuide.title} className="mt-6">
          {activeGuide.content}
        </Panel>
      </PageShell>
    </AppShell>);
}
