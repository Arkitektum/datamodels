'use client';

import { useEffect, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import { parseXsd } from '@/lib/xsd';
import type { Struktur, StrukturObjekt, StrukturFelt } from '@/lib/struktur';

export default function StrukturView({
  datamodellId,
  defaultStruktur = [],
}: {
  datamodellId: string;
  defaultStruktur?: Struktur;
}) {
  const { value, setValue, status } = useDokumentData<Struktur>(datamodellId, 'struktur', defaultStruktur);
  const [objekter, setObjekter] = useState<Struktur>(defaultStruktur);
  const adopted = useRef(false);

  useEffect(() => {
    if (adopted.current) return;
    if (status === 'idle') {
      setObjekter(Array.isArray(value) && value.length ? value : defaultStruktur);
      adopted.current = true;
    }
  }, [status, value, defaultStruktur]);

  function update(next: Struktur, detalj?: string) {
    setObjekter(next);
    setValue(next, detalj);
  }
  // tekstendringer lagres stille; logges «fra → til» ved blur
  const patchObjekt = (oi: number, p: Partial<StrukturObjekt>) =>
    update(objekter.map((o, i) => (i === oi ? { ...o, ...p } : o)));
  const patchFelt = (oi: number, fi: number, p: Partial<StrukturFelt>) =>
    update(
      objekter.map((o, i) =>
        i === oi ? { ...o, felt: o.felt.map((f, j) => (j === fi ? { ...f, ...p } : f)) } : o,
      ),
    );

  // blur-logging «fra → til»
  const focusVal = useRef('');
  const kort = (s: string) => (s.length > 100 ? s.slice(0, 100) + '…' : s);
  const logBlur = (label: string, ny: string) => {
    if (ny !== focusVal.current)
      setValue(objekter, `${label}: «${kort(focusVal.current)}» → «${kort(ny)}»`);
  };

  const addObjekt = () =>
    update([...objekter, { navn: 'Nytt objekt', beskrivelse: '', felt: [] }], 'La til objekt');
  const deleteObjekt = (oi: number) => {
    if (!confirm('Slette dette objektet?')) return;
    update(objekter.filter((_, i) => i !== oi), `Slettet objekt «${objekter[oi].navn}»`);
  };
  const addFelt = (oi: number) =>
    update(
      objekter.map((o, i) =>
        i === oi ? { ...o, felt: [...o.felt, { navn: '', type: '', beskrivelse: '' }] } : o,
      ),
      `La til felt i «${objekter[oi].navn}»`,
    );
  const deleteFelt = (oi: number, fi: number) =>
    update(
      objekter.map((o, i) => (i === oi ? { ...o, felt: o.felt.filter((_, j) => j !== fi) } : o)),
      `Slettet felt i «${objekter[oi].navn}»`,
    );

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseXsd(String(ev.target?.result));
        update(parsed, `Importerte XSD (${parsed.length} objekter)`);
      } catch (err) {
        alert('Kunne ikke lese XSD: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Datamodell</h1>
          <p className="muted">
            Bygg objekter og felt manuelt, eller importer en XSD. Beskrivelser kan redigeres.
          </p>
        </div>
        <div className="regel-controls" style={{ margin: 0 }}>
          <button type="button" className="btn-primary" onClick={addObjekt}>
            ➕ Nytt objekt
          </button>
          <label className="regel-importbtn">
            📦 Importer XSD
            <input type="file" accept=".xsd,.xml,application/xml,text/xml" onChange={onImport} />
          </label>
          <span className={`save-status ${status}`} style={{ alignSelf: 'center' }}>
            {status === 'saving' ? '☁ Lagrer …' : status === 'saved' ? '☁ Lagret (delt)' : ''}
          </span>
        </div>
      </div>

      {objekter.length === 0 ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            Ingen objekter ennå. Trykk «➕ Nytt objekt» for å bygge manuelt, eller «📦 Importer XSD».
          </p>
        </div>
      ) : (
        objekter.map((obj, oi) => (
          <section key={oi} className="struktur-objekt card">
            <div className="struktur-objekt-head">
              <input
                className="struktur-navn"
                value={obj.navn}
                onChange={(e) => patchObjekt(oi, { navn: e.target.value })}
                onFocus={(e) => (focusVal.current = e.target.value)}
                onBlur={(e) => logBlur('Objektnavn', e.target.value)}
                placeholder="Objektnavn"
              />
              <button type="button" className="dm-del" onClick={() => deleteObjekt(oi)} title="Slett objekt">
                ×
              </button>
            </div>
            <textarea
              className="struktur-besk"
              value={obj.beskrivelse}
              rows={2}
              onChange={(e) => patchObjekt(oi, { beskrivelse: e.target.value })}
              onFocus={(e) => (focusVal.current = e.target.value)}
              onBlur={(e) => logBlur(`Beskrivelse for «${obj.navn}»`, e.target.value)}
              placeholder="Beskrivelse av objektet …"
            />
            <div className="regeltable-scroll">
              <table className="regeltable">
                <thead>
                  <tr>
                    <th style={{ width: '26%' }}>Felt</th>
                    <th style={{ width: '22%' }}>Type</th>
                    <th>Beskrivelse</th>
                    <th style={{ width: '34px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {obj.felt.map((f, fi) => (
                    <tr key={fi}>
                      <td>
                        <input
                          className="struktur-celle"
                          value={f.navn}
                          onChange={(e) => patchFelt(oi, fi, { navn: e.target.value })}
                          onFocus={(e) => (focusVal.current = e.target.value)}
                          onBlur={(e) => logBlur(`Feltnavn i «${obj.navn}»`, e.target.value)}
                          placeholder="feltnavn"
                        />
                      </td>
                      <td>
                        <input
                          className="struktur-celle"
                          value={f.type}
                          onChange={(e) => patchFelt(oi, fi, { type: e.target.value })}
                          onFocus={(e) => (focusVal.current = e.target.value)}
                          onBlur={(e) => logBlur(`Type for «${f.navn}» i «${obj.navn}»`, e.target.value)}
                          placeholder="type"
                        />
                      </td>
                      <td>
                        <input
                          className="struktur-celle"
                          value={f.beskrivelse}
                          onChange={(e) => patchFelt(oi, fi, { beskrivelse: e.target.value })}
                          onFocus={(e) => (focusVal.current = e.target.value)}
                          onBlur={(e) => logBlur(`Beskrivelse for «${f.navn}» i «${obj.navn}»`, e.target.value)}
                          placeholder="beskrivelse"
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="struktur-fjern"
                          onClick={() => deleteFelt(oi, fi)}
                          title="Fjern felt"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="brev-bygg-actions">
              <button type="button" onClick={() => addFelt(oi)}>
                ＋ Felt
              </button>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
