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

from fastapi import HTTPException, Response, Request
from fastapi.responses import RedirectResponse
from app.models.schemas import OTPRequest, OTPVerifyRequest
from app.core.db import get_db
from app.core.config import FRONTEND_URL, BACKEND_URL
from app.core.oauth import oauth
from app.services.otp_service import (
    generate_otp_code, send_otp_transaction, verify_otp_transaction, mark_user_identity_verified
)
from app.services.email_service import send_otp_email
from app.services.jwt_service import generate_token, verify_token
import logging

logger = logging.getLogger(__name__)

class UserController:
    @staticmethod
    async def send_otp(payload: OTPRequest):
        email = payload.email.lower().strip()
        otp_code = generate_otp_code()
        
        tx_res = await send_otp_transaction(email, otp_code)
        if not tx_res.get("success"):
            raise HTTPException(status_code=500, detail="Failed to store OTP transaction")
            
        await send_otp_email(email, "Sharexpress Cloud Verification Code", otp_code)
        
        return {
            "success": True,
            "message": f"Verification OTP sent to {email}",
            "transaction_id": tx_res["transaction_id"],
            "otp_debug": otp_code # Logged for testing
        }

    @staticmethod
    async def verify_otp(payload: OTPVerifyRequest, response: Response):
        res = await verify_otp_transaction(payload.transaction_id, payload.otp)
        if not res.get("valid"):
            raise HTTPException(status_code=400, detail=res.get("reason", "Invalid OTP"))
            
        email = res["email"]
        db = get_db()
        
        # Upsert user record
        user = await db.users.find_one({"email": email})
        if not user:
            user_doc = {
                "email": email,
                "name": email.split("@")[0].title(),
                "provider": "email",
                "created_at": "2026-07-30T00:00:00Z"
            }
            res_db = await db.users.insert_one(user_doc)
            user_id = str(res_db.inserted_id)
        else:
            user_id = str(user["_id"])
            
        # Issue RS256 Signed JWT Token
        token = generate_token(user_id=user_id, email=email, response=response)
        
        # Mark user identity verified in Redis (15-min TTL for secret exposure gate)
        mark_user_identity_verified(user_id)
        
        return {
            "success": True,
            "message": "Authentication successful",
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "provider": "email"
            }
        }

    @staticmethod
    async def google_login(request: Request):
        redirect_uri = f"{BACKEND_URL}/auth/google/callback"
        return await oauth.google.authorize_redirect(request, redirect_uri)

    @staticmethod
    async def google_callback(request: Request, response: Response):
        try:
            token = await oauth.google.authorize_access_token(request)
            user_info = token.get("userinfo") or await oauth.google.userinfo(token=token)
            email = user_info["email"].lower()
            name = user_info.get("name", email.split("@")[0])
            avatar = user_info.get("picture")

            db = get_db()
            user = await db.users.find_one({"email": email})
            if not user:
                user_doc = {"email": email, "name": name, "avatar_url": avatar, "provider": "google"}
                res = await db.users.insert_one(user_doc)
                user_id = str(res.inserted_id)
            else:
                user_id = str(user["_id"])

            jwt_token = generate_token(user_id=user_id, email=email, response=response)
            mark_user_identity_verified(user_id)
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
        except Exception as e:
            logger.error("Google SSO callback error: %s", e)
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=sso_failed")

    @staticmethod
    async def github_login(request: Request):
        redirect_uri = f"{BACKEND_URL}/auth/github/callback"
        return await oauth.github.authorize_redirect(request, redirect_uri)

    @staticmethod
    async def github_callback(request: Request, response: Response):
        try:
            token = await oauth.github.authorize_access_token(request)
            resp = await oauth.github.get("user", token=token)
            profile = resp.json()
            email = profile.get("email")
            if not email:
                emails_resp = await oauth.github.get("user/emails", token=token)
                emails = emails_resp.json()
                primary = next((e for e in emails if e.get("primary")), emails[0] if emails else {})
                email = primary.get("email", f"{profile['login']}@github.com")

            email = email.lower()
            name = profile.get("name") or profile.get("login")
            avatar = profile.get("avatar_url")

            db = get_db()
            user = await db.users.find_one({"email": email})
            if not user:
                user_doc = {"email": email, "name": name, "avatar_url": avatar, "provider": "github"}
                res = await db.users.insert_one(user_doc)
                user_id = str(res.inserted_id)
            else:
                user_id = str(user["_id"])

            generate_token(user_id=user_id, email=email, response=response)
            mark_user_identity_verified(user_id)
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
        except Exception as e:
            logger.error("GitHub SSO callback error: %s", e)
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=sso_failed")

    @staticmethod
    async def gitlab_login(request: Request):
        redirect_uri = f"{BACKEND_URL}/auth/gitlab/callback"
        return await oauth.gitlab.authorize_redirect(request, redirect_uri)

    @staticmethod
    async def gitlab_callback(request: Request, response: Response):
        try:
            token = await oauth.gitlab.authorize_access_token(request)
            resp = await oauth.gitlab.get("user", token=token)
            profile = resp.json()
            email = profile["email"].lower()
            name = profile.get("name") or profile.get("username")
            avatar = profile.get("avatar_url")

            db = get_db()
            user = await db.users.find_one({"email": email})
            if not user:
                user_doc = {"email": email, "name": name, "avatar_url": avatar, "provider": "gitlab"}
                res = await db.users.insert_one(user_doc)
                user_id = str(res.inserted_id)
            else:
                user_id = str(user["_id"])

            generate_token(user_id=user_id, email=email, response=response)
            mark_user_identity_verified(user_id)
            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
        except Exception as e:
            logger.error("GitLab SSO callback error: %s", e)
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=sso_failed")

    @staticmethod
    async def logout(response: Response):
        response.delete_cookie(key="user", path="/")
        return {"success": True, "message": "Logged out successfully"}
