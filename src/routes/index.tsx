import { createFileRoute } from "@tanstack/react-router";

import { OperatorPortal } from "./operator";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aadhaar Training — Grievance & Support Portal" },
      {
        name: "description",
        content:
          "Submit or track Aadhaar training grievances. Operators need no account — scan, submit and track with a grievance ID.",
      },
      { property: "og:title", content: "Aadhaar Training — Grievance & Support Portal" },
      {
        property: "og:description",
        content: "Submit or track Aadhaar training grievances. No account required for operators.",
      },
    ],
  }),
  component: OperatorPortal,
});
