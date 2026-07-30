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
from app.models.schemas import DatabaseCreate
from app.controllers.database_controller import DatabaseController
from app.middleware.auth import get_current_user, require_identity_verified
from typing import Dict, Any

router = APIRouter(prefix="/databases", tags=["Managed Database Clusters"])

@router.post("")
async def create_database(payload: DatabaseCreate, workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await DatabaseController.create_database(payload, workspace_id, user)

@router.get("")
async def list_databases(workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await DatabaseController.list_databases(workspace_id)

@router.get("/{id}/connection")
async def get_connection_string(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await DatabaseController.get_connection_string(id, unmask=False)

# OTP IDENTITY VERIFICATION GATE: Requires recent Email OTP check to reveal unmasked connection strings!
@router.get("/{id}/connection/reveal")
async def reveal_connection_string(id: str, user: Dict[str, Any] = Depends(require_identity_verified)):
    return await DatabaseController.get_connection_string(id, unmask=True)
