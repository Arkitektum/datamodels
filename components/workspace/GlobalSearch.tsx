'use client';

// Globalt søkeresultat-panel. Kjører sokAlt() med debounce, grupperer treff
// etter kategori og deep-linker til riktig modell + fane (+ felt-tråd).
import { useEffect, useRef, useState } from 'react';
import { sokAlt, type SokTreff, type SokKategori } from '@/lib/sok';

interface GlobalSearchProps {
  query: string;
  models: { id: string; navn: string }[];
  onGoTo: (modellId: string, fane: string, kontekst: string | null) => void;
}

// Visningsrekkefølge + norske overskrifter per kategori.
const KATEGORIER: { id: SokKategori; tittel: string; etikett: string }[] = [
  { id: 'modell', tittel: 'Modeller', etikett: 'Modell' },
  { id: 'felt', tittel: 'Felt', etikett: 'Felt' },
  { id: 'regel', tittel: 'Regler', etikett: 'Regel' },
  { id: 'dokument', tittel: 'Dokumenter', etikett: 'Dokument' },
];

const MAKS_PER_KATEGORI = 20;

export default function GlobalSearch({ query, models, onGoTo }: GlobalSearchProps) {
  const [treff, setTreff] = useState<SokTreff[]>([]);
  const [laster, setLaster] = useState(false);
  // Holder gjeldende query slik at sene svar ikke overskriver nyere søk.
  const gjeldende = useRef('');

  useEffect(() => {
    const q = query.trim();
    gjeldende.current = q;

    if (q.length < 2) {
      setTreff([]);
      setLaster(false);
      return;
    }

    setLaster(true);
    const t = setTimeout(() => {
      const denne = q;
      sokAlt(q, models)
        .then((res) => {
          if (gjeldende.current !== denne) return; // utdatert svar – ignorer
          setTreff(res);
          setLaster(false);
        })
        .catch(() => {
          if (gjeldende.current !== denne) return;
          setTreff([]);
          setLaster(false);
        });
    }, 250);

    return () => clearTimeout(t);
  }, [query, models]);

  const visQuery = query.trim();

  return (
    <div className="card" style={{ padding: '20px 22px' }}>
      <div className="eyebrow" style={{ marginBottom: 14 }}>
        Søkeresultater
      </div>

      {laster && (
        <p className="p p-sm" style={{ color: 'var(--fg-2)' }}>
          Søker …
        </p>
      )}

      {!laster && treff.length === 0 && (
        <p className="p p-sm" style={{ color: 'var(--fg-2)' }}>
          Ingen treff for «{visQuery}».
        </p>
      )}

      {!laster &&
        KATEGORIER.map((kat) => {
          const alle = treff.filter((t) => t.kategori === kat.id);
          if (alle.length === 0) return null;
          const vist = alle.slice(0, MAKS_PER_KATEGORI);
          const resterende = alle.length - vist.length;

          return (
            <section key={kat.id} style={{ marginBottom: 22 }}>
              <div
                className="eyebrow"
                style={{ margin: '0 0 8px', color: 'var(--fg-2)' }}
              >
                {kat.tittel} ({alle.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {vist.map((t, i) => (
                  <button
                    key={`${t.modellId}-${t.kategori}-${t.tittel}-${t.kontekst ?? ''}-${i}`}
                    type="button"
                    onClick={() => onGoTo(t.modellId, t.fane, t.kontekst)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--neutral-border)',
                      background: 'var(--bg-1)',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span
                        style={{
                          display: 'block',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          color: 'var(--fg-1)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {t.tittel}
                      </span>
                      {t.undertittel && (
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.78rem',
                            color: 'var(--fg-2)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.undertittel}
                        </span>
                      )}
                    </span>
                    <span
                      className="tag tag--neutral"
                      style={{ flexShrink: 0 }}
                    >
                      {kat.etikett}
                    </span>
                  </button>
                ))}
              </div>
              {resterende > 0 && (
                <p
                  className="p p-sm"
                  style={{ color: 'var(--fg-3)', margin: '8px 0 0' }}
                >
                  + {resterende} flere treff
                </p>
              )}
            </section>
          );
        })}
    </div>
  );
}
