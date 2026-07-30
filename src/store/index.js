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

import { configureStore, createSlice } from "@reduxjs/toolkit";
import {
  projects as initialProjects,
  deployments as initialDeployments,
  databases as initialDatabases,
  compute as initialCompute,
  functions as initialFunctions,
  domains as initialDomains,
  secrets as initialSecrets,
  buckets as initialBuckets,
  mediaFiles as initialMediaFiles,
  team as initialTeam,
  invoices as initialInvoices,
  apiKeys as initialApiKeys,
  logLines as initialLogLines,
} from "../lib/mock";

// --- Auth Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: { name: "Jordan Lee", email: "jordan@acme.com", role: "Owner", initials: "JL" },
    isAuthenticated: true,
    twoFactorRequired: false,
    twoFactorVerified: false,
    emailVerified: true,
    verificationCodeSent: false,
    error: null,
  },
  reducers: {
    login: (state, action) => {
      const { email, password } = action.payload;
      if (email && password) {
        state.isAuthenticated = true;
        state.user = { name: "Jordan Lee", email, role: "Owner", initials: email.substring(0, 2).toUpperCase() };
        state.error = null;
      }
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.twoFactorVerified = false;
    },
    setTwoFactorRequired: (state, action) => {
      state.twoFactorRequired = action.payload;
    },
    verifyTwoFactor: (state, action) => {
      if (action.payload === "123456" || action.payload.length === 6) {
        state.twoFactorVerified = true;
        state.error = null;
      } else {
        state.error = "Invalid 2FA code. Hint: Enter any 6 digit code.";
      }
    },
    register: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.emailVerified = false;
    },
    verifyEmailLink: (state) => {
      state.emailVerified = true;
    },
    forgotPassword: (state, action) => {
      state.verificationCodeSent = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  }
});

// --- Projects Slice ---
const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    list: initialProjects,
    activeProjectId: "p_01",
    error: null,
  },
  reducers: {
    addProject: (state, action) => {
      const newProj = {
        id: `p_${Date.now()}`,
        status: "ready",
        updatedAt: "Just now",
        branch: "main",
        region: "iad1",
        environment: "production",
        ...action.payload,
      };
      state.list.unshift(newProj);
    },
    deleteProject: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
      if (state.activeProjectId === action.payload) {
        state.activeProjectId = state.list[0]?.id || null;
      }
    },
    setActiveProject: (state, action) => {
      state.activeProjectId = action.payload;
    },
  }
});

// --- Deployments Slice ---
const deploymentsSlice = createSlice({
  name: "deployments",
  initialState: {
    list: initialDeployments,
  },
  reducers: {
    addDeployment: (state, action) => {
      const newDpl = {
        id: `dpl_${Math.random().toString(36).substring(2, 6)}`,
        status: "ready",
        createdAt: "Just now",
        duration: "12s",
        ...action.payload,
      };
      state.list.unshift(newDpl);
    },
    triggerRollback: (state, action) => {
      const { deploymentId, projectName } = action.payload;
      const original = state.list.find(d => d.id === deploymentId);
      if (original) {
        const rollbackDpl = {
          ...original,
          id: `dpl_${Math.random().toString(36).substring(2, 6)}`,
          status: "building",
          createdAt: "Just now",
          message: `Rollback to commit ${original.commit}`,
          duration: "—",
        };
        state.list.unshift(rollbackDpl);
        
        // Mock progression to "ready" after 4 seconds
        setTimeout(() => {
          // This is a side-effect, handled in store subscription or async thunks if needed,
          // but for simplicity we will just let it be. Let's make it start as ready to keep UI simple.
        }, 1000);
      }
    },
    updateDeploymentStatus: (state, action) => {
      const { id, status } = action.payload;
      const d = state.list.find(d => d.id === id);
      if (d) d.status = status;
    }
  }
});

// --- Databases Slice ---
const databasesSlice = createSlice({
  name: "databases",
  initialState: {
    list: initialDatabases,
  },
  reducers: {
    addDatabase: (state, action) => {
      const newDb = {
        id: `db_${Date.now()}`,
        status: "healthy",
        cpu: 1,
        storage: 1,
        size: "256 MB",
        ...action.payload
      };
      state.list.push(newDb);
    },
    restartDatabase: (state, action) => {
      const db = state.list.find(d => d.id === action.payload);
      if (db) {
        db.status = "restarting";
      }
    },
    completeDatabaseRestart: (state, action) => {
      const db = state.list.find(d => d.id === action.payload);
      if (db) {
        db.status = "healthy";
      }
    }
  }
});

// --- Compute Slice ---
const computeSlice = createSlice({
  name: "compute",
  initialState: {
    list: initialCompute,
  },
  reducers: {
    scaleReplicas: (state, action) => {
      const { id, replicas } = action.payload;
      const cmp = state.list.find(c => c.id === id);
      if (cmp) {
        cmp.replicas = replicas;
        cmp.status = "scaling";
      }
    },
    completeScaling: (state, action) => {
      const cmp = state.list.find(c => c.id === action.payload);
      if (cmp) {
        cmp.status = "healthy";
      }
    },
    restartContainer: (state, action) => {
      const cmp = state.list.find(c => c.id === action.payload);
      if (cmp) {
        cmp.status = "restarting";
      }
    },
    completeRestart: (state, action) => {
      const cmp = state.list.find(c => c.id === action.payload);
      if (cmp) {
        cmp.status = "healthy";
      }
    }
  }
});

// --- Storage Slice ---
const storageSlice = createSlice({
  name: "storage",
  initialState: {
    buckets: initialBuckets,
    activeBucketId: "b_1",
    files: [
      { id: "sf_1", bucketId: "b_1", name: "assets/logo.png", size: "45 KB", type: "image/png", updated: "2h ago" },
      { id: "sf_2", bucketId: "b_1", name: "index.html", size: "1.2 KB", type: "text/html", updated: "1d ago" },
      { id: "sf_3", bucketId: "b_2", name: "uploads/invoice_981.pdf", size: "142 KB", type: "application/pdf", updated: "5m ago" },
      { id: "sf_4", bucketId: "b_3", name: "backups/prod_db_2026_07_01.tar.gz", size: "841 MB", type: "application/x-gzip", updated: "12h ago" },
    ],
  },
  reducers: {
    addBucket: (state, action) => {
      const newB = {
        id: `b_${Date.now()}`,
        size: "0 B",
        objects: "0",
        region: "iad1",
        visibility: "private",
        ...action.payload
      };
      state.buckets.push(newB);
    },
    setActiveBucket: (state, action) => {
      state.activeBucketId = action.payload;
    },
    uploadFile: (state, action) => {
      const newFile = {
        id: `sf_${Date.now()}`,
        bucketId: state.activeBucketId,
        size: "124 KB",
        type: "image/png",
        updated: "Just now",
        ...action.payload
      };
      state.files.unshift(newFile);
      
      // Update objects count
      const b = state.buckets.find(b => b.id === state.activeBucketId);
      if (b) {
        const count = parseInt(b.objects.replace(/,/g, "")) + 1;
        b.objects = count.toLocaleString();
      }
    },
    deleteFile: (state, action) => {
      state.files = state.files.filter(f => f.id !== action.payload);
      const b = state.buckets.find(b => b.id === state.activeBucketId);
      if (b) {
        const count = Math.max(0, parseInt(b.objects.replace(/,/g, "")) - 1);
        b.objects = count.toLocaleString();
      }
    }
  }
});

// --- Media Slice ---
const mediaSlice = createSlice({
  name: "media",
  initialState: {
    files: initialMediaFiles,
    transformations: {
      activeFileId: "f_1",
      width: 800,
      height: 600,
      quality: 80,
      format: "webp",
      compression: "lossy"
    }
  },
  reducers: {
    selectMediaFile: (state, action) => {
      state.transformations.activeFileId = action.payload;
    },
    updateTransformations: (state, action) => {
      state.transformations = {
        ...state.transformations,
        ...action.payload
      };
    },
    addMediaFile: (state, action) => {
      state.files.unshift({
        id: `f_${Date.now()}`,
        size: "345 KB",
        updated: "Just now",
        ...action.payload
      });
    }
  }
});

// --- Functions Slice ---
const functionsSlice = createSlice({
  name: "functions",
  initialState: {
    list: initialFunctions,
    invocationsHistory: [
      { time: "12:00", count: 420 },
      { time: "12:05", count: 510 },
      { time: "12:10", count: 320 },
      { time: "12:15", count: 680 },
      { time: "12:20", count: 440 },
    ]
  },
  reducers: {
    addFunction: (state, action) => {
      state.list.push({
        id: `fn_${Date.now()}`,
        invocations: "0",
        errors: "0.00%",
        p95: "—",
        ...action.payload
      });
    },
    triggerFunction: (state, action) => {
      const fn = state.list.find(f => f.id === action.payload);
      if (fn) {
        // Increment invocation
        let count = parseFloat(fn.invocations.replace(/[MK]/g, "")) || 0;
        if (fn.invocations.includes("M")) count *= 1000000;
        else if (fn.invocations.includes("k")) count *= 1000;
        count += 1;
        
        if (count >= 1000000) fn.invocations = (count / 1000000).toFixed(1) + "M";
        else if (count >= 1000) fn.invocations = (count / 1000).toFixed(1) + "k";
        else fn.invocations = count.toString();
      }
    }
  }
});

// --- Domains Slice ---
const domainsSlice = createSlice({
  name: "domains",
  initialState: {
    list: initialDomains,
  },
  reducers: {
    addDomain: (state, action) => {
      state.list.unshift({
        id: `d_${Date.now()}`,
        status: "pending",
        ssl: "issuing",
        expires: "—",
        ...action.payload
      });
    },
    verifyDomain: (state, action) => {
      const d = state.list.find(item => item.id === action.payload);
      if (d) {
        d.status = "active";
        d.ssl = "valid";
        d.expires = "in 365 days";
      }
    },
    deleteDomain: (state, action) => {
      state.list = state.list.filter(d => d.id !== action.payload);
    }
  }
});

// --- Secrets Slice ---
const secretsSlice = createSlice({
  name: "secrets",
  initialState: {
    list: initialSecrets,
  },
  reducers: {
    addSecret: (state, action) => {
      state.list.unshift({
        id: `s_${Date.now()}`,
        updated: "Just now",
        ...action.payload
      });
    },
    deleteSecret: (state, action) => {
      state.list = state.list.filter(s => s.id !== action.payload);
    }
  }
});

// --- Monitoring Slice ---
const monitoringSlice = createSlice({
  name: "monitoring",
  initialState: {
    alerts: [
      { id: "al_1", name: "High Latency P99", metric: "latency", threshold: "> 500ms", enabled: true },
      { id: "al_2", name: "CPU Exhaustion", metric: "cpu", threshold: "> 90%", enabled: true },
      { id: "al_3", name: "Error Spike", metric: "errors", threshold: "> 1% / 5m", enabled: false },
    ],
    incidents: [
      { id: "inc_1", title: "Latency spike in US-East region", status: "resolved", time: "2d ago" },
      { id: "inc_2", title: "Storage volume resizing delay", status: "resolved", time: "1w ago" },
    ]
  },
  reducers: {
    toggleAlert: (state, action) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) alert.enabled = !alert.enabled;
    },
    addAlert: (state, action) => {
      state.alerts.push({
        id: `al_${Date.now()}`,
        enabled: true,
        ...action.payload
      });
    }
  }
});

// --- Logs Slice ---
const logsSlice = createSlice({
  name: "logs",
  initialState: {
    lines: initialLogLines,
    filterLevel: "all",
    searchQuery: "",
    isStreaming: true,
  },
  reducers: {
    addLogLine: (state, action) => {
      if (state.isStreaming) {
        state.lines.unshift(action.payload);
        if (state.lines.length > 100) {
          state.lines.pop();
        }
      }
    },
    clearLogs: (state) => {
      state.lines = [];
    },
    toggleStreaming: (state) => {
      state.isStreaming = !state.isStreaming;
    },
    setFilterLevel: (state, action) => {
      state.filterLevel = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

// --- Team Slice ---
const teamSlice = createSlice({
  name: "team",
  initialState: {
    members: initialTeam,
    invitations: [
      { id: "inv_1", email: "dev@acme.com", role: "Developer", sent: "1h ago" },
    ],
  },
  reducers: {
    inviteMember: (state, action) => {
      state.invitations.unshift({
        id: `inv_${Date.now()}`,
        sent: "Just now",
        ...action.payload
      });
    },
    cancelInvite: (state, action) => {
      state.invitations = state.invitations.filter(i => i.id !== action.payload);
    },
    updateRole: (state, action) => {
      const { id, role } = action.payload;
      const member = state.members.find(m => m.id === id);
      if (member) member.role = role;
    },
    removeMember: (state, action) => {
      state.members = state.members.filter(m => m.id !== action.payload);
    }
  }
});

// --- Billing Slice ---
const billingSlice = createSlice({
  name: "billing",
  initialState: {
    invoices: initialInvoices,
    subscription: { plan: "Enterprise", amount: "$4,800/mo", nextBill: "Aug 1, 2026" },
    usage: {
      bandwidth: { current: 412, limit: 1000, unit: "GB" },
      compute: { current: 1840, limit: 5000, unit: "Hrs" },
      storage: { current: 1.7, limit: 5, unit: "TB" },
      functions: { current: 1.34, limit: 10, unit: "M Invocations" },
    }
  },
  reducers: {
    changePlan: (state, action) => {
      state.subscription.plan = action.payload.plan;
      state.subscription.amount = action.payload.amount;
    }
  }
});

// --- API Keys Slice ---
const apiKeysSlice = createSlice({
  name: "apiKeys",
  initialState: {
    list: initialApiKeys,
  },
  reducers: {
    generateKey: (state, action) => {
      const randomPrefix = Math.random().toString(36).substring(2, 6);
      state.list.unshift({
        id: `k_${Date.now()}`,
        prefix: `sk_live_${randomPrefix}…c1`,
        created: "Just now",
        lastUsed: "Never",
        ...action.payload
      });
    },
    rotateKey: (state, action) => {
      const key = state.list.find(k => k.id === action.payload);
      if (key) {
        const randomPrefix = Math.random().toString(36).substring(2, 6);
        key.prefix = `sk_live_${randomPrefix}…rotated`;
        key.lastUsed = "Never";
      }
    },
    revokeKey: (state, action) => {
      state.list = state.list.filter(k => k.id !== action.payload);
    }
  }
});

// --- Settings Slice ---
const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    appearance: { theme: "dark", sidebarOpen: true },
    notifications: { emailAlerts: true, billingAlerts: true, securityAlerts: true }
  },
  reducers: {
    toggleTheme: (state) => {
      state.appearance.theme = state.appearance.theme === "dark" ? "light" : "dark";
    },
    updateNotifications: (state, action) => {
      state.notifications = {
        ...state.notifications,
        ...action.payload
      };
    }
  }
});

// --- Workspaces Slice ---
const workspacesSlice = createSlice({
  name: "workspaces",
  initialState: {
    list: [
      { id: "ws_01", name: "Acme Inc", slug: "acme-inc", plan: "Enterprise", color: "#7C3AED", createdAt: "Jan 2026" },
      { id: "ws_02", name: "Personal", slug: "personal", plan: "Pro", color: "#0891B2", createdAt: "Mar 2026" },
    ],
    activeWorkspaceId: "ws_01",
  },
  reducers: {
    createWorkspace: (state, action) => {
      const ws = {
        id: `ws_${Date.now()}`,
        color: "#059669",
        plan: "Free",
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        ...action.payload,
      };
      state.list.push(ws);
      state.activeWorkspaceId = ws.id;
    },
    switchWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    deleteWorkspace: (state, action) => {
      state.list = state.list.filter(w => w.id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.list[0]?.id || null;
      }
    },
    updateWorkspace: (state, action) => {
      const { id, ...changes } = action.payload;
      const ws = state.list.find(w => w.id === id);
      if (ws) Object.assign(ws, changes);
    },
  }
});

// --- Store Configuration ---
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    workspaces: workspacesSlice.reducer,
    projects: projectsSlice.reducer,
    deployments: deploymentsSlice.reducer,
    databases: databasesSlice.reducer,
    compute: computeSlice.reducer,
    storage: storageSlice.reducer,
    media: mediaSlice.reducer,
    functions: functionsSlice.reducer,
    domains: domainsSlice.reducer,
    secrets: secretsSlice.reducer,
    monitoring: monitoringSlice.reducer,
    logs: logsSlice.reducer,
    team: teamSlice.reducer,
    billing: billingSlice.reducer,
    apiKeys: apiKeysSlice.reducer,
    settings: settingsSlice.reducer,
  }
});

// Export all actions
export const {
  login, logout, setTwoFactorRequired, verifyTwoFactor, register, verifyEmailLink, forgotPassword, clearAuthError
} = authSlice.actions;

export const { addProject, deleteProject, setActiveProject } = projectsSlice.actions;
export const { addDeployment, triggerRollback, updateDeploymentStatus } = deploymentsSlice.actions;
export const { addDatabase, restartDatabase, completeDatabaseRestart } = databasesSlice.actions;
export const { scaleReplicas, completeScaling, restartContainer, completeRestart } = computeSlice.actions;
export const { addBucket, setActiveBucket, uploadFile, deleteFile } = storageSlice.actions;
export const { selectMediaFile, updateTransformations, addMediaFile } = mediaSlice.actions;
export const { addFunction, triggerFunction } = functionsSlice.actions;
export const { addDomain, verifyDomain, deleteDomain } = domainsSlice.actions;
export const { addSecret, deleteSecret } = secretsSlice.actions;
export const { toggleAlert, addAlert } = monitoringSlice.actions;
export const { addLogLine, clearLogs, toggleStreaming, setFilterLevel, setSearchQuery } = logsSlice.actions;
export const { inviteMember, cancelInvite, updateRole, removeMember } = teamSlice.actions;
export const { changePlan } = billingSlice.actions;
export const { generateKey, rotateKey, revokeKey } = apiKeysSlice.actions;
export const { toggleTheme, updateNotifications } = settingsSlice.actions;
export const { createWorkspace, switchWorkspace, deleteWorkspace, updateWorkspace } = workspacesSlice.actions;
