import { createClient } from "@supabase/supabase-js";
import { env } from "../utils/env";

// Server-side client using the SERVICE ROLE key.
// This bypasses Row Level Security — never expose this key to the frontend.
// The frontend should talk to OUR API, not Supabase directly.
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
