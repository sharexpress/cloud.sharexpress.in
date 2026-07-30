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

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Response, Request, HTTPException
from pathlib import Path
from typing import Optional
import logging
from app.core.config import PROJECT_ENVIRONMENT, JWT_EXPIRES, JWT_ALGORITHM

logger = logging.getLogger(__name__)
is_prod = PROJECT_ENVIRONMENT == "PRODUCTION"

BASE_DIR = Path(__file__).resolve().parent.parent
try:
    SECURITY_DIR = BASE_DIR / "core" / "security"
    PRIVATE_KEY = (SECURITY_DIR / "private.pem").read_text()
    PUBLIC_KEY = (SECURITY_DIR / "public.pem").read_text()
except FileNotFoundError as e:
    logger.error("JWT key files not found: %s", e)
    PRIVATE_KEY = ""
    PUBLIC_KEY = ""

def generate_token(user_id: str, email: str = "", response: Optional[Response] = None) -> str:
    """Generate RS256 signed JWT token."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": now,
        "exp": now + timedelta(days=JWT_EXPIRES),
    }
    token = jwt.encode(payload, PRIVATE_KEY, algorithm=JWT_ALGORITHM)
    
    if response:
        response.set_cookie(
            key="user",
            value=token,
            httponly=True,
            secure=is_prod,
            samesite="lax" if not is_prod else "none",
            path="/",
        )
    return token

def verify_token(token: str) -> Optional[dict]:
    """Verify RS256 JWT token using public key."""
    try:
        payload = jwt.decode(token, PUBLIC_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning("JWT verification error: %s", e)
        return None
