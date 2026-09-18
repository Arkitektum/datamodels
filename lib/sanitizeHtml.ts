// Liten allowlist-sanitizer for rik-tekst fra dokument-editoren. Hindrer lagret
// XSS (f.eks. <img onerror>, <script>, javascript:-lenker) når delt HTML vises
// hos andre brukere. Kjører i nettleseren (DOMParser); på server returneres
// input uendret (ingen utrygg data prerendres).
const ALLOWED_TAGS: Record<string, string[]> = {
  p: [],
  br: [],
  b: [],
  strong: [],
  i: [],
  em: [],
  u: [],
  h1: [],
  h2: [],
  h3: [],
  h4: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  div: [],
  span: [],
  // `rel` står bevisst IKKE her: den settes alltid av oss under, slik at en
  // lagret rel="" ikke kan slå ut noopener-vernet.
  a: ['href', 'target'],
};
const DROP_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'svg', 'math']);
const VOID_TAGS = new Set(['br']);

const escText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');

  const clean = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) return escText(node.nodeValue || '');
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    if (DROP_TAGS.has(tag)) return ''; // fjern hele elementet og innholdet
    const inner = Array.from(el.childNodes).map(clean).join('');
    // hasOwnProperty, ikke `in`: `in` går opp prototypekjeden, så en tag som
    // <constructor> eller <tostring> ville blitt sett på som tillatt og gitt en
    // funksjon i stedet for en attributt-liste (TypeError → hele visningen
    // krasjer for alle som åpner dokumentet).
    if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tag)) return inner;

    let attrs = '';
    let harHref = false;
    for (const name of ALLOWED_TAGS[tag]) {
      const v = el.getAttribute(name);
      if (v == null) continue;
      if (name === 'href') {
        if (/^\s*(javascript|data|vbscript):/i.test(v)) continue;
        harHref = true;
      }
      attrs += ` ${name}="${escAttr(v)}"`;
    }
    // Lenker får alltid vårt eget rel – aldri brukerens. Kun når en href
    // faktisk ble sluppet gjennom; en forkastet javascript:-lenke er ikke
    // lenger en lenke og skal ikke ha rel.
    if (tag === 'a' && harHref) attrs += ' rel="noopener noreferrer"';
    if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
    return `<${tag}${attrs}>${inner}</${tag}>`;
  };

  return Array.from(doc.body.childNodes).map(clean).join('');
}
