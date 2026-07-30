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
  activeWorkspaceId: null,
  loading: false,
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
});

export const {
  setWorkspaces,
  setActiveWorkspace,
  createWorkspace,
  switchWorkspace,
  addWorkspace,
} = workspacesSlice.actions;

export default workspacesSlice.reducer;
