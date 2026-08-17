import { createFileRoute } from "@tanstack/react-router";

import { StaffLogin } from "@/components/StaffLogin";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Aadhaar Training Support" },
      {
        name: "description",
        content: "Administrator sign-in for the Aadhaar training grievance portal: reports, trainers, locations and QR management.",
      },
      { property: "og:title", content: "Admin Sign In — Aadhaar Training Support" },
      { property: "og:description", content: "Sign in to administer the grievance portal." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <StaffLogin
      title="Administrator Sign In"
      subtitle="Full access to grievances and configuration"
      redirectTo="/admin/dashboard"
    />
  ),
});
