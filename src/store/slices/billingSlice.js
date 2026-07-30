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
  plan: "Pro",
  subscription: {
    plan: "Pro",
    nextBill: "Aug 1, 2026",
    amount: "$120/mo",
  },
  usage: { bandwidth_gb: 184, compute_hours: 742 },
  invoices: [
    { id: "INV-2026-006", period: "Jun 2026", issued: "Jun 1, 2026", amount: "$120.00", status: "paid" },
    { id: "INV-2026-005", period: "May 2026", issued: "May 1, 2026", amount: "$120.00", status: "paid" },
    { id: "INV-2026-004", period: "Apr 2026", issued: "Apr 1, 2026", amount: "$120.00", status: "paid" }
  ],
};

export const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    changePlan: (state, action) => {
      const planName = typeof action.payload === "string" ? action.payload : action.payload?.plan || "Pro";
      const amount = typeof action.payload === "object" && action.payload?.amount ? action.payload.amount : "$120/mo";
      state.plan = planName;
      state.subscription.plan = planName;
      state.subscription.amount = amount;
    },
    addInvoice: (state, action) => {
      state.invoices.unshift(action.payload);
    },
  },
});

export const { changePlan, addInvoice } = billingSlice.actions;

export default billingSlice.reducer;
