/**
 * Server-side klient mot Sjekkliste-Plan-API-et (datamodell-korpuset + sjekklister).
 *
 * Base-URL leses fra SJEKKLISTE_API_BASE; default er den publiserte Azure-
 * tjenesten. Kjøres kun server-side (route handlers), så ingen CORS/nettleser-
 * begrensninger. Henting er lest-only.
 */

const DEFAULT_BASE =
  'https://ca-web-dibkplansjekk-poc.bluesea-86bb7fc5.norwayeast.azurecontainerapps.io';

export function sjekklisteBase(): string {
  return (process.env.SJEKKLISTE_API_BASE || DEFAULT_BASE).replace(/\/+$/, '');
}

// ---- API-former (kun feltene vi bruker) -----------------------------------

/** Attributt på en klasse i korpuset. */
export interface ApiAttributt {
  name: string;
  type?: string;
  cardinality?: string;
}

/** Klasse i en korpus-modell. */
export interface ApiKlasse {
  name: string;
  isAbstract?: boolean;
  description?: string;
  attributes?: ApiAttributt[];
  stereotype?: string;
}

/** Komprimert listeoppføring fra GET /api/datamodeller. */
export interface ApiModellListe {
  name: string;
  version?: string;
  sosiKey: string;
  source?: string;
  description?: string;
  sourceCategory?: string;
  classCount?: number;
  codelistCount?: number;
  associationCount?: number;
}

/** Full modell fra GET /api/datamodeller/{sosiKey}. */
export interface ApiModellDetalj {
  Name?: string;
  name?: string;
  Version?: string;
  version?: string;
  SosiKey?: string;
  sosiKey?: string;
  Classes?: ApiKlasse[];
  classes?: ApiKlasse[];
}

async function hent<T>(path: string): Promise<T> {
  const url = `${sjekklisteBase()}${path}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    // Korpuset endrer seg sjelden; la Next cache det. Indeksen i bibliotek.ts
    // legger på sin egen TTL i tillegg.
    next: { revalidate: 60 * 60 * 6 },
  });
  if (!res.ok) {
    throw new Error(`Sjekkliste-API ${res.status} for ${path}`);
  }
  return (await res.json()) as T;
}

/** Liste over alle datamodeller (komprimert, uten klasser). */
export async function listDatamodeller(): Promise<ApiModellListe[]> {
  const data = await hent<{ models?: ApiModellListe[] }>('/api/datamodeller');
  return data.models ?? [];
}

/** Full detalj for én modell (klasser + attributter). */
export async function getDatamodell(sosiKey: string): Promise<ApiModellDetalj> {
  return hent<ApiModellDetalj>(`/api/datamodeller/${encodeURIComponent(sosiKey)}`);
}

/** Normaliser felt-skrivemåte (API bruker PascalCase, listen camelCase). */
export function modellKlasser(m: ApiModellDetalj): ApiKlasse[] {
  return m.Classes ?? m.classes ?? [];
}

// ---- Sjekklister ----------------------------------------------------------

/** Ett sjekkpunkt (rå JSON-LD-concept, kun feltene vi leser). */
export interface ApiSjekkpunkt {
  '@id'?: string;
  'skos:prefLabel'?: string;
  'arealplan:krav'?: string;
  'arealplan:dokumenttype'?: string | string[];
  'arealplan:sjekkpunktId'?: string;
  [key: string]: unknown;
}

/**
 * Flat liste av sjekkpunkt i én sjekkliste (uten @context). Gyldige
 * identifikatorer: sjekkliste_teknisk_kvalitet, sjekkliste_fag_utredningstema,
 * planprosess_aktiviteter.
 */
export async function hentSjekkpunkter(
  identifier: string,
): Promise<ApiSjekkpunkt[]> {
  const data = await hent<{ 'skos:member'?: ApiSjekkpunkt[] }>(
    `/api/plan-sjekkliste/${encodeURIComponent(identifier)}/sjekkpunkt?context=stripped`,
  );
  return data['skos:member'] ?? [];
}

/** Dokumenttype(r) på et sjekkpunkt som array (API gir streng eller liste). */
export function sjekkpunktDokumenttyper(p: ApiSjekkpunkt): string[] {
  const d = p['arealplan:dokumenttype'];
  if (Array.isArray(d)) return d;
  if (typeof d === 'string' && d) return [d];
  return [];
}
