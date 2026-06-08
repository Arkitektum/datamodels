// Pragmatisk XSD → struktur-parser (kjører i nettleseren med DOMParser).
// Håndterer navngitte complexTypes + deres felt (sequence/all/choice, også under
// complexContent/extension), kardinalitet (minOccurs/maxOccurs), og dokumentasjon
// fra xs:annotation/xs:documentation. Dekker de vanlige Dibk-XSD-mønstrene; ikke
// en full XSD-implementasjon (løser ikke imports/typearv på tvers av filer).
import type { Struktur, StrukturObjekt, StrukturFelt } from './struktur';

const XS = 'http://www.w3.org/2001/XMLSchema';

function localName(tag: string): string {
  const i = tag.indexOf(':');
  return i >= 0 ? tag.slice(i + 1) : tag;
}
function stripPrefix(v: string | null): string {
  if (!v) return '';
  const i = v.indexOf(':');
  return i >= 0 ? v.slice(i + 1) : v;
}

function documentationOf(el: Element): string {
  for (const child of Array.from(el.children)) {
    if (localName(child.tagName) === 'annotation') {
      for (const d of Array.from(child.children)) {
        if (localName(d.tagName) === 'documentation') {
          return (d.textContent || '').trim().replace(/\s+/g, ' ');
        }
      }
    }
  }
  return '';
}

function cardinality(el: Element): string {
  const min = el.getAttribute('minOccurs');
  const max = el.getAttribute('maxOccurs');
  const lo = min == null ? '1' : min;
  const hi = max == null ? '1' : max === 'unbounded' ? 'n' : max;
  return `${lo}..${hi}`;
}

function feltType(el: Element): string {
  const t = el.getAttribute('type');
  if (t) return stripPrefix(t);
  const ref = el.getAttribute('ref');
  if (ref) return stripPrefix(ref);
  for (const c of Array.from(el.children)) {
    const ln = localName(c.tagName);
    if (ln === 'complexType') return '(objekt)';
    if (ln === 'simpleType') return '(verdi)';
  }
  return '';
}

function feltNavn(el: Element): string {
  return el.getAttribute('name') || stripPrefix(el.getAttribute('ref')) || '(uten navn)';
}

// Samler felt på ett nivå: går inn i particles (sequence/all/choice/group/
// complexContent/extension/restriction), men IKKE inn i et elements eget subtre
// (så nestede inline-complexType-felt ikke blandes inn).
function collectFelt(node: Element, ut: StrukturFelt[]): void {
  for (const child of Array.from(node.children)) {
    const ln = localName(child.tagName);
    if (ln === 'element') {
      ut.push({
        navn: feltNavn(child),
        type: feltType(child),
        kardinalitet: cardinality(child),
        beskrivelse: documentationOf(child),
      });
    } else if (
      ln === 'sequence' ||
      ln === 'all' ||
      ln === 'choice' ||
      ln === 'group' ||
      ln === 'complexContent' ||
      ln === 'simpleContent' ||
      ln === 'extension' ||
      ln === 'restriction'
    ) {
      collectFelt(child, ut);
    }
  }
}

function baseNote(ct: Element): string {
  const ext = ct.getElementsByTagNameNS(XS, 'extension')[0];
  if (ext && ext.getAttribute('base')) return `Utvider ${stripPrefix(ext.getAttribute('base'))}. `;
  return '';
}

export function parseXsd(text: string): Struktur {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Ugyldig XML/XSD – kunne ikke tolke fila.');
  }
  const objekter: StrukturObjekt[] = [];

  // 1) Navngitte complexTypes → ett objekt hver.
  const complexTypes = Array.from(doc.getElementsByTagNameNS(XS, 'complexType'));
  for (const ct of complexTypes) {
    const navn = ct.getAttribute('name');
    if (!navn) continue; // anonyme (inline) hopper vi over her
    const felt: StrukturFelt[] = [];
    collectFelt(ct, felt);
    objekter.push({
      navn,
      beskrivelse: (baseNote(ct) + documentationOf(ct)).trim(),
      felt,
    });
  }

  // 2) Toppnivå-elementer med inline complexType → eget objekt.
  const root = doc.documentElement;
  for (const el of Array.from(root.children)) {
    if (localName(el.tagName) !== 'element') continue;
    const inline = Array.from(el.children).find((c) => localName(c.tagName) === 'complexType');
    if (!inline) continue;
    const felt: StrukturFelt[] = [];
    collectFelt(inline as Element, felt);
    objekter.push({
      navn: el.getAttribute('name') || '(rotelement)',
      beskrivelse: documentationOf(el),
      felt,
    });
  }

  if (objekter.length === 0) {
    throw new Error('Fant ingen complexType/elementer i XSD-en.');
  }
  return objekter;
}
