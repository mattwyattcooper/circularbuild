import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Allow flexible payloads; we only need runtime behaviour here.
// biome-ignore lint/suspicious/noExplicitAny: admin client works across tables
type AdminClient = SupabaseClient<any>;

let adminClient: AdminClient | undefined;

export function getSupabaseAdminClient(): AdminClient {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      throw new Error("Supabase admin credentials are not configured");
    }

    // biome-ignore lint/suspicious/noExplicitAny: admin client works across tables
    adminClient = createClient<any>(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClient;
}
