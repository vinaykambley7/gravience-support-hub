import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AnalyticsView } from "@/components/AnalyticsView";
import { AuthGate } from "@/components/AuthGate";
import { StaffShell } from "@/components/StaffShell";
import { listTrainers } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics & Reports — Aadhaar Training Support" },
      {
        name: "description",
        content: "Administrator analytics: trainer-wise daily, monthly and yearly grievance performance across all districts.",
      },
      { property: "og:title", content: "Analytics & Reports — Aadhaar Training Support" },
      { property: "og:description", content: "Trainer-wise grievance analytics and resolution performance." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  return (
    <AuthGate require="admin" loginPath="/admin/login">
      {() => (
        <StaffShell
          area="Admin Portal"
          loginPath="/admin/login"
          userLabel="Administrator"
          navItems={[
            { label: "Dashboard", to: "/admin/dashboard" },
            { label: "Analytics", to: "/admin/analytics" },
            { label: "QR Code", to: "/qr" },
          ]}
        >
          <AdminAnalyticsBody />
        </StaffShell>
      )}
    </AuthGate>
  );
}

function AdminAnalyticsBody() {
  const listFn = useServerFn(listTrainers);
  const { data = [] } = useQuery({ queryKey: ["admin-trainers"], queryFn: () => listFn() });

  return (
    <AnalyticsView
      title="Analytics & Reports"
      subtitle="Trainer-wise daily, monthly and yearly grievance analytics from live data."
      trainerOptions={data.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
