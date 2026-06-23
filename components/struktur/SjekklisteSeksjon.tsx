'use client';

/**
 * Rådgivende seksjon i Datamodell-fanen: viser sjekkpunkt fra Sjekkliste-API-et
 * som er relevante for modellen, utledet fra forventede vedlegg → dokumenttype.
 * Kun forslag — ingen validering eller skriving.
 */
import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

interface RelevantSjekkpunkt {
  id: string;
  sjekkpunktId?: string;
  tittel: string;
  krav?: string;
  treffKoder: string[];
  sjekkliste: string;
}
interface Resultat {
  modellKoder: string[];
  ukobledeVedlegg: string[];
  punkter: RelevantSjekkpunkt[];
  feil: string[];
}

const LISTE_NAVN: Record<string, string> = {
  sjekkliste_teknisk_kvalitet: 'Teknisk kvalitet',
  sjekkliste_fag_utredningstema: 'Fag- og utredningstema',
};

export default function SjekklisteSeksjon({ modellId }: { modellId: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Resultat | null>(null);
  const [laster, setLaster] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  useEffect(() => {
    if (!open || data || laster) return;
    let avbrutt = false;
    setLaster(true);
    setFeil(null);
    fetch(`${BASE}/api/sjekkliste/relevante?modell=${encodeURIComponent(modellId)}`)
      .then(async (res) => {
        const j = await res.json();
        if (!res.ok) throw new Error(j.error || `Feil ${res.status}`);
        if (!avbrutt) setData(j as Resultat);
      })
      .catch((e) => !avbrutt && setFeil((e as Error).message))
      .finally(() => !avbrutt && setLaster(false));
    return () => {
      avbrutt = true;
    };
  }, [open, data, laster, modellId]);

  return (
    <div
      style={{
        border: '1px solid var(--neutral-border-strong)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 16,
        overflow: 'hidden',
        background: 'var(--bg-1)',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          textAlign: 'left',
          appearance: 'none',
          border: 'none',
          cursor: 'pointer',
          background: 'var(--accent-tinted)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <svg
          viewBox="0 0 16 16"
          width="13"
          height="13"
          aria-hidden="true"
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}
        >
          <path d="M6 4 L10 8 L6 12" fill="none" stroke="#003045" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-text)' }}>
          📋 Relevante dokumentkrav fra sjekkliste
        </span>
        {data && (
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--fg-2)' }}>
            {data.punkter.length} forslag
          </span>
        )}
      </button>

      {open && (
        <div style={{ padding: '12px 16px' }}>
          <p style={{ margin: '0 0 10px', fontSize: '0.76rem', color: 'var(--fg-3)' }}>
            Forslag basert på modellens forventede vedlegg. Rådgivende — du bestemmer.
          </p>

          {laster && <div style={{ color: 'var(--fg-3)', fontSize: '0.82rem' }}>Henter sjekkpunkt …</div>}
          {feil && <div style={{ color: 'var(--warning-text, #b45309)', fontSize: '0.82rem' }}>{feil}</div>}

          {data && (
            <>
              {data.modellKoder.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {data.modellKoder.map((k) => (
                    <Kode key={k}>{k}</Kode>
                  ))}
                </div>
              )}

              {data.modellKoder.length === 0 && (
                <div style={{ fontSize: '0.82rem', color: 'var(--fg-2)' }}>
                  Modellen har ingen forventede vedlegg som kobles til en dokumenttype, så
                  ingen sjekkpunkt kan foreslås automatisk.
                </div>
              )}

              {data.punkter.map((p) => (
                <div
                  key={p.id || p.sjekkpunktId || p.tittel}
                  style={{ padding: '8px 0', borderTop: '1px solid var(--neutral-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                    {p.sjekkpunktId && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--fg-3)' }}>
                        {p.sjekkpunktId}
                      </span>
                    )}
                    <strong style={{ fontSize: '0.84rem' }}>{p.tittel}</strong>
                    {p.treffKoder.map((k) => (
                      <Kode key={k}>{k}</Kode>
                    ))}
                    <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--fg-3)' }}>
                      {LISTE_NAVN[p.sjekkliste] ?? p.sjekkliste}
                    </span>
                  </div>
                  {p.krav && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--fg-2)', marginTop: 2 }}>{p.krav}</div>
                  )}
                </div>
              ))}

              {data.ukobledeVedlegg.length > 0 && (
                <div style={{ marginTop: 10, fontSize: '0.72rem', color: 'var(--fg-3)' }}>
                  Vedlegg uten dokumenttype-kobling: {data.ukobledeVedlegg.join(', ')}
                </div>
              )}
              {data.feil.length > 0 && (
                <div style={{ marginTop: 6, fontSize: '0.72rem', color: 'var(--warning-text, #b45309)' }}>
                  {data.feil.join(' · ')}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Kode({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.66rem',
        background: 'var(--neutral-bg-input)',
        color: 'var(--fg-2)',
        borderRadius: 'var(--radius-sm)',
        padding: '1px 5px',
      }}
    >
      {children}
    </span>
  );
}
