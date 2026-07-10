// Strukturell diff mellom to jsonb-verdier fra dokument_data — brukes til å
// vise hva som er endret mellom to historikk-snapshots (HistorikkTab) og
// mellom din ulagrede versjon og sist lagrede ved konflikt (ConflictBanner).
// Ren og UI-uavhengig: resultatet er flate linjer med sti + fra/til.

export type DiffSlag = 'lagt_til' | 'fjernet' | 'endret';

export interface DiffLinje {
  sti: string; // f.eks. 'grupper[navn=Tiltak].felt[2].kardinalitet'
  slag: DiffSlag;
  fra?: string; // kompakt visningsverdi (JSON, avkortet)
  til?: string;
}

const MAKS_VERDI = 120;

/** Kompakt visningsverdi for en vilkårlig JSON-verdi. */
export function visVerdi(v: unknown): string {
  if (v === undefined) return '(mangler)';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (s == null) return 'null';
  return s.length > MAKS_VERDI ? s.slice(0, MAKS_VERDI) + '…' : s;
}

/** Nøkkelfelt som identifiserer et element i en liste, slik at flytting/endring
 *  ikke rapporteres som «alt etter dette punktet er endret». */
const LISTE_NOEKLER = ['id', 'navn', 'regelId', 'kode', 'epost'];

function listeNoekkel(liste: unknown[]): string | null {
  if (liste.length === 0) return null;
  for (const kandidat of LISTE_NOEKLER) {
    const treff = liste.filter(
      (el) =>
        el != null &&
        typeof el === 'object' &&
        !Array.isArray(el) &&
        typeof (el as Record<string, unknown>)[kandidat] === 'string',
    );
    if (treff.length < liste.length) continue;
    // Nøkkelen må være (tilnærmet) unik for å kunne brukes til paring.
    const verdier = new Set(liste.map((el) => (el as Record<string, unknown>)[kandidat]));
    if (verdier.size === liste.length) return kandidat;
  }
  return null;
}

function erObjekt(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Alle forskjeller mellom to JSON-verdier, som flate linjer. Lister av
 *  objekter pares på et nøkkelfelt (id/navn/…) når det finnes, ellers på
 *  posisjon. Like verdier gir ingen linjer. */
export function jsonDiff(fra: unknown, til: unknown, sti = ''): DiffLinje[] {
  if (fra === undefined && til === undefined) return [];
  if (fra === undefined) return [{ sti, slag: 'lagt_til', til: visVerdi(til) }];
  if (til === undefined) return [{ sti, slag: 'fjernet', fra: visVerdi(fra) }];

  if (Array.isArray(fra) && Array.isArray(til)) {
    const noekkel = listeNoekkel(fra) ?? listeNoekkel(til);
    if (noekkel) {
      const linjer: DiffLinje[] = [];
      const tilKart = new Map(
        til.map((el) => [(el as Record<string, unknown>)[noekkel] as string, el]),
      );
      const sett = new Set<string>();
      for (const el of fra) {
        const id = (el as Record<string, unknown>)[noekkel] as string;
        sett.add(id);
        linjer.push(...jsonDiff(el, tilKart.get(id), `${sti}[${noekkel}=${id}]`));
      }
      for (const el of til) {
        const id = (el as Record<string, unknown>)[noekkel] as string;
        if (!sett.has(id)) linjer.push(...jsonDiff(undefined, el, `${sti}[${noekkel}=${id}]`));
      }
      return linjer;
    }
    const linjer: DiffLinje[] = [];
    const maks = Math.max(fra.length, til.length);
    for (let i = 0; i < maks; i++) {
      linjer.push(...jsonDiff(fra[i], til[i], `${sti}[${i}]`));
    }
    return linjer;
  }

  if (erObjekt(fra) && erObjekt(til)) {
    const linjer: DiffLinje[] = [];
    for (const key of new Set([...Object.keys(fra), ...Object.keys(til)])) {
      linjer.push(...jsonDiff(fra[key], til[key], sti ? `${sti}.${key}` : key));
    }
    return linjer;
  }

  if (JSON.stringify(fra) === JSON.stringify(til)) return [];
  return [{ sti, slag: 'endret', fra: visVerdi(fra), til: visVerdi(til) }];
}
