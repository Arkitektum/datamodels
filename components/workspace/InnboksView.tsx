'use client';

// Global «Innboks» — én samlet liste på tvers av datamodeller. Endringsforslag
// vises individuelt (hvert er en avgjørelse). Kommentarer grupperes PER FELT
// (én rad per felt-tråd med antall), ikke én rad per kommentar. Type-filter
// (Alle / Forslag / Kommentarer), status-filter for forslag, og snarvei rett
// til felt-tråden.
import { useMemo, useState } from 'react';
import type { ForslagStatus, Melding } from '@/lib/diskusjon';

interface InnboksProps {
  messages: Melding[]; // alle diskusjon-meldinger (allerede hentet)
  modellNavn: (datamodellId: string) => string; // slå opp visningsnavn
  canDecide: boolean; // DiBK/admin kan godkjenne/avvise
  onGoTo: (datamodellId: string, kontekst: string | null) => void; // hopp til tråd
  onDecide: (id: string, status: ForslagStatus) => void;
}

// Hvilken meldingstype som vises.
type TypeFilter = 'all' | 'proposal' | 'comment';
// Status-filter — gjelder kun endringsforslag.
type StatusFilter = 'open' | 'approved' | 'rejected' | 'all';

// Én felt-tråd med kommentarer (gruppert).
interface KommentarGruppe {
  datamodell_id: string;
  kontekst: string | null;
  antall: number;
  siste: Melding; // nyeste kommentar i tråden
}

const TYPE_FILTRE: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Alle' },
  { key: 'proposal', label: 'Forslag' },
  { key: 'comment', label: 'Kommentarer' },
];

const STATUS_FILTRE: { key: StatusFilter; label: string }[] = [
  { key: 'open', label: 'Åpne' },
  { key: 'approved', label: 'Godkjent' },
  { key: 'rejected', label: 'Avvist' },
  { key: 'all', label: 'Alle' },
];

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

// Full feltsti (objekt.felt) for et kort, eller modellnivå.
function feltSti(m: Melding): string {
  return m.kontekst?.trim() || m.felt?.trim() || '(hele modellen)';
}

export default function InnboksView({
  messages,
  modellNavn,
  canDecide,
  onGoTo,
  onDecide,
}: InnboksProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');

  const forslag = useMemo(() => messages.filter((m) => m.type === 'proposal'), [messages]);

  // Kommentarer gruppert per felt-tråd (datamodell + kontekst), nyeste først.
  const kommentarGrupper = useMemo<KommentarGruppe[]>(() => {
    const map = new Map<string, KommentarGruppe>();
    for (const m of messages) {
      if (m.type !== 'comment') continue;
      const noekkel = `${m.datamodell_id}::${m.kontekst ?? ''}`;
      const fin = map.get(noekkel);
      if (!fin) {
        map.set(noekkel, { datamodell_id: m.datamodell_id, kontekst: m.kontekst, antall: 1, siste: m });
      } else {
        fin.antall += 1;
        if (new Date(m.opprettet).getTime() > new Date(fin.siste.opprettet).getTime()) fin.siste = m;
      }
    }
    return [...map.values()].sort(
      (a, b) => new Date(b.siste.opprettet).getTime() - new Date(a.siste.opprettet).getTime(),
    );
  }, [messages]);

  // Antall per type (til knappe-tellerne). Kommentarer telles per felt-tråd.
  const typeTellere = useMemo(
    () => ({
      all: forslag.length + kommentarGrupper.length,
      proposal: forslag.length,
      comment: kommentarGrupper.length,
    }),
    [forslag, kommentarGrupper],
  );

  // Antall per status (kun forslag — til status-knappene).
  const statusTellere = useMemo(
    () => ({
      open: forslag.filter((m) => m.status === 'open').length,
      approved: forslag.filter((m) => m.status === 'approved').length,
      rejected: forslag.filter((m) => m.status === 'rejected').length,
      all: forslag.length,
    }),
    [forslag],
  );

  const visStatusFilter = typeFilter === 'proposal';

  // Forslag i valgt status-filter, sortert nyeste først.
  const synligeForslag = useMemo(() => {
    const f = statusFilter === 'all' ? forslag : forslag.filter((m) => m.status === statusFilter);
    return [...f].sort(
      (a, b) => new Date(b.opprettet).getTime() - new Date(a.opprettet).getTime(),
    );
  }, [forslag, statusFilter]);

  // Samlet «Alle»-liste: forslag + kommentar-grupper, sortert nyeste først.
  type Rad = { kind: 'forslag'; m: Melding } | { kind: 'gruppe'; g: KommentarGruppe };
  const synligeAlle = useMemo<Rad[]>(() => {
    const rader: { tid: number; rad: Rad }[] = [
      ...forslag.map((m) => ({ tid: new Date(m.opprettet).getTime(), rad: { kind: 'forslag', m } as Rad })),
      ...kommentarGrupper.map((g) => ({
        tid: new Date(g.siste.opprettet).getTime(),
        rad: { kind: 'gruppe', g } as Rad,
      })),
    ];
    return rader.sort((a, b) => b.tid - a.tid).map((r) => r.rad);
  }, [forslag, kommentarGrupper]);

  const tomTekst =
    typeFilter === 'comment'
      ? 'Ingen kommentarer.'
      : typeFilter === 'proposal'
        ? 'Ingen endringsforslag i dette filteret.'
        : 'Ingen meldinger ennå.';

  // Hva som faktisk vises i valgt type-filter.
  const rader: Rad[] =
    typeFilter === 'comment'
      ? kommentarGrupper.map((g) => ({ kind: 'gruppe', g }))
      : typeFilter === 'proposal'
        ? synligeForslag.map((m) => ({ kind: 'forslag', m }))
        : synligeAlle;

  return (
    <section
      className="pv-scroll"
      style={{ height: '100%', overflowY: 'auto', padding: '18px 20px' }}
    >
      <h2 style={{ margin: '0 0 14px', fontSize: '1.05rem', color: 'var(--fg-1)' }}>
        Innboks – forslag og kommentarer
      </h2>

      {/* Type-filter (Alle / Forslag / Kommentarer). */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {TYPE_FILTRE.map((f) => (
          <button
            key={f.key}
            className={typeFilter === f.key ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'}
            onClick={() => setTypeFilter(f.key)}
          >
            {f.label} ({typeTellere[f.key]})
          </button>
        ))}
      </div>

      {/* Status-filter — kun for forslag. */}
      {visStatusFilter && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
          {STATUS_FILTRE.map((f) => (
            <button
              key={f.key}
              className="btn btn--pill btn--sm"
              onClick={() => setStatusFilter(f.key)}
              style={statusFilter === f.key ? { borderColor: 'var(--accent-border)', color: 'var(--accent-text)' } : undefined}
            >
              {f.label} ({statusTellere[f.key]})
            </button>
          ))}
        </div>
      )}
      {!visStatusFilter && <div style={{ marginBottom: 16 }} />}

      {rader.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--fg-2)', fontSize: '0.86rem', padding: 32 }}>
          {tomTekst}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {rader.map((r) =>
            r.kind === 'forslag' ? (
              <ForslagKort
                key={r.m.id}
                m={r.m}
                modellNavn={modellNavn}
                canDecide={canDecide}
                onGoTo={onGoTo}
                onDecide={onDecide}
              />
            ) : (
              <KommentarGruppeKort
                key={`${r.g.datamodell_id}::${r.g.kontekst ?? ''}`}
                g={r.g}
                modellNavn={modellNavn}
                onGoTo={onGoTo}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

// ---- Kort: endringsforslag (individuelt) ----------------------------------

function ForslagKort({
  m,
  modellNavn,
  canDecide,
  onGoTo,
  onDecide,
}: {
  m: Melding;
  modellNavn: (id: string) => string;
  canDecide: boolean;
  onGoTo: (id: string, kontekst: string | null) => void;
  onDecide: (id: string, status: ForslagStatus) => void;
}) {
  const erDibk = m.rolle === 'dibk';
  const tagCls = erDibk ? 'tag tag--success' : 'tag tag--info';
  const tagLabel = erDibk ? 'DiBK' : 'Utvikler';
  const sp = statusPill(m.status);
  const kanAvgjore = canDecide && m.status === 'open';
  const avgjort = m.status === 'approved' || m.status === 'rejected';

  return (
    <article
      onClick={() => onGoTo(m.datamodell_id, m.kontekst)}
      title="Åpne diskusjon for dette feltet"
      style={kortStil}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--accent-text)' }}>
          {modellNavn(m.datamodell_id)}
        </span>
        <span className={sp.cls}>{sp.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-2)' }}>
          {formatTid(m.opprettet)}
        </span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6 }}>
        Endringsforslag ·{' '}
        <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'none' }}>{feltSti(m)}</span>
      </div>

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

      {m.body && <div style={{ fontSize: '0.9rem', color: 'var(--fg-1)' }}>{m.body}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--fg-1)' }}>{m.forfatter}</span>
        <span className={tagCls}>{tagLabel}</span>
      </div>

      {avgjort && (m.avgjort_av || m.avgjort_tid) && (
        <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--fg-2)' }}>
          {m.status === 'approved' ? 'Godkjent' : 'Avvist'}
          {m.avgjort_av ? ` av ${m.avgjort_av}` : ''}
          {m.avgjort_tid ? ` · ${formatTid(m.avgjort_tid)}` : ''}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn--tertiary btn--sm" onClick={() => onGoTo(m.datamodell_id, m.kontekst)}>
          Åpne diskusjon
        </button>
        {kanAvgjore && (
          <>
            <button className="btn btn--primary btn--sm" onClick={() => onDecide(m.id, 'approved')}>
              Godkjenn
            </button>
            <button className="btn btn--secondary btn--sm" onClick={() => onDecide(m.id, 'rejected')}>
              Avvis
            </button>
          </>
        )}
      </div>
    </article>
  );
}

// ---- Kort: kommentar-tråd per felt (gruppert) -----------------------------

function KommentarGruppeKort({
  g,
  modellNavn,
  onGoTo,
}: {
  g: KommentarGruppe;
  modellNavn: (id: string) => string;
  onGoTo: (id: string, kontekst: string | null) => void;
}) {
  const erDibk = g.siste.rolle === 'dibk';
  const tagCls = erDibk ? 'tag tag--success' : 'tag tag--info';
  const tagLabel = erDibk ? 'DiBK' : 'Utvikler';

  return (
    <article
      onClick={() => onGoTo(g.datamodell_id, g.kontekst)}
      title="Åpne diskusjon for dette feltet"
      style={kortStil}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--accent-text)' }}>
          {modellNavn(g.datamodell_id)}
        </span>
        <span className="pill pill--neutral">{g.antall} kommentar{g.antall === 1 ? '' : 'er'}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-2)' }}>
          {formatTid(g.siste.opprettet)}
        </span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6 }}>
        Kommentarer ·{' '}
        <span style={{ fontFamily: 'var(--font-mono)', textTransform: 'none' }}>{feltSti(g.siste)}</span>
      </div>

      {g.siste.body && (
        <div style={{ fontSize: '0.9rem', color: 'var(--fg-1)' }}>
          <span style={{ color: 'var(--fg-2)', fontSize: '0.72rem' }}>Siste: </span>
          {g.siste.body}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
        <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--fg-1)' }}>{g.siste.forfatter}</span>
        <span className={tagCls}>{tagLabel}</span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
        <button className="btn btn--tertiary btn--sm" onClick={() => onGoTo(g.datamodell_id, g.kontekst)}>
          Åpne diskusjon
        </button>
      </div>
    </article>
  );
}

const kortStil: React.CSSProperties = {
  border: '1px solid var(--accent-border)',
  background: 'var(--accent-tinted)',
  borderRadius: 'var(--radius-lg)',
  padding: 14,
  cursor: 'pointer',
};
