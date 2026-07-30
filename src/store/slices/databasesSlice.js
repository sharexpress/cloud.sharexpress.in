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
export const fetchDatabases = createAsyncThunk(
  "databases/fetchDatabases",
  async (workspace_id = "ws_acme", { rejectWithValue }) => {
    try {
      return await api.listDatabases(workspace_id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch databases");
    }
  }
);

export const createDatabaseThunk = createAsyncThunk(
  "databases/createDatabase",
  async ({ dbData, workspace_id = "ws_acme" }, { rejectWithValue }) => {
    try {
      const res = await api.createDatabase(dbData, workspace_id);
      return res.database;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to provision database cluster");
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

export const databasesSlice = createSlice({
  name: "databases",
  initialState,
  reducers: {
    setDatabases: (state, action) => {
      state.list = action.payload;
    },
    addDatabase: (state, action) => {
      state.list.unshift(action.payload);
    },
    restartDatabase: () => {},
    completeDatabaseRestart: () => {},
  },
  extraReducers: (builder) => {
    builder
      // fetchDatabases
      .addCase(fetchDatabases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDatabases.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchDatabases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createDatabaseThunk
      .addCase(createDatabaseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDatabaseThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createDatabaseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setDatabases,
  addDatabase,
  restartDatabase,
  completeDatabaseRestart,
} = databasesSlice.actions;

export default databasesSlice.reducer;
