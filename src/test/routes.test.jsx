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

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store";

// Mock TanStack Router hooks
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => () => ({}),
  useRouterState: () => "/dashboard",
  useRouter: () => ({ navigate: vi.fn() }),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
  Outlet: () => <div data-testid="outlet" />,
}));

describe("Deep Route Component Safety Suite", () => {
  function renderWithStore(ui) {
    return render(<Provider store={store}>{ui}</Provider>);
  }

  it("verifies Redux store state selectors produce no undefined access errors", () => {
    const state = store.getState();
    expect(state.projects?.list).toBeDefined();
    expect(state.databases?.list).toBeDefined();
    expect(state.storage?.buckets).toBeDefined();
    expect(state.deployments?.list).toBeDefined();
    expect(state.workspaces?.list).toBeDefined();
  });
});
