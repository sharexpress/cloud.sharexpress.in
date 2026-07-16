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

import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
let serverEntryPromise;
async function getServerEntry() {
    if (!serverEntryPromise) {
        serverEntryPromise = import("@tanstack/react-start/server-entry").then((m) => (m.default ?? m));
    }
    return serverEntryPromise;
}
// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response) {
    if (response.status < 500)
        return response;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json"))
        return response;
    const body = await response.clone().text();
    if (!isH3SwallowedErrorBody(body))
        return response;
    console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
    return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
    });
}
function isH3SwallowedErrorBody(body) {
    try {
        const payload = JSON.parse(body);
        return payload.unhandled === true && payload.message === "HTTPError";
    }
    catch {
        return false;
    }
}
export default {
    async fetch(request, env, ctx) {
        try {
            const handler = await getServerEntry();
            const response = await handler.fetch(request, env, ctx);
            return await normalizeCatastrophicSsrResponse(response);
        }
        catch (error) {
            console.error(error);
            return new Response(renderErrorPage(), {
                status: 500,
                headers: { "content-type": "text/html; charset=utf-8" },
            });
        }
    },
};
