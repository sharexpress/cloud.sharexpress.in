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
  members: [],
  invitations: [],
  loading: false,
};

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    inviteMember: (state, action) => {
      state.invitations.unshift(action.payload);
    },
    cancelInvite: () => {},
    updateRole: () => {},
    removeMember: (state, action) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
  },
});

export const { setMembers, inviteMember, cancelInvite, updateRole, removeMember } = teamSlice.actions;

export default teamSlice.reducer;
