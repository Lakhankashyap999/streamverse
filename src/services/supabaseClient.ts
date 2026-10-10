import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

/** When false the app runs in local DEMO MODE with clearly labelled sample content. */
export const isSupabaseConfigured = Boolean(url && publishableKey);
export const isDemoMode = !isSupabaseConfigured;

/**
 * Browser client using the PUBLISHABLE key only.
 * All writes are protected by Row Level Security + SECURITY DEFINER functions.
 * The service-role key must never be used in frontend code.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/**
 * Visitors get an anonymous Supabase session (no personal data) so the database
 * can enforce "one vote per visitor session" and per-session rate limits.
 * Requires "Allow anonymous sign-ins" in Supabase Auth settings.
 */
export async function ensureVisitorSession(): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.auth.getSession();
  if (data.session) return true;
  const { error } = await supabase.auth.signInAnonymously();
  return !error;
}
