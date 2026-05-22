import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server env vars not set");
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}
