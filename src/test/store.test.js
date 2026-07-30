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

import { describe, it, expect } from "vitest";
import { store, setProjects, addProject, setDatabases, addDatabase, setBuckets, toggleTheme } from "@/store";

describe("Redux Store Feature Slices Suite", () => {
  it("initializes root store with all required domain feature slices", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("workspaces");
    expect(state).toHaveProperty("projects");
    expect(state).toHaveProperty("deployments");
    expect(state).toHaveProperty("databases");
    expect(state).toHaveProperty("storage");
    expect(state).toHaveProperty("settings");
    expect(state).toHaveProperty("secrets");
    expect(state).toHaveProperty("domains");
    expect(state).toHaveProperty("functions");
    expect(state).toHaveProperty("team");
    expect(state).toHaveProperty("billing");
    expect(state).toHaveProperty("apiKeys");
    expect(state).toHaveProperty("logs");
    expect(state).toHaveProperty("monitoring");
    expect(state).toHaveProperty("compute");
    expect(state).toHaveProperty("stats");
  });

  it("updates projectsSlice correctly", () => {
    store.dispatch(setProjects([{ id: "p_1", name: "Test Proj", slug: "test-proj" }]));
    expect(store.getState().projects.list).toHaveLength(1);

    store.dispatch(addProject({ id: "p_2", name: "New Proj", slug: "new-proj" }));
    expect(store.getState().projects.list).toHaveLength(2);
    expect(store.getState().projects.list[0].name).toBe("New Proj");
  });

  it("updates databasesSlice correctly", () => {
    store.dispatch(setDatabases([{ id: "db_1", name: "test-db", engine: "PostgreSQL 16" }]));
    expect(store.getState().databases.list).toHaveLength(1);
  });

  it("updates storageSlice correctly", () => {
    store.dispatch(setBuckets([{ id: "b_1", name: "acme-uploads", visibility: "public" }]));
    expect(store.getState().storage.buckets).toHaveLength(1);
  });

  it("toggles settingsSlice appearance theme", () => {
    const initialTheme = store.getState().settings.appearance.theme;
    store.dispatch(toggleTheme());
    const toggledTheme = store.getState().settings.appearance.theme;
    expect(toggledTheme).not.toBe(initialTheme);
  });
});
