'use client';

import { useEffect, useRef, useState } from 'react';
import type { ForslagStatus, Melding, MeldingType } from '@/lib/diskusjon';

function statusPill(status: ForslagStatus | null) {
  if (status === 'approved') return { cls: 'pill pill--success', label: 'Godkjent' };
  if (status === 'rejected') return { cls: 'pill pill--danger', label: 'Avvist' };
  return { cls: 'pill pill--warning', label: 'Venter på DiBK' };
}

export default function DiskusjonPanel({
  ctx,
  ctxLabel,
  modellNavn,
  messages,
  canDecide,
  currentEpost,
  currentNavn,
  onBack,
  onSend,
  onDecide,
  onEdit,
  onDeleteMessage,
  onClear,
}: {
  ctx: string | null;
  ctxLabel: string;
  modellNavn: string;
  messages: Melding[];
  canDecide: boolean;
  currentEpost: string;
  currentNavn: string;
  onBack: () => void;
  onSend: (p: { type: MeldingType; body: string; felt?: string; endring?: string }) => Promise<void> | void;
  onDecide: (id: string, status: ForslagStatus) => void;
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
  const threadRef = useRef<HTMLDivElement>(null);
  const ctxIsField = !!ctx;

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
                      <div style={{ fontSize: '0.9rem', color: 'var(--fg-1)' }}>{m.body}</div>
                      <div style={{ marginTop: 8 }}>
                        <span className={sp.cls}>{sp.label}</span>
                      </div>
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
                      {m.body}
                    </div>
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
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={mode === 'proposal' ? 'Begrunnelse for endringen…' : 'Skriv en kommentar…'}
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
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn--primary btn--md" onClick={send} style={{ flex: 1 }}>
            Send
          </button>
          <button className="btn btn--tertiary btn--sm" onClick={onClear}>
            Tøm tråd
          </button>
        </div>
      </div>
    </aside>
  );
}
