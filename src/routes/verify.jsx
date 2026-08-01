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

import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";
import { MailCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { verifyEmailLink } from "../store/index.js";

export const Route = createFileRoute("/verify")({
    head: () => ({ meta: [{ title: "Verify email — Sharexpress Cloud" }] }),
    component: VerifyPage,
});

function VerifyPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const email = user?.email || "jordan@acme.com";

    const handleVerify = () => {
        dispatch(verifyEmailLink());
        router.navigate({ to: "/two-factor" });
    };

    return (<AuthLayout title="Check your email" subtitle={`We sent a verification link to ${email}.`}>
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
          <MailCheck className="h-5 w-5"/>
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">Verification link sent</div>
          <div className="text-[11.5px] text-muted-foreground">The link expires in 15 minutes.</div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <button 
          onClick={handleVerify}
          className="flex h-10 w-full items-center justify-center rounded-md bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer shadow-sm"
        >
          Confirm Email Verification
        </button>
        <button className="flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors">
          Resend email
        </button>
      </div>
    </AuthLayout>);
}
