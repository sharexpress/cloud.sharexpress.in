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

from fastapi import Request, HTTPException
import time
import logging
from app.core.redis import get_redis

logger = logging.getLogger(__name__)

def rate_limit(max_requests: int = 60, window_seconds: int = 60):
    """Redis sliding window rate limiter middleware for enterprise API endpoints."""
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        path = request.url.path
        redis_client = get_redis()

        if not redis_client:
            return # Fallback allow if Redis offline

        key = f"rate_limit:{client_ip}:{path}"
        current = int(time.time())
        window_start = current - window_seconds

        try:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(current): current})
            pipe.zcard(key)
            pipe.expire(key, window_seconds)
            results = pipe.execute()

            request_count = results[2]
            if request_count > max_requests:
                logger.warning("Rate limit exceeded for IP %s on %s", client_ip, path)
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests. Please slow down and try again later."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Rate limiter error: %s", e)

    return dependency
