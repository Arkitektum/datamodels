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
  a: ['href', 'target', 'rel'],
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
    const inner = Array.from(el.childNodes).map(clean).join('');
    if (DROP_TAGS.has(tag)) return ''; // fjern hele elementet og innholdet
    if (!(tag in ALLOWED_TAGS)) return inner; // ukjent tag: pakk ut, behold tekst

    let attrs = '';
    for (const name of ALLOWED_TAGS[tag]) {
      const v = el.getAttribute(name);
      if (v == null) continue;
      if (name === 'href' && /^\s*(javascript|data|vbscript):/i.test(v)) continue;
      attrs += ` ${name}="${escAttr(v)}"`;
    }
    if (tag === 'a' && attrs.includes('href=')) attrs += ' rel="noopener noreferrer"';
    if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
    return `<${tag}${attrs}>${inner}</${tag}>`;
  };

  return Array.from(doc.body.childNodes).map(clean).join('');
}
