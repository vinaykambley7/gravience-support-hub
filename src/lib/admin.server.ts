import type { SupabaseClient } from "@supabase/supabase-js";

/** Verifies the caller holds the admin role. Throws a 403 Response otherwise. */
export async function assertAdmin(supabase: SupabaseClient, userId: string): Promise<void> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Response("Forbidden", { status: 403 });
}
