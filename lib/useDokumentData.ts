'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, SUPABASE_TABLE } from './supabase';
import { subscribeTable } from '@/lib/realtime';

export type SaveStatus = 'loading' | 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export interface DokumentDataResult<T> {
  value: T;
  setValue: (next: T, detalj?: string) => void;
  status: SaveStatus;
  endretAv: string | null;
  endretTid: string | null;
  reload: () => void;
  /** Øker ved HVER server-(re)load — IKKE ved lokal setValue. Konsumenter
   *  re-adopterer serververdien når denne endrer seg. */
  revision: number;
  /** True når en annen bruker har lagret nyere endringer mens DU har
   *  ulagrede lokale endringer (serververdien er ikke hentet inn ennå). */
  stale: boolean;
}

/**
 * Delt, redigerbar data for én (datamodell, type), lagret i Supabase-tabellen
 * `dokument_data`. Henter delt verdi ved montering, faller tilbake til
 * defaultValue, og lagrer endringer (debounced).
 *
 * Samtidighet: bruker en `versjon`-kolonne (bumpes av trigger ved UPDATE).
 * Skriving er betinget (update … eq versjon) — hvis en annen bruker har
 * skrevet i mellomtiden returneres ingen rad, og vi går i `'conflict'` i
 * stedet for å overskrive stille. Hooken abonnerer dessuten på sanntid for
 * sin egen rad og oppdager når andre lagrer.
 */
export function useDokumentData<T>(
  datamodellId: string,
  type: string,
  defaultValue: T,
): DokumentDataResult<T> {
  const [value, setValueState] = useState<T>(defaultValue);
  const [status, setStatus] = useState<SaveStatus>('loading');
  const [endretAv, setEndretAv] = useState<string | null>(null);
  const [endretTid, setEndretTid] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [stale, setStale] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Versjonen vi sist så fra serveren. null = ingen rad finnes ennå (skal INSERT).
  const versjonRef = useRef<number | null>(null);
  // Har brukeren ulagrede endringer? Settes i setValue, nullstilles etter
  // vellykket lagring. Styrer om sanntid skal reload-e eller flagge stale.
  const dirtyRef = useRef(false);
  // Sann mens en debounced lagring kjører (insert/update). Da ignoreres
  // sanntids-hendelser, ellers kan ekkoet av VÅR EGEN skriving rekke fram før
  // .select()-svaret og feilaktig flagge stale (egen lagring = «konflikt»).
  const savingRef = useRef(false);
  // True når lagring er låst fordi en annen bruker har skrevet nyere (konflikt).
  // Da planlegges ingen nye, dødfødte lagringer før brukeren laster inn på nytt.
  const conflictRef = useRef(false);
  // Siste ulagrede verdi som venter på debounce. Lar oss flushe den ved
  // unmount / bytte av (datamodell,type) i stedet for å miste den.
  const pendingRef = useRef<{ next: T; detalj?: string } | null>(null);

  const load = useCallback(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    supabase
      .from(SUPABASE_TABLE)
      .select('innhold,endret_av,endret_tid,versjon')
      .eq('datamodell_id', datamodellId)
      .eq('type', type)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('[useDokumentData] load', error.message);
          setStatus('error');
          return;
        }
        if (data) {
          versjonRef.current = typeof data.versjon === 'number' ? data.versjon : 0;
          if (data.innhold != null) {
            setValueState(data.innhold as T);
            setEndretAv(data.endret_av ?? null);
            setEndretTid(data.endret_tid ?? null);
          }
        } else {
          // Ingen rad ennå → neste skriving blir en INSERT.
          versjonRef.current = null;
        }
        // En server-(re)load fant sted: nullstill stale/konflikt, bump revision
        // slik at konsumenter re-adopterer, og gå til idle.
        dirtyRef.current = false;
        conflictRef.current = false;
        setStale(false);
        setRevision((r) => r + 1);
        setStatus('idle');
      });
  }, [datamodellId, type]);

  useEffect(() => {
    load();
  }, [load]);

  // Sanntid: abonner på endringer i SIN rad (filtrert på datamodell_id; type
  // sjekkes i onChange siden PostgREST-filter kun tar ett uttrykk her).
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    const unsubscribe = subscribeTable(SUPABASE_TABLE, {
      filter: 'datamodell_id=eq.' + datamodellId,
      onChange: (payload) => {
        if (savingRef.current) return; // egen skriving pågår – la update-svaret reconcile
        if (payload.new?.type !== type) return;
        const innVersjon = payload.new?.versjon;
        if (typeof innVersjon !== 'number') return;
        const naa = versjonRef.current ?? -1;
        if (innVersjon <= naa) return; // ikke nyere enn det vi har
        if (dirtyRef.current) {
          // Brukeren har ulagrede endringer → ikke overskriv, bare flagg.
          setStale(true);
        } else {
          // Trygt å hente inn den nyere serververdien.
          load();
        }
      },
    });
    return unsubscribe;
  }, [datamodellId, type, load]);

  // Utfører selve den (betingede) skrivingen mot serveren for én verdi. Skilt
  // ut fra debounce-timeren slik at den også kan flushes ved unmount.
  const persist = useCallback(
    async (next: T, detalj?: string) => {
      const supabase = getSupabase();
      if (!supabase) return;
      savingRef.current = true;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const epost = user?.email ?? null;

        if (versjonRef.current === null) {
          // Ingen rad ennå → INSERT. Unik-konflikt (23505) betyr at en annen
          // bruker rakk å opprette raden først → konflikt.
          const { data, error } = await supabase
            .from(SUPABASE_TABLE)
            .insert({
              datamodell_id: datamodellId,
              type,
              innhold: next as unknown,
              endret_av: epost,
              sist_detalj: detalj ?? null,
            })
            .select('versjon,endret_av,endret_tid')
            .maybeSingle();
          if (error) {
            if (error.code === '23505') {
              conflictRef.current = true;
              setStale(true);
              setStatus('conflict');
            } else {
              console.warn('[useDokumentData] insert', error.message);
              setStatus('error');
            }
            return;
          }
          versjonRef.current = typeof data?.versjon === 'number' ? data.versjon : 0;
          setEndretAv(data?.endret_av ?? epost);
          setEndretTid(data?.endret_tid ?? null);
          dirtyRef.current = false;
          conflictRef.current = false;
          setStale(false);
          setStatus('saved');
          return;
        }

        // Raden finnes → betinget UPDATE mot kjent versjon.
        const { data, error } = await supabase
          .from(SUPABASE_TABLE)
          .update({
            innhold: next as unknown,
            endret_av: epost,
            sist_detalj: detalj ?? null,
          })
          .eq('datamodell_id', datamodellId)
          .eq('type', type)
          .eq('versjon', versjonRef.current)
          .select('versjon,endret_av,endret_tid')
          .maybeSingle();
        if (error) {
          console.warn('[useDokumentData] update', error.message);
          setStatus('error');
          return;
        }
        if (!data) {
          // Ingen rad truffet (uten feil) → noen andre skrev (versjon endret).
          // IKKE overskriv brukerens lokale verdi; lås lagring til reload, slik
          // at vi ikke spinner på dødfødte skrivinger mot en utdatert versjon.
          conflictRef.current = true;
          setStale(true);
          setStatus('conflict');
          return;
        }
        versjonRef.current = typeof data.versjon === 'number' ? data.versjon : versjonRef.current;
        setEndretAv(data.endret_av ?? epost);
        setEndretTid(data.endret_tid ?? null);
        dirtyRef.current = false;
        conflictRef.current = false;
        setStale(false);
        setStatus('saved');
      } finally {
        savingRef.current = false;
      }
    },
    [datamodellId, type],
  );

  // Flusher en ventende, debounced lagring umiddelbart. Brukes ved unmount og
  // ved bytte av (datamodell,type), så ulagrede endringer ikke går tapt.
  const flushNow = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const p = pendingRef.current;
    if (!p) return;
    pendingRef.current = null;
    await persist(p.next, p.detalj);
  }, [persist]);

  const setValue = useCallback(
    (next: T, detalj?: string) => {
      setValueState(next);
      const supabase = getSupabase();
      if (!supabase) return; // ikke konfigurert: bare lokal state
      // Ærlig konflikt: når lagring er låst (annen bruker skrev nyere), beholder
      // vi brukerens lokale redigering, men planlegger INGEN ny lagring. Brukeren
      // må «Last inn på nytt» (banner) for å låse opp.
      if (conflictRef.current) return;
      dirtyRef.current = true;
      setStatus('saving');
      pendingRef.current = { next, detalj };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        void flushNow();
      }, 500);
    },
    [flushNow],
  );

  // Flush ventende lagring ved unmount / bytte av (datamodell,type).
  useEffect(() => {
    return () => {
      void flushNow();
    };
  }, [flushNow]);

  // reload nullstiller stale/conflict og henter ferskeste serververdi.
  const reload = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    pendingRef.current = null;
    dirtyRef.current = false;
    conflictRef.current = false;
    setStale(false);
    load();
  }, [load]);

  return { value, setValue, status, endretAv, endretTid, reload, revision, stale };
}
