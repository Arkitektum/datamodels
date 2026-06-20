import { getSupabase, SUPABASE_TABLE } from './supabase';

/** Ett snapshot av delt data slik det så ut ved én meningsfulle endring. */
export interface HistorikkRad {
  id: number;
  datamodell_id: string;
  type: string;
  innhold: unknown;
  versjon: number | null;
  detalj: string | null;
  endret_av: string | null;
  endret_tid: string;
}

/** Hent historikk for én modell (alle typer), nyeste først. */
export async function fetchHistorikk(datamodellId: string): Promise<HistorikkRad[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('dokument_data_historikk')
    .select('id,datamodell_id,type,innhold,versjon,detalj,endret_av,endret_tid')
    .eq('datamodell_id', datamodellId)
    .order('endret_tid', { ascending: false });
  if (error) {
    console.warn('[historikk] fetch', error.message);
    return [];
  }
  return (data ?? []) as HistorikkRad[];
}

/**
 * Gjenopprett: skriv et tidligere snapshot tilbake som gjeldende verdi.
 *
 * Bruker upsert mot dokument_data (onConflict 'datamodell_id,type') og setter
 * `sist_detalj`, slik at selve gjenopprettingen både logges (logg-trigger) og
 * snapshottes (snapshot-trigger). Dette er en eksplisitt siste-skriver-vinner-
 * handling; åpne editorer fanger opp endringen via sanntid (stale/reload i
 * useDokumentData).
 */
export async function gjenopprettVersjon(rad: HistorikkRad): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const naar = new Date(rad.endret_tid).toLocaleString('no-NO');

  const { error } = await supabase.from(SUPABASE_TABLE).upsert(
    {
      datamodell_id: rad.datamodell_id,
      type: rad.type,
      innhold: rad.innhold,
      endret_av: user?.email ?? null,
      sist_detalj: 'Gjenopprettet versjon fra ' + naar,
    },
    { onConflict: 'datamodell_id,type' },
  );
  if (error) {
    console.warn('[historikk] gjenopprett', error.message);
    return false;
  }
  return true;
}
