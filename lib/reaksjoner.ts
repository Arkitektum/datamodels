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

/** Setter (eller endrer) brukerens reaksjon på en melding. */
export async function settReaksjon(
  meldingId: string,
  epost: string,
  navn: string | null,
  verdi: ReaksjonVerdi,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from('diskusjon_reaksjon')
    .upsert({ melding_id: meldingId, epost, navn, verdi }, { onConflict: 'melding_id,epost' });
  if (error) {
    console.warn('[reaksjoner] sett', error.message);
    return false;
  }
  return true;
}

/** Fjerner brukerens reaksjon på en melding. */
export async function fjernReaksjon(meldingId: string, epost: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from('diskusjon_reaksjon')
    .delete()
    .eq('melding_id', meldingId)
    .eq('epost', epost);
  if (error) {
    console.warn('[reaksjoner] fjern', error.message);
    return false;
  }
  return true;
}
