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

import { Link } from "@tanstack/react-router";
import { SharexpressLogo } from "./logo";

export function AuthLayout({ title, subtitle, children, footer, }) {
    return (<div className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-2">
      <div className="flex flex-col justify-between px-8 py-8">
        <Link to="/" className="flex items-center gap-2.5">
          <SharexpressLogo className="h-6 w-6" />
          <div>
            <span className="text-[14px] font-semibold text-foreground tracking-tight block leading-none">Sharexpress Cloud</span>
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Sharexpress Foundation</span>
          </div>
        </Link>

        <div className="mx-auto w-full max-w-sm py-16">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-2 text-[13px] text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>

        <div className="text-[11.5px] text-muted-foreground">
          {footer ?? <span>© 2026 Sharexpress Foundation. All rights reserved.</span>}
        </div>
      </div>

      <aside className="relative hidden overflow-hidden border-l border-border bg-surface lg:block dot-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/10"/>
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="max-w-md">
            <div className="text-[11px] font-medium uppercase tracking-wider text-accent">Sharexpress Cloud Infrastructure</div>
            <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-foreground">
              Ship faster.<br />Scale calmly across the ecosystem.
            </h2>
            <p className="mt-4 text-[13.5px] leading-relaxed text-muted-foreground">
              Sharexpress Cloud integrates deployments, compute, databases, object storage, and media delivery seamlessly with assets.sharexpress.in and files.sharexpress.in — so your team spends time creating, not plumbing.
            </p>
          </div>

          <figure className="rounded-lg border border-border bg-background/70 p-5 backdrop-blur-sm">
            <blockquote className="text-[13.5px] leading-relaxed text-foreground">
              "We consolidated our entire asset delivery and microservices onto Sharexpress Cloud. Zero downtime and lightning performance."
            </blockquote>
            <figcaption className="mt-3 flex items-center gap-2.5">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-accent/15 text-[10px] font-semibold text-accent">SF</div>
              <div className="text-[11.5px] text-muted-foreground">
                <span className="text-foreground">Sharexpress Ecosystem</span> · Engineering Team
              </div>
            </figcaption>
          </figure>
        </div>
      </aside>
    </div>);
}
