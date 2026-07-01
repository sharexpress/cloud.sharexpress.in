import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell, PageHeader, Panel } from "@/components/app/primitives";
import { ArrowRight, BookOpen, Code2, Rocket, Terminal } from "lucide-react";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Documentation — Nimbus" }] }),
  component: DocsPage,
});

const sections = [
  { icon: Rocket, title: "Getting started", desc: "Deploy your first project in under 60 seconds.", links: ["Quickstart", "Concepts", "CLI setup", "Frameworks"] },
  { icon: Code2, title: "API reference", desc: "Every endpoint, typed and documented.", links: ["Projects", "Deployments", "Storage", "Functions"] },
  { icon: Terminal, title: "CLI", desc: "Ship from your terminal with `nimbus deploy`.", links: ["Install", "Auth", "Deploy", "Environments"] },
  { icon: BookOpen, title: "SDKs", desc: "Official clients for TypeScript, Go, Python, and Rust.", links: ["TypeScript", "Go", "Python", "Rust"] },
];

function DocsPage() {
  return (
    <AppShell breadcrumbs={[{ label: "Acme Inc" }, { label: "Documentation" }]}>
      <PageShell>
        <PageHeader title="Documentation" description="Everything you need to build on Nimbus." />

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <div key={s.title} className="rounded-lg border border-border bg-surface p-5 hover:border-border-strong">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-md border border-border bg-background text-foreground">
                  <s.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">{s.title}</div>
                  <div className="text-[12px] text-muted-foreground">{s.desc}</div>
                </div>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-1">
                {s.links.map((l) => (
                  <li key={l}>
                    <a className="group flex items-center justify-between rounded-md px-2 py-1.5 text-[12.5px] text-muted-foreground hover:bg-surface-elevated hover:text-foreground" href="#">
                      {l}
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Panel title="Quickstart" className="mt-6">
          <div className="rounded-md border border-border bg-background p-4 font-mono text-[12.5px] text-foreground">
            <div className="text-muted-foreground"># install the CLI</div>
            <div><span className="text-accent">$</span> npm i -g @nimbus/cli</div>
            <div className="mt-3 text-muted-foreground"># log in and deploy</div>
            <div><span className="text-accent">$</span> nimbus login</div>
            <div><span className="text-accent">$</span> nimbus deploy --prod</div>
            <div className="mt-3 text-muted-foreground">✓ Deployed to https://acme.com in 42s</div>
          </div>
        </Panel>
      </PageShell>
    </AppShell>
  );
}
