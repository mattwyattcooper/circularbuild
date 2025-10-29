import type { SupabaseClient } from "@supabase/supabase-js";

type GenericSchema = Record<string, unknown>;
type GenericDatabase = Record<string, GenericSchema>;
type GenericSupabaseClient = SupabaseClient<
  GenericDatabase,
  "public",
  GenericSchema
>;

declare module "@supabase/auth-helpers-nextjs" {
  export const createServerComponentClient: () => GenericSupabaseClient;
  export const createRouteHandlerClient: () => GenericSupabaseClient;
  export const createPagesClient: () => GenericSupabaseClient;
  export const createBrowserSupabaseClient: () => GenericSupabaseClient;
  export const createClientComponentClient: () => GenericSupabaseClient;
}

declare module "@supabase/auth-helps-netjs" {
  export * from "@supabase/auth-helpers-nextjs";
}
