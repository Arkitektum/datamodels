import type { DiffLinje } from '@/lib/diff';

const SLAG_META: Record<DiffLinje['slag'], { symbol: string; farge: string; label: string }> = {
  lagt_til: { symbol: '+', farge: 'var(--success-base)', label: 'Lagt til' },
  fjernet: { symbol: '−', farge: 'var(--danger-base)', label: 'Fjernet' },
  endret: { symbol: '~', farge: 'var(--warning-base)', label: 'Endret' },
};

const MAKS_LINJER = 60;

/** Flat, lesbar liste over strukturelle endringer (lib/diff.ts → jsonDiff). */
export default function DiffListe({ linjer }: { linjer: DiffLinje[] }) {
  if (linjer.length === 0) {
    return (
      <p style={{ fontSize: '0.82rem', color: 'var(--fg-2)', margin: '8px 0' }}>
        Ingen forskjeller i innholdet.
      </p>
    );
  }
  const viste = linjer.slice(0, MAKS_LINJER);
  return (
    <div
      style={{
        margin: '8px 0',
        border: '1px solid var(--neutral-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-1)',
        maxHeight: 320,
        overflow: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.75rem',
      }}
    >
      {viste.map((l, i) => {
        const meta = SLAG_META[l.slag];
        return (
          <div
            key={i}
            style={{
              display: 'flex',
              gap: 8,
              padding: '4px 10px',
              borderBottom: i < viste.length - 1 ? '1px solid var(--neutral-border)' : 'none',
              alignItems: 'baseline',
            }}
          >
            <span title={meta.label} style={{ color: meta.farge, fontWeight: 700, flexShrink: 0 }}>
              {meta.symbol}
            </span>
            <span style={{ color: 'var(--accent-text)', flexShrink: 0 }}>{l.sti || '(rot)'}</span>
            <span style={{ color: 'var(--fg-1)', wordBreak: 'break-word' }}>
              {l.slag === 'endret' && (
                <>
                  <span style={{ color: 'var(--fg-2)' }}>{l.fra}</span>
                  {' → '}
                  {l.til}
                </>
              )}
              {l.slag === 'lagt_til' && l.til}
              {l.slag === 'fjernet' && <span style={{ color: 'var(--fg-2)' }}>{l.fra}</span>}
            </span>
          </div>
        );
      })}
      {linjer.length > MAKS_LINJER && (
        <div style={{ padding: '4px 10px', color: 'var(--fg-2)' }}>
          … og {linjer.length - MAKS_LINJER} endringer til
        </div>
      )}
    </div>
  );
}
