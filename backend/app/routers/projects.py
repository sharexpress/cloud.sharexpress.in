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
from app.models.schemas import ProjectCreate, ProjectEnvCreate
from app.controllers.project_controller import ProjectController
from app.middleware.auth import get_current_user, require_identity_verified
from typing import Dict, Any

router = APIRouter(prefix="/projects", tags=["Project Hosting & Deployments"])

@router.post("")
async def create_project(payload: ProjectCreate, workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.create_project(payload, workspace_id, user)

@router.get("")
async def list_projects(workspace_id: str = "ws_acme", user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.list_projects(workspace_id)

@router.get("/{id}")
async def get_project(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.get_project(id)

@router.post("/{id}/deploy")
async def trigger_deploy(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.trigger_deployment(id, user)

@router.get("/{id}/deployments")
async def list_deployments(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.list_deployments(id)

@router.get("/{id}/env")
async def get_env_vars(id: str, user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.get_env_vars(id, mask=True)

@router.post("/{id}/env")
async def add_env_var(id: str, payload: ProjectEnvCreate, user: Dict[str, Any] = Depends(get_current_user)):
    return await ProjectController.add_env_var(id, payload)

# OTP IDENTITY VERIFICATION GATE: Requires recent Email OTP check to reveal unmasked secrets!
@router.get("/{id}/env/reveal")
async def reveal_env_vars(id: str, user: Dict[str, Any] = Depends(require_identity_verified)):
    return await ProjectController.get_env_vars(id, mask=False)
