// E-postmaler for varsler (rene funksjoner, testbare uten nettverk).
// Radene kommer fra `varsel`-tabellen (db/patches/08-varsler.sql), som fylles
// av databasetriggere når forslag opprettes/avgjøres og ved @-omtaler.

export type VarselKind = 'forslag_ny' | 'forslag_godkjent' | 'forslag_avvist' | 'omtale';

export interface VarselRad {
  id: number;
  mottaker_epost: string;
  kind: VarselKind;
  datamodell_id: string;
  kontekst: string | null;
  aktor_navn: string | null;
  tekst: string | null;
  opprettet: string;
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function varselEmne(v: VarselRad): string {
  switch (v.kind) {
    case 'forslag_ny':
      return `Nytt endringsforslag på ${v.datamodell_id}`;
    case 'forslag_godkjent':
      return `Forslaget ditt på ${v.datamodell_id} ble godkjent`;
    case 'forslag_avvist':
      return `Forslaget ditt på ${v.datamodell_id} ble avvist`;
    case 'omtale':
      return `${v.aktor_navn ?? 'Noen'} nevnte deg i en diskusjon på ${v.datamodell_id}`;
  }
}

/** HTML-brødtekst. appUrl (uten skråstrek til slutt) gir en dyplenke til
 *  diskusjonsfanen for modellen; tom streng utelater lenken. */
export function varselBrodtekst(v: VarselRad, appUrl: string): string {
  const hvem = escapeHtml(v.aktor_navn ?? 'En kollega');
  const hvor = v.kontekst ? `feltet <code>${escapeHtml(v.kontekst)}</code>` : 'hele modellen';
  const intro =
    v.kind === 'forslag_ny'
      ? `${hvem} har sendt et nytt endringsforslag på ${hvor}.`
      : v.kind === 'forslag_godkjent'
        ? `${hvem} har godkjent endringsforslaget ditt (${hvor}).`
        : v.kind === 'forslag_avvist'
          ? `${hvem} har avvist endringsforslaget ditt (${hvor}).`
          : `${hvem} nevnte deg i en diskusjon om ${hvor}.`;
  const utdrag = v.tekst
    ? `<blockquote style="border-left:3px solid #ccc;margin:12px 0;padding:4px 12px;color:#444">${escapeHtml(v.tekst)}</blockquote>`
    : '';
  const lenke = appUrl
    ? `<p><a href="${appUrl}/?model=${encodeURIComponent(v.datamodell_id)}&fane=diskusjon">Åpne diskusjonen i Datamodell-portalen</a></p>`
    : '';
  return `<p>Hei,</p><p>${intro}</p>${utdrag}${lenke}<p style="color:#888;font-size:12px">Du får denne e-posten fordi du har en bruker i Datamodell-portalen.</p>`;
}
