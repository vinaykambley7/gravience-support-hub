import { createFileRoute } from "@tanstack/react-router";

import { AuthGate } from "@/components/AuthGate";
import { GrievanceWorkspace } from "@/components/GrievanceWorkspace";
import { StaffShell } from "@/components/StaffShell";

export const Route = createFileRoute("/trainer/dashboard")({
  head: () => ({
    meta: [
      { title: "Trainer Dashboard — Aadhaar Training Support" },
      {
        name: "description",
        content: "Trainer dashboard for reviewing, updating and resolving grievances assigned to you.",
      },
      { property: "og:title", content: "Trainer Dashboard — Aadhaar Training Support" },
      { property: "og:description", content: "Review and resolve your assigned grievances." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainerDashboard,
});

function TrainerDashboard() {
  return (
    <AuthGate require="trainer" loginPath="/trainer/login">
      {(me) => (
        <StaffShell
          area="Trainer Portal"
          loginPath="/trainer/login"
          userLabel={me.trainer?.name ?? "Trainer"}
          navItems={[
            { label: "My Grievances", to: "/trainer/dashboard" },
            { label: "Analytics", to: "/trainer/analytics" },
          ]}
        >
          <h1 className="font-display text-xl font-semibold">My Grievances</h1>
          <p className="mt-1 mb-5 text-sm text-muted-foreground">
            Only grievances assigned to you are visible here.
          </p>
          <GrievanceWorkspace />
        </StaffShell>
      )}
    </AuthGate>
  );
}
