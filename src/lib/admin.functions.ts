import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import { assertAdmin } from "./admin.server";

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("grievances")
      .select("status, priority, district, training_location, category, trainer_name, created_at")
      .limit(5000);
    if (error) throw error;
    return data ?? [];
  });

export const listTrainers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("trainers")
      .select("id, code, name, email, phone, is_active, user_id, created_at")
      .order("code", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const updateTrainer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(2).max(120).optional(),
        email: z.string().trim().email().max(200).optional(),
        phone: z.string().trim().max(20).optional(),
        is_active: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const patch: { name?: string; email?: string; phone?: string; is_active?: boolean } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.email !== undefined) patch.email = data.email;
    if (data.phone !== undefined) patch.phone = data.phone;
    if (data.is_active !== undefined) patch.is_active = data.is_active;
    const { error } = await context.supabase.from("trainers").update(patch).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const resetTrainerPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ id: z.string().uuid(), password: z.string().min(8).max(72) })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: trainer, error } = await context.supabase
      .from("trainers")
      .select("user_id, email")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    if (!trainer?.user_id) throw new Error("This trainer has no login account yet.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(trainer.user_id, {
      password: data.password,
    });
    if (authError) throw authError;
    return { ok: true, email: trainer.email };
  });

export const saveLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        district: z.string().trim().min(2).max(80),
        name: z.string().trim().min(2).max(160),
        address: z.string().trim().max(300).optional(),
        is_active: z.boolean().optional(),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    if (data.id) {
      const patch = {
        district: data.district,
        name: data.name,
        address: data.address ?? null,
        is_active: data.is_active ?? true,
      };
      const { error } = await context.supabase
        .from("training_locations")
        .update(patch)
        .eq("id", data.id);
      if (error) throw error;
    } else {
      const { error } = await context.supabase.from("training_locations").insert({
        district: data.district,
        name: data.name,
        address: data.address ?? null,
        is_active: data.is_active ?? true,
      });
      if (error) throw error;
    }
    return { ok: true };
  });

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("app_settings").select("key, value");
    if (error) throw error;
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value ?? "";
    return map;
  });

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        key: z.enum(["team_email", "public_base_url"]),
        value: z.string().trim().max(300),
      })
      .parse(data),
  )
  .handler(async ({ context, data }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await context.supabase
      .from("app_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw error;
    return { ok: true };
  });
