/**
 * Register over innebygde datamodeller i portalen. Egendefinerte modeller bor i
 * databasen (lib/customModels.ts). Innebygde modeller bærer rik metadata som
 * vises i arbeidsområdet (status, provider, versjon, rot-type, lede + XSD).
 */
import { HOERING_XSD_FILE, HOERING_XSD_NS, HOERING_XSD_SRC } from '@/data/hoeringOgOffentligEttersynV2.xsd';
import { STRUKTUR_DEFAULT } from '@/data/hoeringOgOffentligEttersynV2.struktur';
import { EKSEMPEL_DEFAULT, type EksempelRad } from '@/data/hoeringOgOffentligEttersynV2.eksempel';
import {
  VEDLEGG_DEFAULT,
  KODELISTER_DEFAULT,
  type VedleggType,
  type Kodeliste,
} from '@/data/hoeringOgOffentligEttersynV2.kodelister';
import type { Struktur } from '@/lib/struktur';

export type ModellStatus = 'publisert' | 'arbeid' | 'planlagt';

export interface ModellXsd {
  file: string;
  ns: string;
  src: string;
}

export interface Datamodell {
  id: string; // = datamodell_id i databasen
  navn: string;
  beskrivelse?: string;
  slug: string; // historisk url-segment (beholdes for evt. deep-link)
  status: ModellStatus;
  dataFormatId: string; // f.eks. «11002» (vises som merke)
  provider: string; // f.eks. «DIBK»
  version: string; // dataformat-versjon
  root: string; // rot-objekttype
  lede: string; // ingress på modell-toppen
  /** Standard objekt-/feltstruktur (gruppert). Lagres delt og kan redigeres. */
  struktur?: Struktur;
  /** Syntetisk eksempel (felt/verdi). */
  eksempel?: EksempelRad[];
  /** Kanonisk XSD. Mangler den, genereres XSD fra strukturen. */
  xsd?: ModellXsd;
  /** Standard forventede vedlegg (redigerbart per modell, lagres delt). */
  vedlegg?: VedleggType[];
  /** Standard kodelister (redigerbart per modell, lagres delt). */
  kodelister?: Kodeliste[];
}

export const DATAMODELLER: Datamodell[] = [
  {
    id: 'hoeringOgOffentligEttersynV2',
    navn: 'Høring og offentlig ettersyn',
    beskrivelse: 'HøringOgOffentligEttersyn V2 – brevmaler og valideringsregler.',
    slug: 'hoering-og-offentlig-ettersyn',
    status: 'publisert',
    dataFormatId: '11002',
    provider: 'DIBK',
    version: '2',
    root: 'HoeringOgOffentligEttersynType',
    lede:
      'Rotmodell for varsling om høring og offentlig ettersyn. Konvolutt med ' +
      'prosessdata og referanser til berørte parter, eiendommer, planforslag og ' +
      'høringsdetaljer.',
    struktur: STRUKTUR_DEFAULT,
    eksempel: EKSEMPEL_DEFAULT,
    xsd: { file: HOERING_XSD_FILE, ns: HOERING_XSD_NS, src: HOERING_XSD_SRC },
    vedlegg: VEDLEGG_DEFAULT,
    kodelister: KODELISTER_DEFAULT,
  },
];

export function getDatamodellBySlug(slug: string): Datamodell | undefined {
  return DATAMODELLER.find((d) => d.slug === slug);
}

export function getDatamodellById(id: string): Datamodell | undefined {
  return DATAMODELLER.find((d) => d.id === id);
}
