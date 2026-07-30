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

import smtplib
import asyncio
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core import config

logger = logging.getLogger(__name__)

def _send_smtp_sync(to_email: str, subject: str, otp_code: str):
    """Send HTML OTP email synchronously."""
    host = config.SMTP_HOST
    port = config.SMTP_PORT
    username = config.SMTP_USERNAME
    password = config.SMTP_PASSWORD
    from_email = config.SMTP_FROM_EMAIL
    from_name = config.SMTP_FROM_NAME

    if not username or not password or not from_email:
        logger.info("[MOCK EMAIL] To: %s | OTP: %s", to_email, otp_code)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{from_email}>" if from_name else from_email
    msg["To"] = to_email

    html_content = f"""
    <div style="font-family: sans-serif; padding: 20px; background-color: #0d1117; color: #ffffff;">
        <h2>Sharexpress Cloud Verification Code</h2>
        <p>Your one-time code for login and sensitive action verification is:</p>
        <h1 style="font-family: monospace; font-size: 32px; letter-spacing: 4px; color: #8b5cf6;">{otp_code}</h1>
        <p style="color: #8b949e; font-size: 12px;">This code will expire in 5 minutes.</p>
    </div>
    """
    msg.attach(MIMEText(html_content, "html"))

    if port == 465:
        server = smtplib.SMTP_SSL(host, port, timeout=30)
    else:
        server = smtplib.SMTP(host, port, timeout=30)
        server.ehlo()
        if port == 587 or server.has_extn("STARTTLS"):
            server.starttls()
            server.ehlo()

    try:
        server.login(username, password)
        server.sendmail(from_email, to_email, msg.as_string())
        logger.info("Sent OTP email to %s", to_email)
    finally:
        server.quit()

async def send_otp_email(to_email: str, subject: str, otp_code: str) -> bool:
    """Send OTP email asynchronously."""
    try:
        await asyncio.to_thread(_send_smtp_sync, to_email, subject, otp_code)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email: %s", e)
        return False
