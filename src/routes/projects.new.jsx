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

import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { AppShell } from "@/components/app/shell";
import { PageShell } from "@/components/app/primitives";
import { 
  Github, Search, ArrowRight, Check, Plus, Edit3, X, Sparkles, 
  GitBranch, FolderPlus, Terminal, Globe, Cpu, Layers, HelpCircle, ChevronDown, Lock
} from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProjectThunk } from "@/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects/new")({
    head: () => ({ meta: [{ title: "New Resource — Sharexpress Cloud" }] }),
    component: NewProjectOnboardingPage,
});

const MOCK_REPOSITORIES = [
    { name: "santusht06 / leetcode", repoName: "leetcode", updated: "40m ago", branch: "main", language: "TypeScript" },
    { name: "santusht06 / sharexpress", repoName: "sharexpress", updated: "1h ago", branch: "main", language: "JavaScript" },
    { name: "santusht06 / shopground-era", repoName: "shopground-era", updated: "2d ago", branch: "main", language: "TypeScript" },
    { name: "santusht06 / langflow", repoName: "langflow", updated: "3d ago", branch: "main", language: "Python" },
    { name: "santusht06 / vite-template", repoName: "vite-template", updated: "3d ago", branch: "main", language: "JavaScript" },
    { name: "santusht06 / tahrir", repoName: "tahrir", updated: "3d ago", branch: "main", language: "Go" },
    { name: "santusht06 / launch-editor", repoName: "launch-editor", updated: "3d ago", branch: "main", language: "TypeScript" },
];

function NewProjectOnboardingPage() {
    const navigate = useNavigate();
    const search = useSearch({ strict: false });
    const dispatch = useDispatch();
    const activeWsId = useSelector((state) => state.workspaces?.activeWorkspaceId || "ws_acme");

    // Type of service being created (static site, web service, etc)
    const initialType = search?.type === "static" ? "Static Site" : "Web Service";
    const [serviceType, setServiceType] = useState(initialType);
    
    // Step state: 1 = Repo selection, 2 = Service Configuration
    const [step, setStep] = useState(1);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [repoSearchQuery, setRepoSearchQuery] = useState("");
    const [providerTab, setProviderTab] = useState("git"); // git | public

    // Form Configuration State
    const [name, setName] = useState("");
    const [branch, setBranch] = useState("main");
    const [rootDir, setRootDir] = useState("");
    const [buildCommand, setBuildCommand] = useState("npm run build");
    const [publishDir, setPublishDir] = useState("dist");
    const [projectGroup, setProjectGroup] = useState("");
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    
    // Environment Variables State
    const [envVars, setEnvVars] = useState([
        { key: "", value: "" }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const filteredRepos = MOCK_REPOSITORIES.filter(r => 
        r.name.toLowerCase().includes(repoSearchQuery.toLowerCase())
    );

    const handleSelectRepo = (repo) => {
        setSelectedRepo(repo);
        setName(repo.repoName);
        setStep(2);
    };

    const handleAddEnvVar = () => {
        setEnvVars([...envVars, { key: "", value: "" }]);
    };

    const handleEnvChange = (index, field, val) => {
        const updated = [...envVars];
        updated[index][field] = val;
        setEnvVars(updated);
    };

    const handleRemoveEnvVar = (index) => {
        setEnvVars(envVars.filter((_, i) => i !== index));
    };

    const handleGenerateSecret = (index) => {
        const secret = "sec_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        handleEnvChange(index, "value", secret);
    };

    const handleSubmitDeploy = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSubmitting(true);
        try {
            const projectData = {
                name: name.trim(),
                framework: serviceType === "Static Site" ? "Vite + React" : "Next.js",
                type: serviceType === "Static Site" ? "static_site" : "web_service",
                repo: selectedRepo ? selectedRepo.name : "santusht06/" + name,
                branch: branch,
                buildCommand: buildCommand,
                publishDir: publishDir,
                status: "building",
                url: `https://${name.toLowerCase().replace(/[^a-z0-9-]/g, "")}.sharexpress.in`,
            };

            await dispatch(createProjectThunk({ projectData, workspace_id: activeWsId })).unwrap();
            navigate({ to: "/projects" });
        } catch (err) {
            alert(err || "Failed to launch service deployment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AppShell breadcrumbs={[{ label: "Projects" }, { label: `New ${serviceType}` }]}>
            <PageShell>
                <div className="mx-auto max-w-5xl py-4">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                New {serviceType}
                            </h1>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Connect a repository and configure build settings to deploy to Sharexpress Cloud.
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select 
                                value={serviceType} 
                                onChange={(e) => setServiceType(e.target.value)}
                                className="h-8 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground focus:border-[#5F6AD2] focus:outline-none"
                            >
                                <option value="Static Site">Static Site</option>
                                <option value="Web Service">Web Service</option>
                                <option value="Private Service">Private Service</option>
                                <option value="Background Worker">Background Worker</option>
                            </select>
                        </div>
                    </div>

                    {/* Step 1: Repository Selection */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-[200px_1fr] gap-6">
                                <div>
                                    <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">Source Code</h2>
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        Select a Git repository from your connected provider or enter a public Git URL.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Tabs & Credentials */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                                        <div className="flex items-center gap-1 rounded-lg border border-border bg-surface p-0.5 text-xs font-medium">
                                            <button
                                                type="button"
                                                onClick={() => setProviderTab("git")}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                                                    providerTab === "git" ? "bg-[#5F6AD2] text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Git Provider
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setProviderTab("public")}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                                                    providerTab === "public" ? "bg-[#5F6AD2] text-white font-semibold" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                Public Git Repository
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground">
                                            <Github className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="font-mono text-[11px]">Credentials (1)</span>
                                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Search repositories…"
                                            value={repoSearchQuery}
                                            onChange={(e) => setRepoSearchQuery(e.target.value)}
                                            className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Repository List */}
                                    <div className="rounded-lg border border-border bg-surface divide-y divide-border overflow-hidden">
                                        {filteredRepos.map((repo) => (
                                            <div
                                                key={repo.name}
                                                className="flex items-center justify-between px-4 py-3 hover:bg-surface-elevated transition-colors"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <div className="min-w-0">
                                                        <div className="font-mono text-xs font-semibold text-foreground truncate">
                                                            {repo.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                                                            <span>{repo.updated}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 font-mono">
                                                                <GitBranch className="h-2.5 w-2.5" /> {repo.branch}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => handleSelectRepo(repo)}
                                                    className="h-7 px-3.5 rounded bg-surface border border-border hover:border-[#5F6AD2] text-[#5F6AD2] text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shrink-0"
                                                >
                                                    Connect
                                                </button>
                                            </div>
                                        ))}

                                        {filteredRepos.length === 0 && (
                                            <div className="p-8 text-center text-xs text-muted-foreground">
                                                No repositories match "{repoSearchQuery}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configuration Form */}
                    {step === 2 && (
                        <form onSubmit={handleSubmitDeploy} className="space-y-8">
                            {/* Connected Repo Header Badge */}
                            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
                                <div className="flex items-center gap-3 font-mono text-xs text-foreground">
                                    <Github className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-semibold">{selectedRepo?.name}</span>
                                    <span className="text-muted-foreground">• {selectedRepo?.updated}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2.5 py-1 bg-background hover:bg-surface-elevated transition-colors cursor-pointer"
                                >
                                    <Edit3 className="h-3 w-3" /> Edit
                                </button>
                            </div>

                            {/* Form Sections Grid */}
                            <div className="space-y-6 divide-y divide-border/60">
                                {/* Service Name */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-4">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">Name</label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            A unique name for your static site or web service.
                                        </p>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="my-awesome-site"
                                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Project Selection */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-6">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">
                                            Project <span className="text-muted-foreground font-normal">(Optional)</span>
                                        </label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            Add this service to a project once it's created.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border border-border bg-surface p-5 text-center">
                                        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground mb-3">
                                            <FolderPlus className="h-4 w-4" />
                                        </div>
                                        <h3 className="text-xs font-semibold text-foreground">Create a new project to add this to?</h3>
                                        <p className="mt-1 text-[11px] text-muted-foreground max-w-md mx-auto">
                                            Projects allow you to group resources into environments so you can better manage related services.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateProjectModalOpen(true)}
                                            className="mt-4 inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                                        >
                                            <Plus className="h-3.5 w-3.5" /> Create a project
                                        </button>
                                    </div>
                                </div>

                                {/* Branch Selection */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-6">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">Branch</label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            The Git branch to build and deploy from.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <GitBranch className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <select
                                                value={branch}
                                                onChange={(e) => setBranch(e.target.value)}
                                                className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-xs font-mono text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                            >
                                                <option value="main">main</option>
                                                <option value="dev">dev</option>
                                                <option value="staging">staging</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Root Directory */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-6">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">
                                            Root Directory <span className="text-muted-foreground font-normal">(Optional)</span>
                                        </label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            If set, commands run from this directory instead of repository root. Most commonly used with a monorepo.
                                        </p>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={rootDir}
                                            onChange={(e) => setRootDir(e.target.value)}
                                            placeholder="e.g. src or ./apps/web"
                                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Build Command */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-6">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">Build Command</label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            Command executed to build your application before deployment.
                                        </p>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">$</span>
                                            <input
                                                type="text"
                                                value={buildCommand}
                                                onChange={(e) => setBuildCommand(e.target.value)}
                                                placeholder="npm run build"
                                                className="h-10 w-full rounded-md border border-border bg-background pl-7 pr-3 text-xs font-mono text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Publish Directory */}
                                <div className="grid grid-cols-[220px_1fr] gap-6 pt-6">
                                    <div>
                                        <label className="text-xs font-semibold text-foreground">Publish Directory</label>
                                        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                                            The relative path of the directory containing built static assets (e.g. <code className="font-mono text-[10.5px] bg-surface px-1 py-0.5 rounded">./dist</code> or <code className="font-mono text-[10.5px] bg-surface px-1 py-0.5 rounded">./build</code>).
                                        </p>
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={publishDir}
                                            onChange={(e) => setPublishDir(e.target.value)}
                                            placeholder="e.g. dist"
                                            className="h-10 w-full rounded-md border border-border bg-background px-3 text-xs font-mono text-foreground focus:border-[#5F6AD2] focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Environment Variables */}
                                <div className="pt-6">
                                    <div className="mb-4">
                                        <h3 className="text-xs font-semibold text-foreground">Environment Variables</h3>
                                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                                            Set environment-specific config and secrets (such as API keys), then read those values from your code.
                                        </p>
                                    </div>

                                    <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
                                        {envVars.map((env, idx) => (
                                            <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="NAME_OF_VARIABLE"
                                                    value={env.key}
                                                    onChange={(e) => handleEnvChange(idx, "key", e.target.value)}
                                                    className="h-9 rounded-md border border-border bg-background px-3 font-mono text-xs text-foreground uppercase focus:border-[#5F6AD2] focus:outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="value"
                                                    value={env.value}
                                                    onChange={(e) => handleEnvChange(idx, "value", e.target.value)}
                                                    className="h-9 rounded-md border border-border bg-background px-3 font-mono text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleGenerateSecret(idx)}
                                                    className="h-9 px-3 rounded border border-border bg-background hover:bg-surface-elevated text-xs font-medium text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <Sparkles className="h-3.5 w-3.5 text-[#5F6AD2]" /> Generate
                                                </button>
                                                {envVars.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEnvVar(idx)}
                                                        className="h-9 w-9 grid place-items-center rounded border border-border bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        <div className="flex items-center gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={handleAddEnvVar}
                                                className="inline-flex items-center gap-1.5 rounded border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add Environment Variable
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Advanced Section */}
                                <div className="pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-[#5F6AD2] transition-colors cursor-pointer"
                                    >
                                        <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
                                        Advanced Configuration
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-4 rounded-lg border border-border bg-surface p-4 space-y-4 text-xs">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-foreground">Auto-Deploy on Git Push</div>
                                                    <div className="text-[11px] text-muted-foreground">Automatically trigger production builds when code is pushed.</div>
                                                </div>
                                                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#5F6AD2]" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-semibold text-foreground">Pull Request Previews</div>
                                                    <div className="text-[11px] text-muted-foreground">Generate temporary preview environments for incoming PRs.</div>
                                                </div>
                                                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-[#5F6AD2]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Deploy Submit CTA */}
                            <div className="border-t border-border pt-6 flex justify-start">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="h-10 px-6 rounded-md bg-[#5F6AD2] text-xs font-semibold text-white shadow-md shadow-[#5F6AD2]/25 hover:bg-[#4F5ABF] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? "Deploying..." : `Deploy ${serviceType}`}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Inline Create Project Modal */}
                    {isCreateProjectModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                            <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-5 shadow-xl animate-in fade-in zoom-in-95">
                                <h3 className="text-sm font-semibold text-foreground">Create Project</h3>
                                <p className="mt-1 text-xs text-muted-foreground">Group your web services and databases into a logical container.</p>
                                <input
                                    type="text"
                                    placeholder="Project Name (e.g. E-Commerce Suite)"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="mt-4 h-9 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:border-[#5F6AD2] focus:outline-none"
                                />
                                <div className="mt-5 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateProjectModalOpen(false)}
                                        className="h-8 px-3 rounded border border-border text-xs text-foreground hover:bg-surface-elevated"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newProjectName.trim()) {
                                                setProjectGroup(newProjectName.trim());
                                                setIsCreateProjectModalOpen(false);
                                            }
                                        }}
                                        className="h-8 px-4 rounded bg-[#5F6AD2] text-xs font-medium text-white hover:bg-[#4F5ABF]"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PageShell>
        </AppShell>
    );
}
