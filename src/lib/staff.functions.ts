import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Who am I: role + trainer record (if any). */
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: roles }, { data: trainer }] = await Promise.all([
      context.supabase.from("user_roles").select("role").eq("user_id", context.userId),
      context.supabase
        .from("trainers")
        .select("id, code, name, email, is_active")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);
    const roleList = (roles ?? []).map((r) => r.role as string);
    return {
      userId: context.userId,
      isAdmin: roleList.includes("admin"),
      isTrainer: roleList.includes("trainer"),
      trainer: trainer ?? null,
    };
  });

/** Grievance list. RLS restricts trainers to their own grievances. */
export const listGrievances = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        search: z.string().trim().max(120).optional(),
        district: z.string().max(80).optional(),
        training_location: z.string().max(160).optional(),
        category: z.string().max(80).optional(),
        priority: z.string().max(20).optional(),
        status: z.string().max(30).optional(),
        trainer_id: z.string().uuid().optional(),
        from: z.string().max(20).optional(),
        to: z.string().max(20).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ context, data }) => {
    let query = context.supabase
      .from("grievances")
      .select(
        "id, grievance_id, operator_name, operator_id, mobile_number, centre_name, district, training_location, trainer_id, trainer_name, training_date, category, subject, priority, status, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data.district) query = query.eq("district", data.district);
    if (data.training_location) query = query.eq("training_location", data.training_location);
    if (data.category) query = query.eq("category", data.category);
    if (data.priority)
      query = query.eq("priority", data.priority as "Low" | "Medium" | "High" | "Critical");
    if (data.status) query = query.eq("status", data.status as "Submitted");
    if (data.trainer_id) query = query.eq("trainer_id", data.trainer_id);
    if (data.from) query = query.gte("created_at", `${data.from}T00:00:00Z`);
    if (data.to) query = query.lte("created_at", `${data.to}T23:59:59Z`);
    if (data.search) {
      const s = data.search.replace(/[%,()]/g, "");
      query = query.or(
        `grievance_id.ilike.%${s}%,operator_name.ilike.%${s}%,operator_id.ilike.%${s}%,subject.ilike.%${s}%,mobile_number.ilike.%${s}%`,
      );
    }
    const { data: rows, error } = await query;
    if (error) throw error;
    return rows ?? [];
  });

/** Single grievance + timeline. RLS blocks other trainers' grievances. */
export const getGrievance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ context, data }) => {
    const { data: grievance, error } = await context.supabase
      .from("grievances")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!grievance) return { grievance: null, timeline: [], attachments: [] };

    const [{ data: timeline }, { data: attachments }] = await Promise.all([
      context.supabase
        .from("grievance_history")
        .select("id, from_status, to_status, note, changed_by_name, created_at")
        .eq("grievance_uuid", data.id)
        .order("created_at", { ascending: true }),
      context.supabase
        .from("grievance_attachments")
        .select("id, file_name, mime_type, size_bytes")
        .eq("grievance_uuid", data.id),
    ]);
    return {
      grievance,
      timeline: timeline ?? [],
      attachments: attachments ?? [],
    };
  });

/** Status / notes / resolution update, with timeline entry. */
export const updateGrievance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["Submitted", "Under Review", "In Progress", "Resolved", "Closed"]).optional(),
        internal_notes: z.string().max(4000).optional(),
        resolution: z.string().max(4000).optional(),
        note: z.string().max(1000).optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    const { data: current, error: readError } = await context.supabase
      .from("grievances")
      .select("id, status")
      .eq("id", data.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!current) throw new Error("Grievance not found or access denied.");

    const patch: {
      status?: "Submitted" | "Under Review" | "In Progress" | "Resolved" | "Closed";
      internal_notes?: string;
      resolution?: string;
    } = {};
    if (data.status) patch.status = data.status;
    if (data.internal_notes !== undefined) patch.internal_notes = data.internal_notes;
    if (data.resolution !== undefined) patch.resolution = data.resolution;

    if (Object.keys(patch).length > 0) {
      const { error: updateError } = await context.supabase
        .from("grievances")
        .update(patch)
        .eq("id", data.id);
      if (updateError) throw updateError;
    }

    if (data.status || data.note) {
      const { data: profile } = await context.supabase
        .from("trainers")
        .select("name")
        .eq("user_id", context.userId)
        .maybeSingle();
      const { error: historyError } = await context.supabase.from("grievance_history").insert({
        grievance_uuid: data.id,
        from_status: current.status,
        to_status: data.status ?? current.status,
        note: data.note ?? null,
        changed_by_name: profile?.name ?? "Administrator",
      });
      if (historyError) throw historyError;
    }
    return { ok: true };
  });

/** Districts / locations list for staff filters. */
export const listLocations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("training_locations")
      .select("id, district, name, address, is_active")
      .order("district", { ascending: true })
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });
