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
from dotenv import load_dotenv

load_dotenv(override=True)

PROJECT_ENVIRONMENT = os.getenv("PROJECT_ENVIRONMENT", "DEVELOPMENT").upper()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# DATABASE CONFIGURATION
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "sharexpress_cloud")

SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY", "sharexpress-session-secret-key-2026")
ENCRYPTION_MASTER_KEY = os.getenv("ENCRYPTION_MASTER_KEY", "sharexpress-secret-key-32bytes-master-2026!")

# REDIS CONFIGURATION
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))

# JWT RS256 CONFIGURATION
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "RS256")
JWT_EXPIRES = int(os.getenv("JWT_EXPIRES", 7))

# GOOGLE OAUTH CLIENT
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")

# GITHUB OAUTH CLIENT
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

# GITLAB OAUTH CLIENT
GITLAB_CLIENT_ID = os.getenv("GITLAB_CLIENT_ID", "")
GITLAB_CLIENT_SECRET = os.getenv("GITLAB_CLIENT_SECRET", "")

# SMTP CONFIGURATION
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "noreply@sharexpress.in")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Sharexpress Cloud")
