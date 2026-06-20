-- ====================================================================
-- PATCH 01 — Optimistisk samtidighetskontroll på dokument_data
-- --------------------------------------------------------------------
-- Innfører en `versjon`-kolonne som bumpes ved hver UPDATE, slik at
-- appen kan oppdage at en annen bruker har lagret nyere endringer
-- (last-write-wins erstattes med betinget skriving i useDokumentData).
-- Idempotent: kan kjøres flere ganger uten skade.
-- ====================================================================

-- 1) Versjonskolonne. Starter på 0; bumpes av set_endret_tid ved UPDATE.
alter table public.dokument_data add column if not exists versjon bigint not null default 0;

-- 2) Utvid den eksisterende tidstrigger-funksjonen til også å bumpe versjon
--    ved UPDATE. Beholder dagens oppførsel (sette endret_tid) for INSERT.
--    Denne `create or replace` overskriver definisjonen i schema.sql.
create or replace function public.set_endret_tid()
returns trigger language plpgsql as $$
begin
    new.endret_tid := now();
    if (tg_op = 'UPDATE') then
        new.versjon := coalesce(old.versjon, 0) + 1;
    end if;
    return new;
end;
$$;

-- Trigger trg_dokument_data_tid finnes allerede (definert i schema.sql) og
-- peker på public.set_endret_tid(); ved `create or replace` over plukkes den
-- nye funksjonskroppen opp uten at triggeren må re-opprettes.
