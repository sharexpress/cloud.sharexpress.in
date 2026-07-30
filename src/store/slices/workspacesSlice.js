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
export const fetchWorkspaces = createAsyncThunk(
  "workspaces/fetchWorkspaces",
  async (_, { rejectWithValue }) => {
    try {
      return await api.listWorkspaces();
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch workspaces");
    }
  }
);

export const createWorkspaceThunk = createAsyncThunk(
  "workspaces/createWorkspace",
  async ({ name, slug }, { rejectWithValue }) => {
    try {
      const res = await api.createWorkspace(name, slug);
      return res.workspace;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create workspace");
    }
  }
);

const initialState = {
  list: [],
  activeWorkspaceId: null,
  loading: false,
  error: null,
};

export const workspacesSlice = createSlice({
  name: "workspaces",
  initialState,
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
      const newWs = {
        id: `ws_${Date.now()}`,
        name: action.payload,
        slug: action.payload.toLowerCase().replace(/\s+/g, "-"),
      };
      state.list.push(newWs);
      state.activeWorkspaceId = newWs.id;
    },
    switchWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
    },
    addWorkspace: (state, action) => {
      state.list.unshift(action.payload);
      state.activeWorkspaceId = action.payload.id;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWorkspaces
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
        if (!state.activeWorkspaceId && action.payload.length > 0) {
          state.activeWorkspaceId = action.payload[0].id;
        }
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createWorkspaceThunk
      .addCase(createWorkspaceThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWorkspaceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        state.activeWorkspaceId = action.payload.id;
      })
      .addCase(createWorkspaceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setWorkspaces,
  setActiveWorkspace,
  createWorkspace,
  switchWorkspace,
  addWorkspace,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
