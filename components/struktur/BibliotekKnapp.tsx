'use client';

/**
 * Rådgivende bibliotek-oppslag for et felt- eller objektnavn. Viser en liten
 * 📚-knapp; ved klikk slås navnet opp mot /api/bibliotek/oppslag og resultatet
 * vises i en flytende panel med to seksjoner: «Eksakt» (samme navn) og
 * «Liknende» (nær skrivemåte). Kun forslag — komponenten skriver aldri tilbake
 * i strukturen.
 */
import { useEffect, useRef, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface FeltRef {
  navn: string;
  type?: string;
  kardinalitet?: string;
  modell: string;
  klasse: string;
  gammel: boolean;
  kilde: 'korpus' | 'portal';
}
interface ObjektRef {
  navn: string;
  beskrivelse?: string;
  modell: string;
  gammel: boolean;
  kilde: 'korpus' | 'portal';
}
type Rad = FeltRef | ObjektRef;
interface Treff {
  eksakt: Rad[];
  liknende: Rad[];
  eksaktTotalt: number;
  liknendeTotalt: number;
}

export default function BibliotekKnapp({
  navn,
  kind,
}: {
  navn: string;
  kind: 'felt' | 'objekt';
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Treff | null>(null);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const knappRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const lukk = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        knappRef.current?.contains(t) ||
        panelRef.current?.contains(t)
      )
        return;
      setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', lukk);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', lukk);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  async function aapne() {
    const q = navn.trim();
    const r = knappRef.current?.getBoundingClientRect();
    if (r) {
      const bredde = 380;
      const left = Math.max(8, Math.min(r.left, window.innerWidth - bredde - 8));
      setPos({ top: r.bottom + 4, left });
    }
    setOpen(true);
    if (q.length < 2) {
      setFeil('Skriv minst 2 tegn i navnet først.');
      setData(null);
      return;
    }
    setLaster(true);
    setFeil(null);
    try {
      const res = await fetch(
        `${BASE}/api/bibliotek/oppslag?kind=${kind}&navn=${encodeURIComponent(q)}`,
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Feil ${res.status}`);
      setData(j as Treff);
    } catch (e) {
      setFeil((e as Error).message);
      setData(null);
    } finally {
      setLaster(false);
    }
  }

  return (
    <>
      <button
        ref={knappRef}
        type="button"
        title={`Slå opp «${navn || '…'}» i datamodell-biblioteket`}
        onClick={() => (open ? setOpen(false) : aapne())}
        style={{
          appearance: 'none',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          color: open ? 'var(--accent-text, #2563eb)' : 'var(--fg-3)',
          fontSize: '0.82rem',
          lineHeight: 1,
          padding: 2,
          flexShrink: 0,
        }}
      >
        📚
      </button>
      {open && pos && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            width: 380,
            maxHeight: '60vh',
            overflowY: 'auto',
            zIndex: 1000,
            background: 'var(--neutral-bg, #fff)',
            border: '1px solid var(--neutral-border, #d4d4d8)',
            borderRadius: 'var(--radius-md, 8px)',
            boxShadow: '0 8px 28px rgba(0,0,0,.16)',
            padding: 12,
            fontSize: '0.78rem',
            color: 'var(--fg-1)',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '.04em',
              color: 'var(--fg-3)',
              marginBottom: 8,
            }}
          >
            Bibliotek · {kind === 'felt' ? 'feltnavn' : 'objektnavn'} «{navn}»
          </div>

          {laster && <div style={{ color: 'var(--fg-3)' }}>Slår opp …</div>}
          {feil && <div style={{ color: 'var(--warning-text, #b45309)' }}>{feil}</div>}

          {data && (
            <>
              <Seksjon
                tittel="Eksakt"
                rader={data.eksakt}
                totalt={data.eksaktTotalt}
                kind={kind}
                tom="Ingen andre modeller bruker akkurat dette navnet."
              />
              <Seksjon
                tittel="Liknende"
                rader={data.liknende}
                totalt={data.liknendeTotalt}
                kind={kind}
                tom="Ingen liknende navn funnet."
              />
            </>
          )}
        </div>
      )}
    </>
  );
}

function Seksjon({
  tittel,
  rader,
  totalt,
  kind,
  tom,
}: {
  tittel: string;
  rader: Rad[];
  totalt: number;
  kind: 'felt' | 'objekt';
  tom: string;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div
        style={{
          fontWeight: 600,
          marginBottom: 4,
          display: 'flex',
          gap: 6,
          alignItems: 'baseline',
        }}
      >
        {tittel}
        <span style={{ color: 'var(--fg-3)', fontWeight: 400 }}>
          {totalt > rader.length ? `${rader.length} av ${totalt}` : totalt}
        </span>
      </div>
      {rader.length === 0 ? (
        <div style={{ color: 'var(--fg-3)' }}>{tom}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rader.map((r, i) => (
            <RadView key={i} rad={r} kind={kind} />
          ))}
        </div>
      )}
    </div>
  );
}

function RadView({ rad, kind }: { rad: Rad; kind: 'felt' | 'objekt' }) {
  const felt = kind === 'felt' ? (rad as FeltRef) : null;
  return (
    <div
      style={{
        padding: '4px 6px',
        borderRadius: 'var(--radius-sm, 4px)',
        background: 'var(--neutral-bg-input, #f4f4f5)',
        opacity: rad.gammel ? 0.7 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '0.78rem' }}>{rad.navn}</strong>
        {felt?.type && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.66rem',
              color: 'var(--fg-2)',
            }}
          >
            {felt.type}
            {felt.kardinalitet ? ` · ${felt.kardinalitet}` : ''}
          </span>
        )}
        {rad.gammel && <Merke tekst="gammel" tone="warning" />}
        <Merke tekst={rad.kilde === 'portal' ? 'portal' : 'korpus'} tone="neutral" />
      </div>
      <div style={{ color: 'var(--fg-3)', fontSize: '0.7rem', marginTop: 1 }}>
        {rad.modell}
        {felt ? ` · ${felt.klasse}` : ''}
      </div>
    </div>
  );
}

function Merke({ tekst, tone }: { tekst: string; tone: 'warning' | 'neutral' }) {
  return (
    <span
      style={{
        fontSize: '0.6rem',
        textTransform: 'uppercase',
        letterSpacing: '.03em',
        padding: '1px 5px',
        borderRadius: 999,
        background:
          tone === 'warning'
            ? 'var(--warning-bg, #fef3c7)'
            : 'var(--neutral-bg-input, #e4e4e7)',
        color:
          tone === 'warning'
            ? 'var(--warning-text, #b45309)'
            : 'var(--fg-3)',
      }}
    >
      {tekst}
    </span>
  );
}
