import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error("createAdminClient: NEXT_PUBLIC_SUPABASE_URL is not set")
  if (!key) throw new Error("createAdminClient: SUPABASE_SERVICE_ROLE_KEY is not set (check Cloudflare Dashboard Secrets)")
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
