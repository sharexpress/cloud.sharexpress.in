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
import { Github, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/lib/api";
import { setUser } from "../store/index.js";

export const Route = createFileRoute("/login")({
    head: () => ({ meta: [{ title: "Sign in — Sharexpress Cloud" }] }),
    component: LoginPage,
});

function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    
    const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.sendOtp(email.trim());
            if (res.success && res.transaction_id) {
                setTransactionId(res.transaction_id);
                setStep(2);
            }
        } catch (err) {
            setError(err.message || "Failed to send verification OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const res = await api.verifyOtp(transactionId, otp.trim());
            if (res.success && res.user) {
                dispatch(setUser(res.user));
                router.navigate({ to: "/" });
            }
        } catch (err) {
            setError(err.message || "Invalid OTP code");
        } finally {
            setLoading(false);
        }
    };

    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

    return (
        <AuthLayout
            title={step === 1 ? "Sign in to Sharexpress Cloud" : "Enter Verification Code"}
            subtitle={step === 1 ? "Enter your email to receive a passwordless OTP code." : `We sent a 6-digit verification code to ${email}`}
            footer={<span>Need help? Contact <a href="mailto:support@sharexpress.in" className="text-foreground hover:underline">support@sharexpress.in</a></span>}
        >
            <div className="space-y-3">
                {step === 1 && (
                    <>
                        <a
                            href={`${API_BASE}/auth/github/login`}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors"
                        >
                            <Github className="h-4 w-4"/> Continue with GitHub
                        </a>
                        <a
                            href={`${API_BASE}/auth/google/login`}
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors"
                        >
                            <span className="grid h-4 w-4 place-items-center rounded-sm bg-foreground text-[9px] font-bold text-background">G</span>
                            Continue with Google
                        </a>

                        <div className="relative py-2 flex items-center justify-center">
                            <span className="w-full border-t border-border/40" />
                            <span className="absolute bg-background px-2 text-[11px] text-muted uppercase">or email OTP</span>
                        </div>
                    </>
                )}

                {error && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded p-2.5 text-xs text-destructive font-medium">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-accent/40 border border-border rounded-md pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Sending Code..." : "Send Verification Code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold mb-1">6-Digit OTP Code</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-accent/40 border border-border rounded-md pl-9 pr-3 py-2 text-xs font-mono text-center tracking-widest text-sm focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-all"
                        >
                            {loading ? "Verifying..." : "Verify & Sign In"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-center text-xs text-muted hover:text-foreground pt-1"
                        >
                            &larr; Back to Email
                        </button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}
