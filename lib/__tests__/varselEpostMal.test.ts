import { describe, it, expect } from 'vitest';
import { varselEmne, varselBrodtekst, escapeHtml, type VarselRad } from '@/lib/varselEpostMal';

function rad(over: Partial<VarselRad>): VarselRad {
  return {
    id: 1,
    mottaker_epost: 'mottaker@example.no',
    kind: 'omtale',
    datamodell_id: 'testModell',
    kontekst: null,
    aktor_navn: 'Kari Test',
    tekst: null,
    opprettet: '2026-07-10T10:00:00Z',
    ...over,
  };
}

describe('varselEmne', () => {
  it('lager emne per varseltype', () => {
    expect(varselEmne(rad({ kind: 'forslag_ny' }))).toBe('Nytt endringsforslag på testModell');
    expect(varselEmne(rad({ kind: 'forslag_godkjent' }))).toContain('godkjent');
    expect(varselEmne(rad({ kind: 'forslag_avvist' }))).toContain('avvist');
    expect(varselEmne(rad({ kind: 'omtale' }))).toBe('Kari Test nevnte deg i en diskusjon på testModell');
  });

  it('tåler manglende aktørnavn', () => {
    expect(varselEmne(rad({ kind: 'omtale', aktor_navn: null }))).toContain('Noen nevnte deg');
  });
});

describe('varselBrodtekst', () => {
  it('nevner feltet når kontekst finnes, ellers hele modellen', () => {
    expect(varselBrodtekst(rad({ kontekst: 'Objekt.felt' }), '')).toContain('Objekt.felt');
    expect(varselBrodtekst(rad({ kontekst: null }), '')).toContain('hele modellen');
  });

  it('legger ved dyplenke kun når appUrl er satt', () => {
    const med = varselBrodtekst(rad({}), 'https://portal.example.no');
    expect(med).toContain('https://portal.example.no/?model=testModell&fane=diskusjon');
    expect(varselBrodtekst(rad({}), '')).not.toContain('<a href');
  });

  it('escaper brukerstyrt innhold (XSS i e-post)', () => {
    const html = varselBrodtekst(rad({ tekst: '<script>alert(1)</script>', aktor_navn: 'A & B' }), '');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('A &amp; B');
  });
});

describe('escapeHtml', () => {
  it('escaper de fire spesialtegnene', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });
});
