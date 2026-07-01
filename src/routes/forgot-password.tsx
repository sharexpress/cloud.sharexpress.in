import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — Nimbus" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={<span>Remembered it? <Link to="/login" className="text-foreground hover:underline">Sign in</Link></span>}
    >
      <form className="space-y-4">
        <div>
          <label className="text-[11.5px] text-muted-foreground">Email</label>
          <input type="email" className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-[13px] text-foreground focus:border-accent focus:outline-none" />
        </div>
        <button className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90">Send reset link</button>
      </form>
    </AuthLayout>
  );
}
