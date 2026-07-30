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
import base64
import hashlib
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.core.config import ENCRYPTION_MASTER_KEY

def _derive_key() -> bytes:
    """Derive 256-bit key from master key string."""
    return hashlib.sha256(ENCRYPTION_MASTER_KEY.encode()).digest()

def encrypt_secret(plaintext: str) -> str:
    """Encrypt plaintext using AES-256-GCM. Returns base64 encoded payload (nonce + ciphertext)."""
    if not plaintext:
        return ""
    key = _derive_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 96-bit nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    combined = nonce + ciphertext
    return base64.b64encode(combined).decode('utf-8')

def decrypt_secret(encrypted_b64: str) -> str:
    """Decrypt base64 payload using AES-256-GCM."""
    if not encrypted_b64:
        return ""
    try:
        key = _derive_key()
        aesgcm = AESGCM(key)
        combined = base64.b64decode(encrypted_b64.encode('utf-8'))
        nonce = combined[:12]
        ciphertext = combined[12:]
        decrypted = aesgcm.decrypt(nonce, ciphertext, None)
        return decrypted.decode('utf-8')
    except Exception as e:
        # Fallback if unencrypted legacy data
        return encrypted_b64
