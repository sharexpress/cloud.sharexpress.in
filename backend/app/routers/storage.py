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

from fastapi import APIRouter, Depends
from app.models.schemas import StorageBucketCreate
from app.controllers.storage_controller import StorageController
from app.middleware.auth import get_current_user, require_identity_verified
from typing import Dict, Any

router = APIRouter(prefix="/storage", tags=["MinIO Object Storage & Buckets"])

@router.post("/buckets")
async def create_bucket(payload: StorageBucketCreate, workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await StorageController.create_bucket(payload, workspace_id, user)

@router.get("/buckets")
async def list_buckets(workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await StorageController.list_buckets(workspace_id)

@router.get("/buckets/{id}/keys")
async def get_keys(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await StorageController.get_credentials(id, unmask=False)

# OTP IDENTITY VERIFICATION GATE: Requires recent Email OTP check to reveal unmasked S3 keys!
@router.get("/buckets/{id}/keys/reveal")
async def reveal_keys(id: str, user: Dict[str, Any] = Depends(require_identity_verified)):
    return await StorageController.get_credentials(id, unmask=True)
