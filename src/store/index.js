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
  uploadFile,
  deleteFile,
} from "./slices/storageSlice";

import settingsReducer, {
  toggleTheme,
  updateAppearance,
  updateNotifications,
} from "./slices/settingsSlice";

import secretsReducer, {
  setSecrets,
  addSecret,
  deleteSecret,
} from "./slices/secretsSlice";

import domainsReducer, {
  setDomains,
  addDomain,
  verifyDomain,
  deleteDomain,
} from "./slices/domainsSlice";

import functionsReducer, {
  setFunctions,
  addFunction,
  triggerFunction,
} from "./slices/functionsSlice";

import teamReducer, {
  setMembers,
  inviteMember,
  cancelInvite,
  updateRole,
  removeMember,
} from "./slices/teamSlice";

import billingReducer, {
  changePlan,
  addInvoice,
} from "./slices/billingSlice";

import apiKeysReducer, {
  generateKey,
  rotateKey,
  revokeKey,
  createApiKey,
  revokeApiKey,
} from "./slices/apiKeysSlice";

import logsReducer, {
  addLogLine,
  clearLogs,
  toggleStreaming,
  setFilterLevel,
  setSearchQuery,
} from "./slices/logsSlice";

import monitoringReducer, {
  toggleAlert,
  addAlert,
  setMetricRange,
  toggleLiveUpdates,
  setRegionFilter,
} from "./slices/monitoringSlice";

import computeReducer, {
  setCompute,
  addCompute,
  scaleReplicas,
  completeScaling,
  restartContainer,
  completeRestart,
} from "./slices/computeSlice";

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
  uploadFile,
  deleteFile,
  toggleTheme,
  updateAppearance,
  updateNotifications,
  setSecrets,
  addSecret,
  deleteSecret,
  setDomains,
  addDomain,
  verifyDomain,
  deleteDomain,
  setFunctions,
  addFunction,
  triggerFunction,
  setMembers,
  inviteMember,
  cancelInvite,
  updateRole,
  removeMember,
  changePlan,
  addInvoice,
  generateKey,
  rotateKey,
  revokeKey,
  createApiKey,
  revokeApiKey,
  addLogLine,
  clearLogs,
  toggleStreaming,
  setFilterLevel,
  setSearchQuery,
  toggleAlert,
  addAlert,
  setMetricRange,
  toggleLiveUpdates,
  setRegionFilter,
  setCompute,
  addCompute,
  scaleReplicas,
  completeScaling,
  restartContainer,
  completeRestart,
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
    secrets: secretsReducer,
    domains: domainsReducer,
    functions: functionsReducer,
    team: teamReducer,
    billing: billingReducer,
    apiKeys: apiKeysReducer,
    logs: logsReducer,
    monitoring: monitoringReducer,
    compute: computeReducer,
    stats: statsReducer,
  },
});
