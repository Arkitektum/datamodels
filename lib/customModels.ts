// Egendefinerte datamodeller (opprettet i appen), lagret i Supabase-tabellen
// `datamodell`. Innebygde modeller bor i lib/datamodeller.ts og er ikke her.
import { getSupabase } from './supabase';
import type { ModellStatus } from './datamodeller';
import { parseXsd } from '@/lib/xsd';

/** 'delt' = synlig for alle innloggede, 'privat' = kun for eieren. */
export type Synlighet = 'delt' | 'privat';

export interface CustomModell {
  id: string;
  navn: string;
  beskrivelse?: string | null;
  status: ModellStatus;
  synlighet: Synlighet;
  /** Hvem som opprettet modellen (lowercase e-post). Null på gamle rader. */
  eierEpost: string | null;
}

// Kolonnene fra patch 09. Databaser som ikke har kjørt patchen ennå mangler
// dem, og da feiler hele select-en – derfor forsøker vi det brede utvalget
// først og faller tilbake til det gamle (se listCustomModels).
const KOLONNER = 'id,navn,beskrivelse,status,synlighet,eier_epost';
const KOLONNER_GAMLE = 'id,navn,beskrivelse,status';

type Rad = {
  id: string;
  navn: string;
  beskrivelse?: string | null;
  status?: string | null;
  synlighet?: string | null;
  eier_epost?: string | null;
};

function tilModell(d: Rad, standardStatus: ModellStatus = 'arbeid'): CustomModell {
  return {
    id: d.id,
    navn: d.navn,
    beskrivelse: d.beskrivelse ?? null,
    status: (d.status as ModellStatus) ?? standardStatus,
    synlighet: d.synlighet === 'privat' ? 'privat' : 'delt',
    eierEpost: d.eier_epost ? d.eier_epost.toLowerCase() : null,
  };
}

// Genererer en unik id for en ny modellrad: UUID når tilgjengelig (sikker
// kontekst), ellers en tids- + tilfeldighetsbasert fallback som er unik
// uavhengig av modellnavnet.
function genererModellId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Skyldes feilen at synlighets-kolonnene mangler (patch 09 ikke kjørt)?
 * PostgREST svarer PGRST204 for ukjent kolonne i payloaden og 42703 for ukjent
 * kolonne i select. Vi sjekker eksplisitt, slik at ekte feil (RLS, duplikat-id)
 * IKKE utløser et nytt forsøk som kan skjule årsaken.
 */
function manglerSynlighetsKolonner(feil: { code?: string; message?: string }): boolean {
  if (feil.code === 'PGRST204' || feil.code === '42703') return true;
  return /synlighet|eier_epost/.test(feil.message ?? '') && /column|kolonne/i.test(feil.message ?? '');
}

/**
 * Setter inn en ny modellrad. Forsøker først med synlighet + eier, og faller
 * tilbake til de gamle kolonnene hvis patch 09 ikke er kjørt – da opprettes
 * modellen som delt (kolonnene finnes jo ikke), i stedet for at det å lage en
 * modell slutter å virke.
 */
async function settInnModell(
  id: string,
  navn: string,
  beskrivelse: string | undefined,
  status: ModellStatus,
  synlighet: Synlighet,
  eierEpost: string | null | undefined,
): Promise<{ modell: CustomModell | null; feil: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { modell: null, feil: 'Supabase er ikke konfigurert.' };
  const felles = { id, navn, beskrivelse: beskrivelse || null, status };

  const { data, error } = await supabase
    .from('datamodell')
    .insert({ ...felles, synlighet, eier_epost: eierEpost ? eierEpost.toLowerCase() : null })
    .select(KOLONNER)
    .single();
  if (!error) return { modell: tilModell(data as Rad, status), feil: null };
  if (!manglerSynlighetsKolonner(error)) {
    console.warn('[customModels] create', error.message);
    return { modell: null, feil: error.message };
  }

  const { data: gammel, error: gammelFeil } = await supabase
    .from('datamodell')
    .insert(felles)
    .select(KOLONNER_GAMLE)
    .single();
  if (gammelFeil) {
    console.warn('[customModels] create', error.message, '/', gammelFeil.message);
    return { modell: null, feil: gammelFeil.message };
  }
  return { modell: tilModell(gammel as Rad, status), feil: null };
}

export async function listCustomModels(): Promise<CustomModell[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('datamodell')
    .select(KOLONNER)
    .order('opprettet', { ascending: true });
  if (!error) return (data ?? []).map((d) => tilModell(d as Rad));
  if (!manglerSynlighetsKolonner(error)) {
    console.warn('[customModels] list', error.message);
    return [];
  }

  // Patch 09 ikke kjørt ennå: kolonnene finnes ikke. Da leser vi de gamle
  // kolonnene og behandler alt som delt, slik at portalen fortsatt virker.
  const { data: gamle, error: gammelFeil } = await supabase
    .from('datamodell')
    .select(KOLONNER_GAMLE)
    .order('opprettet', { ascending: true });
  if (gammelFeil) {
    console.warn('[customModels] list', error.message, '/', gammelFeil.message);
    return [];
  }
  return (gamle ?? []).map((d) => tilModell(d as Rad));
}

export async function createCustomModel(
  navn: string,
  beskrivelse?: string,
  status: ModellStatus = 'arbeid',
  synlighet: Synlighet = 'delt',
  eierEpost?: string | null,
): Promise<CustomModell | null> {
  const { modell } = await settInnModell(
    genererModellId(),
    navn,
    beskrivelse,
    status,
    synlighet,
    eierEpost,
  );
  return modell;
}

/**
 * Oppretter en egendefinert modell OG seeder strukturen fra en opplastet XSD,
 * slik at modellen blir fullverdig fra start (i stedet for tom). Strukturen
 * lagres under dokument_data type='struktur' og den opprinnelige XSD-kilden
 * under type='xsdkilde' (samme rader som StrukturView/XsdTab leser).
 *
 * Valg: vi LAR parseXsd kaste videre (fanger ikke feilen her), slik at
 * kalleren kan vise en presis feilmelding fra parseren (f.eks. «Ugyldig
 * XML/XSD …» eller «Fant ingen complexType …»). Parsing skjer derfor før
 * modellraden opprettes – ugyldig XSD gir ingen tom modell på avveie.
 */
export async function createCustomModelFromXsd(
  navn: string,
  beskrivelse: string | undefined,
  status: ModellStatus,
  xsdText: string,
  fileName: string,
  synlighet: Synlighet = 'delt',
  eierEpost?: string | null,
): Promise<CustomModell | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Parse først – kaster ved ugyldig XSD (bobler opp til kalleren).
  const parsed = parseXsd(xsdText);

  // Opprett modellraden (samme måte som createCustomModel).
  const id = genererModellId();
  const { modell } = await settInnModell(id, navn, beskrivelse, status, synlighet, eierEpost);
  if (!modell) return null; // modell-insert feilet → ikke skriv dokument_data

  // Seed struktur + XSD-kilde. sist_detalj på struktur-raden gjør at appen
  // logger opprettelsen.
  const { error: dErr } = await supabase.from('dokument_data').upsert(
    [
      {
        datamodell_id: id,
        type: 'struktur',
        innhold: parsed as unknown,
        sist_detalj: `Opprettet fra XSD (${parsed.length} objekter)`,
      },
      {
        datamodell_id: id,
        type: 'xsdkilde',
        innhold: { src: xsdText, file: fileName } as unknown,
      },
    ],
    { onConflict: 'datamodell_id,type' },
  );
  if (dErr) {
    // Modellen finnes nå; struktur kunne ikke seedes. Logg, men returner
    // likevel modellen (den er opprettet og kan redigeres videre).
    console.warn('[customModels] createFromXsd seed', dErr.message);
  }

  return modell;
}

/**
 * Setter status på en modell. Fungerer både for egendefinerte modeller (rad
 * finnes) og innebygde (upsert oppretter en liten rad med id+navn+status, slik
 * at også «Publisert» kan endres). Øvrig metadata for innebygde bor i koden.
 */
export async function setModellStatus(
  id: string,
  navn: string,
  status: ModellStatus,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  const { error } = await supabase
    .from('datamodell')
    .upsert({ id, navn, status }, { onConflict: 'id' });
  if (error) {
    console.warn('[customModels] setStatus', error.message);
    return false;
  }
  return true;
}

/**
 * Setter synlighet på en egendefinert modell. Første gang en modell gjøres
 * privat må den også få en eier – ellers ville RLS-policyen skjult den for
 * alle, inkludert den som nettopp slo på bryteren.
 *
 * Returnerer en feilmelding når noe gikk galt, ellers null. Mangler kolonnene
 * (patch 09 ikke kjørt) sier vi det rett ut i stedet for å feile stille.
 */
export async function setModellSynlighet(
  id: string,
  synlighet: Synlighet,
  eierEpost: string | null,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return 'Supabase er ikke konfigurert.';
  const { error } = await supabase
    .from('datamodell')
    .update({ synlighet, eier_epost: eierEpost ? eierEpost.toLowerCase() : null })
    .eq('id', id);
  if (error) {
    console.warn('[customModels] setSynlighet', error.message);
    return manglerSynlighetsKolonner(error)
      ? 'Databasen mangler synlighets-kolonnene. Kjør db/patches/09-synlighet.sql i Supabase først.'
      : error.message;
  }
  return null;
}

export async function deleteCustomModel(id: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;
  // Slett innholdet (regler/status/brevmaler/struktur), diskusjon og dokumenter
  // først, så selve modellen.
  await supabase.from('dokument_data').delete().eq('datamodell_id', id);
  await supabase.from('diskusjon').delete().eq('datamodell_id', id);
  await supabase.from('dokument').delete().eq('datamodell_id', id);
  const { error } = await supabase.from('datamodell').delete().eq('id', id);
  if (error) {
    console.warn('[customModels] delete', error.message);
    return false;
  }
  return true;
}
