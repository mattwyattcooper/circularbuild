import type { User } from "next-auth";

import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function upsertProfileFromAuth(user: User, id: string) {
  const admin = getSupabaseAdminClient();

  const payload: { id: string; updated_at: string } & Record<string, string> = {
    id,
    updated_at: new Date().toISOString(),
  };

  if (user.email) {
    payload.email = user.email.toLowerCase();
  }
  if (user.name) {
    payload.name = user.name;
  }
  if (user.image) {
    payload.avatar_url = user.image;
  }

  await admin.from("profiles").upsert(payload, { onConflict: "id" });
}
