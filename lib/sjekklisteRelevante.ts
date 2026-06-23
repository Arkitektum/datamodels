/**
 * Auto-filtrerte sjekkliste-forslag (server-side): finn sjekkpunkt fra
 * Sjekkliste-API-et som er relevante for en datamodell, basert på modellens
 * forventede vedlegg → SOSI-dokumenttype.
 *
 * Rådgivende: dette er forslag til hvilke dokumentkrav modellen berører, ikke
 * validering.
 */
import {
  hentSjekkpunkter,
  sjekkpunktDokumenttyper,
  type ApiSjekkpunkt,
} from '@/lib/sjekklisteApi';
import { DATAMODELLER } from '@/lib/datamodeller';
import { SUPABASE_TABLE } from '@/lib/supabase';
import { getServerSupabase } from '@/lib/supabaseServer';
import type { VedleggType } from '@/data/hoeringOgOffentligEttersynV2.kodelister';

/**
 * Mapping fra portalens vedlegg-navn til SOSI-dokumenttypekode. «Annet» kobles ikke. Sjekkpunkt-koder uten vedlegg-motpart
 * (KUNNGJ, UTTALELSE) er prosess-artefakter og faller naturlig utenfor.
 */
export const DOKUMENTTYPE_MAP: Record<string, string> = {
  planbestemmelse: 'PLANBEST',
  planbeskrivelse: 'PLANBESKR',
  illustrasjoner: 'ILLUST',
  rosanalyse: 'ROS-ANALYSE',
  konsekvensutredning: 'KONSUTR',
  utredning: 'UTREDNING',
  plankart: 'PLANKART',
  fagrapporter: 'RAPPORT',
};

// Sjekklister vi henter dokumentkrav fra (dokumenttype-baserte).
const KILDELISTER = ['sjekkliste_teknisk_kvalitet', 'sjekkliste_fag_utredningstema'];

export interface RelevantSjekkpunkt {
  id: string;
  sjekkpunktId?: string;
  tittel: string;
  krav?: string;
  dokumenttyper: string[]; // alle dokumenttyper punktet gjelder
  treffKoder: string[]; // de som matcher modellen
  sjekkliste: string;
}

export interface RelevanteResultat {
  modellKoder: string[]; // dokumenttypekoder utledet fra modellens vedlegg
  ukobledeVedlegg: string[]; // vedleggnavn uten mapping (transparens)
  punkter: RelevantSjekkpunkt[];
  feil: string[];
}

/** Hent modellens forventede vedlegg (Supabase-overstyring ellers innebygd default). */
async function hentVedlegg(modellId: string): Promise<VedleggType[]> {
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from(SUPABASE_TABLE)
        .select('innhold')
        .eq('datamodell_id', modellId)
        .eq('type', 'vedlegg')
        .maybeSingle();
      if (data && Array.isArray(data.innhold) && data.innhold.length) {
        return data.innhold as VedleggType[];
      }
    } catch {
      // faller tilbake til innebygd default under
    }
  }
  const innebygd = DATAMODELLER.find((d) => d.id === modellId);
  return innebygd?.vedlegg ?? [];
}

/** Utled dokumenttypekoder + ukoblede navn fra en vedleggliste. */
function utledKoder(vedlegg: VedleggType[]): { koder: string[]; ukoblede: string[] } {
  const koder = new Set<string>();
  const ukoblede: string[] = [];
  for (const v of vedlegg) {
    const kode = DOKUMENTTYPE_MAP[v.navn.trim().toLowerCase()];
    if (kode) koder.add(kode);
    else ukoblede.push(v.navn);
  }
  return { koder: [...koder], ukoblede };
}

export async function relevanteSjekkpunkter(
  modellId: string,
): Promise<RelevanteResultat> {
  const feil: string[] = [];
  const vedlegg = await hentVedlegg(modellId);
  const { koder, ukoblede } = utledKoder(vedlegg);
  const kodeSet = new Set(koder);

  const punkter: RelevantSjekkpunkt[] = [];
  if (kodeSet.size > 0) {
    for (const liste of KILDELISTER) {
      let medlemmer: ApiSjekkpunkt[] = [];
      try {
        medlemmer = await hentSjekkpunkter(liste);
      } catch (e) {
        feil.push(`${liste}: ${(e as Error).message}`);
        continue;
      }
      for (const p of medlemmer) {
        const dt = sjekkpunktDokumenttyper(p);
        const treff = dt.filter((k) => kodeSet.has(k));
        if (treff.length === 0) continue;
        punkter.push({
          id: String(p['@id'] ?? ''),
          sjekkpunktId: p['arealplan:sjekkpunktId'],
          tittel: p['skos:prefLabel'] ?? '(uten tittel)',
          krav: p['arealplan:krav'],
          dokumenttyper: dt,
          treffKoder: treff,
          sjekkliste: liste,
        });
      }
    }
  }

  punkter.sort((a, b) =>
    (a.sjekkpunktId ?? '').localeCompare(b.sjekkpunktId ?? '', 'nb', { numeric: true }),
  );

  return { modellKoder: koder, ukobledeVedlegg: ukoblede, punkter, feil };
}
