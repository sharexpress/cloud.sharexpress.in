/*
 * Copyright 2026 Sharexpress Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.
let lastCapturedError;
const TTL_MS = 5_000;
function record(error) {
    lastCapturedError = { error, at: Date.now() };
}
if (typeof globalThis.addEventListener === "function") {
    globalThis.addEventListener("error", (event) => record(event.error ?? event));
    globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
export function consumeLastCapturedError() {
    if (!lastCapturedError)
        return undefined;
    if (Date.now() - lastCapturedError.at > TTL_MS) {
        lastCapturedError = undefined;
        return undefined;
    }
    const { error } = lastCapturedError;
    lastCapturedError = undefined;
    return error;
}
