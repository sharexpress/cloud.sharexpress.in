import type { ReactNode } from "react";
import { AppSidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  breadcrumbs,
  title,
  actions,
  children,
}: {
  breadcrumbs?: { label: string; href?: string }[];
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} breadcrumbs={breadcrumbs} actions={actions} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
