// Tekstlige eksportformer av en datamodell: HTML for innliming i Confluence,
// og Markdown.
//
// Confluence-HTML-en er bevisst «naken»: bare h1/h2/h3, p, table, code og
// strong. Confluence stripper stort sett stiler ved innliming, men beholder
// tabellstrukturen – så resultatet blir native Confluence-tabeller redaktøren
// kan redigere videre, ikke et innlimt skjermbilde.
import type { Struktur, StrukturFelt } from './struktur';
import { grupper, metaLinje, tittelLinje, iDag, type EksportMeta } from './eksport';
import { esc } from './svgTekst';

const KOLONNER = ['Felt', 'Type', 'Kardinalitet', 'Påkrevd', 'Beskrivelse'];

function paakrevd(f: StrukturFelt): string {
  // `req` er det eksplisitte merket i portalen. Uten det leser vi kardinaliteten:
  // starter den på 0 er feltet valgfritt, ellers påkrevd.
  if (f.req) return 'Ja';
  if (f.kardinalitet) return /^0/.test(f.kardinalitet.trim()) ? 'Nei' : 'Ja';
  return '';
}

function feltNavn(f: StrukturFelt): string {
  return (f.attributt ? '@' : '') + f.navn;
}

function merker(f: StrukturFelt): string[] {
  const m: string[] = [];
  if (f.list) m.push('liste');
  if (f.nillable) m.push('nillable');
  if (f.fixed) m.push(`fast verdi: ${f.fixed}`);
  return m;
}

/* ------------------------------- HTML -------------------------------- */

export function tilConfluenceHtml(struktur: Struktur, meta: EksportMeta): string {
  const dato = meta.dato || iDag();
  const ut: string[] = [];

  ut.push(`<h1>${esc(tittelLinje(meta))}</h1>`);
  const undertittel = metaLinje(meta);
  if (undertittel) ut.push(`<p><code>${esc(undertittel)}</code></p>`);
  if (meta.lede) ut.push(`<p>${esc(meta.lede)}</p>`);
  ut.push(
    `<p><em>${esc(
      [meta.status ? `Status: ${meta.status}` : '', `Eksportert ${dato} fra Datamodell-portalen`]
        .filter(Boolean)
        .join(' · '),
    )}</em></p>`,
  );

  const grupperte = grupper(struktur);
  if (!grupperte.length) {
    ut.push('<p>Datamodellen er ikke modellert ennå.</p>');
    return ut.join('\n');
  }

  // Innholdsfortegnelse – praktisk når siden blir lang i Confluence.
  ut.push('<h2>Objekttyper</h2>');
  ut.push('<ul>');
  grupperte.forEach((g) => {
    const navn = g.objekter.map((o) => `<code>${esc(o.navn)}</code>`).join(', ');
    ut.push(`<li><strong>${esc(g.gruppe)}:</strong> ${navn}</li>`);
  });
  ut.push('</ul>');

  grupperte.forEach((g) => {
    ut.push(`<h2>${esc(g.gruppe)}</h2>`);
    g.objekter.forEach((obj) => {
      ut.push(`<h3><code>${esc(obj.navn)}</code>${obj.note ? ' – ' + esc(obj.note) : ''}</h3>`);
      if (obj.rotElement) {
        ut.push(`<p><em>Rotelement: <code>${esc(obj.rotElement)}</code></em></p>`);
      }
      if (obj.beskrivelse) ut.push(`<p>${esc(obj.beskrivelse)}</p>`);

      const felt = obj.felt ?? [];
      if (!felt.length) {
        ut.push('<p><em>Ingen felt definert.</em></p>');
        return;
      }
      ut.push('<table><thead><tr>');
      KOLONNER.forEach((k) => ut.push(`<th>${k}</th>`));
      ut.push('</tr></thead><tbody>');
      felt.forEach((f) => {
        const ekstra = merker(f);
        const besk = [esc(f.beskrivelse), ekstra.length ? `(${esc(ekstra.join(', '))})` : '']
          .filter(Boolean)
          .join(' ');
        ut.push(
          '<tr>' +
            `<td><code>${esc(feltNavn(f))}</code></td>` +
            `<td><code>${esc(f.type || 'string')}</code></td>` +
            `<td>${esc(f.kardinalitet ?? '')}</td>` +
            `<td>${paakrevd(f)}</td>` +
            `<td>${besk}</td>` +
            '</tr>',
        );
      });
      ut.push('</tbody></table>');
    });
  });

  return ut.join('\n');
}

/** Komplett, frittstående HTML-dokument – til nedlasting og utskrift. */
export function tilHtmlDokument(struktur: Struktur, meta: EksportMeta): string {
  return [
    '<!doctype html>',
    '<html lang="no"><head><meta charset="utf-8">',
    `<title>${esc(tittelLinje(meta))}</title>`,
    '<style>',
    'body{font-family:Tahoma,Verdana,Arial,sans-serif;font-size:13px;color:#0d1a26;max-width:1100px;margin:32px auto;padding:0 24px;line-height:1.55}',
    'h1{font-size:1.8rem;margin:0 0 4px}h2{font-size:1.2rem;margin:28px 0 8px;border-bottom:1px solid #d5d5d5;padding-bottom:4px}',
    'h3{font-size:1rem;margin:20px 0 6px}code{font-family:Consolas,"DejaVu Sans Mono",monospace;font-size:0.92em}',
    'table{border-collapse:collapse;width:100%;margin:8px 0 16px}',
    'th,td{border:1px solid #c8ccd0;padding:5px 8px;text-align:left;vertical-align:top}',
    'th{background:#eef3f9;font-weight:700}tr:nth-child(even) td{background:#fafbfc}',
    '@media print{body{margin:0;max-width:none}h2,h3{break-after:avoid}table{break-inside:auto}tr{break-inside:avoid}}',
    '</style></head><body>',
    tilConfluenceHtml(struktur, meta),
    '</body></html>',
  ].join('\n');
}

/* ------------------------------ Markdown ------------------------------ */

// `|` ville brutt tabellcellene i Markdown.
function mdCelle(s: string | undefined): string {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function tilMarkdown(struktur: Struktur, meta: EksportMeta): string {
  const dato = meta.dato || iDag();
  const ut: string[] = [];

  ut.push(`# ${tittelLinje(meta)}`, '');
  const undertittel = metaLinje(meta);
  if (undertittel) ut.push('`' + undertittel + '`', '');
  if (meta.lede) ut.push(meta.lede, '');
  ut.push(
    '_' +
      [meta.status ? `Status: ${meta.status}` : '', `Eksportert ${dato} fra Datamodell-portalen`]
        .filter(Boolean)
        .join(' · ') +
      '_',
    '',
  );

  const grupperte = grupper(struktur);
  if (!grupperte.length) {
    ut.push('Datamodellen er ikke modellert ennå.', '');
    return ut.join('\n');
  }

  grupperte.forEach((g) => {
    ut.push(`## ${g.gruppe}`, '');
    g.objekter.forEach((obj) => {
      ut.push(`### \`${obj.navn}\`${obj.note ? ' – ' + obj.note : ''}`, '');
      if (obj.rotElement) ut.push(`_Rotelement: \`${obj.rotElement}\`_`, '');
      if (obj.beskrivelse) ut.push(obj.beskrivelse, '');

      const felt = obj.felt ?? [];
      if (!felt.length) {
        ut.push('_Ingen felt definert._', '');
        return;
      }
      ut.push(`| ${KOLONNER.join(' | ')} |`);
      ut.push(`| ${KOLONNER.map(() => '---').join(' | ')} |`);
      felt.forEach((f) => {
        const ekstra = merker(f);
        const besk = [mdCelle(f.beskrivelse), ekstra.length ? `(${ekstra.join(', ')})` : '']
          .filter(Boolean)
          .join(' ');
        ut.push(
          `| \`${mdCelle(feltNavn(f))}\` | \`${mdCelle(f.type || 'string')}\` | ` +
            `${mdCelle(f.kardinalitet)} | ${paakrevd(f)} | ${besk} |`,
        );
      });
      ut.push('');
    });
  });

  return ut.join('\n');
}
