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

from fastapi import APIRouter, Response, Depends
from prometheus_client import CONTENT_TYPE_LATEST
from app.services.metrics_service import collect_telemetry_metrics, get_system_stats_summary
from app.middleware.auth import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/observability", tags=["Observability & Metrics"])

@router.get("/metrics")
async def prometheus_metrics():
    """Prometheus metrics endpoint scrapable by Prometheus server / Grafana Agent."""
    content = collect_telemetry_metrics()
    return Response(content=content, media_type=CONTENT_TYPE_LATEST)

@router.get("/stats")
async def system_stats(user: Dict[str, Any] = Depends(get_current_user)):
    """System stats JSON summary for frontend dashboard analytics gauges."""
    return get_system_stats_summary()
