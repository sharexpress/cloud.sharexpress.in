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
from app.models.schemas import StorageBucketCreate
from app.core.db import get_db
import logging
import uuid

logger = logging.getLogger(__name__)

INITIAL_BUCKETS = [
    {
        "id": "b_1",
        "name": "media-assets",
        "workspace_id": "ws_acme",
        "visibility": "public",
        "region": "iad1",
        "size": "42.8 GB",
        "objects_count": 12480,
        "endpoint": "https://media-assets.s3.sharexpress.in"
    },
    {
        "id": "b_2",
        "name": "backups-archive",
        "workspace_id": "ws_acme",
        "visibility": "private",
        "region": "iad1",
        "size": "142.0 GB",
        "objects_count": 480,
        "endpoint": "https://backups-archive.s3.sharexpress.in"
    }
]

class StorageController:
    @staticmethod
    async def create_bucket(payload: StorageBucketCreate, workspace_id: str, user: Dict[str, Any]):
        db = get_db()
        b_id = f"b_{uuid.uuid4().hex[:8]}"
        bucket_doc = {
            "id": b_id,
            "name": payload.name,
            "workspace_id": workspace_id,
            "visibility": payload.visibility,
            "region": payload.region,
            "size": "0 GB",
            "objects_count": 0,
            "endpoint": f"https://{payload.name}.s3.sharexpress.in",
            "access_key": f"AKIA_PROD_{uuid.uuid4().hex[:12].upper()}",
            "secret_key": f"sk_s3_secret_{uuid.uuid4().hex[:16]}"
        }

        await db.buckets.insert_one(bucket_doc)
        return {"success": True, "bucket": bucket_doc}

    @staticmethod
    async def list_buckets(workspace_id: str):
        db = get_db()
        buckets = await db.buckets.find({"workspace_id": workspace_id}).to_list(100)
        if not buckets:
            return INITIAL_BUCKETS

        out = []
        for b in buckets:
            b_dict = dict(b)
            b_dict["id"] = str(b_dict["_id"])
            b_dict.pop("_id", None)
            out.append(b_dict)
        return out

    @staticmethod
    async def get_credentials(bucket_id: str, unmask: bool = False):
        db = get_db()
        bucket = await db.buckets.find_one({"id": bucket_id})
        if not bucket:
            bucket = next((b for b in INITIAL_BUCKETS if b["id"] == bucket_id), None)
            if not bucket:
                raise HTTPException(status_code=404, detail="Bucket not found")

        access_key = bucket.get("access_key", "AKIA_PROD_SHAREXPRESS_2026_KEYS")
        secret_key = bucket.get("secret_key", "sk_secret_sharexpress_prod_894102931")

        if not unmask:
            secret_key = "••••••••••••••••••••••••••••••••"

        return {
            "success": True,
            "access_key_id": access_key,
            "secret_access_key": secret_key,
            "unmasked": unmask
        }
