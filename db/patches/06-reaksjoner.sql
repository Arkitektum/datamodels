-- ====================================================================
-- REAKSJONER — 👍/👎 på andres kommentarer
-- --------------------------------------------------------------------
-- Én reaksjon per person (e-post) per melding. verdi = 'up' | 'down'.
-- Brukeren kan veksle eller fjerne reaksjonen. Man kan IKKE reagere på
-- sin egen melding, og kun på kommentarer (ikke endringsforslag) — dette
-- håndheves av trigger under, i tillegg til at UI skjuler knappene.
-- Kjør denne patchen i Supabase (SQL Editor). Idempotent.
-- ====================================================================
create table if not exists public.diskusjon_reaksjon (
    melding_id uuid not null references public.diskusjon(id) on delete cascade,
    epost      text not null,                 -- reagerende brukers e-post (eierskap)
    navn       text,                          -- visningsnavn (for evt. visning)
    verdi      text not null check (verdi in ('up', 'down')),
    opprettet  timestamptz not null default now(),
    primary key (melding_id, epost)
);
create index if not exists idx_reaksjon_melding on public.diskusjon_reaksjon (melding_id);

alter table public.diskusjon_reaksjon enable row level security;

-- Lese: alle innloggede (antall + egen reaksjon vises i tråden).
drop policy if exists "reaksjon_les" on public.diskusjon_reaksjon;
create policy "reaksjon_les" on public.diskusjon_reaksjon
    for select to authenticated using (true);

-- Opprette/endre/slette EGNE reaksjoner (e-post må matche innlogget bruker).
drop policy if exists "reaksjon_egen" on public.diskusjon_reaksjon;
create policy "reaksjon_egen" on public.diskusjon_reaksjon
    for all to authenticated
    using (lower(coalesce(epost, '')) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (lower(coalesce(epost, '')) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Vern: kan ikke reagere på egen melding, og kun på kommentarer.
create or replace function public.reaksjon_vern()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    maal_epost text;
    maal_type  text;
begin
    select epost, type into maal_epost, maal_type
    from public.diskusjon where id = new.melding_id;

    if maal_type is distinct from 'comment' then
        raise exception 'Reaksjoner er kun tillatt på kommentarer';
    end if;
    if lower(coalesce(maal_epost, '')) = lower(coalesce(auth.jwt() ->> 'email', '')) then
        raise exception 'Du kan ikke reagere på din egen kommentar';
    end if;
    return new;
end;
$$;
drop trigger if exists trg_reaksjon_vern on public.diskusjon_reaksjon;
create trigger trg_reaksjon_vern
    before insert or update on public.diskusjon_reaksjon
    for each row execute function public.reaksjon_vern();

-- Realtime: la klienter abonnere på reaksjons-endringer (som diskusjon).
do $$
begin
  if not exists (select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'diskusjon_reaksjon') then
    alter publication supabase_realtime add table public.diskusjon_reaksjon;
  end if;
end $$;
