// Server-only jobb: send e-post for usendte rader i `varsel`-tabellen.
// Kjøres periodisk fra instrumentation.ts (VARSEL_EPOST_INTERVALL_MIN) og/eller
// på forespørsel via POST /api/varsel-epost. Erstatter den midlertidige
// Supabase Edge Function-løsningen (webhook + Resend) fra den statiske grenen.
//
// Robusthet:
// - Hver rad «claimes» med en betinget UPDATE (epost_sendt=false → true) før
//   sending, så to samtidige kjøringer aldri sender samme varsel to ganger.
//   Feiler sendingen, rulles flagget tilbake og raden prøves i neste kjøring.
// - Kun varsler nyere enn VARSEL_EPOST_MAKS_ALDER_TIMER (standard 24) sendes,
//   så en gammel backlog (f.eks. fra før e-post ble skrudd på) ikke blåses ut
//   ved første kjøring.
import { getServerSupabase } from './supabaseServer';
import { erGraphMailKonfigurert, sendGraphMail } from './graphMail';
import { varselEmne, varselBrodtekst, type VarselRad } from './varselEpostMal';

export interface VarselJobbResultat {
  /** Jobben kjørte ikke (mangler Supabase- eller Graph-konfigurasjon). */
  hoppetOver: boolean;
  sendt: number;
  feilet: number;
}

const MAKS_PER_KJOERING = 50;

let kjoerer = false; // enkel overlapp-vakt innen samme prosess

export async function sendUsendteVarsler(): Promise<VarselJobbResultat> {
  const supabase = getServerSupabase();
  if (!supabase || !erGraphMailKonfigurert() || kjoerer) {
    return { hoppetOver: true, sendt: 0, feilet: 0 };
  }
  kjoerer = true;
  try {
    const maksAlderTimer = Number(process.env.VARSEL_EPOST_MAKS_ALDER_TIMER || 24);
    const tidligst = new Date(Date.now() - maksAlderTimer * 3_600_000).toISOString();
    const appUrl = (process.env.APP_URL ?? '').replace(/\/$/, '');

    const { data, error } = await supabase
      .from('varsel')
      .select('id,mottaker_epost,kind,datamodell_id,kontekst,aktor_navn,tekst,opprettet')
      .eq('epost_sendt', false)
      .gte('opprettet', tidligst)
      .order('opprettet', { ascending: true })
      .limit(MAKS_PER_KJOERING);
    if (error) {
      console.warn('[varselEpost] henting feilet:', error.message);
      return { hoppetOver: false, sendt: 0, feilet: 0 };
    }

    let sendt = 0;
    let feilet = 0;
    for (const rad of (data ?? []) as VarselRad[]) {
      // Claim: kun den kjøringen som faktisk flipper flagget eier raden.
      const { data: claimet } = await supabase
        .from('varsel')
        .update({ epost_sendt: true })
        .eq('id', rad.id)
        .eq('epost_sendt', false)
        .select('id');
      if (!claimet || claimet.length === 0) continue;

      try {
        await sendGraphMail(rad.mottaker_epost, varselEmne(rad), varselBrodtekst(rad, appUrl));
        sendt++;
      } catch (e) {
        // Rull tilbake så varselet prøves på nytt i neste kjøring.
        await supabase.from('varsel').update({ epost_sendt: false }).eq('id', rad.id);
        feilet++;
        // Logg kun årsak/status — aldri mottaker eller innhold.
        console.warn(`[varselEpost] utsending feilet for varsel ${rad.id}:`, (e as Error).message);
      }
    }
    return { hoppetOver: false, sendt, feilet };
  } finally {
    kjoerer = false;
  }
}
