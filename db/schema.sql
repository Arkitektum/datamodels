create table if not exists public.datamodell (
    id          text primary key,            -- f.eks. 'hoeringOgOffentligEttersynV2'
    navn        text not null,               -- visningsnavn
    beskrivelse text,                        -- valgfri beskrivelse
    slug        text,                        -- filnavn/lenke, f.eks. 'hoeringOgOffentligEttersyn.html'
    opprettet   timestamptz not null default now()
);
-- For databaser opprettet før 'beskrivelse' fantes:
alter table public.datamodell add column if not exists beskrivelse text;
-- Status brukes til gruppering i sidemenyen: 'publisert' | 'arbeid' | 'planlagt'.
alter table public.datamodell add column if not exists status text default 'arbeid';

-- All delt redigerbar data. Én rad per (datamodell, datatype).
-- type er en av: 'brevmaler', 'regeldata', 'regelstatus'.
create table if not exists public.dokument_data (
    datamodell_id text not null,
    type          text not null,
    innhold       jsonb,
    endret_av     text,
    sist_detalj   text,        -- kort beskrivelse av siste endring (settes av appen)
    endret_tid    timestamptz not null default now(),
    primary key (datamodell_id, type)
);
alter table public.dokument_data add column if not exists sist_detalj text;

-- Hold endret_tid oppdatert ved hver skriving.
create or replace function public.set_endret_tid()
returns trigger language plpgsql as $$
begin
    new.endret_tid := now();
    return new;
end;
$$;

drop trigger if exists trg_dokument_data_tid on public.dokument_data;
create trigger trg_dokument_data_tid
    before insert or update on public.dokument_data
    for each row execute function public.set_endret_tid();


alter table public.dokument_data enable row level security;
drop policy if exists "auth_alt" on public.dokument_data;
create policy "auth_alt" on public.dokument_data
    for all to authenticated using (true) with check (true);

-- Innloggede kan lese OG opprette/endre/slette egendefinerte modeller.
alter table public.datamodell enable row level security;
drop policy if exists "auth_les" on public.datamodell;
drop policy if exists "auth_alt" on public.datamodell;
create policy "auth_alt" on public.datamodell
    for all to authenticated using (true) with check (true);

-- Brukere opprettes i Supabase: Authentication → Users → "Add user"
-- (eller slå på e-post-registrering). Appen bruker e-post + passord.

-- ====================================================================
-- ENDRINGSLOGG — hvem endret hva og når
-- --------------------------------------------------------------------
-- Fylles automatisk av en trigger ved hver skriving i dokument_data
-- (regler, struktur, brevmaler, notat). endret_av settes av appen til
-- brukerens e-post. Logg-tabellen er kun lesbar for innloggede; selve
-- innsettingen skjer via en SECURITY DEFINER-trigger (forbi RLS).
-- ====================================================================
create table if not exists public.endring_logg (
    id            bigint generated always as identity primary key,
    datamodell_id text,
    type          text,        -- regeldata | regelstatus | struktur | brevmaler | notat
    handling      text,        -- opprettet | endret | slettet
    detalj        text,        -- konkret hva/hvor ble endret (fra appen)
    endret_av     text,
    tidspunkt     timestamptz not null default now()
);
alter table public.endring_logg add column if not exists detalj text;

create or replace function public.logg_dokument_endring()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if (tg_op = 'DELETE') then
        insert into public.endring_logg(datamodell_id, type, handling, detalj, endret_av)
        values (old.datamodell_id, old.type, 'slettet', null, old.endret_av);
        return old;
    else
        -- Logg kun når appen har sendt en konkret beskrivelse. Løpende
        -- (debouncede) lagringer uten detalj spammer dermed ikke loggen.
        if (new.sist_detalj is not null) then
            insert into public.endring_logg(datamodell_id, type, handling, detalj, endret_av)
            values (new.datamodell_id, new.type,
                    case when tg_op = 'INSERT' then 'opprettet' else 'endret' end,
                    new.sist_detalj, new.endret_av);
        end if;
        return new;
    end if;
end;
$$;

drop trigger if exists trg_logg_dokument on public.dokument_data;
create trigger trg_logg_dokument
    after insert or update or delete on public.dokument_data
    for each row execute function public.logg_dokument_endring();

alter table public.endring_logg enable row level security;
drop policy if exists "logg_les" on public.endring_logg;
create policy "logg_les" on public.endring_logg
    for select to authenticated using (true);

-- ====================================================================
-- BRUKERROLLER — hvem er utvikler (Arkitektum) og hvem er DiBK
-- --------------------------------------------------------------------
-- Én rad per innlogget bruker (e-post). rolle styrer om brukeren kan
-- godkjenne/avvise endringsforslag. Rader settes manuelt i Supabase:
--   insert into public.bruker_rolle (epost, rolle, navn)
--   values ('mille@arkitektum.no', 'utvikler', 'Mille Brekke Amundsen');
-- Brukere uten rad behandles som 'utvikler' i appen.
-- ====================================================================
create table if not exists public.bruker_rolle (
    epost text primary key,
    rolle text not null default 'utvikler',   -- 'utvikler' | 'dibk'
    navn  text
);
alter table public.bruker_rolle enable row level security;
-- Innloggede kan lese rolletabellen (appen leser egen + andres rolle for visning).
drop policy if exists "rolle_les" on public.bruker_rolle;
create policy "rolle_les" on public.bruker_rolle
    for select to authenticated using (true);

-- Hjelpefunksjon: er innlogget bruker DiBK-saksbehandler?
create or replace function public.er_dibk()
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.bruker_rolle
        where lower(epost) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and rolle = 'dibk'
    );
$$;

-- ====================================================================
-- DISKUSJON — kommentarer og endringsforslag per modell/felt
-- --------------------------------------------------------------------
-- kontekst = feltsti ('ObjektType.felt') eller NULL for hele modellen.
-- type = 'comment' | 'proposal'. status (kun proposals) =
--   'open' | 'approved' | 'rejected'.
-- ====================================================================
create table if not exists public.diskusjon (
    id            uuid primary key default gen_random_uuid(),
    datamodell_id text not null,
    kontekst      text,                 -- NULL = hele modellen
    type          text not null,        -- 'comment' | 'proposal'
    forfatter     text,                 -- visningsnavn
    epost         text,                 -- forfatterens e-post (eierskap)
    rolle         text,                 -- 'utvikler' | 'dibk' da meldingen ble skrevet
    body          text,
    felt          text,                 -- forslag: feltnavn
    endring       text,                 -- forslag: 'fra → til'
    status        text,                 -- forslag: 'open' | 'approved' | 'rejected'
    opprettet     timestamptz not null default now()
);
-- For databaser opprettet før 'epost' fantes:
alter table public.diskusjon add column if not exists epost text;
create index if not exists idx_diskusjon_modell on public.diskusjon (datamodell_id);

alter table public.diskusjon enable row level security;
-- Lese + skrive nye meldinger: alle innloggede.
drop policy if exists "diskusjon_les" on public.diskusjon;
create policy "diskusjon_les" on public.diskusjon
    for select to authenticated using (true);
drop policy if exists "diskusjon_ny" on public.diskusjon;
create policy "diskusjon_ny" on public.diskusjon
    for insert to authenticated with check (true);
-- Slette meldinger: kun EGNE (matcher e-post) eller DiBK (kan rydde/tømme tråd).
drop policy if exists "diskusjon_slett" on public.diskusjon;
create policy "diskusjon_slett" on public.diskusjon
    for delete to authenticated using (
        lower(coalesce(epost, '')) = lower(coalesce(auth.jwt() ->> 'email', ''))
        or public.er_dibk()
    );
-- Endre EGNE meldinger (matcher e-post).
drop policy if exists "diskusjon_egen_endre" on public.diskusjon;
create policy "diskusjon_egen_endre" on public.diskusjon
    for update to authenticated
    using (lower(coalesce(epost, '')) = lower(coalesce(auth.jwt() ->> 'email', '')))
    with check (lower(coalesce(epost, '')) = lower(coalesce(auth.jwt() ->> 'email', '')));
-- Godkjenne/avvise (endre status på andres forslag): KUN DiBK.
drop policy if exists "diskusjon_avgjor" on public.diskusjon;
create policy "diskusjon_avgjor" on public.diskusjon
    for update to authenticated using (public.er_dibk()) with check (public.er_dibk());

-- Kolonne-vern: RLS kan ikke begrense HVILKE kolonner som endres, så en
-- forfatter kunne ellers selv-godkjenne sitt eget forslag ved å endre `status`
-- på egen rad (diskusjon_egen_endre). Denne triggeren slår fast at KUN DiBK kan
-- endre `status`; vanlige brukere kan fortsatt endre body/felt/endring på egne rader.
create or replace function public.diskusjon_vern_status()
returns trigger language plpgsql security definer set search_path = public as $vern$
begin
    if new.status is distinct from old.status and not public.er_dibk() then
        raise exception 'Kun DiBK kan endre status på endringsforslag';
    end if;
    return new;
end;
$vern$;
drop trigger if exists trg_diskusjon_vern_status on public.diskusjon;
create trigger trg_diskusjon_vern_status
    before update on public.diskusjon
    for each row execute function public.diskusjon_vern_status();

-- ====================================================================
-- DOKUMENT — opplastede filer + dokumenter redigert i nettleseren
-- --------------------------------------------------------------------
-- kind = 'pdf' | 'word' | 'xml' | 'text'.
--   text  → innhold i 'html' (rik tekst redigert i nettleseren)
--   xml   → kildekode i 'fil_tekst'
--   pdf/word → binærfil i Storage-bucket 'dokumenter', sti i 'lager_sti'
-- ====================================================================
create table if not exists public.dokument (
    id            uuid primary key default gen_random_uuid(),
    datamodell_id text not null,
    mappe         text,                 -- gruppering (NULL = uten mappe)
    navn          text not null,
    kind          text not null,        -- 'pdf' | 'word' | 'xml' | 'bilde' | 'text'
    status        text not null default 'utkast',  -- 'utkast' | 'gjennomgang' | 'godkjent'
    html          text,                 -- text-dokument
    fil_navn      text,                 -- opprinnelig filnavn
    fil_tekst     text,                 -- xml-kildekode
    lager_sti     text,                 -- Storage-sti for pdf/word/bilde
    storrelse     bigint,
    opprettet     timestamptz not null default now(),
    endret        timestamptz not null default now()
);
-- For databaser opprettet før 'mappe' fantes:
alter table public.dokument add column if not exists mappe text;
create index if not exists idx_dokument_modell on public.dokument (datamodell_id);

create or replace function public.set_dokument_endret()
returns trigger language plpgsql as $$
begin
    new.endret := now();
    return new;
end;
$$;
drop trigger if exists trg_dokument_endret on public.dokument;
create trigger trg_dokument_endret
    before update on public.dokument
    for each row execute function public.set_dokument_endret();

alter table public.dokument enable row level security;
drop policy if exists "dokument_alt" on public.dokument;
create policy "dokument_alt" on public.dokument
    for all to authenticated using (true) with check (true);

-- ====================================================================
-- STORAGE — bucket for opplastede PDF/Word-filer
-- --------------------------------------------------------------------
-- Opprett bucket 'dokumenter' (privat) i Supabase Studio → Storage, eller:
--   insert into storage.buckets (id, name, public)
--   values ('dokumenter', 'dokumenter', false) on conflict do nothing;
-- Tilgang for innloggede (les/skriv/slett) på dette bucketet:
drop policy if exists "dok_storage_les" on storage.objects;
create policy "dok_storage_les" on storage.objects
    for select to authenticated using (bucket_id = 'dokumenter');
drop policy if exists "dok_storage_ny" on storage.objects;
create policy "dok_storage_ny" on storage.objects
    for insert to authenticated with check (bucket_id = 'dokumenter');
drop policy if exists "dok_storage_slett" on storage.objects;
create policy "dok_storage_slett" on storage.objects
    for delete to authenticated using (bucket_id = 'dokumenter');
