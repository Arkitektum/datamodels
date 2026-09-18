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

-- Rolleoppslaget i appen slår opp med eq mot lowercase (ilike ville tolket `_`
-- i en e-post som jokertegn). Appen skriver allerede lowercase; her ryddes rader
-- som måtte være lagt inn manuelt med store bokstaver.
update public.bruker_rolle
   set epost = lower(epost)
 where epost <> lower(epost)
   and not exists (
       select 1 from public.bruker_rolle b2 where b2.epost = lower(public.bruker_rolle.epost)
   );

-- Den innloggede brukerens e-post, i lowercase. NULL for anonyme.
create or replace function public.min_epost() returns text
language sql stable as $$
    select lower(nullif(auth.jwt() ->> 'email', ''));
$$;

-- Kan innlogget bruker se denne modellen? Delte modeller: ja. Private: kun
-- eieren. Ukjent id (modell slettet, eller innebygd uten rad): ja – da finnes
-- det ingen privat rad å beskytte.
--
-- Brukes av ALLE tabellene som henger på en datamodell. Uten dette ville
-- innholdet i en privat modell lekket ut gjennom innboksen, globalt søk og
-- dokumentlisten, selv om selve modellen var skjult i sidemenyen.
create or replace function public.modell_synlig(modell_id text) returns boolean
language sql stable security definer set search_path = public as $$
    select not exists (
        select 1 from public.datamodell d
        where d.id = modell_id
          and d.synlighet = 'privat'
          and lower(coalesce(d.eier_epost, '')) is distinct from coalesce(public.min_epost(), '')
    );
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
    for select to authenticated using (public.modell_synlig(datamodell_id));

create policy "dd_ny" on public.dokument_data
    for insert to authenticated with check (true);

create policy "dd_endre" on public.dokument_data
    for update to authenticated using (true) with check (true);

create policy "dd_slett" on public.dokument_data
    for delete to authenticated using (true);

-- --------------------------------------------------------------------
-- diskusjon: kommentarer og endringsforslag på en privat modell skal
-- ikke dukke opp i andres innboks eller globale søk.
--
-- Kun SELECT-policyen byttes. diskusjon_ny/slett/egen_endre/avgjor er
-- insert/update/delete og gir ingen lesetilgang, så vernet av `status`
-- (kun DiBK) i trg_diskusjon_vern_status står uendret.
-- --------------------------------------------------------------------
drop policy if exists "diskusjon_les" on public.diskusjon;
create policy "diskusjon_les" on public.diskusjon
    for select to authenticated using (public.modell_synlig(datamodell_id));

-- --------------------------------------------------------------------
-- dokument: opplastede filer og notater på en privat modell. Den gamle
-- «for all»-policyen måtte deles opp av samme grunn som over.
-- --------------------------------------------------------------------
alter table public.dokument enable row level security;
drop policy if exists "dokument_alt" on public.dokument;
drop policy if exists "dok_les" on public.dokument;
drop policy if exists "dok_ny" on public.dokument;
drop policy if exists "dok_endre" on public.dokument;
drop policy if exists "dok_slett" on public.dokument;

create policy "dok_les" on public.dokument
    for select to authenticated using (public.modell_synlig(datamodell_id));

create policy "dok_ny" on public.dokument
    for insert to authenticated with check (true);

create policy "dok_endre" on public.dokument
    for update to authenticated using (true) with check (true);

create policy "dok_slett" on public.dokument
    for delete to authenticated using (true);

-- --------------------------------------------------------------------
-- Storage: selve binærfilene. lastOppFil lagrer dem som
-- «<datamodell_id>/<uuid>-<filnavn>», så første mappeledd er modell-id-en
-- og kan sjekkes med samme funksjon. Objekter uten mappeledd (eldre filer)
-- gir NULL, som modell_synlig() svarer «synlig» på – ingen låses ute.
-- --------------------------------------------------------------------
drop policy if exists "dok_storage_les" on storage.objects;
create policy "dok_storage_les" on storage.objects
    for select to authenticated
    using (
        bucket_id = 'dokumenter'
        and public.modell_synlig((storage.foldername(name))[1])
    );
