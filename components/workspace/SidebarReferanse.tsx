'use client';

import { useEffect, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import type { VedleggType } from '@/data/hoeringOgOffentligEttersynV2.kodelister';
import { ModellView } from './types';
import SidebarKodelister from './SidebarKodelister';

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
      <path d="M6 4 L10 8 L6 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Seksjon({ tittel, defaultOpen, children }: { tittel: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          appearance: 'none',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px 0',
          color: 'var(--accent-text)',
        }}
      >
        <Chevron open={open} />
        <span className="eyebrow" style={{ margin: 0 }}>
          {tittel}
        </span>
      </button>
      {open && <div style={{ marginTop: 6 }}>{children}</div>}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.64rem',
        background: 'var(--neutral-bg-input)',
        color: 'var(--fg-2)',
        borderRadius: 'var(--radius-sm)',
        padding: '1px 5px',
      }}
    >
      {children}
    </span>
  );
}

export default function SidebarReferanse({ model }: { model: ModellView }) {
  const { value, setValue, status } = useDokumentData<VedleggType[]>(model.id, 'vedlegg', model.vedleggDefault);
  const [vedlegg, setVedlegg] = useState<VedleggType[]>(model.vedleggDefault);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [draftNavn, setDraftNavn] = useState('');
  const [draftFil, setDraftFil] = useState('');
  const adopted = useRef(false);

  useEffect(() => {
    if (adopted.current) return;
    if (status === 'idle') {
      setVedlegg(Array.isArray(value) && value.length ? value : model.vedleggDefault);
      adopted.current = true;
    }
  }, [status, value, model.vedleggDefault]);

  // Bytt aktiv modell → nullstill adopsjon (komponenten remountes via key i Sidebar)

  function lagre(next: VedleggType[], detalj: string) {
    setVedlegg(next);
    setValue(next, detalj);
  }
  function startEdit(i: number) {
    setEditIdx(i);
    setDraftNavn(vedlegg[i].navn);
    setDraftFil(vedlegg[i].filtyper.join(', '));
  }
  function startNy() {
    setEditIdx(vedlegg.length);
    setDraftNavn('');
    setDraftFil('');
  }
  function avbryt() {
    setEditIdx(null);
  }
  function lagreEdit() {
    const navn = draftNavn.trim();
    if (!navn) return;
    const filtyper = draftFil
      .split(/[,\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const item: VedleggType = { navn, filtyper };
    const erNy = editIdx === vedlegg.length;
    const next = erNy
      ? [...vedlegg, item]
      : vedlegg.map((v, i) => (i === editIdx ? item : v));
    lagre(next, erNy ? `La til vedlegg «${navn}»` : `Endret vedlegg «${navn}»`);
    setEditIdx(null);
  }
  function slett(i: number) {
    if (!window.confirm(`Fjerne vedlegget «${vedlegg[i].navn}»?`)) return;
    lagre(vedlegg.filter((_, j) => j !== i), `Slettet vedlegg «${vedlegg[i].navn}»`);
  }

  const editRow = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 0' }}>
      <input className="input input--sm" value={draftNavn} onChange={(e) => setDraftNavn(e.target.value)} placeholder="Navn på vedlegg" autoFocus />
      <input className="input input--sm" value={draftFil} onChange={(e) => setDraftFil(e.target.value)} placeholder="Filtyper, f.eks. PDF, PNG" style={{ fontFamily: 'var(--font-mono)' }} />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn--primary btn--sm" onClick={lagreEdit} style={{ flex: 1 }}>
          Lagre
        </button>
        <button className="btn btn--tertiary btn--sm" onClick={avbryt}>
          Avbryt
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 8, paddingTop: 14, borderTop: '1px solid var(--neutral-border)' }}>
      <div style={{ fontSize: '0.72rem', color: 'var(--fg-3)', marginBottom: 10 }}>
        Referanse for <strong style={{ color: 'var(--fg-2)' }}>{model.navn}</strong>
      </div>

      {/* Forventede vedlegg — redigerbart */}
      <Seksjon tittel="📎 Forventede vedlegg" defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {vedlegg.map((v, i) =>
            editIdx === i ? (
              <div key={i}>{editRow}</div>
            ) : (
              <div key={i} style={{ padding: '5px 0', borderBottom: '1px solid var(--neutral-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--fg-1)', flex: 1, minWidth: 0 }}>{v.navn}</span>
                  <button className="ref-mini" title="Endre" onClick={() => startEdit(i)} style={miniBtn}>✎</button>
                  <button className="ref-mini" title="Fjern" onClick={() => slett(i)} style={miniBtn}>✕</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 3 }}>
                  {v.filtyper.map((f) => (
                    <Tag key={f}>{f}</Tag>
                  ))}
                </div>
              </div>
            ),
          )}
          {editIdx === vedlegg.length && editRow}
          {editIdx === null && (
            <button className="btn btn--secondary btn--sm" onClick={startNy} style={{ marginTop: 8 }}>
              + Legg til vedlegg
            </button>
          )}
          <span className={`save-status ${status}`} style={{ fontSize: '0.68rem', marginTop: 4, color: 'var(--fg-3)' }}>
            {status === 'saving' ? 'Lagrer …' : status === 'saved' ? 'Lagret (delt)' : ''}
          </span>
        </div>
      </Seksjon>

      {/* Generiske, redigerbare kodelister */}
      <SidebarKodelister model={model} />
    </div>
  );
}

const miniBtn: React.CSSProperties = {
  appearance: 'none',
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: 'var(--fg-3)',
  fontSize: '0.78rem',
  lineHeight: 1,
  padding: 2,
  flexShrink: 0,
};
