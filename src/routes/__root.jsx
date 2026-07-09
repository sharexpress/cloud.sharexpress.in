import { Provider } from "react-redux";
import { store } from "../store/index.js";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
function NotFoundComponent() {
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-surface text-muted-foreground">
          404
        </div>
        <h1 className="mt-6 text-[22px] font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/dashboard" className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90">
            Back to Overview
          </Link>
        </div>
      </div>
    </div>);
}
function ErrorComponent({ error, reset }) {
    console.error(error);
    const router = useRouter();
    useEffect(() => {
        reportLovableError(error, { boundary: "tanstack_root_error_component" });
    }, [error]);
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          500
        </div>
        <h1 className="mt-6 text-[22px] font-semibold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          An unexpected error occurred. You can try again or head back to the dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => {
            router.invalidate();
            reset();
        }} className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong">
            Overview
          </a>
        </div>
      </div>
    </div>);
}
export const Route = createRootRouteWithContext()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Nimbus — Cloud platform for modern teams" },
            { name: "description", content: "Deploy apps, run compute, manage databases and storage, and monitor everything from one unified cloud control plane." },
            { name: "author", content: "Nimbus" },
            { property: "og:title", content: "Nimbus — Cloud platform for modern teams" },
            { property: "og:description", content: "Deploy apps, run compute, manage databases and storage, and monitor everything from one unified cloud control plane." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
            { rel: "preconnect", href: "https://fonts.googleapis.com" },
            { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
            {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap",
            },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
});
function RootShell({ children }) {
    return (<html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>);
}
function RootComponent() {
    return (<Provider store={store}>
      <Outlet />
    </Provider>);
}
