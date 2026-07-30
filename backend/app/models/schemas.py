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

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any

# --- AUTH SCHEMAS ---
class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    transaction_id: str
    otp: str

class UserProfile(BaseModel):
    id: str
    email: EmailStr
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    provider: str = "email"

# --- WORKSPACE SCHEMAS ---
class WorkspaceCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    plan: str = "free"

class WorkspaceMemberInvite(BaseModel):
    email: EmailStr
    role: str = "developer" # "owner" | "admin" | "developer" | "viewer"

class WorkspaceMemberUpdate(BaseModel):
    role: str

# --- PROJECT SCHEMAS ---
class ProjectCreate(BaseModel):
    name: str
    slug: Optional[str] = None
    type: str = "web_service" # "static" | "web_service" | "private_service"
    framework: str = "nextjs"
    repo_url: Optional[str] = None
    branch: str = "main"
    build_command: Optional[str] = "npm run build"
    start_command: Optional[str] = "npm start"
    port: int = 3000

class ProjectEnvCreate(BaseModel):
    key: str
    value: str
    is_secret: bool = False

# --- DATABASE SCHEMAS ---
class DatabaseCreate(BaseModel):
    name: str
    engine: str = "postgres" # "postgres" | "mongodb" | "mysql" | "sqlite"
    version: Optional[str] = "16"
    region: str = "iad1"
    storage_gb: int = 10

# --- STORAGE BUCKET SCHEMAS ---
class StorageBucketCreate(BaseModel):
    name: str
    visibility: str = "public" # "public" | "private"
    region: str = "iad1"
