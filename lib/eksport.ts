// Felles grunnlag for eksportformene (Confluence-HTML, Markdown, UML-SVG,
// XSD-diagram-SVG og utskriftsvisningen). Alle tar den samme `EksportMeta` +
// `Struktur`, slik at overskrift og undertittel blir identiske på tvers.
import type { Struktur, StrukturObjekt } from './struktur';

export interface EksportMeta {
  /** Modellnavn slik det vises i portalen. */
  navn: string;
  /** Statusetikett («Publisert», «Under arbeid», «Planlagt»). */
  status?: string;
  dataFormatId?: string;
  provider?: string;
  version?: string;
  /** Rot-objekttype. */
  root?: string;
  /** targetNamespace fra XSD-en, når den finnes. */
  ns?: string;
  /** Ingressen på modell-toppen. */
  lede?: string;
  /** Dato som skal stå i eksporten (ISO, `YYYY-MM-DD`). */
  dato?: string;
}

/**
 * Setter sammen `EksportMeta` fra modellens metadata + strukturen. Tar imot
 * enkle felt (ikke `ModellView`), slik at lib-laget slipper å kjenne
 * komponentene. `ns` hentes fra rot-objektet når modellen ikke har en kanonisk
 * XSD å lese målnamespace fra.
 */
export function byggMeta(
  modell: {
    navn: string;
    status?: string;
    dataFormatId?: string;
    provider?: string;
    version?: string;
    root?: string;
    lede?: string;
    ns?: string;
  },
  struktur: Struktur,
): EksportMeta {
  const objekter = Array.isArray(struktur) ? struktur : [];
  return {
    ...modell,
    ns: modell.ns || objekter.find((o) => o.targetNamespace)?.targetNamespace || undefined,
    dato: iDag(),
  };
}

/** Undertittel-linja: «dataFormatProvider DIBK · dataFormatId 11002 · …». */
export function metaLinje(meta: EksportMeta): string {
  return [
    meta.provider ? `dataFormatProvider ${meta.provider}` : '',
    meta.dataFormatId ? `dataFormatId ${meta.dataFormatId}` : '',
    meta.version ? `dataFormatVersion ${meta.version}` : '',
    meta.root ? `rot ${meta.root}` : '',
    meta.ns || '',
  ]
    .filter(Boolean)
    .join('  ·  ');
}

/** Tittel-linja: «Høring og offentlig ettersyn / v2». */
export function tittelLinje(meta: EksportMeta): string {
  return meta.version ? `${meta.navn} / v${meta.version}` : meta.navn;
}

export const FALLBACK_GRUPPE = 'Objekttyper';
const GRUPPE_REKKEFOELGE = ['Konvolutt', 'Parter og aktører', 'Plan', 'Eiendom', 'Felles typer'];

/**
 * Grupperer objektene slik den grupperte Datamodell-fanen gjør: kjente grupper
 * i fast rekkefølge først, deretter øvrige i den rekkefølgen de dukker opp.
 * Eksporten skal se ut som det brukeren nettopp så på skjermen.
 */
export function grupper(struktur: Struktur): { gruppe: string; objekter: StrukturObjekt[] }[] {
  const objekter = Array.isArray(struktur) ? struktur : [];
  const sett: string[] = [];
  objekter.forEach((o) => {
    const g = o.group || FALLBACK_GRUPPE;
    if (!sett.includes(g)) sett.push(g);
  });
  const rekkefoelge = [
    ...GRUPPE_REKKEFOELGE.filter((g) => sett.includes(g)),
    ...sett.filter((g) => !GRUPPE_REKKEFOELGE.includes(g)),
  ];
  return rekkefoelge
    .map((gruppe) => ({
      gruppe,
      objekter: objekter.filter((o) => (o.group || FALLBACK_GRUPPE) === gruppe),
    }))
    .filter((g) => g.objekter.length > 0);
}

/** «navn : Type [kardinalitet]», med @ foran XML-attributter. */
export function feltSignatur(f: {
  navn: string;
  type: string;
  kardinalitet?: string;
  attributt?: boolean;
}): string {
  const pre = f.attributt ? '@' : '';
  const kard = f.kardinalitet ? ` [${f.kardinalitet}]` : '';
  return `${pre}${f.navn} : ${f.type || 'string'}${kard}`;
}

/** Dagens dato som `YYYY-MM-DD` (lokal tid), til datolinja i eksporten. */
export function iDag(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
