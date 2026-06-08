create table if not exists public.datamodell (
    id          text primary key,            -- f.eks. 'hoeringOgOffentligEttersynV2'
    navn        text not null,               -- visningsnavn
    beskrivelse text,                        -- valgfri beskrivelse
    slug        text,                        -- filnavn/lenke, f.eks. 'hoeringOgOffentligEttersyn.html'
    opprettet   timestamptz not null default now()
);
-- For databaser opprettet før 'beskrivelse' fantes:
alter table public.datamodell add column if not exists beskrivelse text;

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
