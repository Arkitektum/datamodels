// Delt diskusjon (kommentarer + endringsforslag) per modell/felt, lagret i
// Supabase-tabellen `diskusjon`. Erstatter prototypens localStorage-tråder.
import { getSupabase } from './supabase';
import type { Rolle } from './roller';

export type MeldingType = 'comment' | 'proposal';
export type ForslagStatus = 'open' | 'approved' | 'rejected';

export interface Melding {
  id: string;
  datamodell_id: string;
  kontekst: string | null; // feltsti, eller null = hele modellen
  type: MeldingType;
  forfatter: string | null;
  epost: string | null; // forfatterens e-post (eierskap)
  rolle: Rolle | null;
  body: string | null;
  felt: string | null;
  endring: string | null;
  status: ForslagStatus | null;
  opprettet: string;
}

export type NyMelding = Omit<Melding, 'id' | 'opprettet'>;

/** Henter ALLE meldinger på tvers av modeller (brukes for sidemeny-badges
 *  og det aktive modellpanelet — datamengden er liten). */
export async function fetchAllDiskusjon(): Promise<Melding[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('diskusjon')
    .select('*')
    .order('opprettet', { ascending: true });
  if (error) {
    console.warn('[diskusjon] fetchAll', error.message);
    return [];
  }
  return (data ?? []) as Melding[];
}

export async function insertMelding(m: NyMelding): Promise<Melding | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('diskusjon').insert(m).select('*').single();
  if (error) {
    console.warn('[diskusjon] insert', error.message);
    return null;
  }
  return data as Melding;
}

/** Endre egen melding (body, og for forslag felt/endring). */
export async function oppdaterMelding(
  id: string,
  patch: Partial<Pick<Melding, 'body' | 'felt' | 'endring'>>,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('diskusjon').update(patch).eq('id', id);
  if (error) {
    console.warn('[diskusjon] oppdaterMelding', error.message);
    return false;
  }
  return true;
}

/** Slette én melding. */
export async function slettMelding(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('diskusjon').delete().eq('id', id);
  if (error) {
    console.warn('[diskusjon] slettMelding', error.message);
    return false;
  }
  return true;
}

export async function setForslagStatus(id: string, status: ForslagStatus): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('diskusjon').update({ status }).eq('id', id);
  if (error) {
    console.warn('[diskusjon] setStatus', error.message);
    return false;
  }
  return true;
}

/** Tømmer én tråd (modell + kontekst). */
export async function deleteTraad(datamodellId: string, kontekst: string | null): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  let q = supabase.from('diskusjon').delete().eq('datamodell_id', datamodellId);
  q = kontekst == null ? q.is('kontekst', null) : q.eq('kontekst', kontekst);
  const { error } = await q;
  if (error) {
    console.warn('[diskusjon] deleteTraad', error.message);
    return false;
  }
  return true;
}

// ---------- rene hjelpere på en allerede hentet liste ----------
export function traadFor(
  alle: Melding[],
  datamodellId: string,
  kontekst: string | null,
): Melding[] {
  return alle.filter(
    (m) => m.datamodell_id === datamodellId && (m.kontekst ?? null) === (kontekst ?? null),
  );
}

export function feltCount(alle: Melding[], datamodellId: string, kontekst: string): number {
  return traadFor(alle, datamodellId, kontekst).length;
}

export function aapneForslagCount(alle: Melding[], datamodellId: string): number {
  return alle.filter(
    (m) => m.datamodell_id === datamodellId && m.type === 'proposal' && m.status === 'open',
  ).length;
}

export function forslagFor(alle: Melding[], datamodellId: string): Melding[] {
  return alle.filter((m) => m.datamodell_id === datamodellId && m.type === 'proposal');
}
