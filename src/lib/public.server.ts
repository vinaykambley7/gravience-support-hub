import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TELANGANA_DISTRICTS } from "./constants";
import { sendGrievanceNotifications } from "./email.server";

export type PublicTrainer = { id: string; name: string };
export type PublicLocation = { id: string; district: string; name: string };

async function ensureSeedData() {
  const [{ count: trainerCount, error: trainerCountError }, { count: locationCount, error: locationCountError }] =
    await Promise.all([
      supabaseAdmin.from("trainers").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("training_locations").select("id", { count: "exact", head: true }),
    ]);

  if (trainerCountError) throw trainerCountError;
  if (locationCountError) throw locationCountError;

  if ((trainerCount ?? 0) === 0) {
    const trainerSeed = Array.from({ length: 5 }, (_, index) => ({
      code: `T${index + 1}`,
      name: `Trainer ${index + 1}`,
      email: `trainer${index + 1}@grievanceportal.app`,
      is_active: true,
      user_id: null,
    }));

    const { error: trainerInsertError } = await supabaseAdmin
      .from("trainers")
      .upsert(trainerSeed, { onConflict: "code" });
    if (trainerInsertError) throw trainerInsertError;
  }

  if ((locationCount ?? 0) === 0) {
    const locationSeed = TELANGANA_DISTRICTS.map((district) => ({
      district,
      name: `${district} Training Centre`,
      is_active: true,
    }));

    const { error: locationInsertError } = await supabaseAdmin
      .from("training_locations")
      .upsert(locationSeed, { onConflict: "district,name" });
    if (locationInsertError) throw locationInsertError;
  }
}

export async function loadFormOptions(): Promise<{
  trainers: PublicTrainer[];
  locations: PublicLocation[];
}> {
  try {
    await ensureSeedData();

    const [trainersRes, locationsRes] = await Promise.all([
      supabaseAdmin
        .from("trainers")
        .select("id, name")
        .eq("is_active", true)
        .order("code", { ascending: true }),
      supabaseAdmin
        .from("training_locations")
        .select("id, district, name")
        .eq("is_active", true)
        .order("name", { ascending: true }),
    ]);
    if (trainersRes.error) throw trainersRes.error;
    if (locationsRes.error) throw locationsRes.error;
    return {
      trainers: (trainersRes.data ?? []) as PublicTrainer[],
      locations: (locationsRes.data ?? []) as PublicLocation[],
    };
  } catch (error) {
    console.error("Failed to load public form options:", error);
    throw error;
  }
}

export type SubmitInput = {
  operator_name: string;
  operator_id: string;
  mobile_number: string;
  centre_name: string;
  district: string;
  training_location: string;
  trainer_id: string;
  training_date: string;
  category: string;
  subject: string;
  description: string;
  priority: string;
  attachment?: { name: string; type: string; dataBase64: string } | null;
};

export async function createGrievance(input: SubmitInput): Promise<{ grievance_id: string }> {
  const { data: trainer, error: trainerError } = await supabaseAdmin
    .from("trainers")
    .select("id, name, email, is_active")
    .eq("id", input.trainer_id)
    .maybeSingle();
  if (trainerError) throw trainerError;
  if (!trainer || !trainer.is_active) throw new Error("Selected trainer is not available.");

  const { data: idData, error: idError } = await supabaseAdmin.rpc("next_grievance_id");
  if (idError) throw idError;
  const grievanceId = idData as unknown as string;

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("grievances")
    .insert({
      grievance_id: grievanceId,
      operator_name: input.operator_name,
      operator_id: input.operator_id,
      mobile_number: input.mobile_number,
      centre_name: input.centre_name,
      district: input.district,
      training_location: input.training_location,
      trainer_id: trainer.id,
      trainer_name: trainer.name,
      training_date: input.training_date,
      category: input.category,
      subject: input.subject,
      description: input.description,
      priority: input.priority as "Low" | "Medium" | "High" | "Critical",
      status: "Submitted",
    })
    .select("id, grievance_id")
    .single();
  if (insertError) throw insertError;

  await supabaseAdmin.from("grievance_history").insert({
    grievance_uuid: inserted.id,
    from_status: null,
    to_status: "Submitted",
    note: "Grievance submitted by operator.",
    changed_by_name: input.operator_name,
  });

  if (input.attachment?.dataBase64) {
    try {
      const bytes = Uint8Array.from(atob(input.attachment.dataBase64), (c) => c.charCodeAt(0));
      const safeName = input.attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
      const path = `${grievanceId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("grievance-attachments")
        .upload(path, bytes, { contentType: input.attachment.type || "application/octet-stream" });
      if (uploadError) throw uploadError;
      await supabaseAdmin.from("grievance_attachments").insert({
        grievance_uuid: inserted.id,
        file_name: safeName,
        file_path: path,
        mime_type: input.attachment.type,
        size_bytes: bytes.byteLength,
      });
    } catch (error) {
      console.error("[attachment] upload failed", error);
    }
  }

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "team_email")
    .maybeSingle();

  await sendGrievanceNotifications([setting?.value ?? "", trainer.email], {
    grievance_id: grievanceId,
    operator_name: input.operator_name,
    operator_id: input.operator_id,
    district: input.district,
    training_location: input.training_location,
    trainer_name: trainer.name,
    training_date: input.training_date,
    category: input.category,
    priority: input.priority,
    subject: input.subject,
    status: "Submitted",
  });

  return { grievance_id: grievanceId };
}

export type PublicTracking = {
  grievance_id: string;
  status: string;
  district: string;
  training_location: string;
  trainer_name: string;
  category: string;
  subject: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolution: string | null;
  timeline: { to_status: string; from_status: string | null; note: string | null; created_at: string }[];
};

export async function fetchTracking(grievanceId: string): Promise<PublicTracking | null> {
  const { data, error } = await supabaseAdmin
    .from("grievances")
    .select(
      "id, grievance_id, status, district, training_location, trainer_name, category, subject, priority, created_at, updated_at, resolution",
    )
    .eq("grievance_id", grievanceId.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: history } = await supabaseAdmin
    .from("grievance_history")
    .select("to_status, from_status, note, created_at")
    .eq("grievance_uuid", data.id)
    .order("created_at", { ascending: true });

  return {
    grievance_id: data.grievance_id,
    status: data.status,
    district: data.district,
    training_location: data.training_location,
    trainer_name: data.trainer_name,
    category: data.category,
    subject: data.subject,
    priority: data.priority,
    created_at: data.created_at,
    updated_at: data.updated_at,
    resolution: data.resolution,
    timeline: (history ?? []) as PublicTracking["timeline"],
  };
}
