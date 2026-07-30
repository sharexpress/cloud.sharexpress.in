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

from fastapi import APIRouter, Response, Request, Depends
from app.models.schemas import OTPRequest, OTPVerifyRequest
from app.controllers.user_controller import UserController
from app.middleware.auth import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication & SSO"])

@router.post("/send-otp")
async def send_otp(payload: OTPRequest):
    return await UserController.send_otp(payload)

@router.post("/verify-otp")
async def verify_otp(payload: OTPVerifyRequest, response: Response):
    return await UserController.verify_otp(payload, response)

@router.get("/google/login")
async def google_login(request: Request):
    return await UserController.google_login(request)

@router.get("/google/callback")
async def google_callback(request: Request, response: Response):
    return await UserController.google_callback(request, response)

@router.get("/github/login")
async def github_login(request: Request):
    return await UserController.github_login(request)

@router.get("/github/callback")
async def github_callback(request: Request, response: Response):
    return await UserController.github_callback(request, response)

@router.get("/gitlab/login")
async def gitlab_login(request: Request):
    return await UserController.gitlab_login(request)

@router.get("/gitlab/callback")
async def gitlab_callback(request: Request, response: Response):
    return await UserController.gitlab_callback(request, response)

@router.post("/logout")
async def logout(response: Response):
    return await UserController.logout(response)

@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    return {"success": True, "user": user}
