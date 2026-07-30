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

// --- Auth Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    isAuthenticated: false,
    twoFactorRequired: false,
    twoFactorVerified: false,
    emailVerified: true,
    verificationCodeSent: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    register: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.twoFactorVerified = false;
    },
    setTwoFactorVerified: (state, action) => {
      state.twoFactorVerified = action.payload;
    },
    verifyTwoFactor: (state) => { state.twoFactorVerified = true; },
    verifyEmailLink: (state) => { state.emailVerified = true; },
    forgotPassword: (state) => { state.verificationCodeSent = true; },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
});

// --- Workspaces Slice ---
const workspacesSlice = createSlice({
  name: "workspaces",
  initialState: {
    list: [],
    activeWorkspaceId: null,
    loading: false,
  },
  reducers: {
    setWorkspaces: (state, action) => {
      state.list = action.payload;
      if (!state.activeWorkspaceId && action.payload.length > 0) {
        state.activeWorkspaceId = action.payload[0].id;
      }
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    createWorkspace: (state, action) => {
      const newWs = { id: `ws_${Date.now()}`, name: action.payload, slug: action.payload.toLowerCase().replace(/\s+/g, "-") };
      state.list.push(newWs);
      state.activeWorkspaceId = newWs.id;
    },
    switchWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    addWorkspace: (state, action) => {
      state.list.unshift(action.payload);
      state.activeWorkspaceId = action.payload.id;
    }
  }
});

// --- Projects Slice ---
const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    list: [],
    loading: false,
  },
  reducers: {
    setProjects: (state, action) => {
      state.list = action.payload;
    },
    addProject: (state, action) => {
      state.list.unshift(action.payload);
    },
    deleteProject: (state, action) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    }
  },
});

// --- Deployments Slice ---
const deploymentsSlice = createSlice({
  name: "deployments",
  initialState: {
    list: [],
  },
  reducers: {
    setDeployments: (state, action) => {
      state.list = action.payload;
    },
    addDeployment: (state, action) => {
      state.list.unshift(action.payload);
    },
    triggerRollback: (state) => {},
  },
});

// --- Databases Slice ---
const databasesSlice = createSlice({
  name: "databases",
  initialState: {
    list: [],
  },
  reducers: {
    setDatabases: (state, action) => {
      state.list = action.payload;
    },
    addDatabase: (state, action) => {
      state.list.unshift(action.payload);
    },
    restartDatabase: (state) => {},
    completeDatabaseRestart: (state) => {},
  },
});

// --- Storage / Buckets Slice ---
const storageSlice = createSlice({
  name: "storage",
  initialState: {
    buckets: [],
    currentObjects: [],
  },
  reducers: {
    setBuckets: (state, action) => {
      state.buckets = action.payload;
    },
    addBucket: (state, action) => {
      state.buckets.unshift(action.payload);
    },
    setObjects: (state, action) => {
      state.currentObjects = action.payload;
    }
  },
});

// --- Generic Stub Slice for auxiliary routes ---
const auxSlice = createSlice({
  name: "aux",
  initialState: {
    functions: [],
    team: [],
    apiKeys: [],
    secrets: [],
    domains: [],
    compute: [],
    invoices: [],
    theme: "dark"
  },
  reducers: {
    addFunction: (state, action) => { state.functions.unshift(action.payload); },
    triggerFunction: (state) => {},
    inviteMember: (state, action) => { state.team.unshift(action.payload); },
    cancelInvite: (state) => {},
    updateRole: (state) => {},
    removeMember: (state) => {},
    createApiKey: (state, action) => { state.apiKeys.unshift(action.payload); },
    revokeApiKey: (state) => {},
    generateKey: (state) => {},
    rotateKey: (state) => {},
    revokeKey: (state) => {},
    addSecret: (state, action) => { state.secrets.unshift(action.payload); },
    deleteSecret: (state) => {},
    addDomain: (state, action) => { state.domains.unshift(action.payload); },
    verifyDomain: (state) => {},
    deleteDomain: (state) => {},
    addCompute: (state, action) => { state.compute.unshift(action.payload); },
    scaleReplicas: (state) => {},
    completeScaling: (state) => {},
    restartContainer: (state) => {},
    completeRestart: (state) => {},
    addInvoice: (state, action) => { state.invoices.unshift(action.payload); },
    changePlan: (state) => {},
    toggleAlert: (state) => {},
    addAlert: (state) => {},
    uploadMediaFile: (state) => {},
    deleteMediaFile: (state) => {},
    uploadFile: (state) => {},
    deleteFile: (state) => {},
    updateNotifications: (state) => {},
    toggleTheme: (state) => { state.theme = state.theme === "dark" ? "light" : "dark"; },
    addLogLine: (state) => {},
    clearLogs: (state) => {},
    toggleStreaming: (state) => {},
    setFilterLevel: (state) => {},
    setSearchQuery: (state) => {},
    setMetricRange: (state) => {},
    toggleLiveUpdates: (state) => {},
    setRegionFilter: (state) => {},
  }
});

// --- Observability / Stats Slice ---
const statsSlice = createSlice({
  name: "stats",
  initialState: {
    metrics: null,
  },
  reducers: {
    setStats: (state, action) => {
      state.metrics = action.payload;
    }
  }
});

export const { setUser, login, register, logout, setTwoFactorVerified, verifyTwoFactor, verifyEmailLink, forgotPassword, clearAuthError } = authSlice.actions;
export const { setWorkspaces, setActiveWorkspace, createWorkspace, switchWorkspace, addWorkspace } = workspacesSlice.actions;
export const { setProjects, addProject, deleteProject } = projectsSlice.actions;
export const { setDeployments, addDeployment, triggerRollback } = deploymentsSlice.actions;
export const { setDatabases, addDatabase, restartDatabase, completeDatabaseRestart } = databasesSlice.actions;
export const { setBuckets, addBucket, setObjects } = storageSlice.actions;
export const { 
  addFunction, triggerFunction, inviteMember, cancelInvite, updateRole, removeMember, 
  createApiKey, revokeApiKey, generateKey, rotateKey, revokeKey, addSecret, deleteSecret, addDomain, verifyDomain, deleteDomain, 
  addCompute, scaleReplicas, completeScaling, restartContainer, completeRestart,
  addInvoice, changePlan, toggleAlert, addAlert, uploadMediaFile, deleteMediaFile, uploadFile, deleteFile, updateNotifications, toggleTheme,
  addLogLine, clearLogs, toggleStreaming, setFilterLevel, setSearchQuery, setMetricRange, toggleLiveUpdates, setRegionFilter
} = auxSlice.actions;
export const { setStats } = statsSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    workspaces: workspacesSlice.reducer,
    projects: projectsSlice.reducer,
    deployments: deploymentsSlice.reducer,
    databases: databasesSlice.reducer,
    storage: storageSlice.reducer,
    aux: auxSlice.reducer,
    stats: statsSlice.reducer,
  },
});
