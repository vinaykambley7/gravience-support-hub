export type AnalyticsRow = {
  status: string;
  priority: string;
  district: string;
  category: string;
  trainer_id: string;
  trainer_name: string;
  created_at: string;
  updated_at: string;
};

const OPEN_STATUSES = ["Submitted", "Under Review", "In Progress"];

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function monthKey(iso: string) {
  return iso.slice(0, 7);
}

function isResolvedLike(status: string) {
  return status === "Resolved" || status === "Closed";
}

export function kpisFor(rows: AnalyticsRow[]) {
  const count = (s: string) => rows.filter((r) => r.status === s).length;
  const resolvedLike = rows.filter((r) => isResolvedLike(r.status));
  const durations = resolvedLike.map(
    (r) => (new Date(r.updated_at).getTime() - new Date(r.created_at).getTime()) / 86_400_000,
  );
  const avg =
    durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  return {
    total: rows.length,
    submitted: count("Submitted"),
    underReview: count("Under Review"),
    inProgress: count("In Progress"),
    resolved: count("Resolved"),
    closed: count("Closed"),
    pending: rows.filter((r) => OPEN_STATUSES.includes(r.status)).length,
    resolutionRate: rows.length ? Math.round((resolvedLike.length / rows.length) * 1000) / 10 : 0,
    avgResolutionDays: Math.round(avg * 10) / 10,
  };
}

function bucket(rows: AnalyticsRow[], keyOf: (iso: string) => string) {
  const map = new Map<
    string,
    { key: string; total: number; resolved: number; pending: number; inProgress: number }
  >();
  for (const row of rows) {
    const key = keyOf(row.created_at);
    const entry =
      map.get(key) ?? { key, total: 0, resolved: 0, pending: 0, inProgress: 0 };
    entry.total += 1;
    if (isResolvedLike(row.status)) entry.resolved += 1;
    else entry.pending += 1;
    if (row.status === "In Progress") entry.inProgress += 1;
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

function fillDays(rows: AnalyticsRow[], from: string, to: string) {
  const base = new Map(bucket(rows, dayKey).map((b) => [b.key, b]));
  const out: { key: string; total: number; resolved: number; pending: number; inProgress: number }[] =
    [];
  const start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  let guard = 0;
  for (let d = start; d <= end && guard < 400; d = new Date(d.getTime() + 86_400_000), guard++) {
    const key = d.toISOString().slice(0, 10);
    out.push(base.get(key) ?? { key, total: 0, resolved: 0, pending: 0, inProgress: 0 });
  }
  return out;
}

function fillMonths(rows: AnalyticsRow[]) {
  const year = new Date().getUTCFullYear();
  const base = new Map(bucket(rows, monthKey).map((b) => [b.key, b]));
  const keys = new Set([...base.keys()]);
  for (let m = 1; m <= 12; m++) keys.add(`${year}-${String(m).padStart(2, "0")}`);
  return [...keys]
    .sort()
    .map((key) => base.get(key) ?? { key, total: 0, resolved: 0, pending: 0, inProgress: 0 });
}

function distribution(rows: AnalyticsRow[], key: keyof AnalyticsRow, limit = 12) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = String(row[key] ?? "—");
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function trainerPerformance(rows: AnalyticsRow[]) {
  const groups = new Map<string, AnalyticsRow[]>();
  for (const row of rows) {
    const name = row.trainer_name ?? "—";
    groups.set(name, [...(groups.get(name) ?? []), row]);
  }
  return [...groups.entries()]
    .map(([name, group]) => ({ trainer_name: name, trainer_id: group[0]?.trainer_id ?? "", ...kpisFor(group) }))
    .sort((a, b) => b.total - a.total);
}

export function buildAnalytics(
  rows: AnalyticsRow[],
  range: { from: string; to: string },
  includeTrainers: boolean,
) {
  return {
    kpis: kpisFor(rows),
    daily: fillDays(rows, range.from, range.to),
    monthly: fillMonths(rows),
    yearly: bucket(rows, (iso) => iso.slice(0, 4)),
    distributions: {
      status: distribution(rows, "status", 6),
      category: distribution(rows, "category"),
      priority: distribution(rows, "priority", 4),
      district: distribution(rows, "district"),
    },
    trainers: includeTrainers ? trainerPerformance(rows) : [],
  };
}
