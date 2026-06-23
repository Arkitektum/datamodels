import type { ModellStatus, ModellXsd } from '@/lib/datamodeller';
import type { EksempelRad } from '@/data/hoeringOgOffentligEttersynV2.eksempel';
import type { VedleggType, Kodeliste } from '@/data/hoeringOgOffentligEttersynV2.kodelister';
import type { Struktur } from '@/lib/struktur';

/** Felles visningsmodell for innebygde og egendefinerte datamodeller. */
export interface ModellView {
  id: string;
  navn: string;
  status: ModellStatus;
  short: string; // mono-merke under navnet (dataFormatId, ellers «egen»)
  builtin: boolean;
  dataFormatId?: string;
  provider?: string;
  version?: string;
  root?: string;
  lede?: string;
  eksempel?: EksempelRad[];
  xsd?: ModellXsd;
  defaultStruktur: Struktur;
  /** Standard forventede vedlegg (redigeres delt per modell). */
  vedleggDefault: VedleggType[];
  /** Standard kodelister (redigeres delt per modell). */
  kodelisterDefault: Kodeliste[];
  /** Kan slettes (kun egendefinerte). */
  slettbar: boolean;
}

export const STATUS_META: Record<
  ModellStatus,
  { label: string; tone: 'success' | 'warning' | 'neutral'; dot: string }
> = {
  publisert: { label: 'Publisert', tone: 'success', dot: 'var(--success-base)' },
  arbeid: { label: 'Under arbeid', tone: 'warning', dot: 'var(--warning-base)' },
  planlagt: { label: 'Planlagt', tone: 'neutral', dot: 'var(--neutral-border-strong)' },
};

export const STATUS_ORDER: ModellStatus[] = ['publisert', 'arbeid', 'planlagt'];

export const SUBTABS: { id: string; label: string }[] = [
  { id: 'datamodell', label: 'Datamodell' },
  { id: 'diagram', label: 'Diagram' },
  { id: 'dokumenter', label: 'Dokumenter' },
  { id: 'xsd', label: 'XSD' },
  { id: 'eksempel', label: 'Eksempel' },
  { id: 'validerxml', label: 'Valider XML' },
  { id: 'diskusjon', label: 'Diskusjon' },
  { id: 'validering', label: 'Valideringsregler' },
  { id: 'historikk', label: 'Historikk' },
];
