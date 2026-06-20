-- ====================================================================
-- PATCH 05 — Versjonshistorikk med gjenoppretting for delt data
-- --------------------------------------------------------------------
-- I dag forteller `endring_logg` bare HVEM som endret HVA og NÅR. Denne
-- patchen lagrer i tillegg et SNAPSHOT av selve innholdet (struktur,
-- regeldata, regelstatus, brevmaler, kodelister, vedlegg, xsdkilde,
-- dokumentmapper osv.) ved hver meningsfulle endring i `dokument_data`.
--
-- Snapshotene gir en versjonshistorikk brukeren kan bla i og GJENOPPRETTE
-- fra: en tidligere versjon skrives da tilbake som gjeldende verdi (se
-- lib/historikk.ts → gjenopprettVersjon).
--
-- Mønsteret følger den eksisterende logg-triggeren:
--   * SECURITY DEFINER så innsetting går forbi RLS (klienten har bare
--     leserett på historikk-tabellen),
--   * snapshot tas KUN når `new.sist_detalj is not null`, samme spam-vern
--     som logg-triggeren (debouncede lagringer uten detalj historiseres
--     dermed ikke).
-- Idempotent: kan kjøres flere ganger uten skade.
-- ====================================================================

-- 1) Historikk-tabell — ett snapshot per meningsfulle skriving.
create table if not exists public.dokument_data_historikk (
    id            bigint generated always as identity primary key,
    datamodell_id text not null,
    type          text not null,
    innhold       jsonb,
    versjon       bigint,
    detalj        text,
    endret_av     text,
    endret_tid    timestamptz not null default now()
);
create index if not exists idx_ddh on public.dokument_data_historikk (datamodell_id, type, endret_tid desc);

-- 2) Snapshot-trigger på dokument_data. AFTER insert/update så raden er
--    ferdig skrevet (versjon allerede bumpet av set_endret_tid). Tar kun
--    snapshot ved meningsfulle endringer (sist_detalj satt av appen).
create or replace function public.snapshot_dokument_data() returns trigger
language plpgsql security definer set search_path = public as $$
begin
    if (new.sist_detalj is not null) then
        insert into public.dokument_data_historikk(datamodell_id, type, innhold, versjon, detalj, endret_av)
        values (new.datamodell_id, new.type, new.innhold, new.versjon, new.sist_detalj, new.endret_av);
    end if;
    return new;
end;
$$;
drop trigger if exists trg_snapshot_dokument on public.dokument_data;
create trigger trg_snapshot_dokument
    after insert or update on public.dokument_data
    for each row execute function public.snapshot_dokument_data();

-- 3) RLS: innloggede kan LESE historikken. Innsetting skjer kun via
--    SECURITY DEFINER-triggeren over (forbi RLS), så ingen skrive-policy.
alter table public.dokument_data_historikk enable row level security;
drop policy if exists "ddh_les" on public.dokument_data_historikk;
create policy "ddh_les" on public.dokument_data_historikk for select to authenticated using (true);
