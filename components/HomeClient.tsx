'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { DATAMODELLER } from '@/lib/datamodeller';
import {
  type CustomModell,
  listCustomModels,
  createCustomModel,
  deleteCustomModel,
} from '@/lib/customModels';

export default function HomeClient() {
  const [custom, setCustom] = useState<CustomModell[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [nyNavn, setNyNavn] = useState('');
  const [nyBesk, setNyBesk] = useState('');

  async function refresh() {
    setCustom(await listCustomModels());
    setLoading(false);
  }
  useEffect(() => {
    refresh();
  }, []);

  function openCreate() {
    setNyNavn('');
    setNyBesk('');
    setShowCreate(true);
  }

  async function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    const navn = nyNavn.trim();
    if (!navn) return;
    setBusy(true);
    const created = await createCustomModel(navn, nyBesk.trim() || undefined);
    setBusy(false);
    if (!created) {
      alert('Kunne ikke opprette modellen. Sjekk at du er innlogget og at databasen tillater det.');
      return;
    }
    setShowCreate(false);
    refresh();
  }

  async function onDelete(m: CustomModell) {
    if (!confirm(`Slette modellen «${m.navn}» og alt innholdet? Kan ikke angres.`)) return;
    const ok = await deleteCustomModel(m.id);
    if (ok) refresh();
    else alert('Kunne ikke slette modellen.');
  }

  return (
    <>
      <TopBar />
      <main className="container">
        <div className="page-head">
          <div>
            <h1>Datamodeller</h1>
            <p className="muted">
              Velg en datamodell, eller lag en ny fra scratch. Endringer lagres delt – alle i
              teamet ser samme innhold.
            </p>
          </div>
          <button className="btn-primary" onClick={openCreate} disabled={busy}>
            ➕ Ny modell
          </button>
        </div>

        <h2>Innebygde</h2>
        <div className="dm-grid">
          {DATAMODELLER.map((d) => (
            <div key={d.id} className="card dm-card">
              <h3>{d.navn}</h3>
              <p>{d.beskrivelse}</p>
              <span className="dm-go">Åpne →</span>
              <Link href={`/datamodell/${d.slug}`} className="dm-stretch" aria-label={d.navn} />
            </div>
          ))}
        </div>

        <h2>Egendefinerte</h2>
        {loading ? (
          <p className="muted">Laster …</p>
        ) : custom.length === 0 ? (
          <p className="muted">Ingen egendefinerte modeller ennå. Trykk «➕ Ny modell» for å lage en.</p>
        ) : (
          <div className="dm-grid">
            {custom.map((m) => (
              <div key={m.id} className="card dm-card dm-card-custom">
                <button className="dm-del" onClick={() => onDelete(m)} title="Slett modell" aria-label="Slett">
                  ×
                </button>
                <h3>{m.navn}</h3>
                <p>{m.beskrivelse || 'Egendefinert modell'}</p>
                <span className="dm-go">Åpne →</span>
                <Link
                  href={`/modell?id=${encodeURIComponent(m.id)}&navn=${encodeURIComponent(m.navn)}`}
                  className="dm-stretch"
                  aria-label={m.navn}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <form className="card signin-card" onClick={(e) => e.stopPropagation()} onSubmit={submitCreate}>
            <h1 style={{ fontSize: '1.4rem' }}>Ny datamodell</h1>
            <label>
              Navn
              <input value={nyNavn} onChange={(e) => setNyNavn(e.target.value)} autoFocus required />
            </label>
            <label>
              Beskrivelse
              <textarea
                value={nyBesk}
                onChange={(e) => setNyBesk(e.target.value)}
                rows={3}
                placeholder="Kort beskrivelse av modellen (valgfritt)"
                style={{ width: '100%', marginTop: 5, padding: '11px 13px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? 'Oppretter …' : 'Opprett modell'}
            </button>
            <button type="button" className="btn-link" style={{ marginTop: 12 }} onClick={() => setShowCreate(false)}>
              Avbryt
            </button>
          </form>
        </div>
      )}
    </>
  );
}
