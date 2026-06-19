// Delte dokumenter per modell, lagret i Supabase-tabellen `dokument`.
// Tekstdokumenter (rik tekst) ligger i `html`; XML i `fil_tekst`; PDF/Word
// lastes opp til Storage-bucketet `dokumenter` og refereres via `lager_sti`.
import { getSupabase } from './supabase';

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

function kindForFil(file: File): DokKind {
  const nm = file.name.toLowerCase();
  if (file.type.includes('pdf') || nm.endsWith('.pdf')) return 'pdf';
  if (/xml/.test(file.type) || nm.endsWith('.xml') || nm.endsWith('.xsd')) return 'xml';
  if (/^image\//.test(file.type) || /\.(png|jpe?g|gif|webp|tiff?|bmp|svg)$/i.test(nm)) return 'bilde';
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

/** Laster opp én fil: XML lagres som tekst, PDF/Word/bilde i Storage. */
export async function lastOppFil(
  datamodellId: string,
  file: File,
  mappe?: string | null,
): Promise<Dokument | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
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
    const sti = `${datamodellId}/${crypto.randomUUID()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(sti, file, { contentType: file.type || undefined, upsert: false });
    if (upErr) {
      console.warn('[dokumenter] upload', upErr.message);
      return null;
    }
    rad.lager_sti = sti;
  }

  const { data, error } = await supabase.from('dokument').insert(rad).select('*').single();
  if (error) {
    console.warn('[dokumenter] insert', error.message);
    return null;
  }
  return data as Dokument;
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

/** Signert URL til en opplastet fil (PDF/Word), gyldig en time. */
export async function signertUrl(d: Dokument): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase || !d.lager_sti) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(d.lager_sti, 3600);
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
    const s = await signertUrl(d);
    if (!s) return;
    url = s;
    navn = d.fil_navn || d.navn;
  } else if (d.fil_tekst != null) {
    const blob = new Blob([d.fil_tekst], { type: 'application/xml' });
    url = URL.createObjectURL(blob);
    navn = d.fil_navn || d.navn + '.xml';
    revoke = true;
  } else {
    const blob = new Blob(
      ['<!doctype html><meta charset=utf-8><title>' + d.navn + '</title>' + (d.html || '')],
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
