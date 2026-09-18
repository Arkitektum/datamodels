-- ====================================================================
-- SYNLIGHET — «privat til jeg er klar» på egendefinerte datamodeller
-- --------------------------------------------------------------------
-- To nye kolonner på datamodell:
--
--   synlighet   'delt'   (standard) — alle innloggede ser modellen
--               'privat'            — kun eieren ser den
--   eier_epost  hvem som opprettet modellen (lowercase e-post)
--
-- Alle eksisterende modeller blir 'delt', så ingenting forsvinner når
-- patchen kjøres.
--
-- RLS: den gamle «for all»-policyen måtte deles opp. Permissive policyer
-- OR-es sammen i Postgres, så en gjenværende `for all using (true)` ville
-- gjort lese-begrensningen virkningsløs. Derfor én policy per kommando.
--
-- Kjør denne patchen i Supabase (SQL Editor). Idempotent.
-- ====================================================================

alter table public.datamodell add column if not exists synlighet text not null default 'delt';
alter table public.datamodell add column if not exists eier_epost text;

update public.datamodell set synlighet = 'delt' where synlighet is null;

do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'datamodell_synlighet_sjekk'
    ) then
        alter table public.datamodell
            add constraint datamodell_synlighet_sjekk check (synlighet in ('delt', 'privat'));
    end if;
end $$;

create index if not exists idx_datamodell_eier on public.datamodell (lower(eier_epost));

-- Den innloggede brukerens e-post, i lowercase. NULL for anonyme.
create or replace function public.min_epost() returns text
language sql stable as $$
    select lower(nullif(auth.jwt() ->> 'email', ''));
$$;

-- --------------------------------------------------------------------
-- datamodell: privat = kun eieren leser den. Skriving er uendret (alle
-- innloggede), siden en privat modell uansett ikke er synlig for andre.
-- --------------------------------------------------------------------
alter table public.datamodell enable row level security;
drop policy if exists "auth_alt" on public.datamodell;
drop policy if exists "auth_les" on public.datamodell;
drop policy if exists "dm_les" on public.datamodell;
drop policy if exists "dm_ny" on public.datamodell;
drop policy if exists "dm_endre" on public.datamodell;
drop policy if exists "dm_slett" on public.datamodell;

create policy "dm_les" on public.datamodell
    for select to authenticated
    using (synlighet <> 'privat' or lower(coalesce(eier_epost, '')) = coalesce(public.min_epost(), ''));

create policy "dm_ny" on public.datamodell
    for insert to authenticated with check (true);

create policy "dm_endre" on public.datamodell
    for update to authenticated using (true) with check (true);

create policy "dm_slett" on public.datamodell
    for delete to authenticated using (true);

-- --------------------------------------------------------------------
-- dokument_data: uten dette ville innholdet i en privat modell fortsatt
-- vært lesbart for den som kjenner datamodell_id-en.
-- --------------------------------------------------------------------
alter table public.dokument_data enable row level security;
drop policy if exists "auth_alt" on public.dokument_data;
drop policy if exists "dd_les" on public.dokument_data;
drop policy if exists "dd_ny" on public.dokument_data;
drop policy if exists "dd_endre" on public.dokument_data;
drop policy if exists "dd_slett" on public.dokument_data;

create policy "dd_les" on public.dokument_data
    for select to authenticated
    using (
        not exists (
            select 1 from public.datamodell d
            where d.id = dokument_data.datamodell_id
              and d.synlighet = 'privat'
              and lower(coalesce(d.eier_epost, '')) is distinct from coalesce(public.min_epost(), '')
        )
    );

create policy "dd_ny" on public.dokument_data
    for insert to authenticated with check (true);

create policy "dd_endre" on public.dokument_data
    for update to authenticated using (true) with check (true);

create policy "dd_slett" on public.dokument_data
    for delete to authenticated using (true);
