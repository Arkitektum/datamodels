// Delte dokumenter per modell, lagret i Supabase-tabellen `dokument`.
// Tekstdokumenter (rik tekst) ligger i `html`; XML i `fil_tekst`; PDF/Word
// lastes opp til Storage-bucketet `dokumenter` og refereres via `lager_sti`.
import { getSupabase } from './supabase';
import { sanitizeHtml } from './sanitizeHtml';

export type DokKind = 'pdf' | 'word' | 'xml' | 'bilde' | 'text';
export type DokStatus = 'utkast' | 'gjennomgang' | 'godkjent';

export interface Dokument {
  id: string;
  datamodell_id: string;
  mappe: string | null;
  navn: string;
  kind: DokKind;
  status: DokStatus;
  html: string | null;
  fil_navn: string | null;
  fil_tekst: string | null;
  lager_sti: string | null;
  storrelse: number | null;
  opprettet: string;
  endret: string;
}

const BUCKET = 'dokumenter';

export async function fetchDokumenter(datamodellId: string): Promise<Dokument[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('dokument')
    .select('*')
    .eq('datamodell_id', datamodellId)
    .order('endret', { ascending: false });
  if (error) {
    console.warn('[dokumenter] fetch', error.message);
    return [];
  }
  return (data ?? []) as Dokument[];
}

export async function createTekstDok(
  datamodellId: string,
  mappe?: string | null,
): Promise<Dokument | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('dokument')
    .insert({
      datamodell_id: datamodellId,
      mappe: mappe ?? null,
      navn: 'Nytt dokument',
      kind: 'text',
      status: 'utkast',
      html: '<p></p>',
    })
    .select('*')
    .single();
  if (error) {
    console.warn('[dokumenter] createTekst', error.message);
    return null;
  }
  return data as Dokument;
}

/**
 * Content-Type utledes fra filendelsen, ikke fra `file.type`. `file.type` er
 * satt av nettleseren og kan settes fritt av den som kaller Storage-API-et –
 * og det er Content-Type som avgjør om nettleseren RENDRER en fil (som HTML
 * eller SVG med skript) i stedet for bare å vise/laste den ned.
 *
 * Dette er laget i belter og bukseseler med allowlisten på selve bucketet
 * (db/patches/10-storage-mime.sql). Bucket-lista er den som faktisk håndhever;
 * denne gir brukeren en forståelig feilmelding før opplastingen forsøkes.
 */
const MIME_FOR_ENDELSE: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  odt: 'application/vnd.oasis.opendocument.text',
  rtf: 'application/rtf',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  csv: 'text/csv',
  txt: 'text/plain',
  zip: 'application/zip',
};

function endelse(navn: string): string {
  const m = navn.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : '';
}

function kindForFil(file: File): DokKind {
  const e = endelse(file.name);
  if (e === 'pdf') return 'pdf';
  if (e === 'xml' || e === 'xsd') return 'xml';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'tif', 'tiff'].includes(e)) return 'bilde';
  return 'word';
}

function lesTekst(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}

export interface OpplastingResultat {
  dokument: Dokument | null;
  /** Årsak når filen ikke ble lastet opp – vises til brukeren. */
  feil: string | null;
}

/** Laster opp én fil: XML lagres som tekst, PDF/Word/bilde i Storage. */
export async function lastOppFil(
  datamodellId: string,
  file: File,
  mappe?: string | null,
): Promise<OpplastingResultat> {
  const supabase = getSupabase();
  if (!supabase) return { dokument: null, feil: 'Supabase er ikke konfigurert.' };
  const kind = kindForFil(file);
  const navn = file.name.replace(/\.(pdf|docx?|odt|xml|xsd|png|jpe?g|gif|webp|tiff?|bmp|svg)$/i, '') || file.name;
  const base = {
    datamodell_id: datamodellId,
    mappe: mappe ?? null,
    navn,
    kind,
    status: 'gjennomgang' as DokStatus,
    fil_navn: file.name,
    storrelse: file.size,
  };

  let rad: Record<string, unknown> = { ...base };
  if (kind === 'xml') {
    rad.fil_tekst = await lesTekst(file);
  } else {
    const mime = MIME_FOR_ENDELSE[endelse(file.name)];
    if (!mime) {
      return {
        dokument: null,
        feil: `«${file.name}» har en filtype som ikke kan lastes opp. ` +
          'HTML og SVG er bevisst utelatt fordi de kan kjøre skript.',
      };
    }
    const sti = `${datamodellId}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(sti, file, { contentType: mime, upsert: false });
    if (upErr) {
      console.warn('[dokumenter] upload', upErr.message);
      return { dokument: null, feil: `Kunne ikke laste opp «${file.name}»: ${upErr.message}` };
    }
    rad.lager_sti = sti;
  }

  const { data, error } = await supabase.from('dokument').insert(rad).select('*').single();
  if (error) {
    console.warn('[dokumenter] insert', error.message);
    return { dokument: null, feil: `Kunne ikke lagre «${file.name}».` };
  }
  return { dokument: data as Dokument, feil: null };
}

export async function oppdaterDok(
  id: string,
  patch: Partial<Pick<Dokument, 'navn' | 'status' | 'html' | 'mappe'>>,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase.from('dokument').update(patch).eq('id', id);
  if (error) {
    console.warn('[dokumenter] oppdater', error.message);
    return false;
  }
  return true;
}

export async function slettDok(d: Dokument): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  if (d.lager_sti) {
    await supabase.storage.from(BUCKET).remove([d.lager_sti]);
  }
  const { error } = await supabase.from('dokument').delete().eq('id', d.id);
  if (error) {
    console.warn('[dokumenter] slett', error.message);
    return false;
  }
  return true;
}

/**
 * Signert URL til en opplastet fil (PDF/Word/bilde), gyldig en time.
 *
 * `nedlasting` setter Content-Disposition til attachment, slik at nettleseren
 * laster ned i stedet for å vise filen inline. Brukes for nedlastingsknappen;
 * forhåndsvisningen (<img>/<iframe>) trenger inline og lar den stå av.
 */
export async function signertUrl(
  d: Dokument,
  opts: { nedlasting?: boolean } = {},
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !d.lager_sti) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(d.lager_sti, 3600, opts.nedlasting ? { download: true } : undefined);
  if (error) {
    console.warn('[dokumenter] signertUrl', error.message);
    return null;
  }
  return data?.signedUrl ?? null;
}

/** Last ned et dokument (Storage-fil, XML-tekst eller rik-tekst som HTML). */
export async function lastNedDok(d: Dokument): Promise<void> {
  let url: string;
  let navn: string;
  let revoke = false;
  if (d.lager_sti) {
    const s = await signertUrl(d, { nedlasting: true });
    if (!s) return;
    url = s;
    navn = d.fil_navn || d.navn;
  } else if (d.fil_tekst != null) {
    const blob = new Blob([d.fil_tekst], { type: 'application/xml' });
    url = URL.createObjectURL(blob);
    navn = d.fil_navn || d.navn + '.xml';
    revoke = true;
  } else {
    // Samme sanering som ved visning: innholdet er delt og kan være skrevet av
    // andre. Uten dette ville et <script> lagt inn utenom editoren (rett mot
    // API-et) kjørt når mottakeren åpner den nedlastede filen lokalt.
    const tittel = d.navn.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const blob = new Blob(
      ['<!doctype html><meta charset=utf-8><title>' + tittel + '</title>' + sanitizeHtml(d.html)],
      { type: 'text/html' },
    );
    url = URL.createObjectURL(blob);
    navn = d.navn + '.html';
    revoke = true;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = navn;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function dokStorrelse(b: number | null): string | null {
  if (!b) return null;
  return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
}
