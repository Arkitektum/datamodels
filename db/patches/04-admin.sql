-- 04-admin.sql
-- Ny rolle «admin»: kan administrere brukerroller i appen OG arver
-- DiBK-rettigheter (godkjenne/avvise endringsforslag).
--
-- Idempotent: create or replace + drop policy if exists tåler flere kjøringer.

-- Hjelpefunksjon: er innlogget bruker admin? (speiler er_dibk())
create or replace function public.er_admin()
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.bruker_rolle
        where lower(epost) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and rolle = 'admin'
    );
$$;

-- Oppdatert: admin arver DiBK-rettigheter også i RLS (f.eks. for
-- forslagsavgjørelser via diskusjon_avgjor / diskusjon_vern_status).
create or replace function public.er_dibk()
returns boolean language sql stable security definer set search_path = public as $$
    select exists (
        select 1 from public.bruker_rolle
        where lower(epost) = lower(coalesce(auth.jwt() ->> 'email', ''))
          and rolle in ('dibk', 'admin')
    );
$$;

-- RLS-skrivetilgang på bruker_rolle: kun admin (behold rolle_les for lesing).
-- En «for all»-policy dekker insert/update/delete; select dekkes fortsatt av
-- rolle_les + denne.
drop policy if exists "rolle_admin_skriv" on public.bruker_rolle;
create policy "rolle_admin_skriv" on public.bruker_rolle
    for all to authenticated using (public.er_admin()) with check (public.er_admin());

-- Vern mot utelåsing: hindre at den SISTE admin-raden slettes eller nedgraderes.
-- Uten dette kan en admin (ved et uhell) fjerne/nedgradere seg selv som siste
-- admin, og da kan ingen lenger skrive bruker_rolle (rolle_admin_skriv krever
-- en eksisterende admin) — rolleadministrasjon må da repareres manuelt i SQL.
create or replace function public.vern_siste_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
    if (tg_op = 'DELETE' and old.rolle = 'admin')
       or (tg_op = 'UPDATE' and old.rolle = 'admin' and new.rolle is distinct from 'admin') then
        if not exists (
            select 1 from public.bruker_rolle
            where rolle = 'admin' and lower(epost) <> lower(old.epost)
        ) then
            raise exception 'Kan ikke fjerne eller nedgradere den siste admin-brukeren';
        end if;
    end if;
    return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists trg_vern_siste_admin on public.bruker_rolle;
create trigger trg_vern_siste_admin
    before update or delete on public.bruker_rolle
    for each row execute function public.vern_siste_admin();

-- ====================================================================
-- BOOTSTRAP — den FØRSTE admin-en
-- --------------------------------------------------------------------
-- Siden ingen admin finnes i utgangspunktet (og rolle_admin_skriv krever
-- at man ALLEREDE er admin for å skrive), kan ikke den første admin-raden
-- settes fra appen. Sett den manuelt én gang i Supabase SQL Editor, f.eks.:
--
--   insert into public.bruker_rolle (epost, rolle, navn)
--   values ('mille@arkitektum.no', 'admin', 'Mille Brekke Amundsen')
--   on conflict (epost) do update set rolle = 'admin';
--
-- Deretter kan den admin-brukeren styre øvrige roller via admin-siden.
-- ====================================================================
