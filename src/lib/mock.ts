// Mock data for the cloud platform prototype. Deterministic — no randomness at import.

export type DeployStatus = "ready" | "building" | "queued" | "error" | "canceled";
export type Region = "iad1" | "sfo1" | "fra1" | "sin1" | "syd1";

export interface Project {
  id: string;
  name: string;
  slug: string;
  framework: string;
  repo: string;
  branch: string;
  domain: string;
  updatedAt: string;
  status: DeployStatus;
  region: Region;
  environment: "production" | "preview";
}

export const projects: Project[] = [
  { id: "p_01", name: "Acme Marketing", slug: "acme-marketing", framework: "Next.js", repo: "acme/marketing", branch: "main", domain: "acme.com", updatedAt: "2m ago", status: "ready", region: "iad1", environment: "production" },
  { id: "p_02", name: "Payments API", slug: "payments-api", framework: "Node.js", repo: "acme/payments", branch: "main", domain: "api.acme.com", updatedAt: "14m ago", status: "building", region: "iad1", environment: "production" },
  { id: "p_03", name: "Docs", slug: "docs", framework: "Astro", repo: "acme/docs", branch: "main", domain: "docs.acme.com", updatedAt: "1h ago", status: "ready", region: "fra1", environment: "production" },
  { id: "p_04", name: "Admin Dashboard", slug: "admin", framework: "Vite + React", repo: "acme/admin", branch: "release/2.4", domain: "admin.acme.com", updatedAt: "3h ago", status: "ready", region: "iad1", environment: "production" },
  { id: "p_05", name: "Image Pipeline", slug: "image-pipeline", framework: "Rust", repo: "acme/image-pipeline", branch: "main", domain: "img.acme.com", updatedAt: "yesterday", status: "error", region: "sfo1", environment: "production" },
  { id: "p_06", name: "Storybook", slug: "storybook", framework: "Storybook", repo: "acme/design", branch: "main", domain: "storybook.acme.com", updatedAt: "2d ago", status: "ready", region: "iad1", environment: "preview" },
  { id: "p_07", name: "Auth Service", slug: "auth", framework: "Go", repo: "acme/auth", branch: "main", domain: "auth.acme.com", updatedAt: "3d ago", status: "ready", region: "sin1", environment: "production" },
  { id: "p_08", name: "Realtime Gateway", slug: "realtime", framework: "Bun", repo: "acme/realtime", branch: "main", domain: "rt.acme.com", updatedAt: "4d ago", status: "queued", region: "syd1", environment: "preview" },
];

export interface Deployment {
  id: string;
  project: string;
  status: DeployStatus;
  branch: string;
  commit: string;
  message: string;
  author: string;
  authorAvatar: string;
  duration: string;
  environment: "production" | "preview";
  createdAt: string;
  url: string;
}

export const deployments: Deployment[] = [
  { id: "dpl_9f2a", project: "Acme Marketing", status: "ready", branch: "main", commit: "a1b2c3d", message: "feat(pricing): add enterprise tier", author: "Jordan Lee", authorAvatar: "JL", duration: "42s", environment: "production", createdAt: "2m ago", url: "acme.com" },
  { id: "dpl_8e1b", project: "Payments API", status: "building", branch: "main", commit: "b2c3d4e", message: "chore: bump stripe-node to 15.2", author: "Priya Shah", authorAvatar: "PS", duration: "0:38", environment: "production", createdAt: "14m ago", url: "api.acme.com" },
  { id: "dpl_7d0c", project: "Docs", status: "ready", branch: "main", commit: "c3d4e5f", message: "docs: rewrite deployment guide", author: "Marcus Chen", authorAvatar: "MC", duration: "18s", environment: "production", createdAt: "1h ago", url: "docs.acme.com" },
  { id: "dpl_6c9d", project: "Admin Dashboard", status: "ready", branch: "release/2.4", commit: "d4e5f6a", message: "fix(table): virtualize on 1k+ rows", author: "Nina Park", authorAvatar: "NP", duration: "1m 4s", environment: "production", createdAt: "3h ago", url: "admin.acme.com" },
  { id: "dpl_5b8e", project: "Image Pipeline", status: "error", branch: "main", commit: "e5f6a7b", message: "refactor: switch to zstd", author: "Sam Rivera", authorAvatar: "SR", duration: "2m 11s", environment: "production", createdAt: "yesterday", url: "img.acme.com" },
  { id: "dpl_4a7f", project: "Storybook", status: "ready", branch: "main", commit: "f6a7b8c", message: "feat: add color contrast checker", author: "Jordan Lee", authorAvatar: "JL", duration: "51s", environment: "preview", createdAt: "2d ago", url: "storybook.acme.com" },
  { id: "dpl_3960", project: "Auth Service", status: "ready", branch: "main", commit: "a7b8c9d", message: "perf: cache JWKs for 10m", author: "Priya Shah", authorAvatar: "PS", duration: "38s", environment: "production", createdAt: "3d ago", url: "auth.acme.com" },
  { id: "dpl_2851", project: "Realtime Gateway", status: "queued", branch: "main", commit: "b8c9d0e", message: "wip: presence channels", author: "Marcus Chen", authorAvatar: "MC", duration: "—", environment: "preview", createdAt: "4d ago", url: "rt.acme.com" },
  { id: "dpl_1742", project: "Acme Marketing", status: "canceled", branch: "feat/hero", commit: "c9d0e1f", message: "hero: try new video treatment", author: "Nina Park", authorAvatar: "NP", duration: "12s", environment: "preview", createdAt: "5d ago", url: "hero-feat-acme.preview.app" },
];

export const activity = [
  { id: 1, who: "Jordan Lee", initials: "JL", verb: "deployed", target: "Acme Marketing", meta: "production · a1b2c3d", time: "2m ago" },
  { id: 2, who: "Priya Shah", initials: "PS", verb: "invited", target: "sam@acme.com", meta: "as Developer", time: "1h ago" },
  { id: 3, who: "Marcus Chen", initials: "MC", verb: "rotated key", target: "prod_api_key", meta: "for Payments API", time: "3h ago" },
  { id: 4, who: "Nina Park", initials: "NP", verb: "added domain", target: "admin.acme.com", meta: "SSL issued", time: "yesterday" },
  { id: 5, who: "Sam Rivera", initials: "SR", verb: "resolved incident", target: "INC-241", meta: "eu-west latency", time: "2d ago" },
  { id: 6, who: "Jordan Lee", initials: "JL", verb: "updated env", target: "STRIPE_KEY", meta: "Payments API", time: "3d ago" },
];

export const databases = [
  { id: "db_1", name: "primary-pg", engine: "PostgreSQL 16", size: "8 GB", region: "iad1", status: "healthy", cpu: 22, storage: 41 },
  { id: "db_2", name: "cache-redis", engine: "Redis 7.2", size: "2 GB", region: "iad1", status: "healthy", cpu: 8, storage: 12 },
  { id: "db_3", name: "events-mongo", engine: "MongoDB 7", size: "16 GB", region: "fra1", status: "healthy", cpu: 34, storage: 58 },
  { id: "db_4", name: "legacy-mysql", engine: "MySQL 8", size: "4 GB", region: "sfo1", status: "degraded", cpu: 71, storage: 78 },
];

export const compute = [
  { id: "c_1", name: "web-edge", type: "Edge", replicas: 12, region: "global", cpu: 34, memory: 41, status: "healthy" },
  { id: "c_2", name: "api-core", type: "Container", replicas: 4, region: "iad1", cpu: 62, memory: 55, status: "healthy" },
  { id: "c_3", name: "workers-images", type: "Container", replicas: 6, region: "fra1", cpu: 81, memory: 74, status: "scaling" },
  { id: "c_4", name: "cron-nightly", type: "Job", replicas: 1, region: "iad1", cpu: 3, memory: 8, status: "idle" },
];

export const functions = [
  { id: "fn_1", name: "on-signup", runtime: "Node 20", trigger: "HTTP", invocations: "128.4k", errors: "0.02%", p95: "42ms" },
  { id: "fn_2", name: "resize-image", runtime: "Rust", trigger: "Storage", invocations: "1.2M", errors: "0.11%", p95: "88ms" },
  { id: "fn_3", name: "send-receipt", runtime: "Node 20", trigger: "Queue", invocations: "48.9k", errors: "0.00%", p95: "121ms" },
  { id: "fn_4", name: "webhook-stripe", runtime: "Bun", trigger: "HTTP", invocations: "22.1k", errors: "0.05%", p95: "31ms" },
];

export const domains = [
  { id: "d_1", host: "acme.com", project: "Acme Marketing", status: "active", ssl: "valid", expires: "in 82 days" },
  { id: "d_2", host: "api.acme.com", project: "Payments API", status: "active", ssl: "valid", expires: "in 82 days" },
  { id: "d_3", host: "docs.acme.com", project: "Docs", status: "active", ssl: "valid", expires: "in 82 days" },
  { id: "d_4", host: "img.acme.com", project: "Image Pipeline", status: "pending", ssl: "issuing", expires: "—" },
];

export const secrets = [
  { id: "s_1", key: "STRIPE_SECRET_KEY", scope: "Payments API", environment: "production", updated: "3d ago" },
  { id: "s_2", key: "DATABASE_URL", scope: "All projects", environment: "production", updated: "2w ago" },
  { id: "s_3", key: "SENTRY_DSN", scope: "All projects", environment: "production", updated: "1mo ago" },
  { id: "s_4", key: "OPENAI_API_KEY", scope: "Acme Marketing", environment: "preview", updated: "1w ago" },
  { id: "s_5", key: "CDN_SIGNING_KEY", scope: "Image Pipeline", environment: "production", updated: "yesterday" },
];

export const buckets = [
  { id: "b_1", name: "acme-media", size: "412.8 GB", objects: "1,284,911", region: "global", visibility: "private" },
  { id: "b_2", name: "acme-uploads", size: "88.4 GB", objects: "312,004", region: "iad1", visibility: "public" },
  { id: "b_3", name: "acme-backups", size: "1.2 TB", objects: "9,822", region: "fra1", visibility: "private" },
];

export const mediaFiles = [
  { id: "f_1", name: "hero-desktop.jpg", type: "image", size: "812 KB", updated: "2m ago" },
  { id: "f_2", name: "hero-mobile.jpg", type: "image", size: "184 KB", updated: "2m ago" },
  { id: "f_3", name: "product-tour.mp4", type: "video", size: "24.1 MB", updated: "1h ago" },
  { id: "f_4", name: "logo-dark.svg", type: "image", size: "3 KB", updated: "yesterday" },
  { id: "f_5", name: "logo-light.svg", type: "image", size: "3 KB", updated: "yesterday" },
  { id: "f_6", name: "og-launch.png", type: "image", size: "412 KB", updated: "2d ago" },
  { id: "f_7", name: "keynote.mov", type: "video", size: "180 MB", updated: "1w ago" },
  { id: "f_8", name: "brand-guidelines.pdf", type: "doc", size: "6.4 MB", updated: "2w ago" },
  { id: "f_9", name: "avatar-jl.png", type: "image", size: "18 KB", updated: "3w ago" },
  { id: "f_10", name: "avatar-ps.png", type: "image", size: "22 KB", updated: "3w ago" },
  { id: "f_11", name: "avatar-mc.png", type: "image", size: "20 KB", updated: "3w ago" },
  { id: "f_12", name: "avatar-np.png", type: "image", size: "19 KB", updated: "3w ago" },
];

export const team = [
  { id: "u_1", name: "Jordan Lee", email: "jordan@acme.com", role: "Owner", initials: "JL", lastActive: "just now" },
  { id: "u_2", name: "Priya Shah", email: "priya@acme.com", role: "Admin", initials: "PS", lastActive: "12m ago" },
  { id: "u_3", name: "Marcus Chen", email: "marcus@acme.com", role: "Developer", initials: "MC", lastActive: "1h ago" },
  { id: "u_4", name: "Nina Park", email: "nina@acme.com", role: "Developer", initials: "NP", lastActive: "3h ago" },
  { id: "u_5", name: "Sam Rivera", email: "sam@acme.com", role: "Billing", initials: "SR", lastActive: "yesterday" },
  { id: "u_6", name: "Alex Ortiz", email: "alex@acme.com", role: "Viewer", initials: "AO", lastActive: "3d ago" },
];

export const invoices = [
  { id: "inv_2026_06", period: "Jun 2026", amount: "$4,812.44", status: "paid", issued: "Jul 1" },
  { id: "inv_2026_05", period: "May 2026", amount: "$4,412.10", status: "paid", issued: "Jun 1" },
  { id: "inv_2026_04", period: "Apr 2026", amount: "$3,988.72", status: "paid", issued: "May 1" },
  { id: "inv_2026_03", period: "Mar 2026", amount: "$3,721.30", status: "paid", issued: "Apr 1" },
];

export const apiKeys = [
  { id: "k_1", name: "Production CI", prefix: "sk_live_9f2a…c1", scope: "Deploy", created: "3mo ago", lastUsed: "2m ago" },
  { id: "k_2", name: "Local dev", prefix: "sk_test_1a4b…9e", scope: "Read", created: "1mo ago", lastUsed: "1h ago" },
  { id: "k_3", name: "Terraform", prefix: "sk_live_7d0c…4f", scope: "Admin", created: "6mo ago", lastUsed: "yesterday" },
];

export const logLines = [
  { t: "12:04:22.108", level: "info", svc: "web-edge", msg: 'GET /api/checkout 200 42ms — session=cs_a1b2' },
  { t: "12:04:22.041", level: "info", svc: "api-core", msg: "cache HIT users:1284 (ttl 58s)" },
  { t: "12:04:21.987", level: "warn", svc: "workers-images", msg: "slow transform 812ms > budget 500ms" },
  { t: "12:04:21.822", level: "info", svc: "web-edge", msg: "POST /api/track 204 8ms" },
  { t: "12:04:21.611", level: "error", svc: "workers-images", msg: "ENOSPC writing /tmp/frame-9812.png — retrying" },
  { t: "12:04:21.402", level: "info", svc: "api-core", msg: "pg query 34ms — SELECT * FROM invoices LIMIT 20" },
  { t: "12:04:21.188", level: "info", svc: "web-edge", msg: "GET / 200 12ms — cf-edge=iad1" },
  { t: "12:04:20.991", level: "debug", svc: "auth", msg: "verified JWT for user_1284" },
  { t: "12:04:20.812", level: "info", svc: "api-core", msg: "queued job resize-image#f_1" },
  { t: "12:04:20.611", level: "warn", svc: "auth", msg: "rate limit 88/100 for ip 203.0.113.44" },
];

export function metricSeries(seed: number, len = 32, base = 40, spread = 40) {
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    const v = Math.sin((i + seed) * 0.6) * (spread / 2) + Math.cos((i + seed) * 0.31) * (spread / 4) + base;
    out.push(Math.max(4, Math.min(100, Math.round(v))));
  }
  return out;
}
