import { describe, it, expect } from 'vitest';
import {
  serializeRegler,
  deserializeRegler,
  parseRegelInput,
  stripRoot,
  fullRegelnr,
  normalizeRegelData,
  type RegelGruppe,
  type RegelGruppeDef,
} from '@/lib/regler';

const ROOT = 'Tiltak';

describe('fullRegelnr / stripRoot', () => {
  it('fullRegelnr prefikser med root når root finnes', () => {
    expect(fullRegelnr(ROOT, '1.2')).toBe('Tiltak.1.2');
  });

  it('fullRegelnr uten root gir p uendret', () => {
    expect(fullRegelnr('', '1.2')).toBe('1.2');
  });

  it('stripRoot fjerner ledende "root."', () => {
    expect(stripRoot(ROOT, 'Tiltak.1.2')).toBe('1.2');
  });

  it('stripRoot lar regelnr uten prefiks være uendret', () => {
    expect(stripRoot(ROOT, '1.2')).toBe('1.2');
  });

  it('stripRoot tåler tom/undefined regelnr', () => {
    expect(stripRoot(ROOT, '')).toBe('');
  });

  it('stripRoot er invers av fullRegelnr', () => {
    const p = 'gruppe.42';
    expect(stripRoot(ROOT, fullRegelnr(ROOT, p))).toBe(p);
  });
});

describe('normalizeRegelData', () => {
  it('returnerer tom liste for undefined', () => {
    expect(normalizeRegelData(undefined)).toEqual([]);
  });

  it('fyller manglende felt med tomme strenger og caster std til boolean', () => {
    const def: RegelGruppeDef[] = [
      { g: 'A', rules: [{ p: 'A.1', t: 'Beskrivelse' }] },
    ];
    const out = normalizeRegelData(def);
    expect(out).toEqual([
      {
        g: 'A',
        std: false,
        rules: [{ p: 'A.1', sjekkpunkt: '', t: 'Beskrivelse', r: '', b: '', f: '', k: '' }],
      },
    ]);
  });
});

describe('serializeRegler / deserializeRegler round-trip', () => {
  const grupper: RegelGruppe[] = [
    {
      g: 'A',
      std: true,
      rules: [
        { p: 'A.1', sjekkpunkt: 'sp1', t: 'Tekst 1', r: 'Feil', b: 'bet', f: 'for', k: 'kom' },
        { p: 'A.2', sjekkpunkt: '', t: 'Tekst 2', r: 'Advarsel', b: '', f: '', k: '' },
      ],
    },
    {
      g: 'B',
      std: false,
      rules: [{ p: 'B.1', sjekkpunkt: 'sp', t: 'Tekst B', r: 'OK', b: '', f: '', k: '' }],
    },
  ];

  it('serialiserer til flatt format med full regelnr og null for tomme felt', () => {
    const flat = serializeRegler(grupper, ROOT);
    expect(flat).toHaveLength(3);
    expect(flat[0]).toEqual({
      Regelnr: 'Tiltak.A.1',
      sjkPkt: 'sp1',
      Beskrivelse: 'Tekst 1',
      Valideringsresultat: 'Feil',
      Betingelse: 'bet',
      Forutsetning: 'for',
      Kommentarer: 'kom',
    });
    expect(flat[1].Betingelse).toBeNull();
    expect(flat[1].Forutsetning).toBeNull();
    expect(flat[1].Kommentarer).toBeNull();
  });

  it('round-trip serialize -> deserialize bevarer struktur og verdier', () => {
    const flat = serializeRegler(grupper, ROOT);
    const stdByGroup = { A: true, B: false };
    const back = deserializeRegler(
      flat as unknown as Array<Record<string, unknown>>,
      ROOT,
      stdByGroup,
    );
    expect(back).toHaveLength(2);
    expect(back[0].g).toBe('A');
    expect(back[0].std).toBe(true);
    expect(back[0].rules).toHaveLength(2);
    expect(back[1].g).toBe('B');
    expect(back[1].std).toBe(false);
    // Tomme felt blir til '' (ikke null) etter round-trip.
    expect(back[0].rules[1]).toEqual({
      p: 'A.2',
      sjekkpunkt: '',
      t: 'Tekst 2',
      r: 'Advarsel',
      b: '',
      f: '',
      k: '',
    });
  });

  it('deserializeRegler hopper over rader uten regelnr', () => {
    const back = deserializeRegler([{ Beskrivelse: 'ingen regelnr' }], ROOT, {});
    expect(back).toEqual([]);
  });

  it('deserializeRegler godtar lowercase regelnr-nøkkel', () => {
    const back = deserializeRegler([{ regelnr: 'Tiltak.X.1' }], ROOT, {});
    expect(back).toHaveLength(1);
    expect(back[0].g).toBe('X');
    expect(back[0].rules[0].p).toBe('X.1');
  });
});

describe('parseRegelInput', () => {
  const stdByGroup = { A: true };

  it('tolker flat liste (uten rules) via deserializeRegler', () => {
    const flat = [
      { Regelnr: 'Tiltak.A.1', Beskrivelse: 'B1', Valideringsresultat: 'Feil' },
    ];
    const out = parseRegelInput(flat, ROOT, stdByGroup);
    expect(out).toHaveLength(1);
    expect(out[0].g).toBe('A');
    expect(out[0].std).toBe(true);
    expect(out[0].rules[0].p).toBe('A.1');
  });

  it('tolker gruppert format (med rules) via normalizeRegelData', () => {
    const grouped = [{ g: 'A', std: true, rules: [{ p: 'A.1', t: 'B1' }] }];
    const out = parseRegelInput(grouped, ROOT, stdByGroup);
    expect(out).toHaveLength(1);
    expect(out[0].rules[0]).toMatchObject({ p: 'A.1', t: 'B1' });
  });

  it('tolker objekt med { grupper: [...] }', () => {
    const wrapped = { grupper: [{ g: 'A', std: false, rules: [{ p: 'A.1', t: 'x' }] }] };
    const out = parseRegelInput(wrapped, ROOT, stdByGroup);
    expect(out).toHaveLength(1);
    expect(out[0].g).toBe('A');
  });

  it('tolker objekt med { regler: [...] } (flat)', () => {
    const wrapped = { regler: [{ Regelnr: 'Tiltak.A.1', Beskrivelse: 'b' }] };
    const out = parseRegelInput(wrapped, ROOT, stdByGroup);
    expect(out).toHaveLength(1);
    expect(out[0].rules[0].p).toBe('A.1');
  });

  it('kaster når input ikke er en liste', () => {
    expect(() => parseRegelInput({ noe: 'annet' }, ROOT, stdByGroup)).toThrow();
  });
});
