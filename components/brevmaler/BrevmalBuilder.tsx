'use client';

import { useEffect, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import { type Brev, type BlokkType, type BrevmalDok, uid } from '@/lib/brevmalDok';

export default function BrevmalBuilder({ datamodellId }: { datamodellId: string }) {
  const { value, setValue, status } = useDokumentData<BrevmalDok>(datamodellId, 'brevmaler', {
    brev: [],
  });
  const [brev, setBrev] = useState<Brev[]>([]);
  const adopted = useRef(false);

  useEffect(() => {
    if (adopted.current) return;
    if (status === 'idle') {
      setBrev(Array.isArray(value?.brev) ? value.brev : []);
      adopted.current = true;
    }
  }, [status, value]);

  function update(next: Brev[], detalj?: string) {
    setBrev(next);
    setValue({ brev: next }, detalj);
  }
  const tittelAv = (id: string) => brev.find((b) => b.id === id)?.tittel || '';

  const addBrev = () =>
    update([...brev, { id: uid(), tittel: 'Nytt brev', blokker: [] }], 'La til brev');
  const deleteBrev = (id: string) => {
    if (!confirm('Slette dette brevet?')) return;
    update(brev.filter((b) => b.id !== id), `Slettet brev «${tittelAv(id)}»`);
  };
  // tekstendringer lagres stille; logges «fra → til» ved blur
  const renameBrev = (id: string, tittel: string) =>
    update(brev.map((b) => (b.id === id ? { ...b, tittel } : b)));

  const addBlokk = (brevId: string, type: BlokkType) =>
    update(
      brev.map((b) =>
        b.id === brevId ? { ...b, blokker: [...b.blokker, { id: uid(), type, tekst: '' }] } : b,
      ),
      `La til ${type} i «${tittelAv(brevId)}»`,
    );
  const editBlokk = (brevId: string, blokkId: string, tekst: string) =>
    update(
      brev.map((b) =>
        b.id === brevId
          ? { ...b, blokker: b.blokker.map((bl) => (bl.id === blokkId ? { ...bl, tekst } : bl)) }
          : b,
      ),
    );

  // blur-logging «fra → til»
  const focusVal = useRef('');
  const kort = (s: string) => (s.length > 100 ? s.slice(0, 100) + '…' : s);
  const logBlur = (label: string, ny: string) => {
    if (ny !== focusVal.current) setValue({ brev }, `${label}: «${kort(focusVal.current)}» → «${kort(ny)}»`);
  };
  const deleteBlokk = (brevId: string, blokkId: string) =>
    update(
      brev.map((b) =>
        b.id === brevId ? { ...b, blokker: b.blokker.filter((bl) => bl.id !== blokkId) } : b,
      ),
      `Fjernet blokk i «${tittelAv(brevId)}»`,
    );
  const moveBlokk = (brevId: string, idx: number, dir: -1 | 1) =>
    update(
      brev.map((b) => {
        if (b.id !== brevId) return b;
        const blokker = [...b.blokker];
        const j = idx + dir;
        if (j < 0 || j >= blokker.length) return b;
        [blokker[idx], blokker[j]] = [blokker[j], blokker[idx]];
        return { ...b, blokker };
      }),
      `Flyttet blokk i «${tittelAv(brevId)}»`,
    );

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Brevmaler</h1>
          <p className="muted">Bygg egne brev med overskrifter og tekstavsnitt.</p>
        </div>
        <div className="regel-controls" style={{ margin: 0 }}>
          <button type="button" className="btn-primary" onClick={addBrev}>
            ➕ Nytt brev
          </button>
          <span className={`save-status ${status}`} style={{ alignSelf: 'center' }}>
            {status === 'saving' ? '☁ Lagrer …' : status === 'saved' ? '☁ Lagret (delt)' : ''}
          </span>
        </div>
      </div>

      {brev.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            Ingen brev ennå. Trykk «➕ Nytt brev» for å lage en brevmal.
          </p>
        </div>
      ) : (
        brev.map((b) => (
          <section key={b.id} className="brev-bygg card">
            <div className="brev-bygg-head">
              <input
                className="brev-tittel"
                value={b.tittel}
                onChange={(e) => renameBrev(b.id, e.target.value)}
                onFocus={(e) => (focusVal.current = e.target.value)}
                onBlur={(e) => logBlur('Brevtittel', e.target.value)}
                placeholder="Brevtittel"
              />
              <button type="button" className="dm-del" onClick={() => deleteBrev(b.id)} title="Slett brev">
                ×
              </button>
            </div>

            {b.blokker.map((bl, idx) => (
              <div key={bl.id} className="brev-blokk">
                <div className="brev-blokk-ctrls">
                  <button type="button" onClick={() => moveBlokk(b.id, idx, -1)} title="Flytt opp">▲</button>
                  <button type="button" onClick={() => moveBlokk(b.id, idx, 1)} title="Flytt ned">▼</button>
                  <button type="button" onClick={() => deleteBlokk(b.id, bl.id)} title="Fjern">✕</button>
                </div>
                {bl.type === 'overskrift' ? (
                  <input
                    className="brev-overskrift"
                    value={bl.tekst}
                    onChange={(e) => editBlokk(b.id, bl.id, e.target.value)}
                    onFocus={(e) => (focusVal.current = e.target.value)}
                    onBlur={(e) => logBlur(`Overskrift i «${b.tittel}»`, e.target.value)}
                    placeholder="Overskrift"
                  />
                ) : (
                  <textarea
                    className="brev-avsnitt"
                    value={bl.tekst}
                    rows={3}
                    onChange={(e) => editBlokk(b.id, bl.id, e.target.value)}
                    onFocus={(e) => (focusVal.current = e.target.value)}
                    onBlur={(e) => logBlur(`Tekst i «${b.tittel}»`, e.target.value)}
                    placeholder="Tekstavsnitt"
                  />
                )}
              </div>
            ))}

            <div className="brev-bygg-actions">
              <button type="button" onClick={() => addBlokk(b.id, 'overskrift')}>＋ Overskrift</button>
              <button type="button" onClick={() => addBlokk(b.id, 'avsnitt')}>＋ Tekstavsnitt</button>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
