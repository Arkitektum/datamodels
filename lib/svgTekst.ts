// Felles hjelpere for SVG-generatorene (umlSvg.ts, xsdDiagramSvg.ts).
//
// SVG-ene lages uten nettleser (ingen canvas/DOM), så tekstbredde må anslås.
// To skrifter er i bruk, med hver sin metode:
//
//   * monospace (UML-kortene) – alle tegn har samme bredde, så en enkel faktor
//     ganget med font-størrelsen treffer eksakt.
//   * Tahoma/sans (XSD-diagrammet) – proporsjonal, så vi bruker en liten
//     bredde-tabell per tegn. Anslaget er ikke pikselnøyaktig, men holder
//     bokser og rammer romslige nok til at teksten aldri renner over.

/** Bredde per tegn i monospace, som andel av font-størrelsen.
 *  Målt mot DejaVu Sans Mono (0.6069 em) – samme verdi Consolas lander på. */
const MONO_EM = 0.607;

export function monoBredde(tekst: string, fontStr: number): number {
  return tekst.length * fontStr * MONO_EM;
}

// Relative tegnbredder for Tahoma bold, som andel av font-størrelsen. Tegn som
// ikke står i tabellen faller tilbake på STD_EM.
const STD_EM = 0.62;
const SANS_BREDDE: Record<string, number> = {
  ' ': 0.33, '.': 0.33, ',': 0.33, ':': 0.36, ';': 0.36, '-': 0.4, '_': 0.55,
  '(': 0.4, ')': 0.4, '[': 0.4, ']': 0.4, '/': 0.45, '|': 0.35, '@': 0.95,
  i: 0.31, j: 0.34, l: 0.31, t: 0.43, f: 0.4, r: 0.47, I: 0.37, J: 0.5,
  a: 0.62, b: 0.65, c: 0.55, d: 0.65, e: 0.62, g: 0.65, h: 0.65, k: 0.62,
  n: 0.65, o: 0.65, p: 0.65, q: 0.65, s: 0.55, u: 0.65, v: 0.6, x: 0.6,
  y: 0.6, z: 0.55, m: 0.97, w: 0.86,
  A: 0.72, B: 0.7, C: 0.72, D: 0.76, E: 0.66, F: 0.62, G: 0.78, H: 0.77,
  K: 0.72, L: 0.6, M: 0.87, N: 0.77, O: 0.8, P: 0.67, Q: 0.8, R: 0.72,
  S: 0.68, T: 0.65, U: 0.75, V: 0.72, W: 1.06, X: 0.7, Y: 0.66, Z: 0.66,
  '0': 0.64, '1': 0.64, '2': 0.64, '3': 0.64, '4': 0.64, '5': 0.64,
  '6': 0.64, '7': 0.64, '8': 0.64, '9': 0.64,
  æ: 0.95, ø: 0.65, å: 0.62, Æ: 1.05, Ø: 0.8, Å: 0.72,
};

export function sansBredde(tekst: string, fontStr: number): number {
  let sum = 0;
  for (const tegn of tekst) sum += SANS_BREDDE[tegn] ?? STD_EM;
  return sum * fontStr;
}

/** Escaper tekst som skal stå som innhold i et SVG-element. */
export function esc(s: string | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Escaper tekst som skal stå i et attributt (f.eks. <title>/aria-label). */
export function escAttr(s: string | undefined | null): string {
  return esc(s).replace(/"/g, '&quot;');
}

/** Runder til én desimal – holder SVG-kilden lesbar og filen liten. */
export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Trygt filnavn-fragment fra et modellnavn («Høring og offentlig ettersyn»
 *  → «hoering-og-offentlig-ettersyn»). */
export function filnavnDel(navn: string): string {
  return (navn || 'datamodell')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'datamodell';
}
