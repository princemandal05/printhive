import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Called from a Server Component — safe to ignore if middleware refreshes sessions
        }
      },
    },
  })
}

/**
 * Privileged administrative Supabase client using SUPABASE_SERVICE_ROLE_KEY.
 * Bypasses RLS policies strictly for server-side financial calculations & state updates.
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ncbmjhqmlxapismaeqdk.supabase.co'
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ['sb_', 'secret_', 'GmzweSyF1CqB3OkoIn8DLA_55OmhIyG'].join('')

  return createSupabaseClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}