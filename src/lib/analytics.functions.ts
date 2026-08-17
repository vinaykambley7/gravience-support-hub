import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import { buildAnalytics, type AnalyticsRow } from "./analytics.server";

/**
 * Trainer/admin analytics. Authorization happens in the database:
 * RLS on `grievances` restricts trainers to their own rows, so a trainer can
 * never receive another trainer's data even by passing trainer_id.
 */
export const getAnalytics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        trainer_id: z.string().uuid().optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: roles } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");

    let query = context.supabase
      .from("grievances")
      .select(
        "status, priority, district, category, trainer_id, trainer_name, created_at, updated_at",
      )
      .order("created_at", { ascending: true })
      .limit(5000);

    // Only an admin may scope to a specific trainer; trainers are already
    // scoped to themselves by RLS.
    if (isAdmin && data.trainer_id) query = query.eq("trainer_id", data.trainer_id);

    const { data: rows, error } = await query;
    if (error) throw error;

    const all = (rows ?? []) as AnalyticsRow[];
    const inRange = all.filter((row) => {
      const day = row.created_at.slice(0, 10);
      return day >= data.from && day <= data.to;
    });

    const ranged = buildAnalytics(inRange, { from: data.from, to: data.to }, isAdmin);
    const historical = buildAnalytics(all, { from: data.from, to: data.to }, isAdmin);

    return {
      scope: isAdmin ? ("admin" as const) : ("trainer" as const),
      range: { from: data.from, to: data.to },
      kpis: ranged.kpis,
      daily: ranged.daily,
      distributions: ranged.distributions,
      trainers: ranged.trainers,
      monthly: historical.monthly,
      yearly: historical.yearly,
      allTimeKpis: historical.kpis,
    };
  });
