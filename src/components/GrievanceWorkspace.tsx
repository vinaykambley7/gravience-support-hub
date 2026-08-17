import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PriorityBadge, StatusBadge } from "@/components/badges";
import { StatCard } from "@/components/StaffShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GRIEVANCE_CATEGORIES, PRIORITIES, STATUSES, TELANGANA_DISTRICTS } from "@/lib/constants";
import { getGrievance, listGrievances, updateGrievance } from "@/lib/staff.functions";

const selectClass =
  "h-10 rounded-lg border border-input bg-surface px-2.5 text-sm outline-none focus:border-ring";

export function GrievanceWorkspace({ trainerFilter }: { trainerFilter?: string | undefined }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    district: "",
    category: "",
    priority: "",
    status: "",
  });
  const [selected, setSelected] = useState<string | null>(null);

  const listFn = useServerFn(listGrievances);
  const detailFn = useServerFn(getGrievance);
  const updateFn = useServerFn(updateGrievance);

  const queryPayload = {
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.district ? { district: filters.district } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(trainerFilter ? { trainer_id: trainerFilter } : {}),
  };

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["grievances", queryPayload],
    queryFn: () => listFn({ data: queryPayload }),
  });

  const { data: detail } = useQuery({
    queryKey: ["grievance", selected],
    queryFn: () => detailFn({ data: { id: selected! } }),
    enabled: !!selected,
  });

  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [resolution, setResolution] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      updateFn({
        data: {
          id: selected!,
          ...(status ? { status: status as "Resolved" } : {}),
          ...(note ? { note } : {}),
          ...(resolution ? { resolution } : {}),
        },
      }),
    onSuccess: async () => {
      toast.success("Grievance updated.");
      setNote("");
      setStatus("");
      setResolution("");
      await queryClient.invalidateQueries({ queryKey: ["grievances"] });
      await queryClient.invalidateQueries({ queryKey: ["grievance", selected] });
    },
    onError: (error: Error) => toast.error(error.message || "Update failed."),
  });

  const counts = STATUSES.map((s) => ({ s, n: rows.filter((r) => r.status === s).length }));

  const exportCsv = () => {
    const header = [
      "Grievance ID",
      "Operator",
      "Mobile",
      "District",
      "Location",
      "Trainer",
      "Category",
      "Subject",
      "Priority",
      "Status",
      "Created",
    ];
    const lines = rows.map((r) =>
      [
        r.grievance_id,
        r.operator_name,
        r.mobile_number,
        r.district,
        r.training_location,
        r.trainer_name,
        r.category,
        r.subject,
        r.priority,
        r.status,
        new Date(r.created_at).toISOString(),
      ]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grievances-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={rows.length} />
        {counts.map(({ s, n }) => (
          <StatCard key={s} label={s} value={n} />
        ))}
      </div>

      <div className="card-surface flex flex-wrap items-center gap-2 p-3">
        <Input
          className="h-10 w-full sm:w-56"
          placeholder="Search ID, operator, subject"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          className={selectClass}
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        >
          <option value="">All districts</option>
          {TELANGANA_DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {GRIEVANCE_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select
          className={selectClass}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Button variant="outline" size="sm" className="ml-auto" onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <div className="card-surface overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              {["Grievance ID", "Operator", "District", "Category", "Priority", "Status", "Date", ""].map(
                (h) => (
                  <th key={h} className="px-3 py-2.5 font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  <Loader2 className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  No grievances match these filters.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/60">
                <td className="px-3 py-2.5 font-semibold">{r.grievance_id}</td>
                <td className="px-3 py-2.5">
                  {r.operator_name}
                  <span className="block text-xs text-muted-foreground">{r.mobile_number}</span>
                </td>
                <td className="px-3 py-2.5">{r.district}</td>
                <td className="px-3 py-2.5">{r.category}</td>
                <td className="px-3 py-2.5">
                  <PriorityBadge priority={r.priority} />
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-IN")}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <Button size="sm" variant="outline" onClick={() => setSelected(r.id)}>
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && detail?.grievance && (
        <div className="fixed inset-0 z-50 flex justify-end bg-foreground/40">
          <div className="w-full max-w-xl overflow-y-auto bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-semibold">
                  {detail.grievance.grievance_id}
                </p>
                <p className="text-sm text-muted-foreground">{detail.grievance.subject}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>

            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Operator", detail.grievance.operator_name],
                ["Operator ID", detail.grievance.operator_id],
                ["Mobile", detail.grievance.mobile_number],
                ["Centre / Agency", detail.grievance.centre_name],
                ["District", detail.grievance.district],
                ["Training Location", detail.grievance.training_location],
                ["Trainer", detail.grievance.trainer_name],
                ["Training Date", detail.grievance.training_date],
                ["Category", detail.grievance.category],
                ["Priority", detail.grievance.priority],
                ["Status", detail.grievance.status],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="font-medium break-words">{String(value ?? "—")}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Description</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{detail.grievance.description}</p>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <p className="font-display text-sm font-semibold">Update grievance</p>
              <select
                className={`${selectClass} w-full`}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Keep current status</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <Textarea
                rows={3}
                placeholder="Add a note for the timeline (visible to the operator)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Textarea
                rows={3}
                placeholder="Resolution summary (shown when resolved)"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={mutation.isPending || (!status && !note && !resolution)}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
                Save update
              </Button>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <p className="font-display text-sm font-semibold">Timeline</p>
              <ol className="mt-3 space-y-3">
                {detail.timeline.map((entry) => (
                  <li key={entry.id} className="flex gap-2.5">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
                    <div>
                      <p className="text-sm font-semibold">{entry.to_status}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString("en-IN")}
                        {entry.changed_by_name ? ` · ${entry.changed_by_name}` : ""}
                      </p>
                      {entry.note && <p className="text-sm">{entry.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
