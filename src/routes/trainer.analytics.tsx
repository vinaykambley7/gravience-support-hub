import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsView } from "@/components/AnalyticsView";
import { AuthGate } from "@/components/AuthGate";
import { StaffShell } from "@/components/StaffShell";

export const Route = createFileRoute("/trainer/analytics")({
  head: () => ({
    meta: [
      { title: "My Analytics — Aadhaar Training Support" },
      {
        name: "description",
        content: "Trainer analytics: daily, monthly and yearly grievance trends for your assigned grievances.",
      },
      { property: "og:title", content: "My Analytics — Aadhaar Training Support" },
      { property: "og:description", content: "Your grievance trends and resolution performance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrainerAnalytics,
});

function TrainerAnalytics() {
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
          <AnalyticsView
            title="My Analytics"
            subtitle="Daily, monthly and yearly trends for grievances assigned to you."
          />
        </StaffShell>
      )}
    </AuthGate>
  );
}
