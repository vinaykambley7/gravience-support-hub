import { createFileRoute } from "@tanstack/react-router";

import { StaffLogin } from "@/components/StaffLogin";

export const Route = createFileRoute("/trainer/login")({
  head: () => ({
    meta: [
      { title: "Trainer Sign In — Aadhaar Training Support" },
      {
        name: "description",
        content: "Trainer sign-in for the Aadhaar training grievance portal. Trainers see only grievances assigned to them.",
      },
      { property: "og:title", content: "Trainer Sign In — Aadhaar Training Support" },
      { property: "og:description", content: "Sign in to manage grievances assigned to you." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <StaffLogin
      title="Trainer Sign In"
      subtitle="Access grievances assigned to you"
      redirectTo="/trainer/dashboard"
    />
  ),
});
