import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";
import { Github } from "lucide-react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, clearAuthError } from "../store/index.js";

export const Route = createFileRoute("/login")({
    head: () => ({ meta: [{ title: "Sign in — Nimbus" }] }),
    component: LoginPage,
});

function LoginPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { isAuthenticated, error } = useSelector((state) => state.auth);
    
    const [email, setEmail] = useState("jordan@acme.com");
    const [password, setPassword] = useState("••••••••");
    
    useEffect(() => {
        dispatch(clearAuthError());
    }, [dispatch]);

    useEffect(() => {
        if (isAuthenticated) {
            router.navigate({ to: "/" });
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            dispatch(login({ email, password }));
        }
    };

    return (<AuthLayout title="Sign in to Nimbus" subtitle="Welcome back. Enter your credentials to continue." footer={<span>Don't have an account? <Link to="/register" className="text-foreground hover:underline">Sign up</Link></span>}>
      <div className="space-y-3">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors">
          <Github className="h-4 w-4"/> Continue with GitHub
        </button>
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong transition-colors">
          <span className="grid h-4 w-4 place-items-center rounded-sm bg-foreground text-[9px] font-bold text-background">G</span>
          Continue with Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border"/> or <div className="h-px flex-1 bg-border"/>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 border border-destructive/25 p-3 text-[12.5px] text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11.5px] text-muted-foreground">Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11.5px] text-muted-foreground">Password</label>
            <Link to="/forgot-password" className="text-[11.5px] text-muted-foreground hover:text-foreground">Forgot?</Link>
          </div>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none transition-colors"
          />
        </div>
        <button type="submit" className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90 transition-opacity">
          Sign in
        </button>
      </form>
    </AuthLayout>);
}
