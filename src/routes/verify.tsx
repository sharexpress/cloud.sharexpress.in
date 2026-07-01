import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";
import { MailCheck } from "lucide-react";

export const Route = createFileRoute("/verify")({
  head: () => ({ meta: [{ title: "Verify email — Nimbus" }] }),
  component: VerifyPage,
});

function VerifyPage() {
  return (
    <AuthLayout title="Check your email" subtitle="We sent a verification link to jordan@acme.com.">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent/15 text-accent">
          <MailCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-foreground">Verification link sent</div>
          <div className="text-[11.5px] text-muted-foreground">The link expires in 15 minutes.</div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Link to="/two-factor" className="flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90">Continue</Link>
        <button className="flex h-10 w-full items-center justify-center rounded-md border border-border bg-surface text-[13px] font-medium text-foreground hover:border-border-strong">Resend email</button>
      </div>
    </AuthLayout>
  );
}
