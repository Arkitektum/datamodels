// UML-oversikt som frittstående SVG: ett kort per objekttype, med feltene
// listet som «navn : Type [kardinalitet]».
//
// Layouten er et rutenett av like brede kort (bredden settes av den lengste
// feltlinja i hele modellen, så ingen tekst brytes). Rot-typen får blått kort
// øverst til venstre. Diagrammet er bevisst pil-fritt: med 20+ typer blir
// relasjonspiler et garnnøste – referansene leses i stedet av typenavnet på
// hver feltlinje. Trenger man pilene, finnes Mermaid-diagrammet i Diagram-fanen.
import type { Struktur, StrukturObjekt } from './struktur';
import { feltSignatur, metaLinje, tittelLinje, type EksportMeta } from './eksport';
import { esc, monoBredde, r1 } from './svgTekst';

const MONO = "'DejaVu Sans Mono', Consolas, 'Courier New', monospace";

const PAD = 24; // ytre marg
const KOL_GAP = 24; // mellomrom mellom kolonner
const RAD_GAP = 26; // mellomrom mellom rader
const TOPP = 110; // første kortrad starter her (under tittelblokken)
const MAKS_KOL = 3;

const TEKST_PAD = 22; // venstre/høyre luft inne i kortet
const BAND_H = 32; // høyden på navnebåndet øverst i kortet
const LINJE_H = 23; // linjeavstand mellom feltene
const FOERSTE_FELT = 56; // grunnlinje for første felt, målt fra kortets topp
const BUNN_PAD = 29; // luft under siste feltlinje

const FS_TITTEL = 25;
const FS_META = 11.5;
const FS_KORTNAVN = 13;
const FS_FELT = 12.5;

const FORKLARING =
  'Eksakte XSD-navn  ·  [0..1] = valgfritt  ·  uten klamme = påkrevd  ·  ' +
  '@ = XML-attributt  ·  blått kort = rotelementets type';

function kortHoeyde(antallFelt: number): number {
  // Tomt kort får likevel plass til én linje, så båndet ikke står alene.
  return FOERSTE_FELT + Math.max(0, antallFelt - 1) * LINJE_H + BUNN_PAD;
}

/** Rot-typen først, deretter resten i den rekkefølgen strukturen har. */
function sorterMedRotFoerst(objekter: StrukturObjekt[], root?: string): StrukturObjekt[] {
  const erRot = (o: StrukturObjekt) => !!o.rotElement || (!!root && o.navn === root);
  const rot = objekter.filter(erRot);
  const resten = objekter.filter((o) => !erRot(o));
  return [...rot, ...resten];
}

function tekst(
  x: number,
  y: number,
  innhold: string,
  fs: number,
  vekt: 'bold' | 'normal',
  farge: string,
): string {
  return (
    `<text x="${r1(x)}" y="${r1(y)}" font-family="${MONO}" font-size="${fs}" ` +
    `font-weight="${vekt}" fill="${farge}">${esc(innhold)}</text>`
  );
}

/** Avrundet topp-bånd (samme radius som kortets rx=4). */
function band(x: number, y: number, b: number, fyll: string): string {
  return (
    `<path d="M ${r1(x)} ${r1(y + 4)} a4,4 0 0 1 4,-4 h ${r1(b - 8)} a4,4 0 0 1 4,4 ` +
    `v ${BAND_H - 4} h -${r1(b)} Z" fill="${fyll}"/>`
  );
}

export function strukturTilUmlSvg(struktur: Struktur, meta: EksportMeta): string {
  const alle = Array.isArray(struktur) ? struktur : [];
  if (!alle.length) return '';
  const objekter = sorterMedRotFoerst(alle, meta.root);

  // Kortbredden settes av den lengste linja som skal stå i et kort – både
  // feltlinjene og typenavnene i båndet.
  const feltLinjer = objekter.flatMap((o) => (o.felt ?? []).map((f) => feltSignatur(f)));
  const bredestFelt = feltLinjer.reduce((m, l) => Math.max(m, monoBredde(l, FS_FELT)), 0);
  const bredestNavn = objekter.reduce((m, o) => Math.max(m, monoBredde(o.navn, FS_KORTNAVN)), 0);
  const kolB = Math.ceil(Math.max(bredestFelt, bredestNavn) + TEKST_PAD * 2);

  const kolonner = Math.min(MAKS_KOL, objekter.length);

  // Plasser kortene rad for rad. Alle kort i en rad starter på samme y, og
  // neste rad legges under det høyeste kortet i raden.
  type Plassert = { obj: StrukturObjekt; x: number; y: number; h: number; rot: boolean };
  const plassert: Plassert[] = [];
  let y = TOPP;
  for (let i = 0; i < objekter.length; i += kolonner) {
    const rad = objekter.slice(i, i + kolonner);
    let hoeyest = 0;
    rad.forEach((obj, k) => {
      const h = kortHoeyde((obj.felt ?? []).length);
      hoeyest = Math.max(hoeyest, h);
      plassert.push({
        obj,
        x: PAD + k * (kolB + KOL_GAP),
        y,
        h,
        rot: i === 0 && k === 0,
      });
    });
    y += hoeyest + RAD_GAP;
  }

  const bredde = PAD * 2 + kolonner * kolB + (kolonner - 1) * KOL_GAP;
  const hoeyde = y - RAD_GAP + PAD;

  const deler: string[] = [];
  deler.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bredde}" height="${r1(hoeyde)}" ` +
      `viewBox="0 0 ${bredde} ${r1(hoeyde)}">`,
  );
  deler.push(`<rect width="${bredde}" height="${r1(hoeyde)}" fill="#F2F2F2"/>`);

  for (const { obj, x, y: ky, h, rot } of plassert) {
    const fyll = rot ? '#EAF4FB' : '#FFFFFF';
    const kant = rot ? '#4A9BD1' : '#D5D5D5';
    const bandFyll = rot ? '#CFE7F5' : '#EDEDED';
    deler.push(
      `<rect x="${r1(x)}" y="${r1(ky)}" width="${kolB}" height="${r1(h)}" rx="4" ` +
        `fill="${fyll}" stroke="${kant}" stroke-width="${rot ? '1.6' : '1'}"/>`,
    );
    deler.push(band(x, ky, kolB, bandFyll));
    deler.push(
      `<line x1="${r1(x)}" y1="${r1(ky + BAND_H)}" x2="${r1(x + kolB)}" y2="${r1(ky + BAND_H)}" ` +
        `stroke="${kant}" stroke-width="1"/>`,
    );
    deler.push(tekst(x + TEKST_PAD, ky + 21, obj.navn, FS_KORTNAVN, 'bold', '#232323'));

    (obj.felt ?? []).forEach((f, i) => {
      // Attributter tones ned, slik at elementene dominerer lesebildet.
      const farge = f.attributt ? '#6E6E6E' : '#2B2B2B';
      deler.push(
        tekst(
          x + TEKST_PAD,
          ky + FOERSTE_FELT + i * LINJE_H,
          feltSignatur(f),
          FS_FELT,
          'normal',
          farge,
        ),
      );
    });
  }

  // Tittelblokken tegnes til slutt, men ligger over kortene i y – rekkefølgen
  // spiller bare rolle for overlapp, og her er det ingen.
  deler.push(tekst(PAD, 46, tittelLinje(meta), FS_TITTEL, 'bold', '#151515'));
  const under = metaLinje(meta);
  if (under) deler.push(tekst(PAD, 68, under, FS_META, 'normal', '#6E6E6E'));
  deler.push(tekst(PAD, 88, FORKLARING, FS_META, 'normal', '#6E6E6E'));

  deler.push('</svg>');
  return deler.join('');
}
