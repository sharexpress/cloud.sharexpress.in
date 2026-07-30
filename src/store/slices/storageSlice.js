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
export const fetchBuckets = createAsyncThunk(
  "storage/fetchBuckets",
  async (workspace_id = "ws_acme", { rejectWithValue }) => {
    try {
      return await api.listBuckets(workspace_id);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch storage buckets");
    }
  }
);

export const createBucketThunk = createAsyncThunk(
  "storage/createBucket",
  async ({ bucketData, workspace_id = "ws_acme" }, { rejectWithValue }) => {
    try {
      const res = await api.createBucket(bucketData, workspace_id);
      return res.bucket;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to create storage bucket");
    }
  }
);

export const fetchObjectsThunk = createAsyncThunk(
  "storage/fetchObjects",
  async (bucketName, { rejectWithValue }) => {
    try {
      const res = await api.listBucketObjects(bucketName);
      return res.objects;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to list bucket objects");
    }
  }
);

const initialState = {
  buckets: [],
  currentObjects: [],
  loading: false,
  error: null,
};

export const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    setBuckets: (state, action) => {
      state.buckets = action.payload;
    },
    addBucket: (state, action) => {
      state.buckets.unshift(action.payload);
    },
    setObjects: (state, action) => {
      state.currentObjects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBuckets
      .addCase(fetchBuckets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuckets.fulfilled, (state, action) => {
        state.loading = false;
        state.buckets = action.payload;
      })
      .addCase(fetchBuckets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createBucketThunk
      .addCase(createBucketThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBucketThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.buckets.unshift(action.payload);
      })
      .addCase(createBucketThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchObjectsThunk
      .addCase(fetchObjectsThunk.fulfilled, (state, action) => {
        state.currentObjects = action.payload;
      });
  },
});

export const { setBuckets, addBucket, setObjects } = storageSlice.actions;

export default storageSlice.reducer;
