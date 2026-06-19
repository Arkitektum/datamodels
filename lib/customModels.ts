// Egendefinerte datamodeller (opprettet i appen), lagret i Supabase-tabellen
// `datamodell`. Innebygde modeller bor i lib/datamodeller.ts og er ikke her.
import { getSupabase } from './supabase';
import type { ModellStatus } from './datamodeller';

export interface CustomModell {
  id: string;
  navn: string;
  beskrivelse?: string | null;
  status: ModellStatus;
}

export async function listCustomModels(): Promise<CustomModell[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('datamodell')
    .select('id,navn,beskrivelse,status')
    .order('opprettet', { ascending: true });
  if (error) {
    console.warn('[customModels] list', error.message);
    return [];
  }
  return (data ?? []).map((d) => ({
    id: d.id,
    navn: d.navn,
    beskrivelse: d.beskrivelse,
    status: (d.status as ModellStatus) ?? 'arbeid',
  }));
}

export async function createCustomModel(
  navn: string,
  beskrivelse?: string,
  status: ModellStatus = 'arbeid',
): Promise<CustomModell | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : 'm-' + Math.abs(navn.length * 2654435761).toString(36);
  const { data, error } = await supabase
    .from('datamodell')
    .insert({ id, navn, beskrivelse: beskrivelse || null, status })
    .select('id,navn,beskrivelse,status')
    .single();
  if (error) {
    console.warn('[customModels] create', error.message);
    return null;
  }
  return {
    id: data.id,
    navn: data.navn,
    beskrivelse: data.beskrivelse,
    status: (data.status as ModellStatus) ?? status,
  };
}

/**
 * Setter status på en modell. Fungerer både for egendefinerte modeller (rad
 * finnes) og innebygde (upsert oppretter en liten rad med id+navn+status, slik
 * at også «Publisert» kan endres). Øvrig metadata for innebygde bor i koden.
 */
export async function setModellStatus(
  id: string,
  navn: string,
  status: ModellStatus,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from('datamodell')
    .upsert({ id, navn, status }, { onConflict: 'id' });
  if (error) {
    console.warn('[customModels] setStatus', error.message);
    return false;
  }
  return true;
}

export async function deleteCustomModel(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  // Slett innholdet (regler/status/brevmaler/struktur), diskusjon og dokumenter
  // først, så selve modellen.
  await supabase.from('dokument_data').delete().eq('datamodell_id', id);
  await supabase.from('diskusjon').delete().eq('datamodell_id', id);
  await supabase.from('dokument').delete().eq('datamodell_id', id);
  const { error } = await supabase.from('datamodell').delete().eq('id', id);
  if (error) {
    console.warn('[customModels] delete', error.message);
    return false;
  }
  return true;
}
