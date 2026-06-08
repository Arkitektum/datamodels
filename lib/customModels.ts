// Egendefinerte datamodeller (opprettet i appen), lagret i Supabase-tabellen
// `datamodell`. Innebygde modeller bor i lib/datamodeller.ts og er ikke her.
import { getSupabase } from './supabase';

export interface CustomModell {
  id: string;
  navn: string;
  beskrivelse?: string | null;
}

export async function listCustomModels(): Promise<CustomModell[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('datamodell')
    .select('id,navn,beskrivelse')
    .order('opprettet', { ascending: true });
  if (error) {
    console.warn('[customModels] list', error.message);
    return [];
  }
  return (data ?? []) as CustomModell[];
}

export async function createCustomModel(
  navn: string,
  beskrivelse?: string,
): Promise<CustomModell | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'm-' + Math.abs(navn.length * 2654435761).toString(36);
  const { data, error } = await supabase
    .from('datamodell')
    .insert({ id, navn, beskrivelse: beskrivelse || null })
    .select('id,navn,beskrivelse')
    .single();
  if (error) {
    console.warn('[customModels] create', error.message);
    return null;
  }
  return data as CustomModell;
}

export async function deleteCustomModel(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  // Slett innholdet (regler/status/brevmaler) først, så selve modellen.
  await supabase.from('dokument_data').delete().eq('datamodell_id', id);
  const { error } = await supabase.from('datamodell').delete().eq('id', id);
  if (error) {
    console.warn('[customModels] delete', error.message);
    return false;
  }
  return true;
}
