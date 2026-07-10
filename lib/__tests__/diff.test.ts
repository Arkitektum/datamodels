import { describe, it, expect } from 'vitest';
import { jsonDiff, visVerdi } from '@/lib/diff';

describe('jsonDiff', () => {
  it('gir ingen linjer for like verdier', () => {
    expect(jsonDiff({ a: 1, b: [1, 2] }, { a: 1, b: [1, 2] })).toEqual([]);
    expect(jsonDiff(null, null)).toEqual([]);
  });

  it('rapporterer endrede primitiver med sti', () => {
    const linjer = jsonDiff({ a: { b: 'x' } }, { a: { b: 'y' } });
    expect(linjer).toEqual([{ sti: 'a.b', slag: 'endret', fra: 'x', til: 'y' }]);
  });

  it('rapporterer lagt til og fjernet nøkler', () => {
    const linjer = jsonDiff({ a: 1 }, { b: 2 });
    expect(linjer).toContainEqual({ sti: 'a', slag: 'fjernet', fra: '1' });
    expect(linjer).toContainEqual({ sti: 'b', slag: 'lagt_til', til: '2' });
  });

  it('parer listeelementer på navn i stedet for posisjon', () => {
    const fra = [
      { navn: 'Tiltak', kardinalitet: '1..1' },
      { navn: 'Part', kardinalitet: '0..1' },
    ];
    // «Tiltak» flyttet sist + endret; «Part» urørt → kun én endringslinje.
    const til = [
      { navn: 'Part', kardinalitet: '0..1' },
      { navn: 'Tiltak', kardinalitet: '0..*' },
    ];
    expect(jsonDiff(fra, til)).toEqual([
      { sti: '[navn=Tiltak].kardinalitet', slag: 'endret', fra: '1..1', til: '0..*' },
    ]);
  });

  it('rapporterer nye og fjernede listeelementer på nøkkel', () => {
    const linjer = jsonDiff([{ navn: 'A' }], [{ navn: 'B' }]);
    expect(linjer.map((l) => [l.sti, l.slag])).toEqual([
      ['[navn=A]', 'fjernet'],
      ['[navn=B]', 'lagt_til'],
    ]);
  });

  it('faller tilbake til posisjon når lista mangler nøkkelfelt', () => {
    const linjer = jsonDiff([1, 2], [1, 3, 4]);
    expect(linjer).toEqual([
      { sti: '[1]', slag: 'endret', fra: '2', til: '3' },
      { sti: '[2]', slag: 'lagt_til', til: '4' },
    ]);
  });

  it('behandler type-endring (objekt → primitiv) som endret', () => {
    const linjer = jsonDiff({ a: { x: 1 } }, { a: 'tekst' });
    expect(linjer).toEqual([{ sti: 'a', slag: 'endret', fra: '{"x":1}', til: 'tekst' }]);
  });
});

describe('visVerdi', () => {
  it('avkorter lange verdier', () => {
    const lang = 'x'.repeat(300);
    expect(visVerdi(lang).length).toBeLessThan(130);
    expect(visVerdi(lang).endsWith('…')).toBe(true);
  });

  it('viser manglende verdi eksplisitt', () => {
    expect(visVerdi(undefined)).toBe('(mangler)');
  });
});
