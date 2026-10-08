import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://kuwxkhktqdznrleuzyej.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_iwzz7ra1O5yWWN2FwVHC8w_dhnOIElj";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/** Singleton Supabase client dùng trên Browser / Client Components */
export const supabase = createClient();

