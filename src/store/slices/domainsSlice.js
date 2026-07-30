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
  list: [],
  loading: false,
};

export const domainsSlice = createSlice({
  name: "domains",
  initialState,
  reducers: {
    setDomains: (state, action) => {
      state.list = action.payload;
    },
    addDomain: (state, action) => {
      state.list.unshift(action.payload);
    },
    verifyDomain: () => {},
    deleteDomain: (state, action) => {
      state.list = state.list.filter((d) => d.id !== action.payload);
    },
  },
});

export const { setDomains, addDomain, verifyDomain, deleteDomain } = domainsSlice.actions;

export default domainsSlice.reducer;
