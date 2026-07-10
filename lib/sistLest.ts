// «Nytt siden sist»: når leste brukeren hver diskusjonstråd sist? Lagres i
// Supabase-tabellen `traad_lest` (db/patches/08) med kontekst = '' for
// modellnivå-tråden. Rene hjelpere teller uleste meldinger per tråd/modell —
// egne meldinger regnes aldri som uleste.
import { getSupabase } from './supabase';
import type { Melding } from './diskusjon';

export interface TraadLest {
  epost: string;
  datamodell_id: string;
  kontekst: string; // '' = modellnivå-tråden
  sist_lest: string;
}

/** Henter innlogget brukers lest-markeringer (RLS begrenser til egne). */
export async function fetchMineLest(): Promise<TraadLest[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.from('traad_lest').select('*');
  if (error) {
    console.warn('[sistLest] fetchMine', error.message);
    return [];
  }
  return (data ?? []) as TraadLest[];
}

/** Markerer en tråd som lest nå. kontekst null = modellnivå-tråden. */
export async function settTraadLest(
  epost: string,
  datamodellId: string,
  kontekst: string | null,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || !epost) return false;
  const { error } = await supabase.from('traad_lest').upsert(
    {
      epost: epost.trim().toLowerCase(),
      datamodell_id: datamodellId,
      kontekst: kontekst ?? '',
      sist_lest: new Date().toISOString(),
    },
    { onConflict: 'epost,datamodell_id,kontekst' },
  );
  if (error) {
    console.warn('[sistLest] settTraadLest', error.message);
    return false;
  }
  return true;
}

// ---------- rene hjelpere på allerede hentede lister ----------

function lestNoekkel(datamodellId: string, kontekst: string | null): string {
  return `${datamodellId}::${kontekst ?? ''}`;
}

/** Oppslagskart fra lest-listen: tråd-nøkkel → sist_lest-tidspunkt (ms). */
export function lestKart(lest: TraadLest[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const l of lest) {
    map.set(lestNoekkel(l.datamodell_id, l.kontekst || null), new Date(l.sist_lest).getTime());
  }
  return map;
}

function erUlest(m: Melding, kart: Map<string, number>, egenEpost: string): boolean {
  if (m.epost && egenEpost && m.epost.toLowerCase() === egenEpost.toLowerCase()) return false;
  const sistLest = kart.get(lestNoekkel(m.datamodell_id, m.kontekst)) ?? 0;
  return new Date(m.opprettet).getTime() > sistLest;
}

/** Antall uleste meldinger i én tråd. */
export function ulesteITraad(
  meldinger: Melding[],
  kart: Map<string, number>,
  egenEpost: string,
  datamodellId: string,
  kontekst: string | null,
): number {
  return meldinger.filter(
    (m) =>
      m.datamodell_id === datamodellId &&
      (m.kontekst ?? null) === (kontekst ?? null) &&
      erUlest(m, kart, egenEpost),
  ).length;
}

/** Antall uleste meldinger i en hel modell (alle tråder). */
export function ulesteIModell(
  meldinger: Melding[],
  kart: Map<string, number>,
  egenEpost: string,
  datamodellId: string,
): number {
  return meldinger.filter(
    (m) => m.datamodell_id === datamodellId && erUlest(m, kart, egenEpost),
  ).length;
}
