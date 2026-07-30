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
from app.models.schemas import WorkspaceCreate
from app.controllers.workspace_controller import WorkspaceController
from app.middleware.auth import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/workspaces", tags=["Workspaces & RBAC"])

@router.post("")
async def create_workspace(payload: WorkspaceCreate, user: Dict[str, Any] = Depends(get_current_user)):
    return await WorkspaceController.create_workspace(payload, user)

@router.get("")
async def list_workspaces(user: Dict[str, Any] = Depends(get_current_user)):
    return await WorkspaceController.list_workspaces(user)
