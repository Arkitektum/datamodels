import { describe, expect, it } from 'vitest';
import type { Struktur } from '@/lib/struktur';
import { byggMeta, grupper, feltSignatur, metaLinje, tittelLinje } from '@/lib/eksport';
import { tilConfluenceHtml, tilMarkdown, tilHtmlDokument } from '@/lib/eksportDok';
import { strukturTilUmlSvg } from '@/lib/umlSvg';
import { strukturTilXsdSvg } from '@/lib/xsdDiagramSvg';
import { filnavnDel } from '@/lib/svgTekst';

const META = {
  navn: 'Høring og offentlig ettersyn',
  status: 'Publisert',
  dataFormatId: '11002',
  provider: 'DIBK',
  version: '2',
  root: 'RotType',
};

const STRUKTUR: Struktur = [
  {
    navn: 'RotType',
    beskrivelse: 'Konvolutten.',
    group: 'Konvolutt',
    rotElement: 'Hoering',
    targetNamespace: 'https://example.test/v2',
    felt: [
      { navn: 'part', type: 'PartType', kardinalitet: '1..*', beskrivelse: 'Parter.', ref: 'PartType', req: true, list: true },
      { navn: 'frist', type: 'dateTime', kardinalitet: '0..1', beskrivelse: 'Frist for <uttalelse>.' },
      { navn: 'dataFormatId', type: 'string', beskrivelse: 'Fast id.', attributt: true, fixed: '11002' },
    ],
  },
  {
    navn: 'PartType',
    beskrivelse: 'En part.',
    group: 'Parter og aktører',
    felt: [{ navn: 'navn', type: 'string', kardinalitet: '0..1', beskrivelse: 'Navn | med rør.' }],
  },
];

describe('eksport', () => {
  it('bygger tittel og metalinje', () => {
    expect(tittelLinje(META)).toBe('Høring og offentlig ettersyn / v2');
    expect(metaLinje(META)).toContain('dataFormatId 11002');
    expect(metaLinje({ navn: 'Uten metadata' })).toBe('');
  });

  it('henter namespace fra strukturen når modellen ikke har XSD', () => {
    expect(byggMeta({ navn: 'X' }, STRUKTUR).ns).toBe('https://example.test/v2');
    expect(byggMeta({ navn: 'X', ns: 'https://gitt/' }, STRUKTUR).ns).toBe('https://gitt/');
  });

  it('grupperer i kjent rekkefølge og hopper over tomme grupper', () => {
    const g = grupper(STRUKTUR);
    expect(g.map((x) => x.gruppe)).toEqual(['Konvolutt', 'Parter og aktører']);
    expect(g[0].objekter[0].navn).toBe('RotType');
  });

  it('bruker «Objekttyper» for objekter uten gruppe', () => {
    expect(grupper([{ navn: 'A', beskrivelse: '', felt: [] }])[0].gruppe).toBe('Objekttyper');
  });

  it('setter @ foran attributter i feltsignaturen', () => {
    expect(feltSignatur({ navn: 'a', type: 'string', kardinalitet: '0..1' })).toBe('a : string [0..1]');
    expect(feltSignatur({ navn: 'a', type: 'string', attributt: true })).toBe('@a : string');
  });
});

describe('tilConfluenceHtml', () => {
  const html = tilConfluenceHtml(STRUKTUR, META);

  it('har overskrift, gruppe og tabell per objekt', () => {
    expect(html).toContain('<h1>Høring og offentlig ettersyn / v2</h1>');
    expect(html).toContain('<h2>Konvolutt</h2>');
    expect(html).toContain('<h3><code>RotType</code></h3>');
    expect((html.match(/<table>/g) ?? []).length).toBe(2);
  });

  it('escaper brukertekst', () => {
    expect(html).toContain('Frist for &lt;uttalelse&gt;.');
    expect(html).not.toContain('<uttalelse>');
  });

  it('utleder påkrevd fra kardinaliteten', () => {
    const rader = html.split('<tr>');
    expect(rader.find((r) => r.includes('>part<'))).toContain('<td>Ja</td>');
    expect(rader.find((r) => r.includes('>frist<'))).toContain('<td>Nei</td>');
  });

  it('tar med liste- og fast verdi-merker', () => {
    expect(html).toContain('(liste)');
    expect(html).toContain('fast verdi: 11002');
  });

  it('sier fra når modellen er tom', () => {
    expect(tilConfluenceHtml([], META)).toContain('ikke modellert ennå');
  });

  it('pakker samme innhold i et komplett dokument', () => {
    const dok = tilHtmlDokument(STRUKTUR, META);
    expect(dok.startsWith('<!doctype html>')).toBe(true);
    expect(dok).toContain('<h3><code>PartType</code></h3>');
  });
});

describe('tilMarkdown', () => {
  const md = tilMarkdown(STRUKTUR, META);

  it('lager overskrifter og tabeller', () => {
    expect(md).toContain('# Høring og offentlig ettersyn / v2');
    expect(md).toContain('## Parter og aktører');
    expect(md).toContain('| Felt | Type | Kardinalitet | Påkrevd | Beskrivelse |');
  });

  it('escaper rør, så tabellcellene ikke brytes', () => {
    expect(md).toContain('Navn \\| med rør.');
  });
});

describe('strukturTilUmlSvg', () => {
  it('gir tom streng uten struktur', () => {
    expect(strukturTilUmlSvg([], META)).toBe('');
  });

  it('tegner ett kort per objekt, med rot-typen markert i blått', () => {
    const svg = strukturTilUmlSvg(STRUKTUR, META);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('>RotType</text>');
    expect(svg).toContain('>PartType</text>');
    expect(svg).toContain('>part : PartType [1..*]</text>');
    // Rot-kortet (blått) tegnes først.
    expect(svg.indexOf('#EAF4FB')).toBeLessThan(svg.indexOf('>RotType</text>'));
    expect((svg.match(/#EAF4FB/g) ?? []).length).toBe(1);
  });

  it('escaper feltnavn i teksten', () => {
    const svg = strukturTilUmlSvg(
      [{ navn: 'A', beskrivelse: '', felt: [{ navn: 'a<b', type: 'string', beskrivelse: '' }] }],
      META,
    );
    expect(svg).toContain('a&lt;b');
  });
});

describe('strukturTilXsdSvg', () => {
  it('gir tom streng uten struktur', () => {
    expect(strukturTilXsdSvg([], META)).toBe('');
  });

  it('tegner rotelement, rammer og piler mellom typene', () => {
    const svg = strukturTilXsdSvg(STRUKTUR, META);
    expect(svg.startsWith('<svg')).toBe(true);
    // Rotelementets navn, ikke typenavnet, står i boksen ytterst til venstre.
    expect(svg).toContain('>Hoering</text>');
    expect(svg).toContain('>RotType</text>');
    expect(svg).toContain('>PartType</text>');
    // part → PartType peker framover, altså blå pil.
    expect(svg).toContain('#3F7CB8');
  });

  it('markerer ubegrensede felt', () => {
    expect(strukturTilXsdSvg(STRUKTUR, META)).toContain('0..∞');
  });
});

describe('filnavnDel', () => {
  it('gjør modellnavn om til trygge filnavn', () => {
    expect(filnavnDel('Høring og offentlig ettersyn')).toBe('hoering-og-offentlig-ettersyn');
    expect(filnavnDel('Blåbær / Ærfugl')).toBe('blaabaer-aerfugl');
    expect(filnavnDel('')).toBe('datamodell');
  });
});
