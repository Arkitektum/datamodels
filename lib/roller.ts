'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { getSupabase } from './supabase';

export type Rolle = 'utvikler' | 'dibk' | 'admin' | 'ceo' | 'team_lead';

/** Visningsnavn for hver rolle (brukes i Header-merket og admin-UI). */
export const ROLLE_LABELS: Record<Rolle, string> = {
  utvikler: 'Utvikler',
  ceo: 'CEO',
  team_lead: 'Team Lead',
  dibk: 'DiBK',
  admin: 'Admin',
};

/** Alle roller i visningsrekkefølge (admin-UI). «ceo» og «team_lead» har samme
 *  rettigheter som «utvikler» – de er kun egne etiketter. */
export const ALLE_ROLLER: Rolle[] = ['utvikler', 'ceo', 'team_lead', 'dibk', 'admin'];

export interface RolleInfo {
  rolle: Rolle;
  navn: string; // visningsnavn (fra bruker_rolle, ellers e-post)
  epost: string;
  isDibk: boolean;
  isAdmin: boolean;
  loading: boolean;
}

/**
 * Henter innlogget brukers rolle fra `bruker_rolle`. Brukere uten rad
 * behandles som «utvikler». «dibk» (og «admin», som arver DiBK-rettigheter)
 * kan godkjenne/avvise endringsforslag (håndheves i tillegg av RLS-policyen
 * `diskusjon_avgjor`). «admin» kan i tillegg administrere brukerroller.
 */
export function useRolle(): RolleInfo {
  const { user } = useAuth();
  const epost = user?.email ?? '';
  const [rolle, setRolle] = useState<Rolle>('utvikler');
  const [navn, setNavn] = useState<string>(epost);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let aktiv = true;
    const supabase = getSupabase();
    if (!supabase || !epost) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('bruker_rolle')
      .select('rolle,navn')
      .ilike('epost', epost)
      .maybeSingle()
      .then(({ data }) => {
        if (!aktiv) return;
        setRolle((data?.rolle as Rolle) ?? 'utvikler');
        setNavn(data?.navn || epost);
        setLoading(false);
      });
    return () => {
      aktiv = false;
    };
  }, [epost]);

  // Admin arver DiBK-rettigheter i appen (speiles av er_dibk() i RLS).
  return {
    rolle,
    navn,
    epost,
    isDibk: rolle === 'dibk' || rolle === 'admin',
    isAdmin: rolle === 'admin',
    loading,
  };
}
