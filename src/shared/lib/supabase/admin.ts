import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * Creates an admin Supabase client that bypasses RLS
 * This should only be used in server-side API routes for administrative operations
 * like creating team member profiles before they have accounts
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
