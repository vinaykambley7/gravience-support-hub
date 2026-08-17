import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthGate } from "@/components/AuthGate";
import { GrievanceWorkspace } from "@/components/GrievanceWorkspace";
import { StaffShell, StatCard } from "@/components/StaffShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getAdminOverview,
  getSettings,
  listTrainers,
  saveLocation,
  saveSetting,
  updateTrainer,
} from "@/lib/admin.functions";
import { FALLBACK_PUBLIC_BASE_URL, STATUSES, TELANGANA_DISTRICTS } from "@/lib/constants";
import { getFormOptions } from "@/lib/public.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Aadhaar Training Support" },
      {
        name: "description",
        content:
          "Administrator dashboard: grievance oversight, reports, trainer management, QR code and portal settings.",
      },
      { property: "og:title", content: "Admin Dashboard — Aadhaar Training Support" },
      { property: "og:description", content: "Full oversight of grievances, trainers and QR access." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const TABS = ["Overview", "Grievances", "Trainers", "Locations", "Settings"] as const;

function AdminDashboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

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
          <div className="mb-5 flex flex-wrap gap-2">
            {TABS.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm font-medium",
                  tab === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-surface hover:bg-muted",
                )}
              >
                {item}
              </button>
            ))}
            <Link
              to="/qr"
              className="rounded-lg border border-input bg-surface px-3 py-1.5 text-sm font-medium hover:bg-muted"
            >
              QR Code
            </Link>
          </div>

          {tab === "Overview" && <Overview />}
          {tab === "Grievances" && <GrievanceWorkspace />}
          {tab === "Trainers" && <Trainers />}
          {tab === "Locations" && <Locations />}
          {tab === "Settings" && <Settings />}
        </StaffShell>
      )}
    </AuthGate>
  );
}

function Overview() {
  const fn = useServerFn(getAdminOverview);
  const { data = [] } = useQuery({ queryKey: ["admin-overview"], queryFn: () => fn() });

  const group = (key: "district" | "category" | "trainer_name") => {
    const map = new Map<string, number>();
    for (const row of data) {
      const value = (row[key] as string) ?? "—";
      map.set(value, (map.get(value) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total" value={data.length} />
        {STATUSES.map((s) => (
          <StatCard key={s} label={s} value={data.filter((r) => r.status === s).length} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {(
          [
            ["By District", "district"],
            ["By Category", "category"],
            ["By Trainer", "trainer_name"],
          ] as const
        ).map(([title, key]) => (
          <div key={key} className="card-surface p-4">
            <h2 className="font-display text-sm font-semibold">{title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {group(key).map(([label, count]) => (
                <li key={label} className="flex justify-between gap-3">
                  <span className="truncate text-muted-foreground">{label}</span>
                  <span className="font-semibold">{count}</span>
                </li>
              ))}
              {data.length === 0 && <li className="text-muted-foreground">No data yet.</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Trainers() {
  const queryClient = useQueryClient();
  const listFn = useServerFn(listTrainers);
  const updateFn = useServerFn(updateTrainer);
  const { data = [] } = useQuery({ queryKey: ["admin-trainers"], queryFn: () => listFn() });

  const mutation = useMutation({
    mutationFn: (input: { id: string; is_active: boolean }) => updateFn({ data: input }),
    onSuccess: async () => {
      toast.success("Trainer updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-trainers"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="card-surface overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            {["Code", "Name", "Email", "Status", ""].map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((trainer) => (
            <tr key={trainer.id}>
              <td className="px-3 py-2.5 font-semibold">{trainer.code}</td>
              <td className="px-3 py-2.5">{trainer.name}</td>
              <td className="px-3 py-2.5 text-muted-foreground">{trainer.email}</td>
              <td className="px-3 py-2.5">{trainer.is_active ? "Active" : "Inactive"}</td>
              <td className="px-3 py-2.5 text-right">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ id: trainer.id, is_active: !trainer.is_active })}
                >
                  {trainer.is_active ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Locations() {
  const queryClient = useQueryClient();
  const optionsFn = useServerFn(getFormOptions);
  const saveFn = useServerFn(saveLocation);
  const { data: options } = useQuery({ queryKey: ["form-options"], queryFn: () => optionsFn() });

  const [district, setDistrict] = useState("");
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: () => saveFn({ data: { district, name, is_active: true } }),
    onSuccess: async () => {
      toast.success("Training location added.");
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["form-options"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const locations = options?.locations ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div className="card-surface space-y-4 p-5">
        <h2 className="font-display text-base font-semibold">Add training location</h2>
        <div className="space-y-1.5">
          <Label htmlFor="loc-district">District</Label>
          <select
            id="loc-district"
            className="h-10 w-full rounded-lg border border-input bg-surface px-3 text-sm"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            <option value="">Select district</option>
            {TELANGANA_DISTRICTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="loc-name">Location name</Label>
          <Input
            id="loc-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hyderabad Training Centre"
          />
        </div>
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !district || name.trim().length < 2}
        >
          Add location
        </Button>
      </div>

      <div className="card-surface overflow-x-auto p-0">
        <table className="w-full min-w-[420px] text-sm">
          <thead className="bg-muted/60 text-left text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">District</th>
              <th className="px-4 py-3">Location</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <tr key={l.id} className="border-t border-border">
                <td className="px-4 py-3">{l.district}</td>
                <td className="px-4 py-3">{l.name}</td>
              </tr>
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  No training locations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Settings() {
  const queryClient = useQueryClient();
  const settingsFn = useServerFn(getSettings);
  const saveFn = useServerFn(saveSetting);
  const { data: settings } = useQuery({ queryKey: ["admin-settings"], queryFn: () => settingsFn() });

  const [teamEmail, setTeamEmail] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    if (!settings) return;
    setTeamEmail(settings["team_email"] ?? "");
    setBaseUrl(settings["public_base_url"] ?? "");
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async () => {
      await saveFn({ data: { key: "team_email", value: teamEmail } });
      await saveFn({ data: { key: "public_base_url", value: baseUrl } });
    },
    onSuccess: async () => {
      toast.success("Settings saved.");
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="card-surface max-w-lg space-y-4 p-5">
      <div className="space-y-1.5">
        <Label htmlFor="team-email">Team notification email</Label>
        <Input
          id="team-email"
          value={teamEmail}
          onChange={(e) => setTeamEmail(e.target.value)}
          placeholder="support@yourteam.in"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="base-url">Public base URL (used for the QR code)</Label>
        <Input
          id="base-url"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder={FALLBACK_PUBLIC_BASE_URL}
        />
      </div>
      <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        Save settings
      </Button>
    </div>
  );
}
