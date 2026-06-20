'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  listBrukerRoller,
  upsertBrukerRolle,
  deleteBrukerRolle,
  type BrukerRolle,
} from '@/lib/admin';
import { ALLE_ROLLER, ROLLE_LABELS, type Rolle } from '@/lib/roller';

const SKRIVEFEIL = 'Kunne ikke lagre – krever admin-rettigheter.';

/**
 * Administrasjon av brukerroller. Selvforsynt – henter egne data. RLS sørger
 * for at kun admin kan skrive; ved avvist skriving vises en diskret feilmelding.
 */
export default function AdminView() {
  const [rader, setRader] = useState<BrukerRolle[]>([]);
  const [loading, setLoading] = useState(true);
  const [feil, setFeil] = useState<string | null>(null);

  // Skjema for ny bruker
  const [nyEpost, setNyEpost] = useState('');
  const [nyNavn, setNyNavn] = useState('');
  const [nyRolle, setNyRolle] = useState<Rolle>('utvikler');

  async function refresh() {
    setLoading(true);
    setRader(await listBrukerRoller());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function endreRolle(epost: string, rolle: Rolle, navn: string | null) {
    setFeil(null);
    const ok = await upsertBrukerRolle(epost, rolle, navn);
    if (!ok) {
      setFeil(SKRIVEFEIL);
      return;
    }
    await refresh();
  }

  async function fjern(epost: string) {
    if (!window.confirm(`Fjerne rollen til «${epost}»?`)) return;
    setFeil(null);
    const ok = await deleteBrukerRolle(epost);
    if (!ok) {
      setFeil(SKRIVEFEIL);
      return;
    }
    await refresh();
  }

  async function leggTil(e: FormEvent) {
    e.preventDefault();
    setFeil(null);
    const epost = nyEpost.trim();
    if (!epost) return;
    const ok = await upsertBrukerRolle(epost, nyRolle, nyNavn.trim() || null);
    if (!ok) {
      setFeil(SKRIVEFEIL);
      return;
    }
    setNyEpost('');
    setNyNavn('');
    setNyRolle('utvikler');
    await refresh();
  }

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Administrasjon – brukerroller</h1>
          <p className="muted">
            Brukere må først opprettes i Supabase (Authentication → Users). Her
            styres kun rollen deres.
          </p>
        </div>
        <button className="btn-link" onClick={refresh}>
          ↻ Oppdater
        </button>
      </div>

      {feil && (
        <p className="pill pill--danger" style={{ marginBottom: 16 }}>
          {feil}
        </p>
      )}

      {loading ? (
        <p className="muted">Laster …</p>
      ) : (
        <div className="regeltable-scroll">
          <table className="logg-table">
            <thead>
              <tr>
                <th>E-post</th>
                <th>Navn</th>
                <th>Rolle</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rader.length === 0 ? (
                <tr>
                  <td colSpan={4} className="muted">
                    Ingen roller registrert ennå.
                  </td>
                </tr>
              ) : (
                rader.map((r) => (
                  <tr key={r.epost}>
                    <td>{r.epost}</td>
                    <td>{r.navn || '—'}</td>
                    <td>
                      <select
                        className="input"
                        value={r.rolle}
                        onChange={(e) =>
                          endreRolle(r.epost, e.target.value as Rolle, r.navn)
                        }
                      >
                        {ALLE_ROLLER.map((rolle) => (
                          <option key={rolle} value={rolle}>
                            {ROLLE_LABELS[rolle]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn--tertiary btn--sm"
                        onClick={() => fjern(r.epost)}
                      >
                        Fjern
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <form className="card" style={{ marginTop: 24 }} onSubmit={leggTil}>
        <h2 style={{ marginTop: 0 }}>Legg til bruker</h2>
        <div
          style={{
            display: 'flex',
            gap: 12,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="muted">E-post</span>
            <input
              className="input"
              type="email"
              required
              value={nyEpost}
              onChange={(e) => setNyEpost(e.target.value)}
              placeholder="navn@domene.no"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="muted">Navn (valgfritt)</span>
            <input
              className="input"
              type="text"
              value={nyNavn}
              onChange={(e) => setNyNavn(e.target.value)}
              placeholder="Visningsnavn"
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="muted">Rolle</span>
            <select
              className="input"
              value={nyRolle}
              onChange={(e) => setNyRolle(e.target.value as Rolle)}
            >
              {ALLE_ROLLER.map((rolle) => (
                <option key={rolle} value={rolle}>
                  {ROLLE_LABELS[rolle]}
                </option>
              ))}
            </select>
          </label>
          <button className="btn btn--primary btn--md" type="submit">
            Legg til
          </button>
        </div>
      </form>
    </div>
  );
}
