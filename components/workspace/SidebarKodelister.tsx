'use client';

import { useEffect, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import type { Kodeliste, KodelisteRad } from '@/data/hoeringOgOffentligEttersynV2.kodelister';
import { ModellView } from './types';

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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="11" height="11" aria-hidden="true" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}>
      <path d="M6 4 L10 8 L6 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type EditPos = { li: number; ri: number | 'new' } | null;

export default function SidebarKodelister({ model }: { model: ModellView }) {
  const { value, setValue, status } = useDokumentData<Kodeliste[]>(model.id, 'kodelister', model.kodelisterDefault);
  const [lister, setLister] = useState<Kodeliste[]>(model.kodelisterDefault);
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [edit, setEdit] = useState<EditPos>(null);
  const [draftKode, setDraftKode] = useState('');
  const [draftBesk, setDraftBesk] = useState('');
  const adopted = useRef(false);

  useEffect(() => {
    if (adopted.current) return;
    if (status === 'idle') {
      setLister(Array.isArray(value) && value.length ? value : model.kodelisterDefault);
      adopted.current = true;
    }
  }, [status, value, model.kodelisterDefault]);

  function lagre(next: Kodeliste[], detalj: string) {
    setLister(next);
    setValue(next, detalj);
  }

  function nyListe() {
    const navn = window.prompt('Navn på kodeliste (f.eks. Roller)');
    if (!navn || !navn.trim()) return;
    const next = [...lister, { navn: navn.trim(), rader: [] }];
    lagre(next, `La til kodeliste «${navn.trim()}»`);
    setOpen((o) => ({ ...o, [next.length - 1]: true }));
  }
  function endreNavn(li: number) {
    const navn = window.prompt('Nytt navn på kodelista', lister[li].navn);
    if (!navn || !navn.trim()) return;
    lagre(lister.map((l, i) => (i === li ? { ...l, navn: navn.trim() } : l)), `Endret kodelistenavn til «${navn.trim()}»`);
  }
  function slettListe(li: number) {
    if (!window.confirm(`Slette kodelista «${lister[li].navn}»?`)) return;
    lagre(lister.filter((_, i) => i !== li), `Slettet kodeliste «${lister[li].navn}»`);
  }
  function startRad(li: number, ri: number | 'new') {
    setEdit({ li, ri });
    if (ri === 'new') {
      setDraftKode('');
      setDraftBesk('');
    } else {
      setDraftKode(lister[li].rader[ri].kode);
      setDraftBesk(lister[li].rader[ri].beskrivelse);
    }
  }
  function lagreRad() {
    if (!edit) return;
    const kode = draftKode.trim();
    if (!kode) return;
    const rad: KodelisteRad = { kode, beskrivelse: draftBesk.trim() };
    const { li, ri } = edit;
    const erNy = ri === 'new';
    const next = lister.map((l, i) => {
      if (i !== li) return l;
      const rader = erNy ? [...l.rader, rad] : l.rader.map((r, j) => (j === ri ? rad : r));
      return { ...l, rader };
    });
    lagre(next, `${erNy ? 'La til' : 'Endret'} kode «${kode}» i «${lister[li].navn}»`);
    setEdit(null);
  }
  function slettRad(li: number, ri: number) {
    const next = lister.map((l, i) => (i === li ? { ...l, rader: l.rader.filter((_, j) => j !== ri) } : l));
    lagre(next, `Slettet kode «${lister[li].rader[ri].kode}» i «${lister[li].navn}»`);
  }

  const radEditor = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '6px 0' }}>
      <input className="input input--sm" value={draftKode} onChange={(e) => setDraftKode(e.target.value)} placeholder="kode" autoFocus style={{ fontFamily: 'var(--font-mono)' }} />
      <input className="input input--sm" value={draftBesk} onChange={(e) => setDraftBesk(e.target.value)} placeholder="beskrivelse" />
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn--primary btn--sm" onClick={lagreRad} style={{ flex: 1 }}>
          Lagre
        </button>
        <button className="btn btn--tertiary btn--sm" onClick={() => setEdit(null)}>
          Avbryt
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <span className="eyebrow" style={{ margin: 0 }}>
          🏷️ Kodelister
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--fg-3)' }}>{lister.length}</span>
        <button className="btn btn--tertiary btn--sm" onClick={nyListe} style={{ marginLeft: 'auto', padding: '2px 6px' }}>
          + Ny
        </button>
      </div>

      {lister.length === 0 && (
        <p style={{ fontSize: '0.74rem', color: 'var(--fg-3)', margin: '0 0 6px' }}>
          Ingen kodelister ennå. Trykk «+ Ny» for å lage en (f.eks. Roller).
        </p>
      )}

      {lister.map((l, li) => {
        const er = !!open[li];
        return (
          <div key={li} style={{ marginBottom: 6, border: '1px solid var(--neutral-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: 'var(--neutral-bg-input)' }}>
              <button onClick={() => setOpen((o) => ({ ...o, [li]: !er }))} style={{ ...miniBtn, color: 'var(--accent-text)', display: 'flex', alignItems: 'center', gap: 5, flex: 1, minWidth: 0 }}>
                <Chevron open={er} />
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.navn}</span>
                <span style={{ fontSize: '0.68rem', color: 'var(--fg-3)' }}>({l.rader.length})</span>
              </button>
              <button title="Endre navn" onClick={() => endreNavn(li)} style={miniBtn}>✎</button>
              <button title="Slett liste" onClick={() => slettListe(li)} style={miniBtn}>✕</button>
            </div>
            {er && (
              <div style={{ padding: '6px 8px' }}>
                {l.rader.map((r, ri) =>
                  edit && edit.li === li && edit.ri === ri ? (
                    <div key={ri}>{radEditor}</div>
                  ) : (
                    <div key={ri} style={{ display: 'flex', gap: 6, alignItems: 'baseline', padding: '2px 0' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', background: 'var(--neutral-bg-input)', color: 'var(--fg-2)', borderRadius: 'var(--radius-sm)', padding: '1px 5px', flexShrink: 0 }}>{r.kode}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--fg-1)', flex: 1, minWidth: 0 }}>{r.beskrivelse}</span>
                      <button title="Endre" onClick={() => startRad(li, ri)} style={miniBtn}>✎</button>
                      <button title="Fjern" onClick={() => slettRad(li, ri)} style={miniBtn}>✕</button>
                    </div>
                  ),
                )}
                {edit && edit.li === li && edit.ri === 'new' && radEditor}
                {!(edit && edit.li === li) && (
                  <button className="btn btn--tertiary btn--sm" onClick={() => startRad(li, 'new')} style={{ marginTop: 4, padding: '2px 6px' }}>
                    + kode
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
      <span className={`save-status ${status}`} style={{ fontSize: '0.68rem', color: 'var(--fg-3)' }}>
        {status === 'saving' ? 'Lagrer …' : status === 'saved' ? 'Lagret (delt)' : ''}
      </span>
    </div>
  );
}
