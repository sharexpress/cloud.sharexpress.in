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
  user: null,
  isAuthenticated: false,
  twoFactorRequired: false,
  twoFactorVerified: false,
  emailVerified: true,
  verificationCodeSent: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    login: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    register: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.twoFactorVerified = false;
    },
    setTwoFactorVerified: (state, action) => {
      state.twoFactorVerified = action.payload;
    },
    verifyTwoFactor: (state) => {
      state.twoFactorVerified = true;
    },
    verifyEmailLink: (state) => {
      state.emailVerified = true;
    },
    forgotPassword: (state) => {
      state.verificationCodeSent = true;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  login,
  register,
  logout,
  setTwoFactorVerified,
  verifyTwoFactor,
  verifyEmailLink,
  forgotPassword,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
