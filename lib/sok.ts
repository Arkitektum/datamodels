// Globalt søk på tvers av alle modeller: modellnavn, struktur-felt,
// valideringsregler og dokumenttitler. Slår sammen statiske (innebygde)
// kilder med delte data fra Supabase. Robust mot manglende DB.
import { getSupabase } from './supabase';
import { DATAMODELLER } from './datamodeller';
import { REGEL_GRUPPER_DEFAULT } from '@/data/hoeringOgOffentligEttersynV2.rules';
import { normalizeRegelData, type RegelGruppe } from './regler';
import type { Struktur } from './struktur';

export type SokKategori = 'modell' | 'felt' | 'regel' | 'dokument';

export interface SokTreff {
  modellId: string;
  modellNavn: string;
  kategori: SokKategori;
  fane: string; // SUBTAB-id å åpne
  kontekst: string | null; // for felt: 'ObjektNavn.feltNavn' (åpner tråd); ellers null
  tittel: string; // hovedtekst i resultatet
  undertittel?: string; // f.eks. modellnavn + kategori-etikett
}

/** Case-insensitiv delstreng-match (tomme verdier matcher aldri). */
function matcher(verdi: string | undefined | null, q: string): boolean {
  return !!verdi && verdi.toLowerCase().includes(q);
}

/**
 * Søk på tvers av alle modeller. Tom/kort query (<2 tegn etter trim) gir [].
 * Kombinerer statiske kilder (innebygde modeller) med delte data fra DB.
 * Svelger DB-feil og fortsetter med det som finnes. Kutter IKKE resultater –
 * komponenten begrenser visningen per kategori.
 */
export async function sokAlt(
  query: string,
  models: { id: string; navn: string }[],
): Promise<SokTreff[]> {
  const q = (query || '').trim().toLowerCase();
  if (q.length < 2) return [];

  // Slå opp modellnavn fra `models`; fall tilbake til id hvis ukjent.
  const navnMap = new Map<string, string>();
  models.forEach((m) => navnMap.set(m.id, m.navn));
  const modellNavn = (id: string) => navnMap.get(id) || id;

  const treff: SokTreff[] = [];

  // 1) Modellnavn ----------------------------------------------------------
  for (const m of models) {
    if (matcher(m.navn, q)) {
      treff.push({
        modellId: m.id,
        modellNavn: m.navn,
        kategori: 'modell',
        fane: 'datamodell',
        kontekst: null,
        tittel: m.navn,
        undertittel: 'Datamodell',
      });
    }
  }

  // Samle inn strukturer og regeldata per modell (statisk + DB).
  // Senere kilde overstyrer tidligere for samme modellId.
  const strukturer = new Map<string, Struktur>();
  const regeldata = new Map<string, RegelGruppe[]>();

  // Statiske, innebygde kilder.
  for (const d of DATAMODELLER) {
    if (d.struktur) strukturer.set(d.id, d.struktur);
  }
  regeldata.set(
    'hoeringOgOffentligEttersynV2',
    normalizeRegelData(REGEL_GRUPPER_DEFAULT),
  );

  // Delte data fra DB (overstyrer innebygd der den finnes).
  const supabase = getSupabase();
  if (supabase) {
    // Struktur + regeldata fra dokument_data.
    try {
      const { data, error } = await supabase
        .from('dokument_data')
        .select('datamodell_id,type,innhold')
        .in('type', ['struktur', 'regeldata']);
      if (error) throw error;
      for (const rad of data ?? []) {
        const r = rad as { datamodell_id: string; type: string; innhold: unknown };
        if (r.type === 'struktur' && Array.isArray(r.innhold)) {
          strukturer.set(r.datamodell_id, r.innhold as Struktur);
        } else if (r.type === 'regeldata' && Array.isArray(r.innhold)) {
          regeldata.set(r.datamodell_id, normalizeRegelData(r.innhold as never));
        }
      }
    } catch (e) {
      console.warn('[sok] dokument_data', e instanceof Error ? e.message : e);
    }

    // 4) Dokumenttitler ---------------------------------------------------
    try {
      const { data, error } = await supabase
        .from('dokument')
        .select('datamodell_id,navn,kind');
      if (error) throw error;
      for (const rad of data ?? []) {
        const r = rad as { datamodell_id: string; navn: string; kind: string };
        if (matcher(r.navn, q)) {
          treff.push({
            modellId: r.datamodell_id,
            modellNavn: modellNavn(r.datamodell_id),
            kategori: 'dokument',
            fane: 'dokumenter',
            kontekst: null,
            tittel: r.navn,
            undertittel: `${modellNavn(r.datamodell_id)} · Dokument`,
          });
        }
      }
    } catch (e) {
      console.warn('[sok] dokument', e instanceof Error ? e.message : e);
    }
  }

  // 2) Struktur-felt -------------------------------------------------------
  for (const [id, struktur] of strukturer) {
    for (const objekt of struktur) {
      for (const felt of objekt.felt || []) {
        if (matcher(felt.navn, q) || matcher(felt.beskrivelse, q)) {
          treff.push({
            modellId: id,
            modellNavn: modellNavn(id),
            kategori: 'felt',
            fane: 'datamodell',
            kontekst: `${objekt.navn}.${felt.navn}`,
            tittel: felt.navn,
            undertittel: `${objekt.navn} · ${modellNavn(id)}`,
          });
        }
      }
    }
  }

  // 3) Regler --------------------------------------------------------------
  for (const [id, grupper] of regeldata) {
    for (const g of grupper) {
      for (const r of g.rules) {
        if (matcher(r.p, q) || matcher(r.t, q) || matcher(r.sjekkpunkt, q)) {
          treff.push({
            modellId: id,
            modellNavn: modellNavn(id),
            kategori: 'regel',
            fane: 'validering',
            kontekst: null,
            tittel: r.p ? `${g.g} · ${r.p}` : r.t || g.g,
            undertittel: r.t || `${modellNavn(id)} · Valideringsregel`,
          });
        }
      }
    }
  }

  // Dedup på modellId + kategori + tittel + kontekst.
  const sett = new Set<string>();
  const unike: SokTreff[] = [];
  for (const t of treff) {
    const nokkel = `${t.modellId}|${t.kategori}|${t.tittel}|${t.kontekst ?? ''}`;
    if (sett.has(nokkel)) continue;
    sett.add(nokkel);
    unike.push(t);
  }
  return unike;
}
