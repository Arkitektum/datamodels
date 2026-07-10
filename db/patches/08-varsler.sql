-- ====================================================================
-- VARSLER + LEST-MARKERING — personlige varsler og «nytt siden sist»
-- --------------------------------------------------------------------
-- To nye tabeller:
--
--   varsel     — ett varsel per mottaker per hendelse. Fylles av
--                SECURITY DEFINER-triggere på diskusjon (forbi RLS):
--                  'forslag_ny'       → alle DiBK/admin når et forslag opprettes
--                  'forslag_godkjent' → forslagsstiller når DiBK godkjenner
--                  'forslag_avvist'   → forslagsstiller når DiBK avviser
--                  'omtale'           → bruker som nevnes med «@Visningsnavn»
--                Kolonnen epost_sendt settes av Edge Functionen
--                send-varsel-epost (valgfri e-postutsending, se README).
--
--   traad_lest — når brukeren sist leste en diskusjonstråd. kontekst = ''
--                betyr modellnivå-tråden. Grunnlag for «n nye»-badges.
--
-- Kjør denne patchen i Supabase (SQL Editor). Idempotent.
-- ====================================================================

create table if not exists public.varsel (
    id             bigint generated always as identity primary key,
    mottaker_epost text not null,        -- lowercase e-post
    kind           text not null check (kind in ('forslag_ny', 'forslag_godkjent', 'forslag_avvist', 'omtale')),
    datamodell_id  text not null,
    kontekst       text,                 -- feltsti, eller NULL = hele modellen
    melding_id     uuid references public.diskusjon(id) on delete cascade,
    aktor_navn     text,                 -- hvem utløste varselet
    aktor_epost    text,
    tekst          text,                 -- kort utdrag av meldingen
    lest           boolean not null default false,
    epost_sendt    boolean not null default false,
    opprettet      timestamptz not null default now()
);
create index if not exists idx_varsel_mottaker on public.varsel (mottaker_epost, lest, opprettet desc);

alter table public.varsel enable row level security;
-- Kun egne varsler kan leses, markeres som lest og slettes. Innsetting skjer
-- utelukkende via SECURITY DEFINER-triggerne under (ingen insert-policy).
drop policy if exists "varsel_egen_les" on public.varsel;
create policy "varsel_egen_les" on public.varsel
    for select to authenticated
    using (lower(mottaker_epost) = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "varsel_egen_endre" on public.varsel;
create policy "varsel_egen_endre" on public.varsel
    for update to authenticated
    using (lower(mottaker_epost) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (lower(mottaker_epost) = lower(coalesce(auth.jwt() ->> 'email', '')));
drop policy if exists "varsel_egen_slett" on public.varsel;
create policy "varsel_egen_slett" on public.varsel
    for delete to authenticated
    using (lower(mottaker_epost) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Nytt innlegg i diskusjon: varsle DiBK om nye forslag, og omtalte brukere.
-- Omtaler gjenkjennes ved at meldingsteksten inneholder «@» + visningsnavnet
-- fra bruker_rolle (composeren setter inn nøyaktig dette). Kun ved INSERT —
-- omtaler lagt til ved senere redigering varsler ikke (bevisst, mot dobbelt-
-- varsling). Forfatteren varsles aldri om egne handlinger.
create or replace function public.varsle_diskusjon_ny()
returns trigger language plpgsql security definer set search_path = public as $$
declare
    b      record;
    utdrag text;
begin
    utdrag := left(coalesce(new.body, ''), 200);

    if new.type = 'proposal' and new.status = 'open' then
        insert into public.varsel
            (mottaker_epost, kind, datamodell_id, kontekst, melding_id, aktor_navn, aktor_epost, tekst)
        select lower(br.epost), 'forslag_ny', new.datamodell_id, new.kontekst, new.id,
               new.forfatter, new.epost, utdrag
        from public.bruker_rolle br
        where br.rolle in ('dibk', 'admin')
          and lower(br.epost) <> lower(coalesce(new.epost, ''));
    end if;

    for b in
        select epost, navn from public.bruker_rolle
        where navn is not null and length(trim(navn)) > 0
    loop
        if position(lower('@' || b.navn) in lower(coalesce(new.body, ''))) > 0
           and lower(b.epost) <> lower(coalesce(new.epost, '')) then
            insert into public.varsel
                (mottaker_epost, kind, datamodell_id, kontekst, melding_id, aktor_navn, aktor_epost, tekst)
            values
                (lower(b.epost), 'omtale', new.datamodell_id, new.kontekst, new.id,
                 new.forfatter, new.epost, utdrag);
        end if;
    end loop;

    return new;
end;
$$;
drop trigger if exists trg_varsle_diskusjon_ny on public.diskusjon;
create trigger trg_varsle_diskusjon_ny
    after insert on public.diskusjon
    for each row execute function public.varsle_diskusjon_ny();

-- Forslag avgjort: varsle forslagsstilleren (ikke hvis vedkommende avgjorde selv).
create or replace function public.varsle_forslag_avgjort()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if new.type = 'proposal'
       and new.status is distinct from old.status
       and new.status in ('approved', 'rejected')
       and new.epost is not null
       and lower(new.epost) <> lower(coalesce(new.avgjort_av, '')) then
        insert into public.varsel
            (mottaker_epost, kind, datamodell_id, kontekst, melding_id, aktor_navn, aktor_epost, tekst)
        values
            (lower(new.epost),
             case when new.status = 'approved' then 'forslag_godkjent' else 'forslag_avvist' end,
             new.datamodell_id, new.kontekst, new.id,
             new.avgjort_av, new.avgjort_av,
             coalesce(new.felt, '') || case when new.endring is not null and new.endring <> ''
                                            then ': ' || left(new.endring, 160) else '' end);
    end if;
    return new;
end;
$$;
drop trigger if exists trg_varsle_forslag_avgjort on public.diskusjon;
create trigger trg_varsle_forslag_avgjort
    after update on public.diskusjon
    for each row execute function public.varsle_forslag_avgjort();

-- ====================================================================
-- TRAAD_LEST — når brukeren sist leste en tråd (grunnlag for «n nye»)
-- ====================================================================
create table if not exists public.traad_lest (
    epost         text not null,          -- lowercase e-post
    datamodell_id text not null,
    kontekst      text not null default '', -- '' = modellnivå-tråden
    sist_lest     timestamptz not null default now(),
    primary key (epost, datamodell_id, kontekst)
);

alter table public.traad_lest enable row level security;
drop policy if exists "traad_lest_egen" on public.traad_lest;
create policy "traad_lest_egen" on public.traad_lest
    for all to authenticated
    using (lower(epost) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (lower(epost) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Realtime: klienter abonnerer på egne varsler (badge oppdateres live).
do $$
begin
  if not exists (select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'varsel') then
    alter publication supabase_realtime add table public.varsel;
  end if;
end $$;

-- ====================================================================
-- E-POST (valgfritt): deploy Edge Functionen supabase/functions/
-- send-varsel-epost og opprett en Database Webhook i Supabase Studio
-- (Database → Webhooks → Create): tabell public.varsel, event INSERT,
-- type «Supabase Edge Function», funksjon send-varsel-epost.
-- Uten webhook/API-nøkkel fungerer varslene fortsatt i appen (innboksen).
-- ====================================================================
