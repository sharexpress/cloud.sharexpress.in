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
export const fetchSystemStats = createAsyncThunk(
  "stats/fetchSystemStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getSystemStats();
      return res.metrics;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch telemetry stats");
    }
  }
);

const initialState = {
  metrics: null,
  loading: false,
  error: null,
};

export const statsSlice = createSlice({
  name: "stats",
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.metrics = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setStats } = statsSlice.actions;

export default statsSlice.reducer;
