// Personlige varsler (nye forslag, avgjørelser, @-omtaler), lagret i Supabase-
// tabellen `varsel`. Radene opprettes av databasetriggere (db/patches/08) —
// appen bare leser, markerer som lest og sletter. E-postutsending er en valgfri
// Edge Function (supabase/functions/send-varsel-epost) og angår ikke klienten.
import { getSupabase } from './supabase';

export type VarselKind = 'forslag_ny' | 'forslag_godkjent' | 'forslag_avvist' | 'omtale';

export interface Varsel {
  id: number;
  mottaker_epost: string;
  kind: VarselKind;
  datamodell_id: string;
  kontekst: string | null;
  melding_id: string | null;
  aktor_navn: string | null;
  aktor_epost: string | null;
  tekst: string | null;
  lest: boolean;
  opprettet: string;
}

/** Henter innlogget brukers varsler, nyeste først (RLS begrenser til egne). */
export async function fetchMineVarsler(): Promise<Varsel[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('varsel')
    .select('*')
    .order('opprettet', { ascending: false });
  if (error) {
    console.warn('[varsler] fetchMine', error.message);
    return [];
  }
  return (data ?? []) as Varsel[];
}

/** Markerer ett varsel som lest. */
export async function markerVarselLest(id: number): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('varsel').update({ lest: true }).eq('id', id);
  if (error) {
    console.warn('[varsler] markerLest', error.message);
    return false;
  }
  return true;
}

/** Markerer alle egne uleste varsler som lest. */
export async function markerAlleVarslerLest(): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('varsel').update({ lest: true }).eq('lest', false);
  if (error) {
    console.warn('[varsler] markerAlleLest', error.message);
    return false;
  }
  return true;
}

// ---------- rene hjelpere ----------

export function antallUlesteVarsler(varsler: Varsel[]): number {
  return varsler.filter((v) => !v.lest).length;
}

/** Kort norsk etikett per varseltype (innboks-kortene). */
export const VARSEL_KIND_LABEL: Record<VarselKind, string> = {
  forslag_ny: 'Nytt endringsforslag',
  forslag_godkjent: 'Forslag godkjent',
  forslag_avvist: 'Forslag avvist',
  omtale: 'Du ble nevnt',
};
