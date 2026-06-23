// 👍/👎-reaksjoner på kommentarer, lagret i Supabase-tabellen
// `diskusjon_reaksjon`. Én reaksjon per person (e-post) per melding; brukeren
// kan veksle eller fjerne den. Server håndhever at man ikke kan reagere på egen
// melding og kun på kommentarer (se db/patches/06-reaksjoner.sql).
import { getSupabase } from './supabase';

export type ReaksjonVerdi = 'up' | 'down';

export interface Reaksjon {
  melding_id: string;
  epost: string;
  navn: string | null;
  verdi: ReaksjonVerdi;
  opprettet: string;
}

/** Henter ALLE reaksjoner (datamengden er liten — som fetchAllDiskusjon). */
export async function fetchAllReaksjoner(): Promise<Reaksjon[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('diskusjon_reaksjon').select('*');
  if (error) {
    console.warn('[reaksjoner] fetchAll', error.message);
    return [];
  }
  return (data ?? []) as Reaksjon[];
}

/** Resultat av en reaksjons-operasjon: feilmelding fra serveren, eller null ved
 *  suksess. Lar UI-et vise den faktiske årsaken i stedet for en gjettet tekst. */
export type ReaksjonResultat = { feil: string | null };

/** Setter (eller endrer) brukerens reaksjon på en melding. */
export async function settReaksjon(
  meldingId: string,
  epost: string,
  navn: string | null,
  verdi: ReaksjonVerdi,
): Promise<ReaksjonResultat> {
  const supabase = getSupabase();
  if (!supabase) return { feil: 'Supabase er ikke konfigurert.' };
  const { error } = await supabase
    .from('diskusjon_reaksjon')
    .upsert({ melding_id: meldingId, epost, navn, verdi }, { onConflict: 'melding_id,epost' });
  if (error) {
    console.warn('[reaksjoner] sett', error.message);
    return { feil: error.message };
  }
  return { feil: null };
}

/** Fjerner brukerens reaksjon på en melding. */
export async function fjernReaksjon(meldingId: string, epost: string): Promise<ReaksjonResultat> {
  const supabase = getSupabase();
  if (!supabase) return { feil: 'Supabase er ikke konfigurert.' };
  const { error } = await supabase
    .from('diskusjon_reaksjon')
    .delete()
    .eq('melding_id', meldingId)
    .eq('epost', epost);
  if (error) {
    console.warn('[reaksjoner] fjern', error.message);
    return { feil: error.message };
  }
  return { feil: null };
}
