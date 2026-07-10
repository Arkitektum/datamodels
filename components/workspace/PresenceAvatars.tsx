'use client';

import type { TilstedeBruker } from '@/lib/presence';

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return '?';
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

const MAKS_AVATARER = 5;

/** Avatar-stabel over ANDRE som ser på samme modell akkurat nå (usePresence). */
export default function PresenceAvatars({ brukere }: { brukere: TilstedeBruker[] }) {
  if (brukere.length === 0) return null;
  const viste = brukere.slice(0, MAKS_AVATARER);
  const rest = brukere.length - viste.length;
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
      title={`Ser på denne modellen nå: ${brukere.map((b) => b.navn).join(', ')}`}
    >
      <span style={{ display: 'inline-flex' }}>
        {viste.map((b, i) => (
          <span
            key={b.epost}
            title={b.navn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--brand1-base)',
              color: 'var(--brand1-text)',
              fontWeight: 600,
              fontSize: 10,
              border: '2px solid var(--bg-2)',
              marginLeft: i === 0 ? 0 : -8,
            }}
          >
            {initialer(b.navn)}
          </span>
        ))}
        {rest > 0 && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--neutral-border-strong)',
              color: 'var(--fg-1)',
              fontWeight: 600,
              fontSize: 10,
              border: '2px solid var(--bg-2)',
              marginLeft: -8,
            }}
          >
            +{rest}
          </span>
        )}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--fg-2)' }}>
        {brukere.length === 1 ? `${viste[0].navn} ser på nå` : `${brukere.length} ser på nå`}
      </span>
    </span>
  );
}
