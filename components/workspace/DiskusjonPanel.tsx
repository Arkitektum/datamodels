'use client';

import { useEffect, useRef, useState } from 'react';
import type { ForslagStatus, Melding, MeldingType } from '@/lib/diskusjon';
import type { Reaksjon, ReaksjonVerdi } from '@/lib/reaksjoner';
import {
  aktivOmtaleQuery,
  omtaleForslag,
  splittOmtaler,
  type OmtaleBruker,
} from '@/lib/omtaler';

function statusPill(status: ForslagStatus | null) {
  if (status === 'approved') return { cls: 'pill pill--success', label: 'Godkjent' };
  if (status === 'rejected') return { cls: 'pill pill--danger', label: 'Avvist' };
  return { cls: 'pill pill--warning', label: 'Venter på DiBK' };
}

/** Meldingstekst med uthevede @-omtaler («@Visningsnavn» fra bruker_rolle). */
function OmtaleTekst({ tekst, brukere }: { tekst: string | null; brukere: OmtaleBruker[] }) {
  if (!tekst) return null;
  const segmenter = splittOmtaler(tekst, brukere);
  return (
    <>
      {segmenter.map((s, i) =>
        s.omtale ? (
          <span
            key={i}
            style={{
              color: 'var(--accent-text)',
              fontWeight: 600,
              background: 'var(--accent-tinted)',
              borderRadius: 4,
              padding: '0 3px',
            }}
          >
            {s.tekst}
          </span>
        ) : (
          <span key={i}>{s.tekst}</span>
        ),
      )}
    </>
  );
}

export default function DiskusjonPanel({
  ctx,
  ctxLabel,
  modellNavn,
  messages,
  reaksjoner,
  brukere,
  canDecide,
  currentEpost,
  currentNavn,
  onBack,
  onSend,
  onDecide,
  onReact,
  onEdit,
  onDeleteMessage,
  onClear,
}: {
  ctx: string | null;
  ctxLabel: string;
  modellNavn: string;
  messages: Melding[];
  reaksjoner: Reaksjon[];
  /** Brukere som kan @-omtales (visningsnavn fra bruker_rolle). */
  brukere: OmtaleBruker[];
  canDecide: boolean;
  currentEpost: string;
  currentNavn: string;
  onBack: () => void;
  onSend: (p: { type: MeldingType; body: string; felt?: string; endring?: string }) => Promise<void> | void;
  onDecide: (id: string, status: ForslagStatus) => void;
  onReact: (meldingId: string, verdi: ReaksjonVerdi) => void;
  onEdit: (id: string, patch: { body?: string; endring?: string }) => Promise<void> | void;
  onDeleteMessage: (id: string) => void;
  onClear: () => void;
}) {
  const [mode, setMode] = useState<MeldingType>('comment');
  const [body, setBody] = useState('');
  const [felt, setFelt] = useState('');
  const [endring, setEndring] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState('');
  const [editEndring, setEditEndring] = useState('');
  const [caret, setCaret] = useState(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const ctxIsField = !!ctx;

  // @-autocomplete: aktivt «@søk» rett før markøren + brukere som matcher.
  const omtaleQuery = aktivOmtaleQuery(body, caret);
  const omtaleKandidater = omtaleQuery ? omtaleForslag(omtaleQuery.query, brukere) : [];

  function velgOmtale(b: OmtaleBruker) {
    if (!omtaleQuery) return;
    const foran = body.slice(0, omtaleQuery.start);
    const bak = body.slice(caret);
    const innsatt = `@${b.navn} `;
    const nyBody = foran + innsatt + bak;
    const nyCaret = foran.length + innsatt.length;
    setBody(nyBody);
    setCaret(nyCaret);
    // Sett markøren rett etter navnet når textarea har fått ny verdi.
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(nyCaret, nyCaret);
      }
    });
  }

  const eier = (m: Melding) =>
    m.epost && currentEpost
      ? m.epost.toLowerCase() === currentEpost.toLowerCase()
      : !m.epost && !!m.forfatter && m.forfatter === currentNavn;

  function startEdit(m: Melding) {
    setEditId(m.id);
    setEditBody(m.body || '');
    setEditEndring(m.endring || '');
  }
  async function lagreEdit(m: Melding) {
    const patch: { body?: string; endring?: string } = { body: editBody.trim() };
    if (m.type === 'proposal') patch.endring = editEndring.trim();
    await onEdit(m.id, patch);
    setEditId(null);
  }

  const editForm = (m: Melding) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
      {m.type === 'proposal' && (
        <input
          className="input input--sm"
          value={editEndring}
          onChange={(e) => setEditEndring(e.target.value)}
          placeholder="Foreslått endring (fra → til)"
          style={{ fontFamily: 'var(--font-mono)' }}
        />
      )}
      <textarea
        value={editBody}
        onChange={(e) => setEditBody(e.target.value)}
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          border: '1px solid var(--neutral-border-strong)',
          borderRadius: 'var(--radius-md)',
          padding: 8,
          resize: 'vertical',
          minHeight: 52,
          width: '100%',
          background: 'var(--bg-1)',
          color: 'var(--fg-1)',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn--primary btn--sm" onClick={() => lagreEdit(m)}>
          Lagre
        </button>
        <button className="btn btn--tertiary btn--sm" onClick={() => setEditId(null)}>
          Avbryt
        </button>
      </div>
    </div>
  );

  // 👍/👎 på en kommentar. Skjult/inaktiv på egne meldinger og når man ikke er
  // innlogget. Trykk samme verdi igjen for å fjerne reaksjonen.
  const reaksjonerRad = (m: Melding) => {
    if (m.type !== 'comment') return null;
    const up = reaksjoner.filter((r) => r.melding_id === m.id && r.verdi === 'up').length;
    const ned = reaksjoner.filter((r) => r.melding_id === m.id && r.verdi === 'down').length;
    const mine = currentEpost
      ? reaksjoner.find(
          (r) => r.melding_id === m.id && r.epost.toLowerCase() === currentEpost.toLowerCase(),
        )?.verdi
      : undefined;
    const egen = eier(m);
    const kanReagere = !egen && !!currentEpost;
    // På egne kommentarer kan man ikke reagere — vis bare et lesbart antall når
    // noen faktisk har reagert, ellers ingenting.
    if (egen && up + ned === 0) return null;

    const pille = (verdi: ReaksjonVerdi, emoji: string, antall: number) => {
      const aktiv = mine === verdi;
      return (
        <button
          type="button"
          disabled={!kanReagere}
          onClick={kanReagere ? () => onReact(m.id, verdi) : undefined}
          title={
            kanReagere
              ? verdi === 'up' ? 'Enig' : 'Uenig'
              : eier(m) ? 'Du kan ikke reagere på din egen kommentar' : 'Logg inn for å reagere'
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: '0.78rem',
            padding: '2px 8px',
            borderRadius: 999,
            border: `1px solid ${aktiv ? 'var(--accent-border)' : 'var(--neutral-border)'}`,
            background: aktiv ? 'var(--accent-tinted)' : 'var(--bg-1)',
            color: aktiv ? 'var(--accent-text)' : 'var(--fg-2)',
            cursor: kanReagere ? 'pointer' : 'default',
          }}
        >
          <span>{emoji}</span>
          {antall > 0 && <span style={{ fontVariantNumeric: 'tabular-nums' }}>{antall}</span>}
        </button>
      );
    };

    return (
      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
        {pille('up', '👍', up)}
        {pille('down', '👎', ned)}
      </div>
    );
  };

  const eierAksjoner = (m: Melding) =>
    eier(m) && editId !== m.id ? (
      <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
        <button className="btn btn--tertiary btn--sm" style={{ padding: '2px 2px', fontSize: '0.78rem' }} onClick={() => startEdit(m)}>
          Endre
        </button>
        <button className="btn btn--tertiary btn--sm" style={{ padding: '2px 2px', fontSize: '0.78rem' }} onClick={() => onDeleteMessage(m.id)}>
          Slett
        </button>
      </div>
    ) : null;

  useEffect(() => {
    const t = threadRef.current;
    if (t) t.scrollTop = t.scrollHeight;
  }, [messages.length, ctx]);

  async function send() {
    const b = body.trim();
    if (!b) return;
    if (mode === 'proposal') {
      const f = felt.trim() || (ctx ? ctx.split('.').pop() || '' : '') || '(modell)';
      await onSend({ type: 'proposal', body: b, felt: f, endring: endring.trim() });
      setFelt('');
      setEndring('');
    } else {
      await onSend({ type: 'comment', body: b });
    }
    setBody('');
  }

  return (
    <aside className="ws-panel">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--neutral-border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--fg-2)' }}>{ctxIsField ? 'Felt' : 'Diskusjon'}</div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: 'var(--accent-text)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ctxLabel}
          </div>
        </div>
        {ctxIsField && (
          <button className="btn btn--pill btn--sm" onClick={onBack}>
            Hele modellen
          </button>
        )}
      </div>

      <div
        ref={threadRef}
        className="pv-scroll"
        style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 200 }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--fg-2)', fontSize: '0.86rem', padding: 24 }}>
            {ctxIsField
              ? `Ingen meldinger om «${ctxLabel}» ennå. Start diskusjonen.`
              : `Ingen meldinger ennå. Start diskusjonen om ${modellNavn}.`}
          </div>
        ) : (
          messages.map((m) => {
            const erDibk = m.rolle === 'dibk';
            const tagCls = erDibk ? 'tag tag--success' : 'tag tag--info';
            const tagLabel = erDibk ? 'DiBK' : 'Utvikler';
            const tid = new Date(m.opprettet).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            if (m.type === 'proposal') {
              const sp = statusPill(m.status);
              const kanAvgjore = canDecide && m.status === 'open';
              return (
                <div
                  key={m.id}
                  style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-tinted)', borderRadius: 'var(--radius-lg)', padding: 12 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--accent-text)' }}>{m.forfatter}</span>
                    <span className={tagCls}>{tagLabel}</span>
                    <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-2)' }}>{tid}</span>
                  </div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    Endringsforslag · {m.felt || '(modell)'}
                  </div>
                  {editId === m.id ? (
                    editForm(m)
                  ) : (
                    <>
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
                      <div style={{ fontSize: '0.9rem', color: 'var(--fg-1)' }}>
                        <OmtaleTekst tekst={m.body} brukere={brukere} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span className={sp.cls}>{sp.label}</span>
                      </div>
                      {(m.status === 'approved' || m.status === 'rejected') && (m.avgjort_av || m.avgjort_tid) && (
                        <div style={{ marginTop: 4, fontSize: '0.7rem', color: 'var(--fg-2)' }}>
                          {m.status === 'approved' ? 'Godkjent' : 'Avvist'}
                          {m.avgjort_av ? ` av ${m.avgjort_av}` : ''}
                          {m.avgjort_tid
                            ? ` · ${new Date(m.avgjort_tid).toLocaleString('no-NO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}`
                            : ''}
                        </div>
                      )}
                      {kanAvgjore && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                          <button className="btn btn--primary btn--sm" onClick={() => onDecide(m.id, 'approved')}>
                            Godkjenn
                          </button>
                          <button className="btn btn--secondary btn--sm" onClick={() => onDecide(m.id, 'rejected')}>
                            Avvis
                          </button>
                        </div>
                      )}
                      {eierAksjoner(m)}
                    </>
                  )}
                </div>
              );
            }
            return (
              <div key={m.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--fg-1)' }}>{m.forfatter}</span>
                  <span className={tagCls}>{tagLabel}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--fg-2)' }}>{tid}</span>
                </div>
                {editId === m.id ? (
                  editForm(m)
                ) : (
                  <>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--fg-1)',
                        background: 'var(--bg-1)',
                        border: '1px solid var(--neutral-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '9px 11px',
                      }}
                    >
                      <OmtaleTekst tekst={m.body} brukere={brukere} />
                    </div>
                    {reaksjonerRad(m)}
                    {eierAksjoner(m)}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <div style={{ borderTop: '1px solid var(--neutral-border)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, background: 'var(--bg-1)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={mode === 'comment' ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'} onClick={() => setMode('comment')} style={{ flex: 1 }}>
            Kommentar
          </button>
          <button className={mode === 'proposal' ? 'btn btn--primary btn--sm' : 'btn btn--secondary btn--sm'} onClick={() => setMode('proposal')} style={{ flex: 1 }}>
            Endringsforslag
          </button>
        </div>
        {mode === 'proposal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input className="input input--sm" value={felt} onChange={(e) => setFelt(e.target.value)} placeholder="Felt (f.eks. fristForUttalelse)" style={{ fontFamily: 'var(--font-mono)' }} />
            <input className="input input--sm" value={endring} onChange={(e) => setEndring(e.target.value)} placeholder="Foreslått endring (fra → til)" style={{ fontFamily: 'var(--font-mono)' }} />
          </div>
        )}
        <div style={{ position: 'relative' }}>
          {omtaleQuery && omtaleKandidater.length > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: 4,
                background: 'var(--bg-1)',
                border: '1px solid var(--neutral-border-strong)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                maxHeight: 180,
                overflowY: 'auto',
                zIndex: 20,
              }}
            >
              {omtaleKandidater.slice(0, 6).map((b) => (
                <button
                  key={b.epost}
                  type="button"
                  // onMouseDown så valget skjer FØR textarea mister fokus.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    velgOmtale(b);
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    appearance: 'none',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '7px 11px',
                    fontSize: '0.86rem',
                    color: 'var(--fg-1)',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>@{b.navn}</span>
                  <span style={{ color: 'var(--fg-2)', fontSize: '0.74rem', marginLeft: 8 }}>
                    {b.epost}
                  </span>
                </button>
              ))}
            </div>
          )}
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setCaret(e.target.selectionStart ?? e.target.value.length);
            }}
            onSelect={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
            placeholder={
              mode === 'proposal'
                ? 'Begrunnelse for endringen… (@navn varsler en kollega)'
                : 'Skriv en kommentar… (@navn varsler en kollega)'
            }
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9rem',
              border: '1px solid var(--neutral-border-strong)',
              borderRadius: 'var(--radius-md)',
              padding: 9,
              resize: 'vertical',
              minHeight: 56,
              width: '100%',
              background: 'var(--bg-1)',
              color: 'var(--fg-1)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--primary btn--md" onClick={send} style={{ flex: 1 }}>
            Send
          </button>
          {/* Tømming av hele tråden (alles meldinger) er forbeholdt DiBK. */}
          {canDecide && (
            <button className="btn btn--tertiary btn--sm" onClick={onClear} title="Sletter hele tråden">
              Tøm tråd
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
