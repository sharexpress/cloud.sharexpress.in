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
  alerts: [],
  incidents: [],
  metricRange: "24h",
  liveUpdates: true,
  regionFilter: "all",
};

export const monitoringSlice = createSlice({
  name: "monitoring",
  initialState,
  reducers: {
    toggleAlert: () => {},
    addAlert: (state, action) => {
      state.alerts.unshift(action.payload);
    },
    setMetricRange: (state, action) => {
      state.metricRange = action.payload;
    },
    toggleLiveUpdates: (state) => {
      state.liveUpdates = !state.liveUpdates;
    },
    setRegionFilter: (state, action) => {
      state.regionFilter = action.payload;
    },
  },
});

export const { toggleAlert, addAlert, setMetricRange, toggleLiveUpdates, setRegionFilter } = monitoringSlice.actions;

export default monitoringSlice.reducer;
