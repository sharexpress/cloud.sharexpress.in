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

import { configureStore } from "@reduxjs/toolkit";

import authReducer, {
  fetchCurrentUser,
  sendOtpThunk,
  verifyOtpThunk,
  logoutThunk,
  setUser,
  login,
  register,
  logout,
  setTwoFactorVerified,
  verifyTwoFactor,
  verifyEmailLink,
  forgotPassword,
  clearAuthError,
} from "./slices/authSlice";

import workspacesReducer, {
  fetchWorkspaces,
  createWorkspaceThunk,
  setWorkspaces,
  setActiveWorkspace,
  createWorkspace,
  switchWorkspace,
  addWorkspace,
} from "./slices/workspacesSlice";

import projectsReducer, {
  fetchProjects,
  createProjectThunk,
  setProjects,
  addProject,
  deleteProject,
} from "./slices/projectsSlice";

import deploymentsReducer, {
  setDeployments,
  addDeployment,
  triggerRollback,
} from "./slices/deploymentsSlice";

import databasesReducer, {
  fetchDatabases,
  createDatabaseThunk,
  setDatabases,
  addDatabase,
  restartDatabase,
  completeDatabaseRestart,
} from "./slices/databasesSlice";

import storageReducer, {
  fetchBuckets,
  createBucketThunk,
  fetchObjectsThunk,
  setBuckets,
  addBucket,
  setObjects,
} from "./slices/storageSlice";

import settingsReducer, {
  toggleTheme,
  updateAppearance,
  updateNotifications,
} from "./slices/settingsSlice";

import auxReducer, {
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
  addLogLine,
  clearLogs,
  toggleStreaming,
  setFilterLevel,
  setSearchQuery,
  setMetricRange,
  toggleLiveUpdates,
  setRegionFilter,
} from "./slices/auxSlice";

import statsReducer, { fetchSystemStats, setStats } from "./slices/statsSlice";

// Re-export all async thunks & actions for enterprise clean imports
export {
  fetchCurrentUser,
  sendOtpThunk,
  verifyOtpThunk,
  logoutThunk,
  setUser,
  login,
  register,
  logout,
  setTwoFactorVerified,
  verifyTwoFactor,
  verifyEmailLink,
  forgotPassword,
  clearAuthError,
  fetchWorkspaces,
  createWorkspaceThunk,
  setWorkspaces,
  setActiveWorkspace,
  createWorkspace,
  switchWorkspace,
  addWorkspace,
  fetchProjects,
  createProjectThunk,
  setProjects,
  addProject,
  deleteProject,
  setDeployments,
  addDeployment,
  triggerRollback,
  fetchDatabases,
  createDatabaseThunk,
  setDatabases,
  addDatabase,
  restartDatabase,
  completeDatabaseRestart,
  fetchBuckets,
  createBucketThunk,
  fetchObjectsThunk,
  setBuckets,
  addBucket,
  setObjects,
  toggleTheme,
  updateAppearance,
  updateNotifications,
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
  addLogLine,
  clearLogs,
  toggleStreaming,
  setFilterLevel,
  setSearchQuery,
  setMetricRange,
  toggleLiveUpdates,
  setRegionFilter,
  fetchSystemStats,
  setStats,
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspacesReducer,
    projects: projectsReducer,
    deployments: deploymentsReducer,
    databases: databasesReducer,
    storage: storageReducer,
    settings: settingsReducer,
    aux: auxReducer,
    stats: statsReducer,
  },
});
