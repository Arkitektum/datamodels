'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ModellView } from '@/components/workspace/types';
import { fetchHistorikk, gjenopprettVersjon, type HistorikkRad } from '@/lib/historikk';

/** Vennlige norske etiketter for kjente datatyper. Ukjent type vises som-is. */
const TYPE_LABEL: Record<string, string> = {
  struktur: 'Datamodell (struktur)',
  regeldata: 'Valideringsregler',
  regelstatus: 'Regelstatuser',
  brevmaler: 'Brevmaler',
  kodelister: 'Kodelister',
  vedlegg: 'Vedlegg',
  xsdkilde: 'XSD-kilde',
  dok_mapper: 'Dokumentmapper',
};
function typeLabel(type: string): string {
  return TYPE_LABEL[type] || type;
}

function tidStr(s: string): string {
  return new Date(s).toLocaleString('no-NO');
}

/** Versjonshistorikk for én modell – se og gjenopprett tidligere snapshots. */
export default function HistorikkTab({ model }: { model: ModellView }) {
  const [rader, setRader] = useState<HistorikkRad[]>([]);
  const [loading, setLoading] = useState(true);
  const [apen, setApen] = useState<Record<number, boolean>>({});
  const [melding, setMelding] = useState<{ tone: 'ok' | 'feil'; tekst: string } | null>(null);

  async function refresh() {
    setLoading(true);
    setRader(await fetchHistorikk(model.id));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model.id]);

  // Grupper radene etter type (nyeste først er allerede sikret av fetch).
  const grupper = useMemo(() => {
    const map = new Map<string, HistorikkRad[]>();
    for (const r of rader) {
      const arr = map.get(r.type) ?? [];
      arr.push(r);
      map.set(r.type, arr);
    }
    return Array.from(map.entries());
  }, [rader]);

  async function gjenopprett(rad: HistorikkRad) {
    if (!window.confirm(`Gjenopprette «${typeLabel(rad.type)}» fra ${tidStr(rad.endret_tid)}?`)) {
      return;
    }
    const ok = await gjenopprettVersjon(rad);
    if (ok) {
      setMelding({ tone: 'ok', tekst: 'Versjon gjenopprettet. Laster på nytt …' });
      setTimeout(() => window.location.reload(), 800);
    } else {
      setMelding({ tone: 'feil', tekst: 'Kunne ikke gjenopprette versjonen.' });
    }
  }

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Versjonshistorikk</h1>
          <p className="muted">
            Lagrede øyeblikksbilder av delt innhold. Se hva en versjon inneholdt, og gjenopprett den
            ved behov.
          </p>
        </div>
        <button className="btn-link" onClick={refresh}>
          ↻ Oppdater
        </button>
      </div>

      {melding && (
        <p className="muted" style={{ color: melding.tone === 'feil' ? 'var(--danger-base)' : 'var(--success-base)' }}>
          {melding.tekst}
        </p>
      )}

      {loading ? (
        <p className="muted">Laster …</p>
      ) : grupper.length === 0 ? (
        <p className="muted">Ingen historikk ennå.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {grupper.map(([type, snapshots]) => (
            <div key={type} className="card">
              <h2 style={{ marginTop: 0 }}>{typeLabel(type)}</h2>
              <div className="regeltable-scroll">
                <table className="logg-table">
                  <thead>
                    <tr>
                      <th>Tidspunkt</th>
                      <th>Bruker</th>
                      <th>Versjon</th>
                      <th>Endring</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {snapshots.map((rad) => (
                      <tr key={rad.id}>
                        <td>{tidStr(rad.endret_tid)}</td>
                        <td>{rad.endret_av || '—'}</td>
                        <td>{rad.versjon ?? '—'}</td>
                        <td>{rad.detalj || '—'}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button
                            className="btn-link"
                            onClick={() => setApen((s) => ({ ...s, [rad.id]: !s[rad.id] }))}
                          >
                            {apen[rad.id] ? 'Skjul innhold' : 'Vis innhold'}
                          </button>{' '}
                          <button className="btn-link" onClick={() => gjenopprett(rad)}>
                            Gjenopprett
                          </button>
                          {apen[rad.id] && (
                            <pre
                              style={{
                                marginTop: 8,
                                maxHeight: 320,
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap',
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.78rem',
                                color: 'var(--fg-1)',
                              }}
                            >
                              {JSON.stringify(rad.innhold, null, 2)}
                            </pre>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
