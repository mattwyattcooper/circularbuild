import { getSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function expirePastListings() {
  const supabase = getSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("listings")
    .update({ status: "removed" })
    .eq("status", "active")
    .lt("available_until", today);
}
