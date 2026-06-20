import { getSupabase } from './supabase';

/**
 * Gjenbrukbar Supabase Realtime-hjelper. Abonnerer på endringer i en tabell og
 * kaller `onChange` ved hver hendelse. Returnerer en unsubscribe-funksjon.
 *
 * Hvis Supabase ikke er konfigurert (getSupabase() === null) returneres en
 * no-op, slik at kallere trygt kan bruke hjelperen uten ekstra sjekker.
 */

/** Intern, monotont økende teller for unike kanalnavn (uten Math.random/Date.now). */
let channelCounter = 0;

export function subscribeTable(
  table: string,
  opts: {
    filter?: string; // f.eks. 'datamodell_id=eq.abc' (PostgREST-filter), valgfritt
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'; // default '*'
    onChange: (payload: { new?: any; old?: any; eventType: string }) => void;
  },
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const { filter, event = '*', onChange } = opts;

  // Unikt kanalnavn basert på teller + tabell + filter (ikke tilfeldighet).
  const channelName = `rt:${table}:${filter ?? ''}:${++channelCounter}`;

  // Bygg filter-objektet robust: utelat 'filter' når det er undefined.
  const changesFilter: {
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    schema: string;
    table: string;
    filter?: string;
  } = { event, schema: 'public', table };
  if (filter !== undefined) changesFilter.filter = filter;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      changesFilter,
      (payload: { new?: any; old?: any; eventType: string }) =>
        onChange({
          new: payload.new,
          old: payload.old,
          eventType: payload.eventType,
        }),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
