-- 03-audit.sql
-- Audit-spor for forslagsavgjørelser i public.diskusjon: «hvem/når».
--
-- Appen setter disse to kolonnene når DiBK godkjenner eller avviser et
-- endringsforslag (setForslagStatus): avgjort_av = e-posten til DiBK-brukeren,
-- avgjort_tid = tidspunktet avgjørelsen ble tatt. Tidligere fantes ingen
-- historikk utover radens nåværende `status`.
--
-- Idempotent: add column if not exists tåler å kjøres flere ganger.

alter table public.diskusjon add column if not exists avgjort_av text;
alter table public.diskusjon add column if not exists avgjort_tid timestamptz;
