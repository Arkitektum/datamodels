import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// URL-en er offentlig (samme som nettleser-klienten). Service-role-nøkkelen er
// en HEMMELIGHET og må ALDRI eksponeres til nettleseren: les den kun fra en
// server-side env-variabel uten NEXT_PUBLIC-prefiks, og legg den ALDRI i
// next.config `env` (som inlines verdier i klient-bundelen).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/** True når server-klienten er konfigurert (URL + service-role-nøkkel finnes). */
export const isServerSupabaseConfigured = Boolean(url && serviceRoleKey);

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase-klient med service-role-nøkkel (singleton). Brukes KUN i
 * route handlers / server-side lib for å lese delte tabeller (datamodell,
 * dokument_data) som har RLS begrenset til `authenticated`. Server-rutene har
 * ingen innlogget brukersesjon, så nettleser-klienten (anon) ville blitt nektet
 * av RLS og fått null rader; service-role omgår RLS for disse lese-kallene.
 *
 * Returnerer null hvis nøkkelen mangler (f.eks. lokalt uten secret) — kallerne
 * faller da tilbake til innebygde defaults i stedet for å krasje.
 */
export function getServerSupabase(): SupabaseClient | null {
  if (!isServerSupabaseConfigured) return null;
  if (!client) {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
