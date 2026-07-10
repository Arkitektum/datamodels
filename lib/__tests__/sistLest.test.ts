import { describe, it, expect, vi } from 'vitest';

// sistLest.ts importerer getSupabase på modulnivå — mock så testene er rene.
vi.mock('@/lib/supabase', () => ({
  getSupabase: () => null,
  SUPABASE_TABLE: 'dokument_data',
  isSupabaseConfigured: false,
}));

import { lestKart, ulesteITraad, ulesteIModell, type TraadLest } from '@/lib/sistLest';
import type { Melding } from '@/lib/diskusjon';

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
    opprettet: '2026-07-01T10:00:00Z',
    ...over,
  };
}

const MEG = 'meg@example.no';

const lest: TraadLest[] = [
  { epost: MEG, datamodell_id: 'm1', kontekst: 'Objekt.felt', sist_lest: '2026-07-01T12:00:00Z' },
  { epost: MEG, datamodell_id: 'm1', kontekst: '', sist_lest: '2026-06-30T00:00:00Z' },
];

const meldinger: Melding[] = [
  // Lest (eldre enn sist_lest for tråden)
  melding({ kontekst: 'Objekt.felt', opprettet: '2026-07-01T10:00:00Z', epost: 'andre@x.no' }),
  // Ulest (nyere enn sist_lest)
  melding({ kontekst: 'Objekt.felt', opprettet: '2026-07-01T13:00:00Z', epost: 'andre@x.no' }),
  // Egen melding — teller aldri som ulest
  melding({ kontekst: 'Objekt.felt', opprettet: '2026-07-01T14:00:00Z', epost: MEG.toUpperCase() }),
  // Modellnivå-tråd, ulest
  melding({ kontekst: null, opprettet: '2026-07-01T09:00:00Z', epost: 'andre@x.no' }),
  // Tråd uten lest-markering — alt er ulest
  melding({ kontekst: 'Annet.felt', opprettet: '2026-01-01T00:00:00Z', epost: 'andre@x.no' }),
  // Annen modell
  melding({ datamodell_id: 'm2', kontekst: null, opprettet: '2026-07-01T09:00:00Z', epost: 'andre@x.no' }),
];

describe('ulesteITraad', () => {
  const kart = lestKart(lest);

  it('teller kun meldinger nyere enn sist_lest', () => {
    expect(ulesteITraad(meldinger, kart, MEG, 'm1', 'Objekt.felt')).toBe(1);
  });

  it('teller alt i tråder uten lest-markering', () => {
    expect(ulesteITraad(meldinger, kart, MEG, 'm1', 'Annet.felt')).toBe(1);
  });

  it('bruker tom kontekst-nøkkel for modellnivå-tråden', () => {
    expect(ulesteITraad(meldinger, kart, MEG, 'm1', null)).toBe(1);
  });
});

describe('ulesteIModell', () => {
  const kart = lestKart(lest);

  it('summerer uleste på tvers av tråder i modellen', () => {
    expect(ulesteIModell(meldinger, kart, MEG, 'm1')).toBe(3);
    expect(ulesteIModell(meldinger, kart, MEG, 'm2')).toBe(1);
  });

  it('teller aldri egne meldinger (case-ufølsomt på e-post)', () => {
    const bareEgne = [melding({ kontekst: 'X.y', epost: MEG, opprettet: '2026-07-02T00:00:00Z' })];
    expect(ulesteIModell(bareEgne, lestKart([]), MEG, 'm1')).toBe(0);
  });
});
