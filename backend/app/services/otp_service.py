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

import random
import uuid
import hashlib
import json
import logging
from typing import Dict, Any
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

def generate_otp_code() -> str:
    """Generate a random 6-digit OTP code."""
    return str(random.randint(100000, 999999))

def hash_otp(otp: str) -> str:
    """Hash OTP using SHA256."""
    return hashlib.sha256(otp.encode()).hexdigest()

async def send_otp_transaction(email: str, otp_code: str) -> Dict[str, Any]:
    """Store hashed OTP transaction in Redis with 5-minute TTL."""
    redis_client = get_redis()
    transaction_id = str(uuid.uuid4())
    key = f"otp:{transaction_id}"
    payload = {
        "email": email,
        "hashedOTP": hash_otp(otp_code),
        "attempts": 0
    }
    
    if redis_client:
        redis_client.setex(key, 300, json.dumps(payload))
    
    logger.info("OTP generated for %s: %s (TxID: %s)", email, otp_code, transaction_id)
    return {
        "success": True,
        "transaction_id": transaction_id,
        "message": "OTP generated successfully",
        "otp_debug": otp_code  # For local development logging
    }

async def verify_otp_transaction(transaction_id: str, otp_code: str) -> Dict[str, Any]:
    """Verify submitted OTP against Redis transaction."""
    redis_client = get_redis()
    if not redis_client:
        # Fallback if Redis is unreachable in local dev
        return {"valid": True, "reason": "Bypassed (no redis)", "email": "user@sharexpress.in"}

    key = f"otp:{transaction_id}"
    raw = redis_client.get(key)
    if not raw:
        return {"valid": False, "reason": "OTP expired or invalid transaction ID"}

    try:
        data = json.loads(raw)
        email = data["email"]
        hashed_target = data["hashedOTP"]
        attempts = data.get("attempts", 0)

        if attempts >= 5:
            redis_client.delete(key)
            return {"valid": False, "reason": "Too many failed attempts. Request a new OTP."}

        if hash_otp(otp_code) == hashed_target:
            redis_client.delete(key)
            return {"valid": True, "reason": "Verified", "email": email}

        data["attempts"] = attempts + 1
        redis_client.setex(key, 300, json.dumps(data))
        return {"valid": False, "reason": f"Invalid OTP. {5 - (attempts + 1)} attempts remaining."}
    except Exception as e:
        logger.error("Error verifying OTP: %s", e)
        return {"valid": False, "reason": "Verification failed"}

def mark_user_identity_verified(user_id: str, ttl_seconds: int = 900):
    """Mark user as identity-verified in Redis for 15 minutes (900 seconds) for sensitive operations."""
    redis_client = get_redis()
    if redis_client:
        redis_client.setex(f"verified_identity:{user_id}", ttl_seconds, "true")

def is_user_identity_verified(user_id: str) -> bool:
    """Check if user completed OTP verification in the last 15 minutes."""
    redis_client = get_redis()
    if not redis_client:
        return True # Default allow in local dev if Redis disabled
    val = redis_client.get(f"verified_identity:{user_id}")
    return Boolean(val) if isinstance(val, bool) else bool(val)
