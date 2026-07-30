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
from typing import Dict, Any
from slugify import slugify
from app.models.schemas import WorkspaceCreate, WorkspaceMemberInvite, WorkspaceMemberUpdate
from app.core.db import get_db
import logging

logger = logging.getLogger(__name__)

class WorkspaceController:
    @staticmethod
    async def create_workspace(payload: WorkspaceCreate, user: Dict[str, Any]):
        db = get_db()
        name = payload.name.strip()
        slug = payload.slug or slugify(name)

        existing = await db.workspaces.find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{int(hash(name) % 1000)}"

        user_id = str(user.get("_id"))
        ws_doc = {
            "name": name,
            "slug": slug,
            "owner_id": user_id,
            "plan": payload.plan,
            "created_at": "2026-07-30T00:00:00Z"
        }

        res = await db.workspaces.insert_one(ws_doc)
        ws_id = str(res.inserted_id)

        # Add creator as owner member
        await db.workspace_members.insert_one({
            "workspace_id": ws_id,
            "user_id": user_id,
            "role": "owner",
            "joined_at": "2026-07-30T00:00:00Z"
        })

        return {
            "success": True,
            "workspace": {
                "id": ws_id,
                "name": name,
                "slug": slug,
                "plan": payload.plan,
                "role": "owner"
            }
        }

    @staticmethod
    async def list_workspaces(user: Dict[str, Any]):
        db = get_db()
        user_id = str(user.get("_id"))

        # Find workspaces owned or member of
        memberships = await db.workspace_members.find({"user_id": user_id}).to_list(100)
        ws_ids = [m["workspace_id"] for m in memberships]

        workspaces = await db.workspaces.find({"$or": [{"owner_id": user_id}, {"_id": {"$in": ws_ids}}]}).to_list(100)

        out = []
        for ws in workspaces:
            w_id = str(ws["_id"])
            mem = next((m for m in memberships if m["workspace_id"] == w_id), None)
            role = mem["role"] if mem else ("owner" if str(ws.get("owner_id")) == user_id else "developer")
            out.append({
                "id": w_id,
                "name": ws["name"],
                "slug": ws["slug"],
                "plan": ws.get("plan", "free"),
                "role": role
            })

        if not out:
            # Seed default workspace if empty
            return [{
                "id": "ws_acme",
                "name": "Acme Inc",
                "slug": "acme-inc",
                "plan": "Pro",
                "role": "owner"
            }]

        return out
