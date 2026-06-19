'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { getSupabase } from './supabase';

export type Rolle = 'utvikler' | 'dibk';

export interface RolleInfo {
  rolle: Rolle;
  navn: string; // visningsnavn (fra bruker_rolle, ellers e-post)
  epost: string;
  isDibk: boolean;
  loading: boolean;
}

/**
 * Henter innlogget brukers rolle fra `bruker_rolle`. Brukere uten rad
 * behandles som «utvikler». Kun «dibk» kan godkjenne/avvise endringsforslag
 * (håndheves i tillegg av RLS-policyen `diskusjon_avgjor`).
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

  return { rolle, navn, epost, isDibk: rolle === 'dibk', loading };
}
