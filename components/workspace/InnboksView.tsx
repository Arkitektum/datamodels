'use client';

// Global «Innboks» — én samlet liste over ALLE endringsforslag på tvers av
// datamodeller, med filter (åpne / godkjent / avvist / alle) og snarvei til
// feltet/tråden. Erstatter behovet for å gå inn i hver modell for å se forslag.
import { useMemo, useState } from 'react';
import type { ForslagStatus, Melding } from '@/lib/diskusjon';

interface InnboksProps {
  messages: Melding[]; // alle diskusjon-meldinger (allerede hentet)
  modellNavn: (datamodellId: string) => string; // slå opp visningsnavn
  canDecide: boolean; // DiBK/admin kan godkjenne/avvise
  onGoTo: (datamodellId: string, kontekst: string | null) => void; // hopp til tråd
  onDecide: (id: string, status: ForslagStatus) => void;
}

// Filter-valg. 'all' = alle forslag uansett status.
type Filter = 'open' | 'approved' | 'rejected' | 'all';

const FILTRE: { key: Filter; label: string }[] = [
  { key: 'open', label: 'Åpne' },
  { key: 'approved', label: 'Godkjent' },
  { key: 'rejected', label: 'Avvist' },
  { key: 'all', label: 'Alle' },
];

const TOMME_TEKST: Record<Filter, string> = {
  open: 'Ingen åpne forslag.',
  approved: 'Ingen godkjente forslag.',
  rejected: 'Ingen avviste forslag.',
  all: 'Ingen endringsforslag.',
};

function statusPill(status: ForslagStatus | null) {
  if (status === 'approved') return { cls: 'pill pill--success', label: 'Godkjent' };
  if (status === 'rejected') return { cls: 'pill pill--danger', label: 'Avvist' };
  return { cls: 'pill pill--warning', label: 'Venter på DiBK' };
}

// Samme dato-format som DiskusjonPanel.
function formatTid(x: string) {
  return new Date(x).toLocaleString('no-NO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function InnboksView({
  messages,
  modellNavn,
  canDecide,
  onGoTo,
  onDecide,
}: InnboksProps) {
  const [filter, setFilter] = useState<Filter>('open');

  // Kun forslag — vanlige kommentarer ignoreres.
  const forslag = useMemo(
    () => messages.filter((m) => m.type === 'proposal'),
    [messages],
  );

  // Antall per filter (til knappe-tellerne).
  const tellere = useMemo(
    () => ({
      open: forslag.filter((m) => m.status === 'open').length,
      approved: forslag.filter((m) => m.status === 'approved').length,
      rejected: forslag.filter((m) => m.status === 'rejected').length,
      all: forslag.length,
    }),
    [forslag],
  );

  // Forslag i valgt filter, sortert nyeste først.
  const synlige = useMemo(() => {
    const f = filter === 'all' ? forslag : forslag.filter((m) => m.status === filter);
    return [...f].sort(
      (a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime(),
    );
  }, [forslag, filter]);

  return (
    <section
      className="pv-scroll"
      style={{ height: '100%', overflowY: 'auto', padding: '18px 20px' }}
    >
      <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: 'var(--fg-1)' }}>
        Innboks – endringsforslag
      </h2>

      {/* Filterknapper med antall per filter. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {FILTRE.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'}
            onClick={() => setFilter(f.key)}
          >
            {f.label} ({tellere[f.key]})
          </button>
        ))}
      </div>

      {synlige.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: 'var(--fg-2)',
            fontSize: '0.86rem',
            padding: 32,
          }}
        >
          {TOMME_TEKST[filter]}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {synlige.map((m) => {
            const erDibk = m.rolle === 'dibk';
            const tagCls = erDibk ? 'tag tag--success' : 'tag tag--info';
            const tagLabel = erDibk ? 'DiBK' : 'Utvikler';
            const sp = statusPill(m.status);
            const kanAvgjore = canDecide && m.status === 'open';
            const avgjort = m.status === 'approved' || m.status === 'rejected';

            return (
              <article
                key={m.id}
                style={{
                  border: '1px solid var(--accent-border)',
                  background: 'var(--accent-tinted)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 14,
                }}
              >
                {/* Modellnavn + status-pill + tid */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--accent-text)' }}>
                    {modellNavn(m.datamodell_id)}
                  </span>
                  <span className={sp.cls}>{sp.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-2)' }}>
                    {formatTid(m.opprettet)}
                  </span>
                </div>

                {/* Felt */}
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Endringsforslag · {m.felt || '(modell)'}
                </div>

                {/* Endring (mono-stil hvis satt) */}
                {m.endring && (
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      background: 'var(--bg-1)',
                      border: '1px solid var(--neutral-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '7px 9px',
                      marginBottom: 6,
                    }}
                  >
                    {m.endring}
                  </div>
                )}

                {/* Begrunnelse */}
                {m.body && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--fg-1)' }}>{m.body}</div>
                )}

                {/* Forfatter + rolle-tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--fg-1)' }}>
                    {m.forfatter}
                  </span>
                  <span className={tagCls}>{tagLabel}</span>
                </div>

                {/* Diskret avgjørelseslinje for avgjorte forslag. */}
                {avgjort && (m.avgjort_av || m.avgjort_tid) && (
                  <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--fg-2)' }}>
                    {m.status === 'approved' ? 'Godkjent' : 'Avvist'}
                    {m.avgjort_av ? ` av ${m.avgjort_av}` : ''}
                    {m.avgjort_tid ? ` · ${formatTid(m.avgjort_tid)}` : ''}
                  </div>
                )}

                {/* Handlinger */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button
                    className="btn btn--tertiary btn--sm"
                    onClick={() => onGoTo(m.datamodell_id, m.kontekst)}
                  >
                    Gå til felt
                  </button>
                  {kanAvgjore && (
                    <>
                      <button
                        className="btn btn--primary btn--sm"
                        onClick={() => onDecide(m.id, 'approved')}
                      >
                        Godkjenn
                      </button>
                      <button
                        className="btn btn--secondary btn--sm"
                        onClick={() => onDecide(m.id, 'rejected')}
                      >
                        Avvis
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
