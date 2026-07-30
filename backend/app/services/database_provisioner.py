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
import uuid
import logging
import asyncio
import docker
from typing import Dict, Any
from app.utils.encryption import encrypt_secret

logger = logging.getLogger(__name__)

def get_docker_client():
    try:
        return docker.from_env()
    except Exception as e:
        logger.warning("Docker daemon unreachable for DB provisioner: %s", e)
        return None

def generate_secure_password() -> str:
    """Generate 16-character secure database password."""
    return f"sx_db_{uuid.uuid4().hex[:12]}"

async def provision_database_container(
    name: str,
    engine: str,
    version: str,
    workspace_id: str
) -> Dict[str, Any]:
    """Provision isolated Docker database container with persistent volume."""
    db_password = generate_secure_password()
    engine_lower = engine.lower()
    container_name = f"sx_db_{name}"
    vol_name = f"sx_vol_{name}"
    
    port_mapping = {
        "postgres": 5432,
        "postgresql": 5432,
        "mongodb": 27017,
        "mysql": 3306,
        "redis": 6379
    }
    port = port_mapping.get(engine_lower, 5432)
    host = f"{name}.internal.sharexpress.in"

    # Define engine docker images & envs
    if engine_lower in ["postgres", "postgresql"]:
        image = f"postgres:{version or '16'}-alpine"
        env = {
            "POSTGRES_USER": "shareexpress",
            "POSTGRES_PASSWORD": db_password,
            "POSTGRES_DB": f"{name}_db"
        }
        conn_template = f"postgresql://shareexpress:{db_password}@{host}:{port}/{name}_db"
    elif engine_lower == "mongodb":
        image = f"mongo:{version or '7.0'}"
        env = {
            "MONGO_INITDB_ROOT_USERNAME": "shareexpress",
            "MONGO_INITDB_ROOT_PASSWORD": db_password
        }
        conn_template = f"mongodb://shareexpress:{db_password}@{host}:{port}/{name}_db?authSource=admin"
    elif engine_lower == "mysql":
        image = f"mysql:{version or '8.0'}"
        env = {
            "MYSQL_ROOT_PASSWORD": db_password,
            "MYSQL_DATABASE": f"{name}_db",
            "MYSQL_USER": "shareexpress",
            "MYSQL_PASSWORD": db_password
        }
        conn_template = f"mysql://shareexpress:{db_password}@{host}:{port}/{name}_db"
    else:
        # Redis
        image = f"redis:{version or '7.2'}-alpine"
        env = {}
        conn_template = f"redis://:{db_password}@{host}:{port}/0"

    client = get_docker_client()
    status = "running"
    
    if client:
        try:
            # Stop existing container if any
            try:
                old_c = client.containers.get(container_name)
                old_c.stop()
                old_c.remove()
            except Exception:
                pass

            logger.info("Pulling database image '%s'...", image)
            # Run detached container with volume mount
            container = client.containers.run(
                image,
                name=container_name,
                detach=True,
                environment=env,
                volumes={vol_name: {'bind': '/var/lib/postgresql/data' if 'postgres' in engine_lower else '/data/db', 'mode': 'rw'}},
                mem_limit="1g",
                restart_policy={"Name": "unless-stopped"}
            )
            logger.info("Database container '%s' live! ID: %s", container_name, container.short_id)
        except Exception as err:
            logger.error("Failed to start Docker DB container: %s", err)
            status = "simulated"
    else:
        status = "simulated"

    encrypted_conn = encrypt_secret(conn_template)

    return {
        "id": f"db_{uuid.uuid4().hex[:8]}",
        "name": name,
        "workspace_id": workspace_id,
        "engine": engine.title(),
        "version": version or "latest",
        "status": status,
        "host": host,
        "port": port,
        "database_name": f"{name}_db",
        "password_encrypted": encrypt_secret(db_password),
        "connection_string_encrypted": encrypted_conn,
        "connection_string_raw": conn_template
    }
