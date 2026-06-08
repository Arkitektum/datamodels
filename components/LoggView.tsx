'use client';

import { useEffect, useState } from 'react';
import { listRecentChanges, typeLabel, type LoggRad } from '@/lib/logg';

/** Endringslogg for én datamodell – hvem endret hva og når. */
export default function LoggView({ datamodellId }: { datamodellId: string }) {
  const [rader, setRader] = useState<LoggRad[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    setRader(await listRecentChanges(datamodellId, 100));
    setLoading(false);
  }
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datamodellId]);

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Endringslogg</h1>
          <p className="muted">Siste endringer i denne datamodellen – hvem gjorde hva og når.</p>
        </div>
        <button className="btn-link" onClick={refresh}>
          ↻ Oppdater
        </button>
      </div>

      {loading ? (
        <p className="muted">Laster …</p>
      ) : rader.length === 0 ? (
        <p className="muted">Ingen endringer registrert ennå for denne modellen.</p>
      ) : (
        <div className="regeltable-scroll">
          <table className="logg-table">
            <thead>
              <tr>
                <th>Tidspunkt</th>
                <th>Bruker</th>
                <th>Hva</th>
                <th>Endring</th>
                <th>Handling</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.tidspunkt).toLocaleString('no-NO')}</td>
                  <td>{r.endret_av || '—'}</td>
                  <td>{typeLabel(r.type)}</td>
                  <td>{r.detalj || '—'}</td>
                  <td>
                    <span className={`logg-handling logg-${r.handling}`}>{r.handling}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
