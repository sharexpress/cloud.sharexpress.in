import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/auth-layout";

export const Route = createFileRoute("/two-factor")({
  head: () => ({ meta: [{ title: "Two-factor authentication — Nimbus" }] }),
  component: TwoFactorPage,
});

function TwoFactorPage() {
  return (
    <AuthLayout title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app.">
      <div className="flex justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            maxLength={1}
            defaultValue={["1", "2", "8", "4", "0", ""][i]}
            className="h-12 w-12 rounded-md border border-border bg-background text-center font-mono text-[18px] text-foreground focus:border-accent focus:outline-none"
          />
        ))}
      </div>
      <Link to="/" className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-foreground text-[13px] font-medium text-background hover:opacity-90">Verify and continue</Link>
      <button className="mt-3 flex h-10 w-full items-center justify-center rounded-md text-[12.5px] text-muted-foreground hover:text-foreground">Use a recovery code instead</button>
    </AuthLayout>
  );
}
