'use client';

// Nedlasting og utklippstavle for eksportene. Alt skjer i nettleseren – ingen
// server er involvert, så dette fungerer også i den statiske Pages-versjonen.

export function lastNedFil(innhold: string, filnavn: string, mime: string): void {
  const blob = new Blob([innhold], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filnavn;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function kopierTekst(tekst: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(tekst);
    return true;
  } catch {
    return false;
  }
}

/**
 * Legger HTML på utklippstavla som ekte `text/html`, slik at Confluence limer
 * inn formaterte tabeller i stedet for rå markup. Nettlesere uten
 * `ClipboardItem` (eller uten tillatelse) faller tilbake til ren tekst – da
 * havner kildekoden på utklippstavla, som fortsatt er brukbar i en
 * kodeblokk/markup-makro.
 */
export async function kopierHtml(html: string): Promise<'html' | 'tekst' | 'feilet'> {
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        }),
      ]);
      return 'html';
    } catch {
      // faller gjennom til ren tekst
    }
  }
  return (await kopierTekst(html)) ? 'tekst' : 'feilet';
}
