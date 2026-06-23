// Delt diskusjon (kommentarer + endringsforslag) per modell/felt, lagret i
// Supabase-tabellen `diskusjon`. Erstatter prototypens localStorage-tråder.
import { getSupabase } from './supabase';
import type { Rolle } from './roller';
import type { Struktur } from './struktur';

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
  avgjort_av: string | null; // e-post til DiBK-bruker som avgjorde forslaget
  avgjort_tid: string | null; // tidspunkt forslaget ble godkjent/avvist
  opprettet: string;
}

// Nye meldinger settes aldri som «avgjort» ved opprettelse — avgjort_av/_tid
// fylles først når DiBK godkjenner/avviser et forslag (se setForslagStatus).
export type NyMelding = Omit<Melding, 'id' | 'opprettet' | 'avgjort_av' | 'avgjort_tid'>;

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
  // Hent innlogget bruker (DiBK) for audit-sporet «hvem/når».
  const { data: { user } } = await supabase.auth.getUser();
  const patch =
    status === 'open'
      ? { status, avgjort_av: null, avgjort_tid: null }
      : { status, avgjort_av: user?.email ?? null, avgjort_tid: new Date().toISOString() };
  // .select() så vi kan skille «oppdaterte raden» fra «RLS avviste / fant ingen
  // rad» (begge gir error=null, men sistnevnte returnerer ingen rader). Uten
  // dette ville en avvist avgjørelse blitt rapportert som vellykket (fail-open).
  const { data, error } = await supabase
    .from('diskusjon')
    .update(patch)
    .eq('id', id)
    .select('id');
  if (error) {
    console.warn('[diskusjon] setStatus', error.message);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

/** Flytter en tråd til en ny kontekst (f.eks. når et felt/objekt døpes om, slik
 *  at kommentarene følger med i stedet for å bli foreldreløse). RLS gjør at kun
 *  EGNE meldinger flyttes (DiBK kan alle) – samme begrensning som deleteTraad. */
export async function flyttTraad(
  datamodellId: string,
  fra: string,
  til: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (fra === til) return true;
  const { error } = await supabase
    .from('diskusjon')
    .update({ kontekst: til })
    .eq('datamodell_id', datamodellId)
    .eq('kontekst', fra);
  if (error) {
    console.warn('[diskusjon] flyttTraad', error.message);
    return false;
  }
  return true;
}

/** Alle feltkontekster («ObjektNavn.feltNavn») i en struktur – samme nøkkel som
 *  diskusjonstrådene bruker. Felt uten navn hoppes over. */
export function strukturKontekster(struktur: Struktur): string[] {
  return struktur.flatMap((o) =>
    (o.felt ?? []).filter((f) => f.navn).map((f) => `${o.navn}.${f.navn}`),
  );
}

/** Sletter tråder for felt som forsvant da strukturen ble erstattet (XSD-import).
 *  Tråder på felt som fortsatt finnes, og modell-nivå-tråder (kontekst = null),
 *  beholdes. RLS gjør at kun egne meldinger slettes (DiBK kan alle). */
export async function ryddForeldreloeseKontekster(
  datamodellId: string,
  gammel: Struktur,
  ny: Struktur,
): Promise<void> {
  const beholdt = new Set(strukturKontekster(ny));
  const fjernet = [...new Set(strukturKontekster(gammel))].filter((k) => !beholdt.has(k));
  await Promise.all(fjernet.map((k) => deleteTraad(datamodellId, k)));
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
