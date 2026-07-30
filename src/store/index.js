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
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.twoFactorVerified = false;
    },
    setTwoFactorVerified: (state, action) => {
      state.twoFactorVerified = action.payload;
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

export const { setUser, logout, setTwoFactorVerified } = authSlice.actions;
export const { setWorkspaces, setActiveWorkspace, addWorkspace } = workspacesSlice.actions;
export const { setProjects, addProject } = projectsSlice.actions;
export const { setDeployments, addDeployment } = deploymentsSlice.actions;
export const { setDatabases, addDatabase } = databasesSlice.actions;
export const { setBuckets, addBucket, setObjects } = storageSlice.actions;
export const { setStats } = statsSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    workspaces: workspacesSlice.reducer,
    projects: projectsSlice.reducer,
    deployments: deploymentsSlice.reducer,
    databases: databasesSlice.reducer,
    storage: storageSlice.reducer,
    stats: statsSlice.reducer,
  },
});
