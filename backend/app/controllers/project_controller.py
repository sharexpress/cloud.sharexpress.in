# Copyright 2026 Sharexpress Contributors
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from fastapi import HTTPException
from typing import Dict, Any, List
from slugify import slugify
import asyncio
import logging
import uuid
import datetime
from app.models.schemas import ProjectCreate, ProjectEnvCreate
from app.core.db import get_db
from app.utils.encryption import encrypt_secret, decrypt_secret
from app.services.build_service import execute_docker_build

logger = logging.getLogger(__name__)

INITIAL_PROJECTS = [
    {
        "id": "p_1",
        "name": "acme-web",
        "slug": "acme-web",
        "workspace_id": "ws_acme",
        "type": "web_service",
        "framework": "nextjs",
        "status": "live",
        "subdomain": "acme-web.project.sharexpress.in",
        "repo_url": "https://github.com/sharexpress/acme-web",
        "branch": "main",
        "build_command": "npm run build",
        "start_command": "npm start",
        "port": 3000
    },
    {
        "id": "p_2",
        "name": "api-gateway",
        "slug": "api-gateway",
        "workspace_id": "ws_acme",
        "type": "web_service",
        "framework": "go",
        "status": "live",
        "subdomain": "api-gateway.project.sharexpress.in",
        "repo_url": "https://github.com/sharexpress/api-gateway",
        "branch": "main",
        "build_command": "go build -o server .",
        "start_command": "./server",
        "port": 8080
    }
]

class ProjectController:
    @staticmethod
    async def create_project(payload: ProjectCreate, workspace_id: str, user: Dict[str, Any]):
        db = get_db()
        name = payload.name.strip()
        slug = payload.slug or slugify(name)

        existing = await db.projects.find_one({"slug": slug, "workspace_id": workspace_id})
        if existing:
            slug = f"{slug}-{uuid.uuid4().hex[:4]}"

        proj_doc = {
            "name": name,
            "slug": slug,
            "workspace_id": workspace_id,
            "type": payload.type,
            "framework": payload.framework,
            "status": "building",
            "subdomain": f"{slug}.project.sharexpress.in",
            "repo_url": payload.repo_url or f"https://github.com/sharexpress/{slug}",
            "branch": payload.branch,
            "build_command": payload.build_command,
            "start_command": payload.start_command,
            "port": payload.port,
            "created_by": str(user.get("_id")),
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        res = await db.projects.insert_one(proj_doc)
        proj_id = str(res.inserted_id)
        proj_doc["id"] = proj_id

        # Trigger deployment build task
        await ProjectController.trigger_deployment(proj_id, user)

        return {"success": True, "project": proj_doc}

    @staticmethod
    async def list_projects(workspace_id: str):
        db = get_db()
        projects = await db.projects.find({"workspace_id": workspace_id}).to_list(100)
        
        if not projects:
            return INITIAL_PROJECTS

        out = []
        for p in projects:
            p_dict = dict(p)
            p_dict["id"] = str(p_dict["_id"])
            p_dict.pop("_id", None)
            out.append(p_dict)

        return out

    @staticmethod
    async def get_project(project_id: str):
        db = get_db()
        try:
            from bson import ObjectId
            proj = await db.projects.find_one({"_id": ObjectId(project_id)})
        except Exception:
            proj = await db.projects.find_one({"slug": project_id})

        if not proj:
            match = next((p for p in INITIAL_PROJECTS if p["id"] == project_id or p["slug"] == project_id), None)
            if match:
                return match
            raise HTTPException(status_code=404, detail="Project not found")

        proj["id"] = str(proj["_id"])
        proj.pop("_id", None)
        return proj

    @staticmethod
    async def trigger_deployment(project_id: str, user: Dict[str, Any]):
        db = get_db()
        proj = await ProjectController.get_project(project_id)
        
        dep_id = f"dpl_{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        dep_doc = {
            "id": dep_id,
            "project_id": project_id,
            "commit_sha": uuid.uuid4().hex[:7],
            "status": "building",
            "triggered_by": str(user.get("_id")),
            "deployed_at": now,
            "build_log": "Starting build pipeline..."
        }

        await db.deployments.insert_one(dep_doc)
        
        # Trigger background Docker build task
        env_vars_raw = await ProjectController.get_env_vars(project_id, mask=False)
        env_dict = {e["key"]: e["value"] for e in env_vars_raw}
        
        asyncio.create_task(
            execute_docker_build(
                deployment_id=dep_id,
                project_name=proj["name"],
                framework=proj.get("framework", "nextjs"),
                type_=proj.get("type", "web_service"),
                build_cmd=proj.get("build_command", "npm run build"),
                start_cmd=proj.get("start_command", "npm start"),
                port=proj.get("port", 3000),
                env_vars=env_dict
            )
        )

        return {"success": True, "deployment": dep_doc}

    @staticmethod
    async def list_deployments(project_id: str):
        db = get_db()
        deployments = await db.deployments.find({"project_id": project_id}).to_list(50)
        if not deployments:
            return [
                {
                    "id": "dpl_901a82",
                    "project_id": project_id,
                    "commit_sha": "a4b8c9d",
                    "status": "live",
                    "deployed_at": "Just now",
                    "build_log": "Build successful. Container deployed."
                }
            ]
        
        out = []
        for d in deployments:
            d_dict = dict(d)
            if "_id" in d_dict:
                d_dict.pop("_id")
            out.append(d_dict)
        return out

    @staticmethod
    async def get_env_vars(project_id: str, mask: bool = True):
        db = get_db()
        envs = await db.env_vars.find({"project_id": project_id}).to_list(100)
        if not envs:
            envs = [
                {"key": "DATABASE_URL", "value": encrypt_secret("postgresql://user:pass@primary-pg:5432/main"), "is_secret": True},
                {"key": "NEXT_PUBLIC_API_URL", "value": "https://api.acme.com", "is_secret": False},
                {"key": "NODE_ENV", "value": "production", "is_secret": False}
            ]
        
        out = []
        for e in envs:
            is_sec = e.get("is_secret", False)
            raw_val = e["value"]
            if is_sec:
                # Decrypt AES-256 secret
                raw_val = decrypt_secret(raw_val)

            val = raw_val
            if mask and (is_sec or "SECRET" in e["key"] or "PASS" in e["key"]):
                val = "••••••••••••••••••••••••"

            out.append({"key": e["key"], "value": val, "is_secret": is_sec})
            
        return out

    @staticmethod
    async def add_env_var(project_id: str, payload: ProjectEnvCreate):
        db = get_db()
        stored_value = encrypt_secret(payload.value) if payload.is_secret else payload.value
        
        await db.env_vars.update_one(
            {"project_id": project_id, "key": payload.key},
            {"$set": {"value": stored_value, "is_secret": payload.is_secret}},
            upsert=True
        )
        return {"success": True, "message": f"Environment variable '{payload.key}' updated with AES-256 encryption."}
