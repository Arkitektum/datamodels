import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const SUPABASE_TABLE =
  process.env.NEXT_PUBLIC_SUPABASE_TABLE || 'dokument_data';

/** True når Supabase er konfigurert (URL + publiserbar nøkkel finnes). */
export const isSupabaseConfigured = Boolean(url && publishableKey);

let client: SupabaseClient | null = null;

/**
 * Henter en delt Supabase-klient (singleton). Returnerer null hvis appen er
 * bygget uten nøkler — da kan UI-et vise en tydelig "ikke konfigurert"-melding
 * i stedet for å krasje.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
