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
import datetime
import logging

from app.models.schemas import DatabaseCreate
from app.core.db import get_db
from app.utils.encryption import encrypt_secret, decrypt_secret
from app.services.database_provisioner import provision_database_container

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
        "connection_string_encrypted": encrypt_secret("postgresql://acme_user:sk_db_pass_908123@primary-pg.internal.sharexpress.in:5432/main_db")
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
        "connection_string_encrypted": encrypt_secret("redis://:sk_redis_pass_12389@cache-redis.internal.sharexpress.in:6379/0")
    }
]

class DatabaseController:
    @staticmethod
    async def create_database(payload: DatabaseCreate, workspace_id: str, user: Dict[str, Any]):
        db = get_db()
        
        # Provision real Docker database container
        prov_res = await provision_database_container(
            name=payload.name,
            engine=payload.engine,
            version=payload.version or "16",
            workspace_id=workspace_id
        )

        db_doc = {
            "id": prov_res["id"],
            "name": payload.name,
            "workspace_id": workspace_id,
            "engine": prov_res["engine"],
            "version": prov_res["version"],
            "region": payload.region,
            "status": prov_res["status"],
            "host": prov_res["host"],
            "port": prov_res["port"],
            "database_name": prov_res["database_name"],
            "connection_string_encrypted": prov_res["connection_string_encrypted"],
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        await db.databases.insert_one(db_doc)
        
        # Return masked connection string by default
        db_doc["connection_string_masked"] = prov_res["connection_string_raw"].replace(
            prov_res["connection_string_raw"].split(":")[2].split("@")[0], "••••••••••••"
        )
        return {"success": True, "database": db_doc}

    @staticmethod
    async def list_databases(workspace_id: str):
        db = get_db()
        databases = await db.databases.find({"workspace_id": workspace_id}).to_list(100)
        if not databases:
            databases = INITIAL_DATABASES

        out = []
        for d in databases:
            d_dict = dict(d)
            if "_id" in d_dict:
                d_dict["id"] = str(d_dict["_id"])
                d_dict.pop("_id", None)

            raw_conn = decrypt_secret(d_dict.get("connection_string_encrypted", ""))
            # Mask password in list view
            parts = raw_conn.split("@")
            if len(parts) > 1 and ":" in parts[0]:
                prefix = parts[0].rsplit(":", 1)[0]
                masked_conn = f"{prefix}:••••••••••••@{parts[1]}"
            else:
                masked_conn = raw_conn

            d_dict["connection_string_masked"] = masked_conn
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

        raw_conn = decrypt_secret(database.get("connection_string_encrypted", ""))
        
        if not unmask:
            parts = raw_conn.split("@")
            if len(parts) > 1 and ":" in parts[0]:
                prefix = parts[0].rsplit(":", 1)[0]
                conn = f"{prefix}:••••••••••••@{parts[1]}"
            else:
                conn = raw_conn
        else:
            conn = raw_conn

        return {
            "success": True,
            "connection_string": conn,
            "unmasked": unmask
        }
