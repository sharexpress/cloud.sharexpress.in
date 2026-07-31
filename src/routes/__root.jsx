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

import { Provider } from "react-redux";
import { store } from "../store/index.js";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, } from "@tanstack/react-router";
import { useEffect } from "react";
import appCss from "../styles.css?url";
import { useSelector } from "react-redux";

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
    console.error("Root Route Error:", error);
    const router = useRouter();
    return (<div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-xl text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive font-mono font-bold text-sm">
          500
        </div>
        <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-foreground">Something went wrong</h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          An unexpected error occurred. Details below:
        </p>
        <div className="mt-4 p-3 rounded-lg bg-surface border border-border text-left font-mono text-[11px] text-destructive overflow-x-auto max-h-48">
          {error?.message || String(error)}
          {error?.stack && <pre className="mt-2 text-[10px] text-muted-foreground opacity-80 whitespace-pre-wrap">{error.stack}</pre>}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => {
            router.invalidate();
            reset();
        }} className="inline-flex items-center justify-center rounded-md bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-opacity hover:opacity-90 cursor-pointer">
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-md border border-border bg-surface px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong">
            Overview
          </a>
        </div>
      </div>
    </div>);
}

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

function ThemeApplier({ children }) {
    const theme = useSelector((state) => state.settings?.appearance?.theme || "dark");
    
    useEffect(() => {
        if (typeof document === "undefined") return;
        const root = document.documentElement;
        if (theme === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
        } else {
            root.classList.add("light");
            root.classList.remove("dark");
            root.style.colorScheme = "light";
        }
    }, [theme]);

    return children;
}

function RootComponent() {
    return (
      <Provider store={store}>
        <ThemeApplier>
          <Outlet />
        </ThemeApplier>
      </Provider>
    );
}

export const Route = createRootRouteWithContext()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Sharexpress Cloud — Cloud Infrastructure Platform" },
            { name: "description", content: "Deploy apps, run microservices, manage databases, object storage, and CDN media seamlessly with Sharexpress Ecosystem." },
            { name: "author", content: "Sharexpress Foundation" },
            { property: "og:title", content: "Sharexpress Cloud — Cloud Infrastructure Platform" },
            { property: "og:description", content: "Deploy apps, run microservices, manage databases, object storage, and CDN media seamlessly with Sharexpress Ecosystem." },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
            { rel: "stylesheet", href: appCss },
            { rel: "icon", href: "/logo.png", type: "image/png" },
            { rel: "shortcut icon", href: "/logo.png", type: "image/png" },
            { rel: "apple-touch-icon", href: "/logo.png" },
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
