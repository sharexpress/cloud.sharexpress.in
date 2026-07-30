# Sharexpress Cloud — Backend Architecture Plan

## Background

Sharexpress Cloud needs a production-grade backend to power the cloud dashboard frontend (already built). The existing auth implementation in `interleet.sharexpress.in` (FastAPI + MongoDB + Redis) serves as the foundation and will be **reused/adapted** — not rewritten.

The backend will be its own service: `api.sharexpress.in` (or `cloud-api.sharexpress.in`).

---

## Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| API Framework | **FastAPI** (Python) | Already established pattern in interleet |
| Primary DB | **PostgreSQL** via SQLAlchemy async | Relational workspaces, projects, RBAC |
| Cache / Queue | **Redis** | Session OTPs, job queue, pub/sub |
| Auth SSO | **authlib** (OAuth2 + OIDC) | Reused from interleet |
| JWT | **python-jose RS256** | RS256 private/public key pair (already generated in interleet `core/security/*.pem`) |
| Container Engine | **Docker + Kubernetes** | Project deployment orchestration |
| Object Storage | **MinIO** (S3-compatible) | Self-hosted S3 storage layer |
| Database Services | **Postgres, MongoDB, MySQL, SQLite** | Managed DB provisioning |
| Observability | **Grafana + Prometheus + Loki** | Logs, metrics, tracing |
| Message Broker | **Redis Streams / Bull** | Build queue, deployment jobs |

---

## Module Breakdown

### 1. Authentication & Identity (`/auth/*`)

**Reuse from interleet:**
- `app/core/oauth.py` → Google & GitHub OAuth (authlib)
- `app/utils/OTP.py` + `app/lib/generateOTP.py` → Email OTP flow
- `app/core/security/private.pem` + `public.pem` → RS256 JWT signing

**Add new:**
- **GitLab OAuth** provider registration (same authlib pattern)
- **Sharexpress native login** — email → OTP flow (already done in interleet, copy directly)
- **RS256 JWT** — swap HS256 for RS256 using existing key pair
- **Sensitive action re-verification** — any `/env`, `/secrets`, `/api-keys` endpoint requires OTP re-check before exposing values

**Endpoints:**
```
POST  /auth/send-otp
POST  /auth/verify-otp
GET   /auth/google/login      → /auth/google/callback
GET   /auth/github/login      → /auth/github/callback
GET   /auth/gitlab/login      → /auth/gitlab/callback
POST  /auth/logout
GET   /auth/me
POST  /auth/verify-identity   ← OTP gate for secret access
```

---

### 2. RBAC — Role-Based Access Control

**Roles per workspace:**

| Role | Capabilities |
|---|---|
| `owner` | Full access, billing, delete workspace |
| `admin` | Create/delete projects, manage members |
| `developer` | Deploy projects, view logs, manage env |
| `viewer` | Read-only access to dashboard and metrics |

**Implementation:**
- `workspace_members` table: `{ workspace_id, user_id, role, invited_at, accepted_at }`
- FastAPI `Depends(require_role("developer"))` decorator pattern
- Per-route permission guards

---

### 3. Workspace Management (`/workspaces/*`)

**Core requirement:** Complete data isolation between workspaces. No cross-workspace data leakage.

**DB Schema (PostgreSQL):**
```sql
workspaces:
  id UUID PK
  slug VARCHAR UNIQUE
  name VARCHAR
  owner_id UUID FK users
  plan ENUM('free', 'pro', 'enterprise')
  created_at TIMESTAMP

workspace_members:
  id UUID PK
  workspace_id UUID FK workspaces
  user_id UUID FK users
  role ENUM('owner','admin','developer','viewer')
```

**Endpoints:**
```
POST   /workspaces                ← create workspace
GET    /workspaces                ← list user's workspaces
GET    /workspaces/:id            ← workspace detail
PATCH  /workspaces/:id            ← update name/settings
DELETE /workspaces/:id            ← delete workspace
POST   /workspaces/:id/invite     ← invite member
GET    /workspaces/:id/members    ← list members
PATCH  /workspaces/:id/members/:uid ← update member role
DELETE /workspaces/:id/members/:uid ← remove member
```

---

### 4. Project Hosting (`/projects/*`)

**The most complex module.** Tech-stack agnostic: we only need a build command and a start command.

**Project types:**
- `static` — build → output dir → Nginx-served CDN
- `web_service` — build → Docker container → exposed via ingress
- `private_service` — internal-only, no public ingress

**Flow:**
```
1. User creates project (name, repo URL, build cmd, start cmd, env vars)
2. Backend clones repo into ephemeral workspace
3. Builds using Docker (isolated container per project)
4. Pushes built image to internal Docker Registry
5. Kubernetes Deployment + Service created (or updated)
6. Ingress rule assigned: subdomain.sharexpress.in or custom domain
7. Deploy log streamed via WebSocket
```

**DB Schema:**
```sql
projects:
  id UUID PK
  workspace_id UUID FK workspaces
  name VARCHAR
  slug VARCHAR UNIQUE
  type ENUM('static','web_service','private_service')
  repo_url VARCHAR
  branch VARCHAR DEFAULT 'main'
  build_cmd VARCHAR
  start_cmd VARCHAR
  port INT DEFAULT 3000
  domain VARCHAR         ← custom domain if set
  subdomain VARCHAR      ← auto: slug.project.sharexpress.in
  status ENUM('idle','building','live','failed','stopped')

deployments:
  id UUID PK
  project_id UUID FK projects
  triggered_by UUID FK users
  commit_sha VARCHAR
  status ENUM('queued','building','deploying','live','failed','rolled_back')
  build_log TEXT
  deployed_at TIMESTAMP

env_vars:
  id UUID PK
  project_id UUID FK projects
  key VARCHAR
  value_encrypted TEXT   ← AES-256-GCM encrypted
  is_secret BOOL DEFAULT false
```

**Kubernetes Orchestration:**
- `k8s/` module using `kubernetes-asyncio` Python client
- Each project → K8s `Deployment` + `Service` + `Ingress`
- Rolling updates on new deploys
- Autoscaler (HPA) configurable per project

**Endpoints:**
```
POST   /projects                       ← create project
GET    /projects                       ← list by workspace
GET    /projects/:id                   ← project detail
PATCH  /projects/:id                   ← update settings
DELETE /projects/:id                   ← delete project + K8s resources
POST   /projects/:id/deploy            ← trigger deployment
GET    /projects/:id/deployments       ← deployment history
POST   /projects/:id/rollback/:dep_id  ← rollback to previous
GET    /projects/:id/logs              ← streaming logs (WebSocket)
GET    /projects/:id/env               ← list env vars (masked)
POST   /projects/:id/env               ← add env var
DELETE /projects/:id/env/:key          ← delete env var
GET    /projects/:id/env/reveal        ← reveal (requires OTP gate)
```

---

### 5. Database Services (`/databases/*`)

**Supported engines:** PostgreSQL, MongoDB, MySQL, SQLite

**Implementation:**
- Each database = provisioned Docker container on K8s
- Connection string stored encrypted, revealed only after OTP
- Automated daily backups to MinIO

**DB Schema:**
```sql
databases:
  id UUID PK
  workspace_id UUID FK workspaces
  name VARCHAR
  engine ENUM('postgres','mongodb','mysql','sqlite')
  version VARCHAR
  host VARCHAR  ← internal K8s service DNS
  port INT
  database_name VARCHAR
  username VARCHAR
  password_encrypted TEXT
  status ENUM('provisioning','running','stopped','error')
  storage_gb INT DEFAULT 10
  connection_string_encrypted TEXT
```

**Endpoints:**
```
POST   /databases               ← provision new DB
GET    /databases               ← list by workspace
GET    /databases/:id           ← detail + metrics
DELETE /databases/:id           ← deprovision
GET    /databases/:id/connection ← reveal conn string (OTP gate)
GET    /databases/:id/backups   ← list backups
POST   /databases/:id/backup    ← trigger manual backup
POST   /databases/:id/restore/:bkp_id ← restore from backup
```

---

### 6. Object Storage (`/storage/*`)

**Backend: MinIO** — S3-compatible self-hosted object storage

**Implementation:**
- `boto3` with custom endpoint pointing to MinIO cluster
- Each workspace gets namespaced bucket access
- Presigned URLs for frontend upload/download

**Endpoints:**
```
POST   /storage/buckets            ← create bucket
GET    /storage/buckets            ← list buckets
GET    /storage/buckets/:id        ← bucket detail + metrics
DELETE /storage/buckets/:id        ← delete bucket
GET    /storage/buckets/:id/objects ← list objects
DELETE /storage/buckets/:id/objects/:key ← delete object
POST   /storage/buckets/:id/presigned-upload   ← get upload URL
POST   /storage/buckets/:id/presigned-download ← get download URL
GET    /storage/buckets/:id/api-keys           ← access credentials (OTP gate)
```

---

### 7. Sensitive Data OTP Gate

Any endpoint that reveals secret values (env vars, DB passwords, API keys, S3 credentials) must be protected:

```python
@router.get("/projects/{id}/env/reveal")
async def reveal_env(
    id: str,
    user = Depends(require_role("developer")),
    _: None = Depends(require_recent_otp_verification)  # ← blocks if not verified in last 15min
):
    ...
```

`require_recent_otp_verification` checks a Redis key:
```
otp:verified:{user_id}  → TTL 15min
```

---

## System Architecture Diagram

```
                        ┌─────────────────────────────────┐
                        │   cloud.sharexpress.in (Frontend) │
                        │      TanStack Start / React       │
                        └──────────────┬──────────────────┘
                                       │ HTTPS
                        ┌──────────────▼──────────────────┐
                        │   api.sharexpress.in             │
                        │   FastAPI (Uvicorn + Gunicorn)   │
                        │                                  │
                        │  Auth ─ Workspace ─ Projects     │
                        │  Databases ─ Storage ─ RBAC      │
                        └──┬──────┬─────────┬─────────────┘
                           │      │         │
              ┌────────────▼──┐ ┌─▼──────┐ ┌▼──────────┐
              │  PostgreSQL   │ │ Redis  │ │   MinIO   │
              │  (Primary DB) │ │(Cache) │ │ (Storage) │
              └───────────────┘ └────────┘ └───────────┘
                           │
              ┌────────────▼──────────────────────┐
              │     Kubernetes Cluster             │
              │                                   │
              │  Project A  Project B  Project C  │
              │  [Pod]      [Pod]      [Pod]       │
              │                                   │
              │  DB: Postgres  DB: MongoDB         │
              │  [StatefulSet] [StatefulSet]       │
              └───────────────────────────────────┘
                           │
              ┌────────────▼──────────────────────┐
              │     Observability Stack            │
              │  Prometheus + Grafana + Loki       │
              └───────────────────────────────────┘
```

---

## Project Structure

```
cloud.sharexpress/
  backend/                       ← NEW: FastAPI backend service
    main.py
    requirements.txt
    Dockerfile
    docker-compose.yml
    .env.example
    app/
      core/
        config.py                ← env config
        db.py                    ← SQLAlchemy async postgres
        redis.py                 ← Redis connection
        security/
          private.pem            ← RS256 private key (copied from interleet)
          public.pem             ← RS256 public key
        oauth.py                 ← Google + GitHub + GitLab authlib
      models/
        user.py
        workspace.py
        project.py
        database.py
        storage.py
        deployment.py
      routers/
        auth.py
        workspaces.py
        projects.py
        databases.py
        storage.py
        domains.py
      controllers/
        auth_controller.py
        workspace_controller.py
        project_controller.py
        database_controller.py
        storage_controller.py
      services/
        jwt_service.py           ← RS256 JWT issue + verify
        otp_service.py           ← OTP generate + send + verify (from interleet)
        email_service.py         ← SMTP (from interleet)
        k8s_service.py           ← Kubernetes orchestration
        minio_service.py         ← MinIO / S3 operations
        build_service.py         ← Docker build + push
        domain_service.py        ← DNS + TLS via Caddy/Cert-manager
      middleware/
        auth.py                  ← JWT bearer token verification
        rbac.py                  ← role guard decorator
        otp_gate.py              ← sensitive action OTP verification
      utils/
        encryption.py            ← AES-256-GCM for env vars / secrets
        pagination.py
        response.py
    k8s/
      manifests/                 ← base K8s YAML templates
        project-deployment.yaml
        project-service.yaml
        project-ingress.yaml
        database-statefulset.yaml
```

---

## Open Questions

> [!IMPORTANT]
> **PostgreSQL vs MongoDB for platform metadata?**
> The existing interleet uses MongoDB for everything. Since Sharexpress Cloud has strongly-relational data (workspaces → members → projects → deployments), PostgreSQL is the better fit. The proposal uses Postgres for platform metadata but can use MongoDB if you prefer consistency with interleet.

> [!IMPORTANT]
> **Kubernetes: Self-hosted or Cloud provider?**
> The K8s cluster design depends on your infrastructure. Do you have:
> - A self-hosted bare-metal/VM cluster (k3s/kubeadm)?
> - A cloud-managed cluster (AWS EKS, GCP GKE, etc.)?
> - Docker Swarm as a simpler alternative for Phase 1?
>
> **Recommendation**: Start with Docker Compose + standalone containers for Phase 1, migrate to K8s in Phase 2.

> [!IMPORTANT]
> **Domain provisioning model?**
> For custom domains, we need wildcard TLS. Two options:
> - **Caddy** (automatic HTTPS via ACME) — simpler to operate
> - **cert-manager + Nginx Ingress** — standard K8s approach
> Which do you prefer?

> [!IMPORTANT]
> **GitLab OAuth: SaaS or self-hosted?**
> GitLab OAuth supports both gitlab.com (SaaS) and self-hosted instances. Should this support gitlab.com only or also allow users to connect their own self-hosted GitLab?

---

## Implementation Phases

### Phase 1 — Foundation (Week 1–2)
- [x] FastAPI project scaffold in `cloud.sharexpress/backend/`
- [x] PostgreSQL & MongoDB schemas
- [x] Auth: Copy OTP + Google + GitHub from interleet, add GitLab, upgrade to RS256 JWT
- [x] RBAC middleware (owner, admin, developer, viewer)
- [x] Workspace CRUD API
- [x] OTP identity verification gate

### Phase 2 — Project Hosting (Week 3–4)
- [x] Docker build pipeline engine
- [x] Project CRUD + deployment trigger
- [x] WebSocket build log streaming (`/projects/{id}/logs/ws`)
- [x] Domain provisioning (subdomain auto-assign)
- [x] Env var management with AES-256-GCM encryption

### Phase 3 — Data Services (Week 5–6)
- [x] Real Docker container database provisioner (PostgreSQL, MongoDB, MySQL, Redis)
- [x] Connection string management + AES-256 decryption on OTP reveal
- [x] Persistent volume allocation (`sx_vol_{name}`)

### Phase 4 — Storage & CDN (Week 7)
- [x] MinIO S3 SDK integration (`boto3`)
- [x] Bucket CRUD + direct presigned URL upload API
- [x] Encrypted Secret Access Keys with OTP identity gate

### Phase 5 — Observability (Week 8)
- [x] Prometheus metrics exporter (`/observability/metrics`)
- [x] Real-time host CPU & Memory telemetry (`/observability/stats`)
- [x] Container gauge monitoring

---

## Verification Plan

### Automated Tests
- `pytest` + `httpx` async test client
- Auth flow coverage: SSO callback → JWT issue → protected route
- RBAC: test each role against each protected endpoint
- OTP gate: verify timeout + correct bypass flow

### Manual Verification
- End-to-end: login → create workspace → deploy project → check live URL
- Confirm env var values are masked in API and revealed only post-OTP
- Verify workspace isolation: User A cannot access Workspace B's data
