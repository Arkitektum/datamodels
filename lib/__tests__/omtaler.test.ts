import { describe, it, expect } from 'vitest';
import {
  finnOmtaler,
  splittOmtaler,
  aktivOmtaleQuery,
  omtaleForslag,
  type OmtaleBruker,
} from '@/lib/omtaler';

const BRUKERE: OmtaleBruker[] = [
  { epost: 'anna@example.no', navn: 'Anna Berg' },
  { epost: 'annab@example.no', navn: 'Anna Berg Hansen' },
  { epost: 'ola@example.no', navn: 'Ola Nordmann' },
  { epost: 'utennavn@example.no', navn: '' },
];

describe('finnOmtaler', () => {
  it('finner omtalte brukere case-ufølsomt', () => {
    const treff = finnOmtaler('Hei @ola nordmann, ser du dette?', BRUKERE);
    expect(treff.map((b) => b.epost)).toEqual(['ola@example.no']);
  });

  it('foretrekker lengste navn ved overlapp', () => {
    const treff = finnOmtaler('Ping @Anna Berg Hansen!', BRUKERE);
    expect(treff.map((b) => b.epost)).toContain('annab@example.no');
  });

  it('gir tom liste uten omtaler', () => {
    expect(finnOmtaler('Ingen omtaler her, bare e-post a@b.no', BRUKERE)).toEqual([]);
  });
});

describe('splittOmtaler', () => {
  it('deler tekst i vanlige og omtale-segmenter', () => {
    const seg = splittOmtaler('Hei @Ola Nordmann, kan du se på dette?', BRUKERE);
    expect(seg).toEqual([
      { tekst: 'Hei ', omtale: false },
      { tekst: '@Ola Nordmann', omtale: true },
      { tekst: ', kan du se på dette?', omtale: false },
    ]);
  });

  it('lar lengste navn vinne ved overlapp', () => {
    const seg = splittOmtaler('@Anna Berg Hansen og @Anna Berg', BRUKERE);
    expect(seg.filter((s) => s.omtale).map((s) => s.tekst)).toEqual([
      '@Anna Berg Hansen',
      '@Anna Berg',
    ]);
  });

  it('returnerer hele teksten som ett segment uten treff', () => {
    expect(splittOmtaler('bare tekst @ukjent', BRUKERE)).toEqual([
      { tekst: 'bare tekst @ukjent', omtale: false },
    ]);
  });
});

describe('aktivOmtaleQuery', () => {
  it('finner aktivt @søk rett før markøren', () => {
    const tekst = 'Hei @An';
    expect(aktivOmtaleQuery(tekst, tekst.length)).toEqual({ start: 4, query: 'An' });
  });

  it('krever @ først i ord (ikke midt i e-postadresser)', () => {
    const tekst = 'skriv til anna@arkitektum';
    expect(aktivOmtaleQuery(tekst, tekst.length)).toBeNull();
  });

  it('avbrytes av linjeskift', () => {
    const tekst = '@Anna\nny linje';
    expect(aktivOmtaleQuery(tekst, tekst.length)).toBeNull();
  });
});

describe('omtaleForslag', () => {
  it('matcher prefiks på fornavn og etternavn', () => {
    expect(omtaleForslag('nord', BRUKERE).map((b) => b.epost)).toEqual(['ola@example.no']);
    expect(omtaleForslag('anna', BRUKERE)).toHaveLength(2);
  });

  it('viser alle med navn ved tomt søk', () => {
    expect(omtaleForslag('', BRUKERE)).toHaveLength(3);
  });
});
