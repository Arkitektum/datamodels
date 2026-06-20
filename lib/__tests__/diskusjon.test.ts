import { describe, it, expect, vi } from 'vitest';

// diskusjon.ts importerer getSupabase på modulnivå. Vi mocker den så ingen
// nettverks-/miljøavhengighet trekkes inn – vi tester kun de rene hjelperne
// som opererer på en allerede hentet liste.
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => null,
  SUPABASE_TABLE: 'dokument_data',
  isSupabaseConfigured: false,
}));

import { traadFor, feltCount, aapneForslagCount, type Melding } from '@/lib/diskusjon';

function melding(over: Partial<Melding>): Melding {
  return {
    id: Math.random().toString(36).slice(2),
    datamodell_id: 'm1',
    kontekst: null,
    type: 'comment',
    forfatter: null,
    epost: null,
    rolle: null,
    body: null,
    felt: null,
    endring: null,
    status: null,
    avgjort_av: null,
    avgjort_tid: null,
    opprettet: '2026-01-01T00:00:00Z',
    ...over,
  };
}

const alle: Melding[] = [
  melding({ datamodell_id: 'm1', kontekst: null }),
  melding({ datamodell_id: 'm1', kontekst: 'felt.a' }),
  melding({ datamodell_id: 'm1', kontekst: 'felt.a' }),
  melding({ datamodell_id: 'm1', kontekst: 'felt.b', type: 'proposal', status: 'open' }),
  melding({ datamodell_id: 'm1', kontekst: 'felt.b', type: 'proposal', status: 'approved' }),
  melding({ datamodell_id: 'm2', kontekst: 'felt.a' }),
];

describe('traadFor', () => {
  it('filtrerer på modell og kontekst (null = hele modellen)', () => {
    expect(traadFor(alle, 'm1', null)).toHaveLength(1);
    expect(traadFor(alle, 'm1', 'felt.a')).toHaveLength(2);
    expect(traadFor(alle, 'm2', 'felt.a')).toHaveLength(1);
  });

  it('behandler manglende kontekst som null', () => {
    expect(traadFor(alle, 'm1', undefined as unknown as null)).toHaveLength(1);
  });

  it('gir tom liste for ukjent modell', () => {
    expect(traadFor(alle, 'ukjent', null)).toEqual([]);
  });
});

describe('feltCount', () => {
  it('teller meldinger for et gitt felt', () => {
    expect(feltCount(alle, 'm1', 'felt.a')).toBe(2);
    expect(feltCount(alle, 'm1', 'felt.b')).toBe(2);
    expect(feltCount(alle, 'm2', 'felt.a')).toBe(1);
  });
});

describe('aapneForslagCount', () => {
  it('teller kun åpne forslag for modellen', () => {
    expect(aapneForslagCount(alle, 'm1')).toBe(1);
    expect(aapneForslagCount(alle, 'm2')).toBe(0);
  });
});
