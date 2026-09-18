// XSD-innholdsmodell som frittstående SVG, i samme stil som verktøy à la
// XMLSpy: rotelementet ytterst til venstre, en sekvens-kompositor, og deretter
// én ramme per komplekse type med elementene stablet under hverandre.
//
// Kolonnene følger avstanden fra rotelementet: en type havner i kolonnen etter
// den typen som først refererer den. Referanser tegnes som piler – blå når de
// peker framover (mot høyre), oransje stiplet når de peker tilbake til en type
// som allerede står lenger til venstre (typisk en delt type som KodeType).
import type { Struktur, StrukturFelt, StrukturObjekt } from './struktur';
import { metaLinje, tittelLinje, type EksportMeta } from './eksport';
import { esc, r1, sansBredde } from './svgTekst';

const SANS = "Tahoma, Verdana, 'DejaVu Sans', Arial, sans-serif";

/* ------------------------------ mål ---------------------------------- */

const MARG = 40; // ytre marg
const INNHOLD_TOPP = 150; // første ramme starter her (under tittelblokken)
const RUTE = 20; // rutenettet i bakgrunnen

const BOKS_H = 23; // elementboks
const BOKS_PITCH = 33; // avstand mellom elementboksene
const BOKS_MIN_B = 90;
const RAMME_FOERSTE = 36; // fra rammens topp til første elementboks
const RAMME_BUNN = 16; // luft under siste elementboks
const RAMME_VENSTRE = 101; // fra rammens venstre kant til elementboksene
const RYGG_INN = 22; // ryggraden ligger så langt venstre for boksene
const PILL_B = 40; // kompositor-pillen
const PILL_H = 22;
const PILL_INN = 16; // pillens venstre kant, målt fra rammens venstre kant

const ROT_MIN_B = 105; // rotelementets boks – bredden følger navnet
const ROT_H = 27;

const KOL_GAP = 180; // plass mellom kolonnene – her går pilene
const GRUPPE_GAP = 44; // vertikal luft mellom rammer i samme kolonne

const FS_TITTEL = 28;
const FS_META = 12.5;
const FS_FORKLARING = 11;
const FS_ETIKETT = 11;
const FS_KARD = 9.5;

/* ----------------------------- farger -------------------------------- */

const BG = '#FFFFC6';
const RUTE_FARGE = '#F2F2B4';
const BLEKK = '#0D1A26';
const DEMPET = '#6A7060';
const RAMME_TEKST = '#8A8A82';
const RAMME_KANT = '#A8A8A0';
const BOKS_FYLL = '#EEF3F9';
const BOKS_KANT = '#8C99A6';
const ROT_FYLL = '#B7D0E8';
const ROT_KANT = '#2F5C8A';
const PIL_FRAM = '#3F7CB8';
const PIL_TILBAKE = '#B0662A';
const KODE_PRIKK = '#1B5B6A';
const SKYGGE = '#00000016';

const FORKLARING_1 =
  'Stiplet elementramme = minOccurs 0 (valgfritt)   ·   heltrukket = påkrevd   ·   ' +
  '● = kodeliste   ·   0..∞ = maxOccurs unbounded';
const FORKLARING_2 =
  'Blå heltrukken pil = referanse framover i modellen   ·   ' +
  'oransje stiplet pil = referanse tilbake til en type lenger til venstre (delt type)';

/* --------------------------- felt-tolkning ---------------------------- */

function erValgfritt(f: StrukturFelt): boolean {
  if (f.req) return false;
  if (f.kardinalitet) return /^\s*0/.test(f.kardinalitet);
  return false;
}

function erUbegrenset(f: StrukturFelt): boolean {
  return /unbounded|∞|\.\.\s*n\b/i.test(f.kardinalitet ?? '');
}

function erKodeliste(f: StrukturFelt): boolean {
  return /kode/i.test(f.type ?? '');
}

function etikett(f: StrukturFelt): string {
  return (f.attributt ? '@' : '') + f.navn;
}

/* ----------------------------- tegning -------------------------------- */

function tekst(
  x: number,
  y: number,
  innhold: string,
  fs: number,
  vekt: 'bold' | 'normal',
  farge: string,
): string {
  return (
    `<text x="${r1(x)}" y="${r1(y)}" font-family="${SANS}" font-size="${fs}" ` +
    `font-weight="${vekt}" fill="${farge}">${esc(innhold)}</text>`
  );
}

function linje(x1: number, y1: number, x2: number, y2: number, farge = BLEKK, b = 1): string {
  return (
    `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" ` +
    `stroke="${farge}" stroke-width="${b}"/>`
  );
}

/** Den lille «dokument»-ikonet som står først i hver elementboks. */
function elementIkon(x: number, y: number): string {
  const d = [`<rect x="${r1(x)}" y="${r1(y)}" width="7" height="7" fill="#FFFFFF" stroke="${BOKS_KANT}" stroke-width=".7"/>`];
  for (let i = 0; i < 3; i++) {
    d.push(
      `<line x1="${r1(x + 1.3)}" y1="${r1(y + 1.6 + i * 2)}" x2="${r1(x + 5.7)}" ` +
        `y2="${r1(y + 1.6 + i * 2)}" stroke="${BOKS_KANT}" stroke-width=".6"/>`,
    );
  }
  return d.join('');
}

/** Boks med slagskygge (skyggen tegnes først, forskjøvet 2 px). */
function boksMedSkygge(
  x: number,
  y: number,
  b: number,
  h: number,
  rx: number,
  fyll: string,
  kant: string,
  stiplet: boolean,
): string {
  return (
    `<rect x="${r1(x + 2)}" y="${r1(y + 2)}" width="${r1(b)}" height="${r1(h)}" rx="${rx}" fill="${SKYGGE}"/>` +
    `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(b)}" height="${r1(h)}" rx="${rx}" fill="${fyll}" ` +
    `stroke="${kant}" stroke-width="1"${stiplet ? ' stroke-dasharray="3 2"' : ''}/>`
  );
}

/** Kompositor-pillen (sekvens) med de tre prikkene. */
function kompositor(x: number, cy: number): string {
  const y = cy - PILL_H / 2;
  const d = [boksMedSkygge(x, y, PILL_B, PILL_H, PILL_H / 2, '#FFFFFF', '#5B6770', false)];
  for (let i = 0; i < 3; i++) {
    d.push(`<circle cx="${r1(x + 12 + i * 8)}" cy="${r1(cy)}" r="2.4" fill="${BLEKK}"/>`);
  }
  return d.join('');
}

/** Bezier med pilspiss. `ned` snur spissen nedover (brukes av tilbakepilene,
 *  som kommer inn ovenfra i stedet for fra venstre). */
function pil(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  farge: string,
  stiplet: boolean,
  ned: boolean,
): string {
  const c1x = x1 + 70;
  const d = ned
    ? `M ${r1(x1)} ${r1(y1)} C ${r1(c1x)} ${r1(y1)} ${r1(x2)} ${r1(y2 - 83)} ${r1(x2)} ${r1(y2)}`
    : `M ${r1(x1)} ${r1(y1)} C ${r1(c1x)} ${r1(y1)} ${r1(x2 - 40)} ${r1(y2)} ${r1(x2)} ${r1(y2)}`;
  const spiss = ned
    ? `M ${r1(x2 - 3.6)} ${r1(y2)} L ${r1(x2)} ${r1(y2 + 7)} L ${r1(x2 + 3.6)} ${r1(y2)} Z`
    : `M ${r1(x2)} ${r1(y2 - 3.6)} L ${r1(x2 + 7)} ${r1(y2)} L ${r1(x2)} ${r1(y2 + 3.6)} Z`;
  return (
    `<path d="${d}" fill="none" stroke="${farge}" stroke-width="1.2" opacity="${stiplet ? '.55' : '.62'}"` +
    `${stiplet ? ' stroke-dasharray="5 3"' : ''}/>` +
    `<path d="${spiss}" fill="${farge}" opacity="${stiplet ? '.75' : '.8'}"/>`
  );
}

/* ------------------------------ layout -------------------------------- */

interface Gruppe {
  obj: StrukturObjekt;
  dybde: number;
  x: number; // rammens venstre kant
  y: number; // rammens topp
  b: number; // rammebredde
  h: number; // rammehøyde
  boksB: number;
}

function boksBredde(obj: StrukturObjekt): number {
  const lengst = (obj.felt ?? []).reduce(
    (m, f) => Math.max(m, sansBredde(etikett(f), FS_ETIKETT)),
    0,
  );
  // 16 px til ikon + luft foran teksten, 12 px etter.
  return Math.max(BOKS_MIN_B, Math.ceil(16 + lengst + 12));
}

function rammeHoeyde(antall: number): number {
  const n = Math.max(1, antall);
  return RAMME_FOERSTE + (n - 1) * BOKS_PITCH + BOKS_H + RAMME_BUNN;
}

/** Hvilken objekttype peker feltet på? `ref` først, ellers `type` når den
 *  treffer et objektnavn. */
function refTil(f: StrukturFelt, navn: Set<string>): string | undefined {
  if (f.ref && navn.has(f.ref)) return f.ref;
  if (f.type && navn.has(f.type)) return f.type;
  return undefined;
}

/** Bredde-først fra rotobjektet: hver type havner i kolonnen etter den som
 *  først refererer den. Typer ingen refererer legges i en egen kolonne bakerst. */
function beregnDybder(objekter: StrukturObjekt[], rot: StrukturObjekt): Map<string, number> {
  const navn = new Set(objekter.map((o) => o.navn));
  const etterNavn = new Map(objekter.map((o) => [o.navn, o]));
  const dybde = new Map<string, number>([[rot.navn, 0]]);
  let koe = [rot];
  while (koe.length) {
    const neste: StrukturObjekt[] = [];
    for (const o of koe) {
      const d = dybde.get(o.navn) ?? 0;
      for (const f of o.felt ?? []) {
        const mål = refTil(f, navn);
        if (!mål || dybde.has(mål)) continue;
        dybde.set(mål, d + 1);
        const m = etterNavn.get(mål);
        if (m) neste.push(m);
      }
    }
    koe = neste;
  }
  const maks = Math.max(0, ...dybde.values());
  objekter.forEach((o) => {
    if (!dybde.has(o.navn)) dybde.set(o.navn, maks + 1);
  });
  return dybde;
}

/* ----------------------------- generator ------------------------------ */

export function strukturTilXsdSvg(struktur: Struktur, meta: EksportMeta): string {
  const objekter = (Array.isArray(struktur) ? struktur : []).filter((o) => o && o.navn);
  if (!objekter.length) return '';

  const navnSett = new Set(objekter.map((o) => o.navn));
  const rot =
    objekter.find((o) => o.rotElement) ??
    (meta.root ? objekter.find((o) => o.navn === meta.root) : undefined) ??
    objekter[0];
  const dybde = beregnDybder(objekter, rot);

  // Grupper per kolonne, i strukturens rekkefølge. Rotobjektet først i sin.
  const kolonner = new Map<number, StrukturObjekt[]>();
  objekter.forEach((o) => {
    const d = dybde.get(o.navn) ?? 0;
    if (!kolonner.has(d)) kolonner.set(d, []);
    kolonner.get(d)!.push(o);
  });
  const kolIndekser = [...kolonner.keys()].sort((a, b) => a - b);

  // Rotelementets boks tegnes helt til venstre, og bredden følger navnet –
  // ellers renner lange rotelementnavn ut av boksen.
  const rotEtikett = rot.rotElement || rot.navn;
  const rotB = Math.max(ROT_MIN_B, Math.ceil(16 + sansBredde(rotEtikett, FS_ETIKETT) + 12));

  // Kolonne 0 starter etter rotelementets boks.
  const grupper: Gruppe[] = [];
  let x = MARG + rotB + 66;
  for (const k of kolIndekser) {
    const iKol = kolonner.get(k)!;
    let y = INNHOLD_TOPP;
    let bredest = 0;
    for (const obj of iKol) {
      const boksB = boksBredde(obj);
      const b = boksB + RAMME_VENSTRE + RAMME_BUNN;
      const h = rammeHoeyde((obj.felt ?? []).length);
      grupper.push({ obj, dybde: k, x, y, b, h, boksB });
      bredest = Math.max(bredest, b);
      y += h + GRUPPE_GAP;
    }
    x += bredest + KOL_GAP;
  }

  const etterNavn = new Map(grupper.map((g) => [g.obj.navn, g]));
  const ryggX = (g: Gruppe) => g.x + RAMME_VENSTRE - RYGG_INN;
  const boksX = (g: Gruppe) => g.x + RAMME_VENSTRE;
  const boksY = (g: Gruppe, i: number) => g.y + RAMME_FOERSTE + i * BOKS_PITCH;
  const senterY = (g: Gruppe) => g.y + g.h / 2;
  const pillX = (g: Gruppe) => g.x + PILL_INN;

  /* --- piler (tegnes først, så de havner bak rammene) --- */
  const piler: string[] = [];
  for (const g of grupper) {
    (g.obj.felt ?? []).forEach((f, i) => {
      const målNavn = refTil(f, navnSett);
      if (!målNavn) return;
      const mål = etterNavn.get(målNavn);
      if (!mål || mål === g) return;
      const fra = { x: boksX(g) + g.boksB, y: boksY(g, i) + BOKS_H / 2 };
      const framover = mål.dybde > g.dybde;
      if (framover) {
        piler.push(pil(fra.x, fra.y, pillX(mål) - 6, senterY(mål), PIL_FRAM, false, false));
      } else {
        // Tilbakepil: kommer inn ovenfra på målets kompositor.
        piler.push(
          pil(fra.x, fra.y, pillX(mål) + PILL_B / 2, mål.y - 6, PIL_TILBAKE, true, true),
        );
      }
    });
  }

  /* --- lerretets størrelse --- */
  const hoeyreKant = grupper.reduce((m, g) => Math.max(m, g.x + g.b), 0);
  const bunn = grupper.reduce((m, g) => Math.max(m, g.y + g.h), 0);
  const bredde = Math.ceil(hoeyreKant + MARG);
  const hoeyde = Math.ceil(bunn + MARG);

  const deler: string[] = [];
  deler.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bredde}" height="${hoeyde}" ` +
      `viewBox="0 0 ${bredde} ${hoeyde}">`,
  );
  deler.push(`<rect width="${bredde}" height="${hoeyde}" fill="${BG}"/>`);
  for (let gx = 0; gx <= bredde; gx += RUTE) deler.push(linje(gx, 0, gx, hoeyde, RUTE_FARGE));
  for (let gy = 0; gy <= hoeyde; gy += RUTE) deler.push(linje(0, gy, bredde, gy, RUTE_FARGE));

  /* --- tittelblokk --- */
  deler.push(tekst(MARG, 52, tittelLinje(meta), FS_TITTEL, 'bold', BLEKK));
  const under = metaLinje(meta);
  if (under) deler.push(tekst(MARG, 76, under, FS_META, 'normal', DEMPET));
  deler.push(tekst(MARG, 96, FORKLARING_1, FS_FORKLARING, 'normal', DEMPET));
  deler.push(tekst(MARG, 114, FORKLARING_2, FS_FORKLARING, 'normal', DEMPET));

  deler.push(...piler);

  /* --- rotelementet ytterst til venstre --- */
  const rotGruppe = etterNavn.get(rot.navn);
  if (rotGruppe) {
    const cy = senterY(rotGruppe);
    const y = cy - ROT_H / 2;
    deler.push(boksMedSkygge(MARG, y, rotB, ROT_H, 2, ROT_FYLL, ROT_KANT, false));
    deler.push(elementIkon(MARG + 5, y + 3));
    deler.push(tekst(MARG + 16, y + 17.5, rotEtikett, FS_ETIKETT, 'bold', BLEKK));
    deler.push(linje(MARG + rotB, cy, pillX(rotGruppe), cy));
  }

  /* --- rammer med elementbokser --- */
  for (const g of grupper) {
    const felt = g.obj.felt ?? [];
    deler.push(
      `<rect x="${r1(g.x)}" y="${r1(g.y)}" width="${r1(g.b)}" height="${r1(g.h)}" rx="2" ` +
        `fill="${BG}" fill-opacity=".8" stroke="${RAMME_KANT}" stroke-width="1" stroke-dasharray="5 3"/>`,
    );
    deler.push(tekst(g.x + 12, g.y + 15, g.obj.navn, FS_ETIKETT, 'bold', RAMME_TEKST));

    const cy = senterY(g);
    deler.push(kompositor(pillX(g), cy));
    deler.push(linje(pillX(g) + PILL_B, cy, ryggX(g), cy));

    if (felt.length) {
      const foerste = boksY(g, 0) + BOKS_H / 2;
      const siste = boksY(g, felt.length - 1) + BOKS_H / 2;
      // Ryggraden går fra første til siste boks; med bare ett felt blir den et
      // punkt, og da holder det med den vannrette streken.
      if (felt.length > 1) deler.push(linje(ryggX(g), foerste, ryggX(g), siste));
    }

    felt.forEach((f, i) => {
      const by = boksY(g, i);
      const cyBoks = by + BOKS_H / 2;
      deler.push(linje(ryggX(g), cyBoks, boksX(g), cyBoks));
      deler.push(
        boksMedSkygge(
          boksX(g),
          by,
          g.boksB,
          BOKS_H,
          2,
          BOKS_FYLL,
          BOKS_KANT,
          erValgfritt(f),
        ),
      );
      deler.push(elementIkon(boksX(g) + 5, by + 3));
      deler.push(tekst(boksX(g) + 16, by + 15.5, etikett(f), FS_ETIKETT, 'bold', BLEKK));
      if (erKodeliste(f)) {
        deler.push(
          `<circle cx="${r1(boksX(g) + g.boksB - 10)}" cy="${r1(cyBoks)}" r="3.4" fill="${KODE_PRIKK}"/>`,
        );
      }
      if (erUbegrenset(f)) {
        deler.push(tekst(boksX(g) + g.boksB + 6, cyBoks + 3.5, '0..∞', FS_KARD, 'normal', RAMME_TEKST));
      }
    });
  }

  deler.push('</svg>');
  return deler.join('');
}
