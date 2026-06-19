'use client';

import { ModellView } from '../types';

export default function EksempelTab({ model }: { model: ModellView }) {
  const rows = model.eksempel ?? [];
  if (rows.length === 0) {
    return (
      <div className="callout callout--info">
        <span className="callout-icon" />
        <div>
          <strong className="callout-title">Ingen eksempeldata ennå</strong>
          <div>Et utfylt eksempel legges til når modellen er ferdig.</div>
        </div>
      </div>
    );
  }
  return (
    <div>
      <p className="p p-sm" style={{ color: 'var(--fg-2)', marginBottom: 12 }}>
        Syntetisk eksempel. Felter som ikke fylles ut er utelatt.
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '42%' }}>Felt</th>
            <th>Verdi</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82rem',
                  color: 'var(--accent-text)',
                }}
              >
                {r.k}
              </td>
              <td>{r.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
