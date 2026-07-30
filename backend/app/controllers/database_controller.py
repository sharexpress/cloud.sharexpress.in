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

from fastapi import HTTPException
from typing import Dict, Any
from app.models.schemas import DatabaseCreate
from app.core.db import get_db
import logging
import uuid
import datetime

logger = logging.getLogger(__name__)

INITIAL_DATABASES = [
    {
        "id": "db_1",
        "name": "primary-pg",
        "workspace_id": "ws_acme",
        "engine": "PostgreSQL",
        "version": "16.2",
        "status": "running",
        "region": "iad1",
        "host": "primary-pg.internal.sharexpress.in",
        "port": 5432,
        "database_name": "main_db",
        "connection_string_masked": "postgresql://acme_user:••••••••••••@primary-pg.internal.sharexpress.in:5432/main_db"
    },
    {
        "id": "db_2",
        "name": "cache-redis",
        "workspace_id": "ws_acme",
        "engine": "Redis",
        "version": "7.2",
        "status": "running",
        "region": "iad1",
        "host": "cache-redis.internal.sharexpress.in",
        "port": 6379,
        "database_name": "0",
        "connection_string_masked": "redis://:••••••••••••@cache-redis.internal.sharexpress.in:6379/0"
    }
]

class DatabaseController:
    @staticmethod
    async def create_database(payload: DatabaseCreate, workspace_id: str, user: Dict[str, Any]):
        db = get_db()
        db_id = f"db_{uuid.uuid4().hex[:8]}"
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        db_doc = {
            "id": db_id,
            "name": payload.name,
            "workspace_id": workspace_id,
            "engine": payload.engine.title(),
            "version": payload.version,
            "region": payload.region,
            "status": "running",
            "host": f"{payload.name}.internal.sharexpress.in",
            "port": 5432 if payload.engine == "postgres" else 27017 if payload.engine == "mongodb" else 3306,
            "database_name": f"{payload.name}_db",
            "connection_string": f"{payload.engine}://share_user:sk_secret_db_pass_8921@{payload.name}.internal.sharexpress.in/{payload.name}_db",
            "created_at": now
        }

        await db.databases.insert_one(db_doc)
        return {"success": True, "database": db_doc}

    @staticmethod
    async def list_databases(workspace_id: str):
        db = get_db()
        databases = await db.databases.find({"workspace_id": workspace_id}).to_list(100)
        if not databases:
            return INITIAL_DATABASES

        out = []
        for d in databases:
            d_dict = dict(d)
            d_dict["id"] = str(d_dict["_id"])
            d_dict.pop("_id", None)
            d_dict["connection_string_masked"] = d_dict.get("connection_string", "").replace("sk_secret_db_pass_8921", "••••••••••••")
            out.append(d_dict)
        return out

    @staticmethod
    async def get_connection_string(db_id: str, unmask: bool = False):
        db = get_db()
        database = await db.databases.find_one({"id": db_id})
        if not database:
            database = next((d for d in INITIAL_DATABASES if d["id"] == db_id), None)
            if not database:
                raise HTTPException(status_code=404, detail="Database not found")

        conn = database.get("connection_string") or "postgresql://acme_user:sk_secret_db_pass_8921@primary-pg.internal.sharexpress.in:5432/main_db"
        if not unmask:
            conn = conn.replace("sk_secret_db_pass_8921", "••••••••••••")

        return {
            "success": True,
            "connection_string": conn,
            "unmasked": unmask
        }
