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

"""
Sharexpress Cloud — Core Backend API
Self-hosted cloud platform API powered by FastAPI, MongoDB, Redis, Docker & MinIO.
"""

import os
import logging
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

load_dotenv(override=True)

from app.core.config import SESSION_SECRET_KEY, BACKEND_URL
from app.routers.auth import router as auth_router
from app.routers.workspaces import router as workspaces_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sharexpress-cloud")

app = FastAPI(
    title="Sharexpress Cloud API",
    description="Production backend API for Sharexpress Cloud infrastructure dashboard.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- MIDDLEWARE ---
CORS_ORIGINS = os.environ.get(
    "BACKEND_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8080,http://127.0.0.1:8080",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    same_site="lax",
    https_only=False,
)

# --- ROUTES ---
app.include_router(auth_router)
app.include_router(workspaces_router)

@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "Sharexpress Cloud API",
        "version": "1.0.0",
        "status": "online",
        "docs": f"{BACKEND_URL}/docs"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.environ.get("SERVER_HOST", "0.0.0.0"),
        port=int(os.environ.get("SERVER_PORT", 8000)),
        reload=True,
    )
