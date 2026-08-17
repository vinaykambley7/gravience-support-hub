import { createFileRoute } from "@tanstack/react-router";

import { TELANGANA_DISTRICTS } from "@/lib/constants";

const ADMIN_EMAIL = "admin@grievanceportal.app";
const ADMIN_PASSWORD = "Admin@2026!";
const TRAINER_PASSWORD = "Trainer@2026!";

async function bootstrap() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Guard: only runs while the portal has no admin yet.
  const { data: existingAdmin } = await supabaseAdmin
    .from("user_roles")
    .select("id")
    .eq("role", "admin")
    .limit(1);
  if (existingAdmin && existingAdmin.length > 0) {
    return { status: 409 as const, body: { error: "Portal already initialised." } };
  }

  const created: { role: string; email: string; password: string }[] = [];

  const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Portal Administrator" },
  });
  if (adminError || !adminUser.user) {
    console.error("Admin create error:", adminError);
    return { status: 500 as const, body: { error: adminError?.message ?? "Admin create failed", details: adminError } };
  }
  const { error: adminRoleError } = await supabaseAdmin.from("user_roles").insert({ user_id: adminUser.user.id, role: "admin" });
  if (adminRoleError) {
    console.error("Admin role insert error:", adminRoleError);
  }
  created.push({ role: "Admin", email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  for (let i = 1; i <= 5; i += 1) {
    const email = `trainer${i}@grievanceportal.app`;
    const { data: trainerUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: TRAINER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: `Trainer ${i}` },
    });
    if (error || !trainerUser.user) {
      console.error(`Trainer ${i} create error:`, error);
      return { status: 500 as const, body: { error: error?.message ?? "Trainer create failed", details: error } };
    }
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: trainerUser.user.id, role: "trainer" });
    if (roleError) console.error(`Trainer ${i} role insert error:`, roleError);
    
    const { error: trainerError } = await supabaseAdmin.from("trainers").insert({
      user_id: trainerUser.user.id,
      code: `T${i}`,
      name: `Trainer ${i}`,
      email,
      is_active: true,
    });
    if (trainerError) console.error(`Trainer ${i} table insert error:`, trainerError);
    created.push({ role: `Trainer ${i}`, email, password: TRAINER_PASSWORD });
  }

  const { data: locationCount } = await supabaseAdmin
    .from("training_locations")
    .select("id")
    .limit(1);
  if (!locationCount || locationCount.length === 0) {
    const { error: locError } = await supabaseAdmin.from("training_locations").insert(
      TELANGANA_DISTRICTS.map((district) => ({
        district,
        name: `${district} Training Centre`,
        is_active: true,
      })),
    );
    if (locError) {
      console.error("Training locations insert error:", locError);
    }
  }

  return { status: 200 as const, body: { ok: true, accounts: created } };
}

export const Route = createFileRoute("/api/public/bootstrap")({
  server: {
    handlers: {
      POST: async () => {
        const result = await bootstrap();
        return new Response(JSON.stringify(result.body), {
          status: result.status,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
