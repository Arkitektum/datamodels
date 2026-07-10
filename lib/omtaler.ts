// @-omtaler i diskusjonsmeldinger. Rene hjelpere: gjenkjenning av «@Visnings-
// navn» i tekst (samme regel som databasetriggeren i db/patches/08 bruker for
// varsling) og autocomplete-tilstand for composeren. Navnene kommer fra
// bruker_rolle (lib/admin.ts → listBrukerRoller) — brukere uten visningsnavn
// kan ikke omtales.

export interface OmtaleBruker {
  epost: string;
  navn: string;
}

/** Tekstsegment for visning: omtaler utheves, resten rendres som vanlig. */
export interface OmtaleSegment {
  tekst: string;
  omtale: boolean;
}

/** Brukere som faktisk er omtalt i teksten («@» + navn, case-ufølsomt).
 *  Lengste navn prøves først, slik at «@Anna Berg Hansen» ikke også treffer
 *  en bruker som heter «Anna Berg». */
export function finnOmtaler(tekst: string, brukere: OmtaleBruker[]): OmtaleBruker[] {
  const lav = tekst.toLowerCase();
  return sortertPaaNavnelengde(brukere).filter((b) => lav.includes('@' + b.navn.toLowerCase()));
}

/** Deler teksten i segmenter der hver «@Navn»-forekomst er sitt eget segment
 *  med omtale=true. Overlappende treff vinnes av lengste navn. */
export function splittOmtaler(tekst: string, brukere: OmtaleBruker[]): OmtaleSegment[] {
  const navn = sortertPaaNavnelengde(brukere).map((b) => b.navn);
  const lav = tekst.toLowerCase();
  const segmenter: OmtaleSegment[] = [];
  let forrige = 0; // sluttposisjon for forrige segment
  let pos = 0;
  while (pos < tekst.length) {
    const at = lav.indexOf('@', pos);
    if (at === -1) break;
    const treff = navn.find((n) => lav.startsWith('@' + n.toLowerCase(), at));
    if (!treff) {
      pos = at + 1;
      continue;
    }
    if (at > forrige) segmenter.push({ tekst: tekst.slice(forrige, at), omtale: false });
    // Behold original skrivemåte fra teksten (kan avvike i store/små bokstaver).
    segmenter.push({ tekst: tekst.slice(at, at + treff.length + 1), omtale: true });
    forrige = at + treff.length + 1;
    pos = forrige;
  }
  if (forrige < tekst.length || segmenter.length === 0) {
    segmenter.push({ tekst: tekst.slice(forrige), omtale: false });
  }
  return segmenter;
}

/** Aktiv «@søketekst» rett før markøren i composeren, eller null. `start` er
 *  posisjonen til @-tegnet (for innsetting). Avbrytes av linjeskift. */
export function aktivOmtaleQuery(
  tekst: string,
  caret: number,
): { start: number; query: string } | null {
  const foran = tekst.slice(0, caret);
  const at = foran.lastIndexOf('@');
  if (at === -1) return null;
  // «@» må stå først eller etter blank, ellers treffer vi e-postadresser o.l.
  if (at > 0 && !/\s/.test(foran[at - 1])) return null;
  const query = foran.slice(at + 1);
  if (query.includes('\n')) return null;
  // Gi opp når søket er blitt urimelig langt uten treff-potensial.
  if (query.length > 40) return null;
  return { start: at, query };
}

/** Brukere som matcher autocomplete-søket (prefiks på fornavn/etternavn). */
export function omtaleForslag(query: string, brukere: OmtaleBruker[]): OmtaleBruker[] {
  const q = query.trim().toLowerCase();
  const medNavn = brukere.filter((b) => b.navn.trim().length > 0);
  if (!q) return medNavn;
  return medNavn.filter(
    (b) =>
      b.navn.toLowerCase().startsWith(q) ||
      b.navn
        .toLowerCase()
        .split(/\s+/)
        .some((del) => del.startsWith(q)),
  );
}

function sortertPaaNavnelengde(brukere: OmtaleBruker[]): OmtaleBruker[] {
  return [...brukere]
    .filter((b) => b.navn && b.navn.trim().length > 0)
    .sort((a, b) => b.navn.length - a.navn.length);
}
