import { getSupabase } from './supabase';

export interface LoggRad {
  id: number;
  datamodell_id: string;
  type: string;
  handling: string;
  detalj: string | null;
  endret_av: string | null;
  tidspunkt: string;
}

/** Endringer for én datamodell (eller alle hvis datamodellId utelates). */
export async function listRecentChanges(datamodellId?: string, limit = 60): Promise<LoggRad[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  let q = supabase
    .from('endring_logg')
    .select('id,datamodell_id,type,handling,detalj,endret_av,tidspunkt')
    .order('tidspunkt', { ascending: false })
    .limit(limit);
  if (datamodellId) q = q.eq('datamodell_id', datamodellId);
  const { data, error } = await q;
  if (error) {
    console.warn('[logg]', error.message);
    return [];
  }
  return (data ?? []) as LoggRad[];
}

const TYPE_LABEL: Record<string, string> = {
  regeldata: 'Valideringsregler',
  regelstatus: 'Regelstatuser',
  struktur: 'Datamodell-struktur',
  brevmaler: 'Brevmaler',
  notat: 'Notat',
};
export function typeLabel(type: string): string {
  return TYPE_LABEL[type] || type;
}
