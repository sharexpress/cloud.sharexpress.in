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
  functions: [],
  team: [],
  apiKeys: [],
  secrets: [],
  domains: [],
  compute: [],
  invoices: [],
  theme: "dark",
};

export const auxSlice = createSlice({
  name: "aux",
  initialState,
  reducers: {
    addFunction: (state, action) => {
      state.functions.unshift(action.payload);
    },
    triggerFunction: () => {},
    inviteMember: (state, action) => {
      state.team.unshift(action.payload);
    },
    cancelInvite: () => {},
    updateRole: () => {},
    removeMember: () => {},
    createApiKey: (state, action) => {
      state.apiKeys.unshift(action.payload);
    },
    revokeApiKey: () => {},
    generateKey: () => {},
    rotateKey: () => {},
    revokeKey: () => {},
    addSecret: (state, action) => {
      state.secrets.unshift(action.payload);
    },
    deleteSecret: () => {},
    addDomain: (state, action) => {
      state.domains.unshift(action.payload);
    },
    verifyDomain: () => {},
    deleteDomain: () => {},
    addCompute: (state, action) => {
      state.compute.unshift(action.payload);
    },
    scaleReplicas: () => {},
    completeScaling: () => {},
    restartContainer: () => {},
    completeRestart: () => {},
    addInvoice: (state, action) => {
      state.invoices.unshift(action.payload);
    },
    changePlan: () => {},
    toggleAlert: () => {},
    addAlert: () => {},
    uploadMediaFile: () => {},
    deleteMediaFile: () => {},
    uploadFile: () => {},
    deleteFile: () => {},
    updateNotifications: () => {},
    toggleTheme: (state) => {
      state.theme = state.theme === "dark" ? "light" : "dark";
    },
    addLogLine: () => {},
    clearLogs: () => {},
    toggleStreaming: () => {},
    setFilterLevel: () => {},
    setSearchQuery: () => {},
    setMetricRange: () => {},
    toggleLiveUpdates: () => {},
    setRegionFilter: () => {},
  },
});

export const {
  addFunction,
  triggerFunction,
  inviteMember,
  cancelInvite,
  updateRole,
  removeMember,
  createApiKey,
  revokeApiKey,
  generateKey,
  rotateKey,
  revokeKey,
  addSecret,
  deleteSecret,
  addDomain,
  verifyDomain,
  deleteDomain,
  addCompute,
  scaleReplicas,
  completeScaling,
  restartContainer,
  completeRestart,
  addInvoice,
  changePlan,
  toggleAlert,
  addAlert,
  uploadMediaFile,
  deleteMediaFile,
  uploadFile,
  deleteFile,
  updateNotifications,
  toggleTheme,
  addLogLine,
  clearLogs,
  toggleStreaming,
  setFilterLevel,
  setSearchQuery,
  setMetricRange,
  toggleLiveUpdates,
  setRegionFilter,
} = auxSlice.actions;

export default auxSlice.reducer;
