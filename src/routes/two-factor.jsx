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
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyTwoFactor, clearAuthError } from "../store/index.js";

export const Route = createFileRoute("/two-factor")({
    head: () => ({ meta: [{ title: "Two-factor authentication — Nimbus" }] }),
    component: TwoFactorPage,
});

function TwoFactorPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { twoFactorVerified, error } = useSelector((state) => state.auth);
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef([]);

    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (twoFactorVerified) {
            router.navigate({ to: "/" });
        }
    }, [twoFactorVerified, router]);

    const handleChange = (index, value) => {
        if (/[^0-9]/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Autofocus next input
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        const fullCode = code.join("");
        dispatch(verifyTwoFactor(fullCode));
    };

    return (<AuthLayout title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 border border-destructive/25 p-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input 
            key={i} 
            ref={(el) => (inputsRef.current[i] = el)}
            maxLength={1} 
            value={code[i]}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="h-12 w-12 rounded-md border border-border bg-background text-center font-mono text-[18px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        ))}
      </div>
      
      <button 
        onClick={handleVerify}
        className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90 transition-opacity"
      >
        Verify and continue
      </button>
      <button className="mt-3 flex h-10 w-full items-center justify-center rounded-md text-[12.5px] text-muted-foreground hover:text-foreground">
        Use a recovery code instead
      </button>
    </AuthLayout>);
}
