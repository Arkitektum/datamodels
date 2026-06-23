// Pragmatisk XSD → struktur-parser (kjører i nettleseren med DOMParser).
// Håndterer navngitte complexTypes + deres felt (sequence/all/choice, også under
// complexContent/extension), kardinalitet (minOccurs/maxOccurs), og dokumentasjon
// fra xs:annotation/xs:documentation. Dekker de vanlige Dibk-XSD-mønstrene; ikke
// en full XSD-implementasjon (løser ikke imports/typearv på tvers av filer).
import type { Struktur, StrukturObjekt, StrukturFelt } from './struktur';

/** Opplastet XSD lagret ordrett (vises uendret i XSD-fanen). */
export interface XsdKilde {
  src: string;
  file: string;
}

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
        ...(child.getAttribute('nillable') === 'true' ? { nillable: true } : {}),
      });
    } else if (ln === 'attribute') {
      const fixed = child.getAttribute('fixed');
      ut.push({
        navn: feltNavn(child),
        type: feltType(child),
        kardinalitet: child.getAttribute('use') === 'required' ? '1..1' : '0..1',
        beskrivelse: documentationOf(child),
        attributt: true,
        ...(fixed != null ? { fixed } : {}),
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

// Finner partikkelen (all/sequence/choice) feltene ligger i – også når den er
// pakket inn i complexContent/extension/restriction.
function particleOf(el: Element): 'sequence' | 'all' | 'choice' | undefined {
  for (const c of Array.from(el.children)) {
    const ln = localName(c.tagName);
    if (ln === 'all' || ln === 'sequence' || ln === 'choice') return ln;
    if (ln === 'complexContent' || ln === 'simpleContent' || ln === 'extension' || ln === 'restriction') {
      const inner = particleOf(c as Element);
      if (inner) return inner;
    }
  }
  return undefined;
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
    const partikkel = particleOf(ct);
    objekter.push({
      navn,
      beskrivelse: (baseNote(ct) + documentationOf(ct)).trim(),
      felt,
      ...(partikkel ? { partikkel } : {}),
    });
  }

  // 2) Toppnivå-elementer.
  //    a) med inline complexType → eget objekt (og marker som rotelement).
  //    b) med type-referanse til en navngitt complexType → marker den typen som rot.
  const root = doc.documentElement;
  for (const el of Array.from(root.children)) {
    if (localName(el.tagName) !== 'element') continue;
    const navn = el.getAttribute('name') || '(rotelement)';
    const inline = Array.from(el.children).find((c) => localName(c.tagName) === 'complexType');
    if (inline) {
      const felt: StrukturFelt[] = [];
      collectFelt(inline as Element, felt);
      const partikkel = particleOf(inline as Element);
      objekter.push({
        navn,
        beskrivelse: documentationOf(el),
        felt,
        rotElement: navn,
        ...(partikkel ? { partikkel } : {}),
      });
      continue;
    }
    const typeRef = stripPrefix(el.getAttribute('type'));
    const mål = typeRef && objekter.find((o) => o.navn === typeRef);
    if (mål) mål.rotElement = navn;
  }

  if (objekter.length === 0) {
    throw new Error('Fant ingen complexType/elementer i XSD-en.');
  }

  // Bevar skjemaets targetNamespace på rot-objektet (eller første objekt).
  const tns = root.getAttribute('targetNamespace');
  if (tns) {
    const rotObj = objekter.find((o) => o.rotElement) ?? objekter[0];
    rotObj.targetNamespace = tns;
  }

  return objekter;
}

// ── XSD-eksport (struktur → XSD-tekst) ───────────────────────────────────────
// Motstykket til parseXsd: skriver hvert objekt som en navngitt xs:complexType
// med en xs:sequence av xs:element, etterfulgt av xs:attribute. Bevarer type,
// kardinalitet, beskrivelser, enums (kodelister) og rotelementer.

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Kjente XSD-innebygde typer som skrives med xs:-prefiks; andre antas å være
// egendefinerte typer (andre objekter) og skrives uten prefiks.
const XS_BUILTINS = new Set([
  'string', 'boolean', 'decimal', 'float', 'double', 'duration', 'dateTime',
  'time', 'date', 'gYearMonth', 'gYear', 'gMonthDay', 'gDay', 'gMonth',
  'hexBinary', 'base64Binary', 'anyURI', 'QName', 'NOTATION', 'normalizedString',
  'token', 'language', 'NMTOKEN', 'NMTOKENS', 'Name', 'NCName', 'ID', 'IDREF',
  'IDREFS', 'ENTITY', 'ENTITIES', 'integer', 'nonPositiveInteger',
  'negativeInteger', 'long', 'int', 'short', 'byte', 'nonNegativeInteger',
  'unsignedLong', 'unsignedInt', 'unsignedShort', 'unsignedByte',
  'positiveInteger', 'anyType',
]);

// «1..n», «0..1», «1» osv. → { minOccurs?, maxOccurs? } – utelater standardverdier (1/1).
function kardinalitetAttrs(kard: string | undefined): string {
  if (!kard) return '';
  const m = kard.split('..');
  const lo = (m[0] || '').trim();
  const hi = (m[1] ?? m[0] ?? '').trim();
  let out = '';
  if (lo && lo !== '1') out += ` minOccurs="${xmlEscape(lo)}"`;
  if (hi && hi !== '1') {
    out += ` maxOccurs="${hi === 'n' || hi === '*' ? 'unbounded' : xmlEscape(hi)}"`;
  }
  return out;
}

function annotation(beskrivelse: string, indent: string): string {
  const b = beskrivelse.trim();
  if (!b) return '';
  return (
    `${indent}<xs:annotation>\n` +
    `${indent}  <xs:documentation>${xmlEscape(b)}</xs:documentation>\n` +
    `${indent}</xs:annotation>\n`
  );
}

function prefixedType(type: string): string {
  const local = stripPrefix(type);
  return XS_BUILTINS.has(local) ? `xs:${local}` : local;
}

function typeAttr(type: string): string {
  const t = (type || '').trim();
  if (!t || t === '(objekt)' || t === '(verdi)') return '';
  return ` type="${xmlEscape(prefixedType(t))}"`;
}

function writeElement(f: StrukturFelt, lines: string[]): void {
  const navn = (f.navn || 'felt').trim() || 'felt';
  const nil = f.nillable ? ' nillable="true"' : '';
  const attrs = `name="${xmlEscape(navn)}"${typeAttr(f.type)}${nil}${kardinalitetAttrs(f.kardinalitet)}`;
  const ann = annotation(f.beskrivelse, '        ');
  if (!ann) {
    lines.push(`      <xs:element ${attrs} />`);
    return;
  }
  lines.push(`      <xs:element ${attrs}>`);
  lines.push(ann.replace(/\n$/, ''));
  lines.push('      </xs:element>');
}

function writeAttribute(f: StrukturFelt, lines: string[]): void {
  const navn = (f.navn || 'attr').trim() || 'attr';
  // «1..1» → use="required"; alt annet er valgfritt (utelates).
  const use = (f.kardinalitet ?? '').split('..')[0].trim() === '1' ? ' use="required"' : '';
  const fixed = f.fixed != null ? ` fixed="${xmlEscape(f.fixed)}"` : '';
  const attrs = `name="${xmlEscape(navn)}"${typeAttr(f.type)}${use}${fixed}`;
  const ann = annotation(f.beskrivelse, '        ');
  if (!ann) {
    lines.push(`    <xs:attribute ${attrs} />`);
    return;
  }
  lines.push(`    <xs:attribute ${attrs}>`);
  lines.push(ann.replace(/\n$/, ''));
  lines.push('    </xs:attribute>');
}

export function serializeXsd(struktur: Struktur): string {
  const lines: string[] = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');

  // targetNamespace settes på rot-objektet ved import; finn første ikke-tomme.
  const tns = struktur.find((o) => o.targetNamespace?.trim())?.targetNamespace?.trim();
  if (tns) {
    const ns = xmlEscape(tns);
    lines.push(
      `<xs:schema xmlns:xs="${XS}" xmlns="${ns}" targetNamespace="${ns}" elementFormDefault="qualified">`,
    );
  } else {
    lines.push(`<xs:schema xmlns:xs="${XS}" elementFormDefault="qualified">`);
  }

  // Rotelementer først – ett xs:element per objekt som er markert som rot.
  for (const obj of struktur) {
    if (!obj.rotElement) continue;
    const elNavn = obj.rotElement.trim();
    const typeNavn = (obj.navn || 'Objekt').trim() || 'Objekt';
    if (elNavn) {
      lines.push('');
      lines.push(`  <xs:element name="${xmlEscape(elNavn)}" type="${xmlEscape(typeNavn)}" />`);
    }
  }

  for (const obj of struktur) {
    const navn = (obj.navn || 'Objekt').trim() || 'Objekt';
    const elementer = obj.felt.filter((f) => !f.attributt);
    const attributter = obj.felt.filter((f) => f.attributt);
    const part = obj.partikkel ?? 'sequence';
    lines.push('');
    lines.push(`  <xs:complexType name="${xmlEscape(navn)}">`);
    const ann = annotation(obj.beskrivelse, '    ');
    if (ann) lines.push(ann.replace(/\n$/, ''));
    // En tom partikkel (xs:sequence/all/choice uten element) er ugyldig XSD; skriv
    // den bare når det finnes elementer. Et objekt med kun attributter – eller helt
    // tomt – blir da en gyldig complexType (evt. helt uten innhold).
    if (elementer.length) {
      lines.push(`    <xs:${part}>`);
      for (const f of elementer) writeElement(f, lines);
      lines.push(`    </xs:${part}>`);
    }
    for (const f of attributter) writeAttribute(f, lines);
    lines.push('  </xs:complexType>');
  }

  lines.push('');
  lines.push('</xs:schema>');
  return lines.join('\n');
}

// ── Gyldighet (NCName-navn) ──────────────────────────────────────────────────
// serializeXsd gir alltid VELFORMET XML, men XSD krever at element-, attributt-,
// type- og rotelementnavn er gyldige NCName: starter med bokstav/understrek, så
// bokstaver/sifre/«.»/«-»/«_» – ingen mellomrom, kolon eller ledende siffer.
const NCNAME_RE = /^[\p{L}_][\p{L}\p{N}._-]*$/u;

export function erGyldigNcName(navn: string): boolean {
  return NCNAME_RE.test(navn);
}

export interface XsdGyldighetsproblem {
  /** «Objekt» eller «Objekt.felt» – hvor problemet er. */
  sti: string;
  melding: string;
}

/** Finner navn i strukturen som ikke gir gyldig XSD (ugyldige NCName-navn).
 *  Tomme partikler håndteres allerede av serializeXsd, så de rapporteres ikke. */
export function xsdGyldighetsproblemer(struktur: Struktur): XsdGyldighetsproblem[] {
  const ut: XsdGyldighetsproblem[] = [];
  for (const o of struktur) {
    const objNavn = (o.navn || '').trim();
    const visObj = objNavn || '(uten navn)';
    if (!erGyldigNcName(objNavn)) {
      ut.push({ sti: visObj, melding: `Objektnavnet «${visObj}» er ikke et gyldig XSD-navn.` });
    }
    if (o.rotElement != null && !erGyldigNcName(o.rotElement.trim())) {
      ut.push({ sti: visObj, melding: `Rotelementet «${o.rotElement}» er ikke et gyldig XSD-navn.` });
    }
    for (const f of o.felt) {
      const feltNavn = (f.navn || '').trim();
      if (!erGyldigNcName(feltNavn)) {
        ut.push({
          sti: `${visObj}.${feltNavn || '(uten navn)'}`,
          melding: `${f.attributt ? 'Attributtnavnet' : 'Feltnavnet'} «${feltNavn || '(uten navn)'}» er ikke et gyldig XSD-navn.`,
        });
      }
    }
  }
  return ut;
}
