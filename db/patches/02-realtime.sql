-- 02-realtime.sql
-- Legger relevante tabeller til i Supabase sin realtime-publikasjon
-- (supabase_realtime), slik at klienter kan abonnere på live-endringer.
--
-- Idempotent: DO-blokken sjekker pg_publication_tables før hver ALTER, så
-- patchen tåler å kjøres flere ganger uten å feile.
--
-- MERK: I tillegg til denne patchen må Realtime være skrudd PÅ for prosjektet
-- i Supabase Studio (Database -> Replication / Realtime). Denne SQL-en gjør
-- ingenting hvis selve Realtime-funksjonen er deaktivert for prosjektet.

do $$
begin
  -- public.dokument_data
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'dokument_data'
  ) then
    alter publication supabase_realtime add table public.dokument_data;
  end if;

  -- public.diskusjon
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'diskusjon'
  ) then
    alter publication supabase_realtime add table public.diskusjon;
  end if;

  -- public.datamodell
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'datamodell'
  ) then
    alter publication supabase_realtime add table public.datamodell;
  end if;
end $$;
