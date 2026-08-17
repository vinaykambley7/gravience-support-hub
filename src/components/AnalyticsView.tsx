import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { StatCard } from "@/components/StaffShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAnalytics } from "@/lib/analytics.functions";
import { cn } from "@/lib/utils";

const PRESETS = ["Today", "Last 7 Days", "Last 30 Days", "This Year", "Custom Range"] as const;
type Preset = (typeof PRESETS)[number];

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeFor(preset: Preset): { from: string; to: string } {
  const today = new Date();
  const to = isoDay(today);
  if (preset === "Today") return { from: to, to };
  if (preset === "Last 7 Days")
    return { from: isoDay(new Date(today.getTime() - 6 * 86_400_000)), to };
  if (preset === "Last 30 Days")
    return { from: isoDay(new Date(today.getTime() - 29 * 86_400_000)), to };
  return { from: `${today.getUTCFullYear()}-01-01`, to };
}

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-surface p-4">
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const axisProps = {
  stroke: "currentColor",
  tick: { fontSize: 11 },
  className: "text-muted-foreground",
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    fontSize: "12px",
    color: "var(--foreground)",
  },
} as const;

export function AnalyticsView({
  title,
  subtitle,
  trainerOptions,
}: {
  title: string;
  subtitle: string;
  /** Admin only: lets the admin scope charts to a single trainer. */
  trainerOptions?: { id: string; name: string }[];
}) {
  const [preset, setPreset] = useState<Preset>("Last 30 Days");
  const [custom, setCustom] = useState(() => rangeFor("Last 30 Days"));
  const [trainerId, setTrainerId] = useState("");

  const range = preset === "Custom Range" ? custom : rangeFor(preset);
  const fn = useServerFn(getAnalytics);

  const payload = useMemo(
    () => ({ ...range, ...(trainerId ? { trainer_id: trainerId } : {}) }),
    [range.from, range.to, trainerId],
  );

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", payload],
    queryFn: () => fn({ data: payload }),
  });

  const daily = (data?.daily ?? []).map((d) => ({ ...d, label: d.key.slice(5) }));
  const monthly = (data?.monthly ?? []).map((m) => ({
    ...m,
    label: `${MONTH_LABELS[Number(m.key.slice(5, 7)) - 1] ?? m.key} ${m.key.slice(2, 4)}`,
  }));
  const yearly = data?.yearly ?? [];
  const k = data?.kpis;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="card-surface flex flex-wrap items-end gap-3 p-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-sm font-medium",
                preset === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-surface hover:bg-muted",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {preset === "Custom Range" && (
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="an-from" className="text-xs">
                From
              </Label>
              <Input
                id="an-from"
                type="date"
                className="h-10 w-40"
                value={custom.from}
                onChange={(e) => setCustom({ ...custom, from: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="an-to" className="text-xs">
                To
              </Label>
              <Input
                id="an-to"
                type="date"
                className="h-10 w-40"
                value={custom.to}
                onChange={(e) => setCustom({ ...custom, to: e.target.value })}
              />
            </div>
          </div>
        )}

        {trainerOptions && (
          <div className="ml-auto space-y-1">
            <Label htmlFor="an-trainer" className="text-xs">
              Trainer
            </Label>
            <select
              id="an-trainer"
              className="h-10 rounded-lg border border-input bg-surface px-2.5 text-sm"
              value={trainerId}
              onChange={(e) => setTrainerId(e.target.value)}
            >
              <option value="">All trainers</option>
              {trainerOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="card-surface flex items-center justify-center p-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {k && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Total" value={k.total} />
            <StatCard label="Submitted" value={k.submitted} />
            <StatCard label="Under Review" value={k.underReview} />
            <StatCard label="In Progress" value={k.inProgress} />
            <StatCard label="Resolved" value={k.resolved} />
            <StatCard label="Closed" value={k.closed} />
            <StatCard label="Pending" value={k.pending} />
            <StatCard label="Resolution Rate" value={`${k.resolutionRate}%`} />
            <StatCard label="Avg Resolution" value={`${k.avgResolutionDays} d`} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <ChartCard
              title="Daily grievances"
              subtitle={`${range.from} → ${range.to} (live database data)`}
            >
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="total" name="Submitted" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Daily resolved vs pending">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="var(--success)" strokeWidth={2} />
                <Line type="monotone" dataKey="pending" name="Pending" stroke="var(--warning)" strokeWidth={2} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Daily status trend">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total" name="Total" stroke="var(--primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="inProgress" name="In Progress" stroke="var(--accent-foreground)" strokeWidth={2} />
              </LineChart>
            </ChartCard>

            <ChartCard title="Monthly grievances" subtitle="January – December">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="var(--warning)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Yearly grievances" subtitle="All years with data">
              <BarChart data={yearly.map((y) => ({ ...y, label: y.key }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total" name="Grievances" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" name="Resolved" fill="var(--success)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Status distribution">
              <PieChart>
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Pie
                  data={data?.distributions.status ?? []}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {(data?.distributions.status ?? []).map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={
                        ["var(--primary)", "var(--accent-foreground)", "var(--warning)", "var(--success)", "var(--muted-foreground)"][
                          index % 5
                        ]
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartCard>

            <ChartCard title="Category distribution">
              <BarChart data={data?.distributions.category ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis type="category" dataKey="name" width={140} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Grievances" fill="var(--primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="District distribution">
              <BarChart data={data?.distributions.district ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" allowDecimals={false} {...axisProps} />
                <YAxis type="category" dataKey="name" width={140} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Grievances" fill="var(--accent-foreground)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartCard>

            <ChartCard title="Priority distribution">
              <BarChart data={data?.distributions.priority ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis allowDecimals={false} {...axisProps} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" name="Grievances" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
          </div>

          {data?.scope === "admin" && (data.trainers?.length ?? 0) > 0 && (
            <div className="card-surface overflow-x-auto">
              <div className="px-4 pt-4">
                <h2 className="font-display text-sm font-semibold">Trainer performance</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Selected period · {range.from} → {range.to}
                </p>
              </div>
              <table className="mt-3 w-full min-w-[820px] text-sm">
                <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
                  <tr>
                    {[
                      "Trainer",
                      "Total",
                      "Submitted",
                      "In Progress",
                      "Resolved",
                      "Closed",
                      "Pending",
                      "Resolution Rate",
                      "Avg Days",
                    ].map((h) => (
                      <th key={h} className="px-3 py-2.5 font-semibold">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.trainers.map((t) => (
                    <tr key={t.trainer_name}>
                      <td className="px-3 py-2.5 font-semibold">{t.trainer_name}</td>
                      <td className="px-3 py-2.5">{t.total}</td>
                      <td className="px-3 py-2.5">{t.submitted}</td>
                      <td className="px-3 py-2.5">{t.inProgress}</td>
                      <td className="px-3 py-2.5">{t.resolved}</td>
                      <td className="px-3 py-2.5">{t.closed}</td>
                      <td className="px-3 py-2.5">{t.pending}</td>
                      <td className="px-3 py-2.5">{t.resolutionRate}%</td>
                      <td className="px-3 py-2.5">{t.avgResolutionDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {k.total === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No grievances in this period yet — charts fill in as real grievances arrive.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      Export CSV
    </Button>
  );
}
