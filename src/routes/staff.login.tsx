import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, UserCog } from "lucide-react";

import { PublicShell } from "@/components/PublicShell";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/staff/login")({
  head: () => ({
    meta: [
      { title: "Staff Access — Aadhaar Training Support" },
      {
        name: "description",
        content: "Staff access page for the Aadhaar training grievance portal: trainer sign-in and administrator sign-in.",
      },
      { property: "og:title", content: "Staff Access — Aadhaar Training Support" },
      { property: "og:description", content: "Choose trainer or administrator sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: StaffAccess,
});

function StaffAccess() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold">Staff Access</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in as a trainer or as the portal administrator.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <Link
            to="/trainer/login"
            className="card-surface flex flex-col gap-3 p-5 transition-shadow hover:shadow-elevated"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UserCog className="size-6" />
            </span>
            <span className="font-display text-lg font-semibold">Trainer Login</span>
            <span className="text-sm text-muted-foreground">
              View and resolve only the grievances assigned to you, with daily and monthly
              analytics.
            </span>
          </Link>

          <Link
            to="/admin/login"
            className="card-surface flex flex-col gap-3 p-5 transition-shadow hover:shadow-elevated"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <ShieldCheck className="size-6" />
            </span>
            <span className="font-display text-lg font-semibold">Admin Login</span>
            <span className="text-sm text-muted-foreground">
              Full oversight: all grievances, trainer-wise analytics, reports, locations and QR
              management.
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Operators do not need an account.{" "}
          <Link to="/operator" className="font-medium underline">
            Go to the operator portal
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
