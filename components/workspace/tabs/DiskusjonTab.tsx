'use client';

import type { Melding } from '@/lib/diskusjon';

function tidStr(s: string) {
  return new Date(s).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

interface Traad {
  kontekst: string | null;
  label: string;
  meldinger: Melding[];
  sist: Melding;
  kommentarer: number;
  forslag: number;
  aapneForslag: number;
}

export default function DiskusjonTab({
  messages,
  onOpen,
}: {
  messages: Melding[];
  onOpen: (ctx: string | null) => void;
}) {
  // Grupper alle meldinger (kommentarer + forslag) per kontekst.
  const map = new Map<string, Melding[]>();
  for (const m of messages) {
    const key = m.kontekst ?? '__model__';
    (map.get(key) ?? map.set(key, []).get(key)!).push(m);
  }
  const traader: Traad[] = Array.from(map.entries())
    .map(([key, msgs]) => {
      const sorted = [...msgs].sort((a, b) => (a.opprettet < b.opprettet ? -1 : 1));
      const kontekst = key === '__model__' ? null : key;
      return {
        kontekst,
        label: kontekst ? kontekst.split('.').pop() || kontekst : 'Hele modellen',
        meldinger: sorted,
        sist: sorted[sorted.length - 1],
        kommentarer: msgs.filter((m) => m.type === 'comment').length,
        forslag: msgs.filter((m) => m.type === 'proposal').length,
        aapneForslag: msgs.filter((m) => m.type === 'proposal' && m.status === 'open').length,
      };
    })
    .sort((a, b) => (a.sist.opprettet < b.sist.opprettet ? 1 : -1));

  if (traader.length === 0) {
    return (
      <div className="callout callout--info">
        <span className="callout-icon" />
        <div>
          <strong className="callout-title">Ingen diskusjoner ennå</strong>
          <div>Skriv en kommentar eller et endringsforslag i panelet til høyre for å starte.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="p p-sm" style={{ color: 'var(--fg-2)', marginBottom: 14 }}>
        Alle diskusjoner for denne modellen – kommentarer og endringsforslag. Klikk en tråd for å
        åpne den i panelet til høyre.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {traader.map((t) => (
          <button
            key={t.kontekst ?? '__model__'}
            onClick={() => onOpen(t.kontekst)}
            className="card is-hoverable"
            style={{ textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {t.kontekst ? (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--accent-text)', fontWeight: 600 }}>
                  {t.label}
                </span>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--accent-text)', fontWeight: 600 }}>Hele modellen</span>
              )}
              {t.aapneForslag > 0 && (
                <span className="pill pill--warning">
                  {t.aapneForslag} {t.aapneForslag === 1 ? 'åpent forslag' : 'åpne forslag'}
                </span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--fg-2)' }}>
                {t.sist.forfatter} · {tidStr(t.sist.opprettet)}
              </span>
            </div>

            <div style={{ fontSize: '0.88rem', color: 'var(--fg-1)' }}>
              {t.sist.type === 'proposal' ? '📝 ' : '💬 '}
              {t.sist.body}
            </div>

            <div style={{ display: 'flex', gap: 8, fontSize: '0.72rem', color: 'var(--fg-2)' }}>
              <span>{t.meldinger.length} {t.meldinger.length === 1 ? 'melding' : 'meldinger'}</span>
              {t.kommentarer > 0 && <span>· {t.kommentarer} kommentar{t.kommentarer === 1 ? '' : 'er'}</span>}
              {t.forslag > 0 && <span>· {t.forslag} forslag</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
