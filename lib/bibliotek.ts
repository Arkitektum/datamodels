/**
 * Datamodell-bibliotek (server-side): et rådgivende oppslagsverk som samler
 * felt- og objektnavn på tvers av korpuset (58 modeller fra Sjekkliste-API-et)
 * OG portalens egne modeller (innebygde + egendefinerte i Supabase).
 *
 * Brukes til navngivningshjelp i StrukturView — kun forslag, aldri validering
 * eller automatiske endringer.
 *
 * Indeksen bygges én gang og caches i minnet med TTL. Søk gjøres mot den
 * cachede indeksen og deler opp i «eksakt» (samme navn) og «liknende»
 * (delstreng / nær skrivemåte).
 */
import {
  listDatamodeller,
  getDatamodell,
  modellKlasser,
} from '@/lib/sjekklisteApi';
import { DATAMODELLER } from '@/lib/datamodeller';
import { getSupabase, SUPABASE_TABLE } from '@/lib/supabase';
import type { Struktur } from '@/lib/struktur';

/** sosiKey-ar for modeller som er utdaterte og kun bør vises som referanse. */
const GAMLE_MODELLER = new Set<string>([
  // Portalens gjeldande Høring-modell er nyare enn korpus-kopien.
  'dibk-hoering-og-offentlig-ettersyn',
]);

export type Kilde = 'korpus' | 'portal';

/** Én forekomst av et felt et sted i korpuset/portalen. */
export interface FeltRef {
  navn: string;
  type?: string;
  kardinalitet?: string;
  modell: string;
  sosiKey: string;
  klasse: string;
  gammel: boolean;
  kilde: Kilde;
}

/** Én forekomst av et objekt/klasse. */
export interface ObjektRef {
  navn: string;
  beskrivelse?: string;
  modell: string;
  sosiKey: string;
  gammel: boolean;
  kilde: Kilde;
}

export interface BibliotekIndeks {
  felt: FeltRef[];
  objekt: ObjektRef[];
  byggetMs: number;
  modellCount: number;
  feil: string[];
}

export interface SokTreff<T> {
  eksakt: T[];
  liknende: T[];
  eksaktTotalt: number;
  liknendeTotalt: number;
}

// ---- Cache ----------------------------------------------------------------

const TTL_MS = 1000 * 60 * 60 * 6; // 6 timer
let cache: { indeks: BibliotekIndeks; tid: number } | null = null;
let inflight: Promise<BibliotekIndeks> | null = null;

/** Henter (og bygger ved behov) den cachede indeksen. */
export async function hentIndeks(tving = false): Promise<BibliotekIndeks> {
  const naa = Date.now();
  if (!tving && cache && naa - cache.tid < TTL_MS) return cache.indeks;
  if (inflight) return inflight;
  inflight = byggIndeks()
    .then((indeks) => {
      cache = { indeks, tid: Date.now() };
      return indeks;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

// ---- Bygging --------------------------------------------------------------

async function byggIndeks(): Promise<BibliotekIndeks> {
  const start = Date.now();
  const felt: FeltRef[] = [];
  const objekt: ObjektRef[] = [];
  const feil: string[] = [];
  let modellCount = 0;

  // 1) Korpus fra Sjekkliste-API-et.
  try {
    const liste = await listDatamodeller();
    const detaljer = await mapLimit(liste, 6, async (m) => {
      try {
        return { liste: m, detalj: await getDatamodell(m.sosiKey) };
      } catch (e) {
        feil.push(`Hopp over ${m.sosiKey}: ${(e as Error).message}`);
        return null;
      }
    });
    for (const d of detaljer) {
      if (!d) continue;
      modellCount++;
      const gammel = GAMLE_MODELLER.has(d.liste.sosiKey);
      for (const k of modellKlasser(d.detalj)) {
        objekt.push({
          navn: k.name,
          beskrivelse: k.description,
          modell: d.liste.name,
          sosiKey: d.liste.sosiKey,
          gammel,
          kilde: 'korpus',
        });
        for (const a of k.attributes ?? []) {
          felt.push({
            navn: a.name,
            type: a.type,
            kardinalitet: a.cardinality,
            modell: d.liste.name,
            sosiKey: d.liste.sosiKey,
            klasse: k.name,
            gammel,
            kilde: 'korpus',
          });
        }
      }
    }
  } catch (e) {
    feil.push(`Korpus utilgjengelig: ${(e as Error).message}`);
  }

  // 2) Portalens innebygde modeller (struktur i koden).
  for (const dm of DATAMODELLER) {
    if (!dm.struktur) continue;
    modellCount++;
    leggTilStruktur(felt, objekt, dm.struktur, dm.navn, `portal:${dm.id}`);
  }

  // 3) Portalens egendefinerte modeller (Supabase) — best effort.
  try {
    const egne = await hentEgneModeller();
    for (const e of egne) {
      modellCount++;
      leggTilStruktur(felt, objekt, e.struktur, e.navn, `portal:${e.id}`);
    }
  } catch (e) {
    feil.push(`Egendefinerte modeller utilgjengelige: ${(e as Error).message}`);
  }

  return { felt, objekt, byggetMs: Date.now() - start, modellCount, feil };
}

function leggTilStruktur(
  felt: FeltRef[],
  objekt: ObjektRef[],
  struktur: Struktur,
  modell: string,
  sosiKey: string,
) {
  const gammel = GAMLE_MODELLER.has(sosiKey);
  for (const o of struktur) {
    objekt.push({
      navn: o.navn,
      beskrivelse: o.beskrivelse,
      modell,
      sosiKey,
      gammel,
      kilde: 'portal',
    });
    for (const f of o.felt ?? []) {
      felt.push({
        navn: f.navn,
        type: f.type,
        kardinalitet: f.kardinalitet,
        modell,
        sosiKey,
        klasse: o.navn,
        gammel,
        kilde: 'portal',
      });
    }
  }
}

interface EgenModell {
  id: string;
  navn: string;
  struktur: Struktur;
}

async function hentEgneModeller(): Promise<EgenModell[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data: modeller, error: mErr } = await supabase
    .from('datamodell')
    .select('id,navn');
  if (mErr || !modeller?.length) return [];
  const { data: struktur, error: sErr } = await supabase
    .from(SUPABASE_TABLE)
    .select('datamodell_id,innhold')
    .eq('type', 'struktur');
  if (sErr || !struktur) return [];
  const strukturById = new Map<string, Struktur>();
  for (const rad of struktur) {
    if (Array.isArray(rad.innhold)) {
      strukturById.set(rad.datamodell_id, rad.innhold as Struktur);
    }
  }
  return modeller
    .map((m) => ({ id: m.id, navn: m.navn, struktur: strukturById.get(m.id) }))
    .filter((m): m is EgenModell => Array.isArray(m.struktur) && m.struktur.length > 0);
}

// ---- Søk ------------------------------------------------------------------

const norm = (s: string) => s.trim().toLowerCase();

/** Avstand for «nær skrivemåte» (enkel Levenshtein, kappet for ytelse). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let forrige = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(
        dp[j] + 1,
        dp[j - 1] + 1,
        forrige + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      forrige = tmp;
    }
  }
  return dp[b.length];
}

/** Liknende navn: delstreng begge veier, eller maks 1 redigeringsavstand. */
function erLiknende(kandidatNorm: string, soekNorm: string): boolean {
  if (kandidatNorm === soekNorm) return false; // eksakt håndteres separat
  if (soekNorm.length < 2 || kandidatNorm.length < 2) return false;
  if (kandidatNorm.includes(soekNorm) || soekNorm.includes(kandidatNorm)) return true;
  return levenshtein(kandidatNorm, soekNorm) <= 1;
}

const GRENSE = 50; // maks per seksjon (truncation rapporteres via *Totalt)

function delOpp<T extends { navn: string }>(
  alle: T[],
  soek: string,
): SokTreff<T> {
  const s = norm(soek);
  const eksaktAlle: T[] = [];
  const liknendeAlle: T[] = [];
  for (const x of alle) {
    const n = norm(x.navn);
    if (n === s) eksaktAlle.push(x);
    else if (erLiknende(n, s)) liknendeAlle.push(x);
  }
  // Liknende sorteres på nærhet (lengdeforskjell), så alfabetisk.
  liknendeAlle.sort(
    (a, b) =>
      Math.abs(a.navn.length - s.length) - Math.abs(b.navn.length - s.length) ||
      a.navn.localeCompare(b.navn, 'nb'),
  );
  return {
    eksakt: eksaktAlle.slice(0, GRENSE),
    liknende: liknendeAlle.slice(0, GRENSE),
    eksaktTotalt: eksaktAlle.length,
    liknendeTotalt: liknendeAlle.length,
  };
}

/** Slå opp et feltnavn i biblioteket (eksakt + liknende). */
export async function sokFelt(navn: string): Promise<SokTreff<FeltRef>> {
  const { felt } = await hentIndeks();
  return delOpp(felt, navn);
}

/** Slå opp et objekt-/klassenavn i biblioteket (eksakt + liknende). */
export async function sokObjekt(navn: string): Promise<SokTreff<ObjektRef>> {
  const { objekt } = await hentIndeks();
  return delOpp(objekt, navn);
}

// ---- Hjelp ----------------------------------------------------------------

/** Kjør async-funksjon over items med begrenset samtidighet. */
async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const ut: R[] = new Array(items.length);
  let i = 0;
  async function arbeider() {
    while (i < items.length) {
      const idx = i++;
      ut[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, arbeider));
  return ut;
}
