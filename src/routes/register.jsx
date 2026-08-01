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
import { Github } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { register } from "../store/index.js";

export const Route = createFileRoute("/register")({
    head: () => ({ meta: [{ title: "Create account — Sharexpress Cloud" }] }),
    component: RegisterPage,
});

function RegisterPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            dispatch(register({ 
                name: `${firstName} ${lastName}`.trim() || "User", 
                email 
            }));
            router.navigate({ to: "/verify" });
        }
    };

    return (<AuthLayout title="Create your account" subtitle="Start with the free tier — no credit card required." footer={<span>Already have an account? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></span>}>
      <div className="space-y-3">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors">
          <Github className="h-4 w-4"/> Sign up with GitHub
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border"/> or <div className="h-px flex-1 bg-border"/>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11.5px] text-muted-foreground">First name</label>
            <input 
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[11.5px] text-muted-foreground">Last name</label>
            <input 
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="text-[11.5px] text-muted-foreground">Work email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[11.5px] text-muted-foreground">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
          <p className="mt-1 text-[10.5px] text-muted-foreground">At least 12 characters with a mix of letters, numbers, and symbols.</p>
        </div>
        <button type="submit" className="flex h-10 w-full items-center justify-center rounded-md bg-[#5F6AD2] text-[13px] font-medium text-white hover:bg-[#4F5ABF] transition-all cursor-pointer shadow-sm">
          Create account
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          By creating an account, you agree to our <a className="text-foreground hover:underline" href="#">Terms</a> and <a className="text-foreground hover:underline" href="#">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>);
}
