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

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth & User
  sendOtp: (email) => request("/auth/send-otp", { method: "POST", body: { email } }),
  verifyOtp: (transaction_id, otp) => request("/auth/verify-otp", { method: "POST", body: { transaction_id, otp } }),
  getMe: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  // Workspaces
  listWorkspaces: () => request("/workspaces"),
  createWorkspace: (name, slug) => request("/workspaces", { method: "POST", body: { name, slug } }),

  // Projects
  listProjects: (workspace_id = "ws_acme") => request(`/projects?workspace_id=${workspace_id}`),
  getProject: (id) => request(`/projects/${id}`),
  createProject: (data, workspace_id = "ws_acme") => request(`/projects?workspace_id=${workspace_id}`, { method: "POST", body: data }),
  triggerDeploy: (id) => request(`/projects/${id}/deploy`, { method: "POST" }),
  listDeployments: (id) => request(`/projects/${id}/deployments`),
  getProjectEnv: (id) => request(`/projects/${id}/env`),
  addProjectEnv: (id, key, value, is_secret) => request(`/projects/${id}/env`, { method: "POST", body: { key, value, is_secret } }),
  revealProjectEnv: (id) => request(`/projects/${id}/env/reveal`),

  // Databases
  listDatabases: (workspace_id = "ws_acme") => request(`/databases?workspace_id=${workspace_id}`),
  createDatabase: (data, workspace_id = "ws_acme") => request(`/databases?workspace_id=${workspace_id}`, { method: "POST", body: data }),
  getConnectionString: (id, unmask = false) => request(`/databases/${id}/connection${unmask ? '?unmask=true' : ''}`),
  revealConnectionString: (id) => request(`/databases/${id}/connection/reveal`),

  // Storage
  listBuckets: (workspace_id = "ws_acme") => request(`/storage/buckets?workspace_id=${workspace_id}`),
  createBucket: (data, workspace_id = "ws_acme") => request(`/storage/buckets?workspace_id=${workspace_id}`, { method: "POST", body: data }),
  listBucketObjects: (bucketName) => request(`/storage/buckets/${bucketName}/objects`),
  getPresignedUpload: (bucketName, objectName) => request(`/storage/buckets/${bucketName}/presigned-upload?object_name=${encodeURIComponent(objectName)}`, { method: "POST" }),
  getStorageKeys: (id) => request(`/storage/buckets/${id}/keys`),
  revealStorageKeys: (id) => request(`/storage/buckets/${id}/keys/reveal`),

  // Observability
  getSystemStats: () => request("/observability/stats"),
};
