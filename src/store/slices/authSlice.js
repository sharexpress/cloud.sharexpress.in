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
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.getMe();
      return res.user;
    } catch (err) {
      return rejectWithValue(err.message || "Failed to fetch user");
    }
  }
);

export const sendOtpThunk = createAsyncThunk(
  "auth/sendOtp",
  async (email, { rejectWithValue }) => {
    try {
      return await api.sendOtp(email);
    } catch (err) {
      return rejectWithValue(err.message || "Failed to send OTP");
    }
  }
);

export const verifyOtpThunk = createAsyncThunk(
  "auth/verifyOtp",
  async ({ transactionId, otp }, { rejectWithValue }) => {
    try {
      const res = await api.verifyOtp(transactionId, otp);
      return res.user;
    } catch (err) {
      return rejectWithValue(err.message || "Invalid OTP code");
    }
  }
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.logout();
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Logout failed");
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpTransactionId: null,
  otpSent: false,
  twoFactorRequired: false,
  twoFactorVerified: false,
  emailVerified: true,
  verificationCodeSent: false,
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
  extraReducers: (builder) => {
    builder
      // fetchCurrentUser
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      // sendOtpThunk
      .addCase(sendOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.otpSent = true;
        state.otpTransactionId = action.payload.transaction_id;
      })
      .addCase(sendOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyOtpThunk
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // logoutThunk
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
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
