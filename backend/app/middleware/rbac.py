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

from fastapi import HTTPException, Depends
from typing import Dict, Any, List
from app.middleware.auth import get_current_user
from app.core.db import get_db

ROLE_HIERARCHY = {
    "owner": 4,
    "admin": 3,
    "developer": 2,
    "viewer": 1,
}

def require_role(min_role: str):
    """Enforce minimum workspace RBAC role."""
    async def dependency(workspace_id: str, user: Dict[str, Any] = Depends(get_current_user)):
        user_id = str(user.get("_id"))
        db = get_db()

        # Check membership
        member = await db.workspace_members.find_one({
            "workspace_id": workspace_id,
            "user_id": user_id
        })

        if not member:
            # Check if workspace owner
            ws = await db.workspaces.find_one({"_id": workspace_id})
            if ws and str(ws.get("owner_id")) == user_id:
                user_role = "owner"
            else:
                user_role = "developer" # Default role for dev mode
        else:
            user_role = member.get("role", "developer")

        user_level = ROLE_HIERARCHY.get(user_role.lower(), 1)
        required_level = ROLE_HIERARCHY.get(min_role.lower(), 1)

        if user_level < required_level:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Minimum role required: '{min_role}'"
            )
        return user_role

    return dependency
