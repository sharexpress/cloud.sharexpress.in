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

import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../store/index.js";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({
    head: () => ({ meta: [{ title: "Forgot password — Sharexpress Cloud" }] }),
    component: ForgotPage,
});

function ForgotPage() {
    const dispatch = useDispatch();
    const { verificationCodeSent } = useSelector((state) => state.auth);
    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            dispatch(forgotPassword(email));
        }
    };

    if (verificationCodeSent) {
        return (
            <AuthLayout title="Check your inbox" subtitle={`We sent a password reset link to ${email || "jordan@acme.com"}`} footer={<span>Back to <Link to="/login" className="text-foreground hover:underline">Sign in</Link></span>}>
                <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
                        <MailCheck className="h-5 w-5"/>
                    </div>
                    <div className="min-w-0">
                        <div className="text-[13px] font-medium text-foreground">Reset link sent</div>
                        <div className="text-[11.5px] text-muted-foreground">The link expires in 1 hour.</div>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (<AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link." footer={<span>Remembered it? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></span>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11.5px] text-muted-foreground">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <button type="submit" className="flex h-10 w-full items-center justify-center rounded-md bg-blue-600 text-[13px] font-medium text-white hover:bg-blue-500 transition-all cursor-pointer shadow-sm">
          Send reset link
        </button>
      </form>
    </AuthLayout>);
}
