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
  appearance: {
    theme: "dark",
    density: "comfortable",
    fontScale: "normal",
  },
  notifications: {
    emailAlerts: true,
    slackAlerts: false,
  },
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.appearance.theme = state.appearance.theme === "dark" ? "light" : "dark";
    },
    updateAppearance: (state, action) => {
      state.appearance = { ...state.appearance, ...action.payload };
    },
    updateNotifications: (state, action) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
  },
});

export const { toggleTheme, updateAppearance, updateNotifications } = settingsSlice.actions;

export default settingsSlice.reducer;
