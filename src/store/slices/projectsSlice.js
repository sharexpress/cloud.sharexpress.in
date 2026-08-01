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

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "@/lib/api";

// --- Async Thunks ---
export const fetchProjects = createAsyncThunk(
  "projects/fetchProjects",
  async (workspace_id = "ws_acme", { rejectWithValue }) => {
    try {
      return await api.listProjects(workspace_id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch projects");
    }
  }
);

export const createProjectThunk = createAsyncThunk(
  "projects/createProject",
  async ({ projectData, workspace_id = "ws_acme" }, { rejectWithValue }) => {
    try {
      const res = await api.createProject(projectData, workspace_id);
      return res.project;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create project");
    }
  }
);

const defaultProjects = [
  {
    id: "p_acme_web",
    name: "backend-setup-portfolio",
    slug: "backend-setup-portfolio",
    type: "web_service",
    framework: "Node",
    repo: "santusht06/backend-setup-portfolio",
    branch: "main",
    domain: "backend-setup-portfolio.sharexpress.in",
    region: "fra1",
    status: "ready",
    updated: "1y",
  },
  {
    id: "p_shop_api",
    name: "shopground-api",
    slug: "shopground-api",
    type: "web_service",
    framework: "Node",
    repo: "santusht06/shopground-api",
    branch: "main",
    domain: "shopground-api.sharexpress.in",
    region: "iad1",
    status: "ready",
    updated: "2d ago",
  },
  {
    id: "p_leetcode_static",
    name: "leetcode-notes",
    slug: "leetcode-notes",
    type: "static_site",
    framework: "Vite + React",
    repo: "santusht06/leetcode",
    branch: "main",
    domain: "leetcode.sharexpress.in",
    region: "iad1",
    status: "ready",
    updated: "40m ago",
  }
];

const initialState = {
  list: defaultProjects,
  loading: false,
  error: null,
};

export const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      state.list = action.payload;
    },
    addProject: (state, action) => {
      state.list.unshift(action.payload);
    },
    deleteProject: (state, action) => {
      state.list = state.list.filter((p) => p.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchProjects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.list = (action.payload && action.payload.length > 0) ? action.payload : defaultProjects;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createProjectThunk
      .addCase(createProjectThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createProjectThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setProjects, addProject, deleteProject } = projectsSlice.actions;

export default projectsSlice.reducer;
