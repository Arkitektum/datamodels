'use client';

// Tilstedeværelse via Supabase Realtime Presence: hvem ser på hvilken modell
// akkurat nå. Én felles kanal for hele arbeidsflaten; hver klient annonserer
// (epost, navn, modellId) og re-annonserer når brukeren bytter modell.
// Returnerer ANDRE brukere på samme modell (aldri en selv). Ved flere faner
// per bruker dedupliseres det på e-post.
import { useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface TilstedeBruker {
  epost: string;
  navn: string;
}

interface PresenceMeta {
  epost: string;
  navn: string;
  modellId: string;
}

export function usePresence(modellId: string, epost: string, navn: string): TilstedeBruker[] {
  const [alle, setAlle] = useState<PresenceMeta[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const joinedRef = useRef(false);
  // Ferskeste metadata til (re-)annonsering uten å rive ned kanalen.
  const metaRef = useRef<PresenceMeta>({ epost, navn, modellId });

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !epost) return;

    const channel = supabase.channel('presence:workspace', {
      config: { presence: { key: epost.toLowerCase() } },
    });
    channelRef.current = channel;

    const sync = () => {
      const state = channel.presenceState<PresenceMeta>();
      setAlle(Object.values(state).flat());
    };
    channel.on('presence', { event: 'sync' }, sync);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        joinedRef.current = true;
        void channel.track(metaRef.current);
      }
    });

    return () => {
      joinedRef.current = false;
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [epost]);

  // Bytte av modell (eller navn): oppdater annonseringen på den stående kanalen.
  useEffect(() => {
    metaRef.current = { epost, navn, modellId };
    if (joinedRef.current && channelRef.current) {
      void channelRef.current.track(metaRef.current);
    }
  }, [epost, modellId, navn]);

  // Andre brukere på samme modell, deduplisert på e-post.
  const sett = new Set<string>();
  const andre: TilstedeBruker[] = [];
  for (const p of alle) {
    if (!p?.epost || p.modellId !== modellId) continue;
    const key = p.epost.toLowerCase();
    if (key === epost.toLowerCase() || sett.has(key)) continue;
    sett.add(key);
    andre.push({ epost: p.epost, navn: p.navn || p.epost });
  }
  return andre;
}
