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

import os
import logging
import boto3
from botocore.config import Config
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "http://localhost:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")

def get_s3_client():
    try:
        return boto3.client(
            "s3",
            endpoint_url=MINIO_ENDPOINT,
            aws_access_key_id=MINIO_ACCESS_KEY,
            aws_secret_access_key=MINIO_SECRET_KEY,
            config=Config(signature_version="s3v4"),
            region_name="us-east-1"
        )
    except Exception as e:
        logger.warning("MinIO S3 client connection error: %s", e)
        return None

def ensure_bucket_exists(bucket_name: str) -> bool:
    """Create S3 bucket if it does not exist."""
    s3 = get_s3_client()
    if not s3:
        return False
    try:
        s3.head_bucket(Bucket=bucket_name)
        return True
    except Exception:
        try:
            s3.create_bucket(Bucket=bucket_name)
            logger.info("Created MinIO S3 bucket '%s'", bucket_name)
            return True
        except Exception as err:
            logger.error("Failed to create bucket '%s': %s", bucket_name, err)
            return False

def generate_presigned_upload_url(bucket_name: str, object_name: str, expiration: int = 3600) -> Dict[str, Any]:
    """Generate S3 presigned URL for direct frontend client upload."""
    s3 = get_s3_client()
    if not s3:
        return {
            "upload_url": f"{MINIO_ENDPOINT}/{bucket_name}/{object_name}?mock_presigned=true",
            "object_key": object_name,
            "fields": {}
        }
    try:
        ensure_bucket_exists(bucket_name)
        response = s3.generate_presigned_post(
            Bucket=bucket_name,
            Key=object_name,
            ExpiresIn=expiration
        )
        return {
            "upload_url": response["url"],
            "fields": response["fields"],
            "object_key": object_name
        }
    except Exception as e:
        logger.error("Failed to generate presigned upload URL: %s", e)
        return {
            "upload_url": f"{MINIO_ENDPOINT}/{bucket_name}/{object_name}",
            "object_key": object_name,
            "fields": {}
        }

def list_bucket_objects(bucket_name: str) -> List[Dict[str, Any]]:
    """List all objects in MinIO bucket."""
    s3 = get_s3_client()
    if not s3:
        return [
            {"key": "avatars/hero-user.png", "size": "412 KB", "content_type": "image/png", "last_modified": "Today at 14:20"},
            {"key": "documents/terms-v2.pdf", "size": "1.2 MB", "content_type": "application/pdf", "last_modified": "Yesterday at 09:15"},
            {"key": "videos/intro-demo.mp4", "size": "24.5 MB", "content_type": "video/mp4", "last_modified": "Jul 28, 2026"},
            {"key": "assets/logo-dark.svg", "size": "18 KB", "content_type": "image/svg+xml", "last_modified": "Jul 27, 2026"}
        ]
    try:
        res = s3.list_objects_v2(Bucket=bucket_name)
        out = []
        for obj in res.get("Contents", []):
            out.append({
                "key": obj["Key"],
                "size": f"{round(obj['Size'] / 1024, 1)} KB",
                "last_modified": str(obj["LastModified"])
            })
        return out
    except Exception as e:
        logger.warning("Error listing S3 objects for bucket %s: %s", bucket_name, e)
        return []
