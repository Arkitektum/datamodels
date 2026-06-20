import { getSupabase } from './supabase';
import type { Rolle } from './roller';

export interface BrukerRolle {
  epost: string;
  rolle: Rolle;
  navn: string | null;
}

/** Alle brukerroller, sortert på e-post. RLS avgjør lesetilgang (alle innloggede). */
export async function listBrukerRoller(): Promise<BrukerRolle[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bruker_rolle')
    .select('epost,rolle,navn')
    .order('epost', { ascending: true });
  if (error) {
    console.warn('[admin] listBrukerRoller', error.message);
    return [];
  }
  return (data ?? []) as BrukerRolle[];
}

/**
 * Oppretter eller endrer en brukerrolle. RLS (`rolle_admin_skriv`) håndhever at
 * kun admin får skrive — for andre returneres false. E-post normaliseres til
 * lowercase + trim (primærnøkkel/onConflict).
 */
export async function upsertBrukerRolle(
  epost: string,
  rolle: Rolle,
  navn?: string | null,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const rad = {
    epost: epost.trim().toLowerCase(),
    rolle,
    navn: navn ?? null,
  };
  const { error } = await supabase
    .from('bruker_rolle')
    .upsert(rad, { onConflict: 'epost' });
  if (error) {
    console.warn('[admin] upsertBrukerRolle', error.message);
    return false;
  }
  return true;
}

/** Fjerner en brukerrolle. RLS håndhever at kun admin får slette. */
export async function deleteBrukerRolle(epost: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from('bruker_rolle')
    .delete()
    .eq('epost', epost.trim().toLowerCase());
  if (error) {
    console.warn('[admin] deleteBrukerRolle', error.message);
    return false;
  }
  return true;
}
