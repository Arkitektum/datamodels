// Egendefinerte datamodeller (opprettet i appen), lagret i Supabase-tabellen
// `datamodell`. Innebygde modeller bor i lib/datamodeller.ts og er ikke her.
import { getSupabase } from './supabase';
import type { ModellStatus } from './datamodeller';
import { parseXsd } from '@/lib/xsd';

export interface CustomModell {
  id: string;
  navn: string;
  beskrivelse?: string | null;
  status: ModellStatus;
}

// Genererer en unik id for en ny modellrad: UUID når tilgjengelig (sikker
// kontekst), ellers en tids- + tilfeldighetsbasert fallback som er unik
// uavhengig av modellnavnet.
function genererModellId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export async function listCustomModels(): Promise<CustomModell[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('datamodell')
    .select('id,navn,beskrivelse,status')
    .order('opprettet', { ascending: true });
  if (error) {
    console.warn('[customModels] list', error.message);
    return [];
  }
  return (data ?? []).map((d) => ({
    id: d.id,
    navn: d.navn,
    beskrivelse: d.beskrivelse,
    status: (d.status as ModellStatus) ?? 'arbeid',
  }));
}

export async function createCustomModel(
  navn: string,
  beskrivelse?: string,
  status: ModellStatus = 'arbeid',
): Promise<CustomModell | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const id = genererModellId();
  const { data, error } = await supabase
    .from('datamodell')
    .insert({ id, navn, beskrivelse: beskrivelse || null, status })
    .select('id,navn,beskrivelse,status')
    .single();
  if (error) {
    console.warn('[customModels] create', error.message);
    return null;
  }
  return {
    id: data.id,
    navn: data.navn,
    beskrivelse: data.beskrivelse,
    status: (data.status as ModellStatus) ?? status,
  };
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
): Promise<CustomModell | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // Parse først – kaster ved ugyldig XSD (bobler opp til kalleren).
  const parsed = parseXsd(xsdText);

  // Opprett modellraden (samme måte som createCustomModel).
  const id = genererModellId();
  const { data, error } = await supabase
    .from('datamodell')
    .insert({ id, navn, beskrivelse: beskrivelse || null, status })
    .select('id,navn,beskrivelse,status')
    .single();
  if (error) {
    console.warn('[customModels] createFromXsd', error.message);
    return null; // modell-insert feilet → ikke skriv dokument_data
  }

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

  return {
    id: data.id,
    navn: data.navn,
    beskrivelse: data.beskrivelse,
    status: (data.status as ModellStatus) ?? status,
  };
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
