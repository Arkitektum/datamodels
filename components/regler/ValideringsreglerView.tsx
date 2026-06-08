'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import EditableCell from './EditableCell';
import {
  REGEL_GRUPPER_DEFAULT,
  REGEL_STATUSER,
  REGEL_ROOT,
} from '@/data/hoeringOgOffentligEttersynV2.rules';
import {
  type RegelGruppe,
  type RegelRule,
  fullRegelnr,
  groupKey,
  normalizeRegelData,
  parseRegelInput,
  resultatClass,
  serializeRegler,
  statusInfo,
  stdByGroupFrom,
} from '@/lib/regler';

const BUILTIN_GRUPPER = normalizeRegelData(REGEL_GRUPPER_DEFAULT);
const FELT_LABEL: Record<string, string> = {
  p: 'Regelnr',
  sjekkpunkt: 'Sjekkpunkt',
  t: 'Tekst',
  b: 'Betingelse',
  f: 'Forutsetning',
  k: 'Kommentar',
};

export default function ValideringsreglerView({
  datamodellId,
  defaultGrupper,
  root = REGEL_ROOT,
}: {
  datamodellId: string;
  /** Standardregler (innebygd modell). Utelat/[] for en modell fra scratch. */
  defaultGrupper?: RegelGruppe[];
  /** Prefiks i Regelnr ved eksport (tom for egendefinerte modeller). */
  root?: string;
}) {
  const base = defaultGrupper ?? BUILTIN_GRUPPER;
  const stdByGroup = useMemo(() => stdByGroupFrom(base), [base]);

  const rules = useDokumentData<RegelGruppe[]>(datamodellId, 'regeldata', base);
  const status = useDokumentData<Record<string, string>>(datamodellId, 'regelstatus', {});

  const [grupper, setGrupper] = useState<RegelGruppe[]>(base);
  const grupperRef = useRef<RegelGruppe[]>(grupper);
  const [resetKey, setResetKey] = useState(0);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('');
  const adopted = useRef(false);

  // Adopter delt/lastet data én gang når innlasting er ferdig.
  useEffect(() => {
    if (adopted.current) return;
    if (rules.status === 'idle') {
      const next = rules.value && rules.value.length ? rules.value : base;
      grupperRef.current = next;
      setGrupper(next);
      adopted.current = true;
      setResetKey((k) => k + 1);
    }
  }, [rules.status, rules.value]);

  const statusMap = status.value || {};

  function persist(next: RegelGruppe[], detalj?: string) {
    grupperRef.current = next;
    rules.setValue(next, detalj);
  }

  // Løpende skriving: muter ref + STILLE lagring (ingen logg per tastetrykk).
  function onCellInput(gi: number, ri: number, field: keyof RegelRule, text: string) {
    const g = grupperRef.current;
    g[gi].rules[ri][field] = text;
    rules.setValue(g);
  }
  // Ved blur: logg «fra → til» hvis feltet faktisk ble endret.
  function onCellCommit(gi: number, ri: number, field: keyof RegelRule, gammel: string, ny: string) {
    const g = grupperRef.current;
    const regelnr = fullRegelnr(root, g[gi].rules[ri].p);
    rules.setValue(g, `${FELT_LABEL[field] || field} på regel ${regelnr}: «${gammel}» → «${ny}»`);
  }

  // Resultat-endring påvirker badges/farge → oppdater state.
  function onResultatChange(gi: number, ri: number, val: string) {
    const next = grupper.map((grp, i) =>
      i === gi
        ? { ...grp, rules: grp.rules.map((r, j) => (j === ri ? { ...r, r: val } : r)) }
        : grp,
    );
    setGrupper(next);
    persist(next, `Resultat «${val || '—'}» på regel ${fullRegelnr(root, grupper[gi].rules[ri].p)}`);
  }

  function cycleStatus(regelnr: string) {
    const cur = statusMap[regelnr] || '';
    const idx = REGEL_STATUSER.findIndex((s) => s.id === cur);
    const next = REGEL_STATUSER[(idx + 1) % REGEL_STATUSER.length];
    const nextMap = { ...statusMap };
    if (next.id) nextMap[regelnr] = next.id;
    else delete nextMap[regelnr];
    status.setValue(nextMap, `Status «${next.navn}» på regel ${regelnr}`);
  }

  function addGroup() {
    const navn = window.prompt('Navn på ny gruppe:')?.trim();
    if (!navn) return;
    const next = [...grupper, { g: navn, std: false, rules: [] }];
    setGrupper(next);
    persist(next, `La til gruppe «${navn}»`);
  }
  function addRule(gi: number) {
    const next = grupper.map((grp, i) =>
      i === gi
        ? { ...grp, rules: [...grp.rules, { p: '', sjekkpunkt: '', t: '', r: '', b: '', f: '', k: '' }] }
        : grp,
    );
    setGrupper(next);
    persist(next, `La til regel i «${grupper[gi].g}»`);
    setCollapsed((c) => ({ ...c, [groupKey(grupper[gi].g)]: false }));
    setResetKey((k) => k + 1);
  }
  function deleteRule(gi: number, ri: number) {
    if (!confirm('Slette denne regelen?')) return;
    const fjernet = fullRegelnr(root, grupper[gi].rules[ri].p);
    const next = grupper.map((grp, i) =>
      i === gi ? { ...grp, rules: grp.rules.filter((_, j) => j !== ri) } : grp,
    );
    setGrupper(next);
    persist(next, `Slettet regel ${fjernet}`);
    setResetKey((k) => k + 1);
  }

  function setAll(open: boolean) {
    const m: Record<string, boolean> = {};
    grupper.forEach((grp) => {
      m[groupKey(grp.g)] = !open;
    });
    setCollapsed(m);
  }

  function toggleGroup(gk: string, gi: number) {
    setCollapsed((c) => ({ ...c, [gk]: !isCollapsed(gk, gi, c) }));
  }

  function isCollapsed(gk: string, gi: number, c = collapsed): boolean {
    return c[gk] !== undefined ? c[gk] : gi !== 0;
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(serializeRegler(grupperRef.current, root), null, 4)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valideringsregler-hoeringOgOffentligEttersynV2.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseRegelInput(JSON.parse(String(ev.target?.result)), root, stdByGroup);
        setGrupper(parsed);
        persist(parsed, `Importerte ${parsed.reduce((n, g) => n + g.rules.length, 0)} regler`);
        setCollapsed({});
        setResetKey((k) => k + 1);
      } catch (err) {
        alert('Kunne ikke lese JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function resetAll() {
    if (!confirm('Tilbakestille alle regler og statuser til standard? Dette sletter dine endringer.')) return;
    setGrupper(base);
    persist(base, 'Tilbakestilte regler til standard');
    status.setValue({}, 'Tilbakestilte statuser');
    setCollapsed({});
    setResetKey((k) => k + 1);
  }

  const term = filter.trim().toLowerCase();

  return (
    <div className="validering-wrap">
      <h1>Valideringsregler</h1>

      <div className="fargekoder">
        <h2>🎨 Fargekoder</h2>
        <p className="desc">Klikk på statusfeltet helt til venstre i en rad for å sette/endre status.</p>
        <div className="fargekoder-legend">
          {REGEL_STATUSER.filter((s) => s.id).map((s) => (
            <span className="fargekode-item" key={s.id}>
              <span className={`fargekode-swatch ${s.cls}`} />
              {s.navn}
            </span>
          ))}
        </div>
      </div>

      <div className="regel-controls">
        <button type="button" onClick={() => setAll(true)}>▾ Åpne alle</button>
        <button type="button" onClick={() => setAll(false)}>▸ Lukk alle</button>
        <input
          type="search"
          className="regel-filter"
          placeholder="🔎 Filtrer grupper / sjekkpunkt / tekst …"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button type="button" onClick={exportJSON}>💾 Eksporter regler</button>
        <label className="regel-importbtn">
          📂 Importer regler
          <input type="file" accept="application/json,.json" onChange={importJSON} />
        </label>
        <button type="button" onClick={addGroup}>➕ Ny gruppe</button>
        <button type="button" onClick={resetAll}>↩️ Tilbakestill</button>
        <span className={`save-status ${rules.status}`} style={{ alignSelf: 'center' }}>
          {rules.status === 'saving' ? '☁ Lagrer …' : rules.status === 'saved' ? '☁ Lagret (delt)' : ''}
        </span>
      </div>

      <div className="regeltable-scroll">
        <table className="regeltable">
          <colgroup>
            <col className="c-status" />
            <col className="c-regelnr" />
            <col className="c-sjekkpunkt" />
            <col className="c-tekst" />
            <col className="c-resultat" />
            <col className="c-betingelse" />
            <col className="c-forutsetning" />
            <col className="c-kommentar" />
            <col className="c-del" />
          </colgroup>
          <thead>
            <tr>
              <th title="Status / fargekode">●</th>
              <th>Regelnr.</th>
              <th>Sjekk-punkt</th>
              <th>Tekst</th>
              <th>Resultat</th>
              <th>Betingelse</th>
              <th>Forutsetning</th>
              <th>Kommentarer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {grupper.map((grp, gi) => {
              const gk = groupKey(grp.g);
              const groupMatch = !term || grp.g.toLowerCase().includes(term);
              const matched = grp.rules.map(
                (r) =>
                  groupMatch ||
                  (r.p || '').toLowerCase().includes(term) ||
                  (r.t || '').toLowerCase().includes(term) ||
                  (r.b || '').toLowerCase().includes(term),
              );
              const anyRule = matched.some(Boolean);
              if (term && !groupMatch && !anyRule) return null;
              const coll = term ? false : isCollapsed(gk, gi);
              const antFeil = grp.rules.filter((r) => r.r === 'Feil').length;
              const antAdv = grp.rules.filter((r) => r.r === 'Advarsel').length;

              return (
                <Fragment key={gk}>
                  <tr
                    className={`group-row${coll ? ' collapsed' : ''}`}
                    onClick={() => toggleGroup(gk, gi)}
                  >
                    <td colSpan={9}>
                      <span className="grp-name">
                        <span className="grp-chevron">▾</span>
                        {grp.g}
                        <span className="grp-count">{grp.rules.length} regler</span>
                        {grp.std && <span className="std-note">Følger standard validering</span>}
                      </span>
                      <span className="grp-meta">
                        {antFeil > 0 && <span className="grp-badge-feil">{antFeil} feil</span>}
                        {antAdv > 0 && <span className="grp-badge-adv">{antAdv} advarsel</span>}
                      </span>
                    </td>
                  </tr>
                  {grp.rules.map((rule, ri) => {
                    const show = matched[ri] && (term ? true : !coll);
                    if (!show) return null;
                    const regelnr = fullRegelnr(root, rule.p);
                    const stId = statusMap[regelnr] || '';
                    const info = statusInfo(REGEL_STATUSER, stId);
                    return (
                      <tr key={ri} className={`rule-row${stId ? ' rowst-' + stId : ''}`}>
                        <td
                          className="regel-status"
                          title={`${info.navn} — klikk for å endre`}
                          onClick={() => cycleStatus(regelnr)}
                        >
                          <span className={`status-chip ${info.cls}`} title={info.navn} />
                        </td>
                        <EditableCell
                          className="col-regelid"
                          value={rule.p}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 'p', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 'p', o, n)}
                        />
                        <EditableCell
                          className="col-sjekkpunkt"
                          value={rule.sjekkpunkt}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 'sjekkpunkt', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 'sjekkpunkt', o, n)}
                        />
                        <EditableCell
                          value={rule.t}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 't', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 't', o, n)}
                        />
                        <td className="col-resultat">
                          <select
                            className={`res-select ${resultatClass(rule.r)}`}
                            value={rule.r}
                            onChange={(e) => onResultatChange(gi, ri, e.target.value)}
                          >
                            <option value="">—</option>
                            <option value="Feil">Feil</option>
                            <option value="Advarsel">Advarsel</option>
                          </select>
                        </td>
                        <EditableCell
                          className="col-betingelse"
                          value={rule.b}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 'b', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 'b', o, n)}
                        />
                        <EditableCell
                          className="col-forutsetning"
                          value={rule.f}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 'f', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 'f', o, n)}
                        />
                        <EditableCell
                          className="col-kommentar"
                          value={rule.k}
                          resetKey={resetKey}
                          onInput={(t) => onCellInput(gi, ri, 'k', t)}
                          onCommit={(o, n) => onCellCommit(gi, ri, 'k', o, n)}
                        />
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="struktur-fjern"
                            onClick={() => deleteRule(gi, ri)}
                            title="Slett regel"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!coll && (
                    <tr className="rule-row regel-addrow">
                      <td colSpan={9}>
                        <button type="button" onClick={() => addRule(gi)}>
                          ➕ Ny regel i «{grp.g}»
                        </button>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
