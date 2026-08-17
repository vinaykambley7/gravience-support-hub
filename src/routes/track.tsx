import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

import { PublicShell } from "@/components/PublicShell";
import { PriorityBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackGrievance } from "@/lib/public.functions";

export const Route = createFileRoute("/track")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Track Grievance — Aadhaar Training Support" },
      {
        name: "description",
        content:
          "Enter your grievance ID to view the current status, full status timeline and resolution of your training grievance.",
      },
      { property: "og:title", content: "Track Grievance — Aadhaar Training Support" },
      {
        property: "og:description",
        content: "Check the live status and timeline of your submitted training grievance.",
      },
    ],
  }),
  component: TrackPage,
});

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

function TrackPage() {
  const { id } = Route.useSearch();
  const [value, setValue] = useState(id ?? "");
  const trackFn = useServerFn(trackGrievance);

  const mutation = useMutation({
    mutationFn: (grievanceId: string) => trackFn({ data: { grievance_id: grievanceId } }),
  });

  useEffect(() => {
    if (id) mutation.mutate(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const result = mutation.data;
  const grievance = result?.grievance ?? null;

  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl">
        <Link
          to="/operator"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 size-4" /> Back
        </Link>
        <h1 className="mt-4 font-display text-2xl font-semibold">Track Grievance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the grievance ID you received after submitting (e.g. GRV-2026-0001).
        </p>

        <form
          className="mt-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim().length >= 4) mutation.mutate(value.trim());
          }}
        >
          <Input
            className="h-12 flex-1 text-base uppercase"
            placeholder="GRV-2026-0001"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase())}
          />
          <Button size="lg" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Search className="mr-1.5 size-4" />
            )}
            Track
          </Button>
        </form>

        {result && !grievance && (
          <div className="card-surface mt-6 p-5 text-sm">
            No grievance found for that ID. Please check the ID and try again.
          </div>
        )}

        {grievance && (
          <div className="mt-6 space-y-4">
            <div className="card-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Grievance ID</p>
                  <p className="font-display text-xl font-semibold">{grievance.grievance_id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={grievance.status} />
                  <PriorityBadge priority={grievance.priority} />
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Subject", grievance.subject],
                  ["Category", grievance.category],
                  ["District", grievance.district],
                  ["Training Location", grievance.training_location],
                  ["Trainer Name", grievance.trainer_name],
                  ["Submitted Date", formatDate(grievance.created_at)],
                  ["Last Updated", formatDate(grievance.updated_at)],
                ].map(([label, val]) => (
                  <div key={label}>
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="font-medium break-words">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="card-surface p-5">
              <h2 className="font-display text-base font-semibold">Status Timeline</h2>
              <ol className="mt-4 space-y-4">
                {grievance.timeline.map((entry, index) => (
                  <li key={`${entry.created_at}-${index}`} className="flex gap-3">
                    <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-accent" />
                    <div>
                      <p className="text-sm font-semibold">{entry.to_status}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </p>
                      {entry.note && <p className="mt-1 text-sm">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {grievance.resolution && (
              <div className="card-surface p-5">
                <h2 className="font-display text-base font-semibold">Resolution</h2>
                <p className="mt-2 text-sm whitespace-pre-wrap">{grievance.resolution}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PublicShell>
  );
}
