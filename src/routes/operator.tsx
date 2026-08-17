import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";

import { PublicShell } from "@/components/PublicShell";
import { PORTAL_NAME } from "@/lib/constants";

export const Route = createFileRoute("/operator")({
  head: () => ({
    meta: [
      { title: "Operator Portal — Aadhaar Training Grievance & Support" },
      {
        name: "description",
        content:
          "Operators can submit a training grievance or track an existing grievance using their grievance ID. No account required.",
      },
      { property: "og:title", content: "Operator Portal — Aadhaar Training Support" },
      {
        property: "og:description",
        content: "Submit a training grievance or track its status. No login required.",
      },
    ],
  }),
  component: OperatorPortal,
});

export function OperatorPortal() {
  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">
            {PORTAL_NAME} Support
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Raise a training-related grievance or check the status of one you already submitted.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <Link
            to="/grievance"
            className="card-surface group flex items-center gap-4 p-5 transition-shadow hover:shadow-elevated"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="size-7" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">Submit Grievance</span>
              <span className="block text-sm text-muted-foreground">
                Fill one short form and get a grievance ID instantly.
              </span>
            </span>
          </Link>

          <Link
            to="/track"
            className="card-surface group flex items-center gap-4 p-5 transition-shadow hover:shadow-elevated"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <Search className="size-7" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold">Track Grievance</span>
              <span className="block text-sm text-muted-foreground">
                Enter your grievance ID to view status, timeline and resolution.
              </span>
            </span>
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Keep your grievance ID safe — it is required to track your request.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/staff/login" className="font-medium underline">
            Staff login
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
