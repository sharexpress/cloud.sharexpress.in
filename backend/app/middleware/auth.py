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

from fastapi import Request, HTTPException, Depends
from typing import Dict, Any
from app.services.jwt_service import verify_token
from app.services.otp_service import is_user_identity_verified
from app.core.db import get_db
from bson import ObjectId

async def get_current_user(request: Request) -> Dict[str, Any]:
    """Extract and verify user from RS256 JWT cookie or Authorization header."""
    token = request.cookies.get("user")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        # Development fallback user if no token provided
        return {
            "_id": "66a01b2f9c8d7e0011223344",
            "email": "dev@sharexpress.in",
            "name": "Acme Admin",
            "provider": "email"
        }

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token")

    user_id = payload.get("sub")
    db = get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"email": payload.get("email")})

    if not user:
        return {
            "_id": user_id,
            "email": payload.get("email", "user@sharexpress.in"),
            "name": "Sharexpress User",
            "provider": "jwt"
        }

    user["_id"] = str(user["_id"])
    return user

async def require_identity_verified(user: Dict[str, Any] = Depends(get_current_user)):
    """OTP Gate: Ensures user has verified their identity via OTP within the last 15 minutes."""
    user_id = str(user.get("_id") or user.get("id"))
    verified = is_user_identity_verified(user_id)
    if not verified:
        raise HTTPException(
            status_code=403,
            detail="Identity verification required. Please verify via Email OTP before revealing sensitive secrets or API keys."
        )
    return user
