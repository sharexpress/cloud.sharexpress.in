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

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buckets: [],
  currentObjects: [],
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
});

export const { setBuckets, addBucket, setObjects } = storageSlice.actions;

export default storageSlice.reducer;
