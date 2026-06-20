'use client';

import { useMemo, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import type { Struktur } from '@/lib/struktur';
import type { ModellView } from '@/components/workspace/types';
import { validerXmlMotStruktur, type ValideringsResultat } from '@/lib/xmlvalidering';
import { normalizeRegelData, type RegelGruppe } from '@/lib/regler';
import { REGEL_GRUPPER_DEFAULT } from '@/data/hoeringOgOffentligEttersynV2.rules';

const BUILTIN_REGLER = normalizeRegelData(REGEL_GRUPPER_DEFAULT);

export default function ValiderXmlTab({ model }: { model: ModellView }) {
  // Strukturen brukes som fasit for validering (samme delte data som Datamodell-fanen).
  const { value: struktur } = useDokumentData<Struktur>(
    model.id,
    'struktur',
    model.defaultStruktur,
  );

  // Valideringsreglene vises kun som skrivebeskyttet sjekkliste — de evalueres ikke.
  const reglerBase = model.builtin ? BUILTIN_REGLER : [];
  const { value: regler } = useDokumentData<RegelGruppe[]>(model.id, 'regeldata', reglerBase);

  const [xml, setXml] = useState('');
  const [resultat, setResultat] = useState<ValideringsResultat | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function onFil(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setXml(String(ev.target?.result ?? ''));
      setResultat(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function valider() {
    const s = Array.isArray(struktur) ? struktur : [];
    setResultat(validerXmlMotStruktur(xml, s));
  }

  function tomt() {
    setXml('');
    setResultat(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Oppsummering av regler (kun sjekkliste).
  const regelOppsummering = useMemo(() => {
    const alle = (Array.isArray(regler) && regler.length ? regler : reglerBase).flatMap(
      (g) => g.rules,
    );
    const feilRegler = alle.filter((r) => r.r === 'Feil');
    const advRegler = alle.filter((r) => r.r === 'Advarsel');
    return { antall: alle.length, feilRegler, advRegler };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regler]);

  return (
    <div className="validering-wrap">
      <div className="page-head">
        <div>
          <h1>Valider XML</h1>
          <p className="muted">
            Lim inn eller last opp en eksempel-XML og valider den mot datamodellens struktur
            (felt og kardinalitet). Dette er en pragmatisk strukturkontroll — ikke full
            XSD-validering.
          </p>
        </div>
        <div className="regel-controls" style={{ margin: 0 }}>
          <button type="button" className="btn-primary" onClick={valider} disabled={!xml.trim()}>
            ✔ Valider
          </button>
          <label className="regel-importbtn">
            📂 Last opp XML
            <input
              ref={fileRef}
              type="file"
              accept=".xml,application/xml,text/xml"
              onChange={onFil}
            />
          </label>
          <button type="button" className="regel-importbtn" onClick={tomt} disabled={!xml && !resultat}>
            ✕ Tøm
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <textarea
          className="struktur-besk"
          value={xml}
          rows={14}
          spellCheck={false}
          onChange={(e) => {
            setXml(e.target.value);
            setResultat(null);
          }}
          placeholder="Lim inn eksempel-XML her …"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}
        />
      </div>

      {/* Resultat */}
      {resultat && (
        <div className="card" style={{ marginTop: 16 }}>
          {!resultat.gyldigXml ? (
            <div className="res-feil" style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
              <strong>XML kunne ikke leses.</strong>
              <div className="muted" style={{ marginTop: 4 }}>{resultat.parseFeil}</div>
            </div>
          ) : (
            <>
              <h2 style={{ marginTop: 0 }}>
                {resultat.funn.length === 0
                  ? '✓ Ingen strukturfeil funnet'
                  : `${resultat.antallFeil} feil, ${resultat.antallAdvarsler} advarsler`}
              </h2>
              {resultat.funn.length > 0 && (
                <div className="regeltable-scroll">
                  <table className="regeltable">
                    <thead>
                      <tr>
                        <th style={{ width: '110px' }}>Alvor</th>
                        <th style={{ width: '38%' }}>Sti</th>
                        <th>Melding</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultat.funn.map((f, i) => (
                        <tr key={i}>
                          <td>
                            <span className={f.alvor === 'feil' ? 'res-feil' : 'res-advarsel'}
                              style={{ padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }}>
                              {f.alvor === 'feil' ? 'Feil' : f.alvor === 'advarsel' ? 'Advarsel' : 'Info'}
                            </span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{f.sti}</td>
                          <td>{f.melding}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tom tilstand før validering */}
      {!resultat && (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="muted" style={{ margin: 0 }}>
            Ingen validering kjørt ennå. Lim inn eller last opp en XML og trykk «✔ Valider».
          </p>
        </div>
      )}

      {/* Skrivebeskyttet oppsummering av valideringsreglene (sjekkliste) */}
      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ marginTop: 0 }}>Valideringsregler ({regelOppsummering.antall})</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {regelOppsummering.feilRegler.length} regler gir «Feil», {regelOppsummering.advRegler.length} gir
          «Advarsel». Reglene evalueres ikke automatisk — bruk dem som sjekkliste.
        </p>
        {regelOppsummering.feilRegler.length > 0 && (
          <div className="regeltable-scroll">
            <table className="regeltable">
              <thead>
                <tr>
                  <th style={{ width: '140px' }}>Regelnr</th>
                  <th>Beskrivelse (gir «Feil»)</th>
                </tr>
              </thead>
              <tbody>
                {regelOppsummering.feilRegler.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{r.p}</td>
                    <td>{r.t}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
