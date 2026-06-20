'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRolle, ROLLE_LABELS } from '@/lib/roller';
import ChangePassword from '@/components/ChangePassword';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/).filter(Boolean);
  if (deler.length === 0) return '?';
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

export type HeaderView = 'modell' | 'innboks' | 'admin';

export default function Header({
  view = 'modell',
  onView,
  innboksCount = 0,
}: {
  view?: HeaderView;
  onView?: (v: HeaderView) => void;
  innboksCount?: number;
} = {}) {
  const { signOut } = useAuth();
  const { rolle, navn, epost, isDibk, isAdmin } = useRolle();
  const [showPw, setShowPw] = useState(false);
  const visNavn = navn || epost;
  const rolleLabel = ROLLE_LABELS[rolle] ?? 'Utvikler';

  const navStyle = (aktiv: boolean): React.CSSProperties => ({
    appearance: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9375rem',
    padding: '7px 12px',
    borderRadius: 6,
    background: aktiv ? 'var(--accent-tinted)' : 'transparent',
    color: aktiv ? 'var(--accent-text)' : 'var(--fg-2)',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-1)',
        borderBottom: '1px solid var(--neutral-border)',
      }}
    >
      <div className="ws-headbar">
        <a
          href="/"
          aria-label="Arkitektum · Dibk Fellestjenester plan og bygg"
          style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flexShrink: 0 }}
        >
          {/* Arkitektum-merket (som før) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${BASE}/arkitektum-logo.png`} alt="Arkitektum" style={{ height: 26, width: 'auto', display: 'block' }} />
          {/* Skillestrek */}
          <span style={{ width: 1, height: 26, background: 'var(--neutral-border-strong)' }} />
          {/* Dibk-tjenesten */}
          <span style={{ lineHeight: 1.15 }}>
            <span
              style={{
                display: 'block',
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--accent-text)',
                letterSpacing: '-0.01em',
              }}
            >
              Dibk
            </span>
            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--fg-2)' }}>
              Fellestjenester plan og bygg
            </span>
          </span>
        </a>

        <nav className="ws-hide-sm" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button type="button" style={navStyle(view === 'modell')} onClick={() => onView?.('modell')}>
            Datamodeller
          </button>
          <button
            type="button"
            style={{ ...navStyle(view === 'innboks'), display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => onView?.('innboks')}
          >
            Innboks
            {innboksCount > 0 && <span className="pill pill--warning">{innboksCount}</span>}
          </button>
          {isAdmin && (
            <button type="button" style={navStyle(view === 'admin')} onClick={() => onView?.('admin')}>
              Admin
            </button>
          )}
        </nav>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="ws-hide-sm" style={{ fontSize: '0.82rem', color: 'var(--fg-2)' }}>Innlogget som</span>
          <span className="ws-hide-sm" style={{ fontSize: '0.85rem', color: 'var(--fg-1)', fontWeight: 500 }}>{visNavn}</span>
          <span className={isAdmin ? 'pill pill--danger' : isDibk ? 'pill pill--success' : 'pill pill--info'}>
            {rolleLabel}
          </span>
          <span
            title={visNavn}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--brand1-base)',
              color: 'var(--brand1-text)',
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            {initialer(visNavn)}
          </span>
          <button className="btn btn--tertiary btn--sm ws-hide-sm" onClick={() => setShowPw(true)}>
            Bytt passord
          </button>
          <button className="btn btn--tertiary btn--sm" onClick={() => signOut()}>
            Logg ut
          </button>
        </div>
      </div>

      {showPw && (
        <div className="modal-overlay" onClick={() => setShowPw(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ChangePassword onDone={() => setShowPw(false)} onCancel={() => setShowPw(false)} />
          </div>
        </div>
      )}

      {/* rolle brukt for å skille avatar-fargen om ønskelig senere */}
      <span hidden data-rolle={rolle} />
    </header>
  );
}
