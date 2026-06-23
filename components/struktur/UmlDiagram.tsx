'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Rendrer en Mermaid-definisjon til SVG i naturlig, lesbar størrelse.
 *
 * Mermaid setter som standard `width="100%"` + `max-width` på SVG-en, som
 * skalerer hele tegningen ned til containerbredden – med mange klasser blir alt
 * uleselig. Vi leser den naturlige størrelsen fra `viewBox` og setter eksplisitt
 * pikselbredde/-høyde (× zoom), så diagrammet vises i full størrelse og
 * containeren scroller. En zoom-kontroll lar brukeren forstørre fritt.
 *
 * Mermaid lastes dynamisk (lazy) – holdes utenfor SSR/static-export. Ved
 * parse-/render-feil vises feilen + kilden, ikke en blank flate.
 */
export default function UmlDiagram({ definition }: { definition: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const nr = useRef(0);
  const natural = useRef<{ w: number; h: number } | null>(null);
  const zoomRef = useRef(1);
  const [zoom, setZoom] = useState(1);
  const [feil, setFeil] = useState<string | null>(null);

  // Setter SVG-ens pikselstørrelse fra naturlig størrelse × gjeldende zoom.
  const apply = useCallback(() => {
    const svg = holder.current?.querySelector('svg');
    const nat = natural.current;
    if (!svg || !nat) return;
    svg.setAttribute('width', String(Math.round(nat.w * zoomRef.current)));
    svg.setAttribute('height', String(Math.round(nat.h * zoomRef.current)));
    svg.style.maxWidth = 'none';
  }, []);

  useEffect(() => {
    let avbrutt = false;
    (async () => {
      if (!definition) {
        if (avbrutt) return;
        natural.current = null;
        setFeil(null);
        if (holder.current) holder.current.innerHTML = '';
        return;
      }
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'strict',
          class: { useMaxWidth: false },
        });
        const { svg } = await mermaid.render('uml-' + nr.current++, definition);
        if (avbrutt) return;
        if (holder.current) {
          holder.current.innerHTML = svg;
          const el = holder.current.querySelector('svg');
          if (el) {
            const vb = (el.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
            const w = vb.length === 4 && vb[2] ? vb[2] : 800;
            const h = vb.length === 4 && vb[3] ? vb[3] : 600;
            natural.current = { w, h };
            apply();
          }
        }
        setFeil(null);
      } catch (e) {
        if (avbrutt) return;
        natural.current = null;
        setFeil((e as Error)?.message || String(e));
        if (holder.current) holder.current.innerHTML = '';
      }
    })();
    return () => {
      avbrutt = true;
    };
  }, [definition, apply]);

  // Re-anvend zoom uten å re-rendre Mermaid.
  useEffect(() => {
    zoomRef.current = zoom;
    apply();
  }, [zoom, apply]);

  const knapp = {
    border: '1px solid var(--neutral-border-strong)',
    background: 'var(--bg-1)',
    borderRadius: 'var(--radius-sm)',
    width: 30,
    height: 30,
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  } as const;

  if (feil) {
    return (
      <div>
        <div className="callout callout--warning">
          <span className="callout-icon" />
          <div>
            <strong className="callout-title">Kunne ikke tegne diagrammet</strong>
            <div>{feil}</div>
          </div>
        </div>
        <pre
          style={{
            marginTop: 12,
            background: 'var(--neutral-bg-input)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            overflow: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
          }}
        >
          {definition}
        </pre>
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid var(--neutral-border-strong)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-1)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          borderBottom: '1px solid var(--neutral-border)',
        }}
      >
        <button type="button" style={knapp} title="Zoom ut" onClick={() => setZoom((z) => Math.max(0.25, +(z / 1.25).toFixed(3)))}>
          −
        </button>
        <span style={{ minWidth: 46, textAlign: 'center', fontSize: '0.8rem', color: 'var(--fg-2)' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button type="button" style={knapp} title="Zoom inn" onClick={() => setZoom((z) => Math.min(4, +(z * 1.25).toFixed(3)))}>
          +
        </button>
        <button type="button" style={{ ...knapp, width: 'auto', padding: '0 10px', fontSize: '0.8rem' }} title="Tilbakestill zoom" onClick={() => setZoom(1)}>
          100%
        </button>
      </div>
      <div style={{ overflow: 'auto', maxHeight: '72vh', padding: 16 }}>
        <div ref={holder} style={{ width: 'fit-content' }} />
      </div>
    </div>
  );
}
