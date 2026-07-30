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
import { render, screen } from "@testing-library/react";
import { Metric, Panel, PageHeader, StatusBadge, Tag } from "@/components/app/primitives";
import { Cpu, HardDrive, Database } from "lucide-react";

describe("Primitives UI Component Suite", () => {
  it("renders Metric with component reference icon without throwing", () => {
    render(<Metric title="CPU Usage" value="42%" icon={Cpu} change="Optimal" trend="up" />);
    expect(screen.getByText("CPU Usage")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("Optimal")).toBeInTheDocument();
  });

  it("renders Metric with pre-constructed JSX element icon without throwing", () => {
    render(<Metric label="RAM Usage" value="8.0 GB" icon={<HardDrive className="h-4 w-4" />} />);
    expect(screen.getByText("RAM Usage")).toBeInTheDocument();
    expect(screen.getByText("8.0 GB")).toBeInTheDocument();
  });

  it("renders Panel with forwardRef icon cleanly", () => {
    render(
      <Panel title="Database Containers" icon={Database}>
        <p>Container Status: Running</p>
      </Panel>
    );
    expect(screen.getByText("Database Containers")).toBeInTheDocument();
    expect(screen.getByText("Container Status: Running")).toBeInTheDocument();
  });

  it("renders PageHeader with both 'action' and 'actions' prop forms", () => {
    render(<PageHeader title="Projects" action={<button>New Project</button>} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("New Project")).toBeInTheDocument();
  });

  it("renders StatusBadge with all predefined status states", () => {
    const statuses = ["ready", "healthy", "building", "degraded", "error"];
    statuses.forEach((st) => {
      const { unmount } = render(<StatusBadge status={st} />);
      expect(screen.getByText(st)).toBeInTheDocument();
      unmount();
    });
  });

  it("renders Tag component", () => {
    render(<Tag>iad1</Tag>);
    expect(screen.getByText("iad1")).toBeInTheDocument();
  });
});
