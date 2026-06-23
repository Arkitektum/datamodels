import { describe, it, expect } from 'vitest';
import { strukturTilMermaid } from '@/lib/umlMermaid';
import type { Struktur } from '@/lib/struktur';

describe('strukturTilMermaid', () => {
  it('gir tom streng for tom struktur', () => {
    expect(strukturTilMermaid([])).toBe('');
  });

  it('lager classDiagram med klasse og typede attributter', () => {
    const s: Struktur = [
      { navn: 'Konvolutt', beskrivelse: '', felt: [{ navn: 'referanse', type: 'string', beskrivelse: '', kardinalitet: '0..1' }] },
    ];
    const ut = strukturTilMermaid(s);
    expect(ut.startsWith('classDiagram')).toBe(true);
    expect(ut).toContain('class Konvolutt["Konvolutt"] {');
    expect(ut).toContain('referanse : string [0..1]');
  });

  it('prefikser XSD-attributter med @', () => {
    const s: Struktur = [
      { navn: 'Konvolutt', beskrivelse: '', felt: [{ navn: 'dataFormatId', type: 'string', beskrivelse: '', attributt: true }] },
    ];
    expect(strukturTilMermaid(s)).toContain('@dataFormatId : string');
  });

  it('viser ref-felt både som attributt og som relasjonspil med kardinalitet', () => {
    const s: Struktur = [
      { navn: 'Konvolutt', beskrivelse: '', felt: [{ navn: 'parter', type: 'Part', beskrivelse: '', ref: 'Part', kardinalitet: '1..n' }] },
      { navn: 'Part', beskrivelse: '', felt: [{ navn: 'navn', type: 'string', beskrivelse: '' }] },
    ];
    const ut = strukturTilMermaid(s);
    expect(ut).toContain('parter : Part [1..n]');
    expect(ut).toContain('Konvolutt --> "1..n" Part : parter');
  });

  it('tar med ledetekster (beskrivelse) når ledetekster=true', () => {
    const s: Struktur = [
      { navn: 'BeroertPart', beskrivelse: 'Berørt part i saken', felt: [{ navn: 'foedselsnummer', type: 'string', beskrivelse: '11 sifre', kardinalitet: '0..1' }] },
    ];
    const utAv = strukturTilMermaid(s);
    expect(utAv).not.toContain('11 sifre');
    expect(utAv).not.toContain('note for');
    const utPå = strukturTilMermaid(s, { ledetekster: true });
    expect(utPå).toContain('foedselsnummer : string [0..1] — 11 sifre');
    expect(utPå).toContain('note for BeroertPart "Berørt part i saken"');
  });

  it('saniterer navn med mellomrom/spesialtegn til gyldig id med alias-etikett', () => {
    const s: Struktur = [{ navn: 'Berørt eiendom', beskrivelse: '', felt: [] }];
    const ut = strukturTilMermaid(s);
    expect(ut).toContain('class Ber_rt_eiendom["Berørt eiendom"]');
  });
});
