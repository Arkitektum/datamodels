-- ====================================================================
-- DISKUSJON — åpen opprydding (løsnet eierskapsvern)
-- --------------------------------------------------------------------
-- Tidligere kunne kun forfatteren (eller DiBK) slette/endre en melding.
-- Det gjorde at en vanlig utvikler som døpte om / slettet et felt eller
-- importerte en ny XSD bare fikk ryddet SINE EGNE kommentarer – andres
-- ble liggende foreldreløst.
--
-- Denne patchen løsner eierskapsvernet: ALLE innloggede kan nå slette og
-- endre kommentarer (også flytte `kontekst` når et felt døpes om), slik at
-- opprydding virker uansett hvem som redigerer strukturen.
--
-- BEVART: trg_diskusjon_vern_status holder fortsatt godkjenn/avvis av
-- endringsforslag (kolonnen `status`) reservert for DiBK. Det er et eget
-- vern enn eierskap og berøres ikke her.
--
-- Kjør denne patchen i Supabase (SQL Editor). Idempotent.
-- ====================================================================

-- Slette meldinger: alle innloggede.
drop policy if exists "diskusjon_slett" on public.diskusjon;
create policy "diskusjon_slett" on public.diskusjon
    for delete to authenticated using (true);

-- Endre meldinger: alle innloggede (status vernes av trigger, se over).
drop policy if exists "diskusjon_egen_endre" on public.diskusjon;
create policy "diskusjon_egen_endre" on public.diskusjon
    for update to authenticated using (true) with check (true);
