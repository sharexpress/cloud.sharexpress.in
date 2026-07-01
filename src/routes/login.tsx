import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";
import { Github } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Nimbus" }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout
      title="Sign in to Nimbus"
      subtitle="Welcome back. Enter your credentials to continue."
      footer={<span>Don't have an account? <Link to="/register" className="text-foreground hover:underline">Sign up</Link></span>}
    >
      <div className="space-y-3">
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong">
          <Github className="h-4 w-4" /> Continue with GitHub
        </button>
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong">
          <span className="grid h-4 w-4 place-items-center rounded-sm bg-foreground text-[9px] font-bold text-background">G</span>
          Continue with Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4">
        <div>
          <label className="text-[11.5px] text-muted-foreground">Email</label>
          <input type="email" defaultValue="jordan@acme.com" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-[11.5px] text-muted-foreground">Password</label>
            <Link to="/forgot-password" className="text-[11.5px] text-muted-foreground hover:text-foreground">Forgot?</Link>
          </div>
          <input type="password" defaultValue="••••••••" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none" />
        </div>
        <Link to="/" className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90">Sign in</Link>
      </form>
    </AuthLayout>
  );
}
