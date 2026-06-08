'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getSupabase, SUPABASE_TABLE } from './supabase';

export type SaveStatus = 'loading' | 'idle' | 'saving' | 'saved' | 'error';

export interface DokumentDataResult<T> {
  value: T;
  setValue: (next: T, detalj?: string) => void;
  status: SaveStatus;
  endretAv: string | null;
  endretTid: string | null;
  reload: () => void;
}

/**
 * Delt, redigerbar data for én (datamodell, type), lagret i Supabase-tabellen
 * `dokument_data`. Henter delt verdi ved montering, faller tilbake til
 * defaultValue, og lagrer endringer (debounced upsert). Erstatter den gamle
 * localStorage-baserte db.js.
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
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setStatus('idle');
      return;
    }
    setStatus('loading');
    supabase
      .from(SUPABASE_TABLE)
      .select('innhold,endret_av,endret_tid')
      .eq('datamodell_id', datamodellId)
      .eq('type', type)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.warn('[useDokumentData] load', error.message);
          setStatus('error');
          return;
        }
        if (data && data.innhold != null) {
          setValueState(data.innhold as T);
          setEndretAv(data.endret_av ?? null);
          setEndretTid(data.endret_tid ?? null);
        }
        setStatus('idle');
      });
  }, [datamodellId, type]);

  useEffect(() => {
    load();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  const setValue = useCallback(
    (next: T, detalj?: string) => {
      setValueState(next);
      const supabase = getSupabase();
      if (!supabase) return; // ikke konfigurert: bare lokal state
      setStatus('saving');
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const { error } = await supabase.from(SUPABASE_TABLE).upsert(
          {
            datamodell_id: datamodellId,
            type,
            innhold: next as unknown,
            endret_av: user?.email ?? null,
            sist_detalj: detalj ?? null,
          },
          { onConflict: 'datamodell_id,type' },
        );
        if (error) {
          console.warn('[useDokumentData] save', error.message);
          setStatus('error');
        } else {
          setEndretAv(user?.email ?? null);
          setStatus('saved');
        }
      }, 500);
    },
    [datamodellId, type],
  );

  return { value, setValue, status, endretAv, endretTid, reload: load };
}
