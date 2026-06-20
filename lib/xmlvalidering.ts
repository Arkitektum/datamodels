// Pragmatisk strukturvalidering av en eksempel-XML mot datamodellens struktur
// (objekter + felt + kardinalitet). Dette er IKKE full XSD-validering — vi
// sjekker påkrevde felt, antall forekomster, ukjente elementer/attributter og
// tomme påkrevde felt. Logikken er ren og testbar; XML parses med DOMParser
// (tilgjengelig i nettleseren).

import type { Struktur, StrukturObjekt, StrukturFelt } from './struktur';

export type FunnAlvor = 'feil' | 'advarsel' | 'info';

export interface ValideringsFunn {
  alvor: FunnAlvor;
  sti: string; // f.eks. 'HoeringOgOffentligEttersynType/fristForUttalelse'
  melding: string; // menneskelesbar forklaring (norsk)
}

export interface ValideringsResultat {
  gyldigXml: boolean; // false hvis XML ikke kunne parses
  parseFeil?: string;
  funn: ValideringsFunn[];
  antallFeil: number;
  antallAdvarsler: number;
}

/** Strip eventuelt namespace-prefiks: «dibk:fristForUttalelse» → «fristForUttalelse». */
function lokalnavn(navn: string): string {
  if (!navn) return '';
  const i = navn.indexOf(':');
  return i >= 0 ? navn.slice(i + 1) : navn;
}

/** Sant for kardinaliteter som tillater flere forekomster («..n»). */
function tillaterFlere(kardinalitet?: string): boolean {
  return !!kardinalitet && /\.\.\s*n$/i.test(kardinalitet.trim());
}

/** Sant for påkrevde felt (kardinalitet starter med «1»). */
function erPaakrevd(kardinalitet?: string): boolean {
  return !!kardinalitet && kardinalitet.trim().startsWith('1');
}

/** Barneelementer (Element-noder) under et element. */
function barneElementer(el: Element): Element[] {
  const ut: Element[] = [];
  for (let i = 0; i < el.childNodes.length; i++) {
    const n = el.childNodes[i];
    if (n.nodeType === 1 /* ELEMENT_NODE */) ut.push(n as Element);
  }
  return ut;
}

/** True hvis elementet er markert nillable (xsi:nil="true"). */
function erNil(el: Element): boolean {
  for (let i = 0; i < el.attributes.length; i++) {
    const a = el.attributes[i];
    if (lokalnavn(a.name) === 'nil' && a.value.trim().toLowerCase() === 'true') return true;
  }
  return false;
}

/** True hvis elementet ikke har tekstinnhold og ingen barneelementer. */
function erTomt(el: Element): boolean {
  if (barneElementer(el).length > 0) return false;
  return (el.textContent ?? '').trim() === '';
}

export function validerXmlMotStruktur(xmlText: string, struktur: Struktur): ValideringsResultat {
  const funn: ValideringsFunn[] = [];
  const tom = (parseFeil?: string): ValideringsResultat => ({
    gyldigXml: false,
    parseFeil,
    funn,
    antallFeil: 0,
    antallAdvarsler: 0,
  });

  try {
    if (!xmlText || !xmlText.trim()) {
      return tom('XML-en er tom. Lim inn eller last opp en eksempel-XML.');
    }

    let doc: Document;
    try {
      doc = new DOMParser().parseFromString(xmlText, 'text/xml');
    } catch (e) {
      return tom('Kunne ikke parse XML: ' + (e as Error).message);
    }

    // DOMParser rapporterer feil via et <parsererror>-element i resultatet.
    const parseError = doc.getElementsByTagName('parsererror')[0];
    if (parseError) {
      const tekst = (parseError.textContent ?? '').replace(/\s+/g, ' ').trim();
      return tom(tekst || 'XML-en er ikke velformet.');
    }

    const rot = doc.documentElement;
    if (!rot) {
      return tom('Fant ingen rot i XML-en.');
    }

    const objekter = Array.isArray(struktur) ? struktur : [];
    if (objekter.length === 0) {
      return {
        gyldigXml: true,
        funn,
        antallFeil: 0,
        antallAdvarsler: 0,
      };
    }

    // Oppslag objektnavn (lokalnavn) → StrukturObjekt.
    const objektEtter = new Map<string, StrukturObjekt>();
    objekter.forEach((o) => {
      if (o?.navn) objektEtter.set(lokalnavn(o.navn), o);
    });

    // Finn rot-objektet: det med rotElement, ellers det første.
    const rotObjekt = objekter.find((o) => o.rotElement) ?? objekter[0];

    // Sammenlign XML-rotnavn mot strukturens rot. Ved rotElement matcher vi mot
    // selve rotElement-navnet, ellers mot objektnavnet.
    const xmlRot = lokalnavn(rot.nodeName);
    const forventetRot = lokalnavn(rotObjekt.rotElement || rotObjekt.navn);
    if (xmlRot !== forventetRot) {
      funn.push({
        alvor: 'advarsel',
        sti: xmlRot,
        melding: `Rotelementet «${xmlRot}» samsvarer ikke med modellens rot «${forventetRot}».`,
      });
    }

    // Rekursiv validering av ett XML-element mot ett struktur-objekt.
    const besokt = new Set<Element>();
    const valider = (el: Element, objekt: StrukturObjekt, sti: string) => {
      if (besokt.has(el)) return; // beskytt mot rekursive modeller / sykliske refs
      besokt.add(el);

      const felt = Array.isArray(objekt.felt) ? objekt.felt : [];

      // Del feltene i element-felt og attributt-felt, indeksert på lokalnavn.
      const elementFelt = new Map<string, StrukturFelt>();
      const attributtFelt = new Map<string, StrukturFelt>();
      felt.forEach((f) => {
        if (!f?.navn) return;
        const ln = lokalnavn(f.navn);
        if (f.attributt) attributtFelt.set(ln, f);
        else elementFelt.set(ln, f);
      });

      // ---- Barneelementer: tell forekomster per lokalnavn ----
      const barn = barneElementer(el);
      const forekomster = new Map<string, Element[]>();
      barn.forEach((b) => {
        const ln = lokalnavn(b.nodeName);
        const liste = forekomster.get(ln);
        if (liste) liste.push(b);
        else forekomster.set(ln, [b]);
      });

      // Ukjente elementer (finnes i XML, ikke i modellen).
      forekomster.forEach((noder, ln) => {
        if (!elementFelt.has(ln)) {
          funn.push({
            alvor: 'advarsel',
            sti: `${sti}/${ln}`,
            melding: `Ukjent element «${ln}» (ikke i modellen).`,
          });
        }
        void noder;
      });

      // Sjekk hvert element-felt i modellen.
      elementFelt.forEach((f, ln) => {
        const noder = forekomster.get(ln) ?? [];
        const feltSti = `${sti}/${ln}`;

        // Påkrevd, men mangler.
        if (noder.length === 0) {
          if (erPaakrevd(f.kardinalitet)) {
            funn.push({
              alvor: 'feil',
              sti: feltSti,
              melding: `Påkrevd felt mangler (kardinalitet ${f.kardinalitet}).`,
            });
          }
          return;
        }

        // For mange forekomster når kardinaliteten ikke tillater flere.
        if (noder.length > 1 && !tillaterFlere(f.kardinalitet)) {
          funn.push({
            alvor: 'feil',
            sti: feltSti,
            melding: `For mange forekomster (${noder.length}) — kardinalitet ${
              f.kardinalitet || '0..1'
            } tillater bare én.`,
          });
        }

        noder.forEach((node) => {
          // Tomt påkrevd felt uten nillable / uten xsi:nil.
          if (erPaakrevd(f.kardinalitet) && erTomt(node) && !f.nillable && !erNil(node)) {
            funn.push({
              alvor: 'advarsel',
              sti: feltSti,
              melding: 'Påkrevd felt er tomt og er ikke markert nillable.',
            });
          }

          // Rekursjon: peker feltets type på et annet struktur-objekt?
          const undertype = objektEtter.get(lokalnavn(f.type));
          if (undertype && undertype !== objekt) {
            valider(node, undertype, feltSti);
          }
        });
      });

      // ---- Attributter ----
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const an = lokalnavn(attr.name);
        // Hopp over namespace-erklæringer og xsi:*-attributter (xmlns, nil, type …).
        if (attr.name === 'xmlns' || attr.name.startsWith('xmlns:')) continue;
        if (an === 'nil' || an === 'type' || an === 'schemaLocation' || an === 'noNamespaceSchemaLocation')
          continue;
        if (!attributtFelt.has(an)) {
          funn.push({
            alvor: 'advarsel',
            sti: `${sti}/@${an}`,
            melding: `Ukjent attributt «${an}» (ikke i modellen).`,
          });
        }
      }

      // Påkrevde attributter som mangler.
      attributtFelt.forEach((f, an) => {
        if (!erPaakrevd(f.kardinalitet)) return;
        let finnes = false;
        for (let i = 0; i < el.attributes.length; i++) {
          if (lokalnavn(el.attributes[i].name) === an) {
            finnes = true;
            break;
          }
        }
        if (!finnes) {
          funn.push({
            alvor: 'feil',
            sti: `${sti}/@${an}`,
            melding: `Påkrevd attributt mangler (kardinalitet ${f.kardinalitet}).`,
          });
        }
      });
    };

    valider(rot, rotObjekt, xmlRot);

    const antallFeil = funn.filter((f) => f.alvor === 'feil').length;
    const antallAdvarsler = funn.filter((f) => f.alvor === 'advarsel').length;

    return { gyldigXml: true, funn, antallFeil, antallAdvarsler };
  } catch (e) {
    // Defensiv: aldri kast — rapporter som parseFeil.
    return {
      gyldigXml: false,
      parseFeil: 'Uventet feil under validering: ' + (e as Error).message,
      funn,
      antallFeil: 0,
      antallAdvarsler: 0,
    };
  }
}
