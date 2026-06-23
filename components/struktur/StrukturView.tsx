'use client';

import { useRef, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import { useAdoptOnRevision } from '@/lib/useAdoptOnRevision';
import ConflictBanner from '@/components/shared/ConflictBanner';
import { parseXsd, serializeXsd, erGyldigNcName } from '@/lib/xsd';
import { deleteTraad, flyttTraad, ryddForeldreloeseKontekster } from '@/lib/diskusjon';
import type { Struktur, StrukturObjekt, StrukturFelt } from '@/lib/struktur';

// Standard XSD-kardinaliteter. Ikke-standard verdier (f.eks. fra import) legges
// til dynamisk i nedtrekkslista så de aldri forsvinner.
const KARDINALITETER: { verdi: string; etikett: string }[] = [
  { verdi: '0..1', etikett: '0..1 (valgfri)' },
  { verdi: '1..1', etikett: '1..1 (påkrevd)' },
  { verdi: '0..n', etikett: '0..n (valgfri, flere)' },
  { verdi: '1..n', etikett: '1..n (påkrevd, flere)' },
];

// Vanlige innebygde XSD-typer som forslag i type-feltet (åpent felt – fri tekst
// er fortsatt mulig, og objektene i modellen legges til dynamisk).
const TYPE_FORSLAG = [
  'string', 'boolean', 'integer', 'decimal', 'long', 'int',
  'dateTime', 'date', 'time', 'anyURI', 'base64Binary',
];

export default function StrukturView({
  datamodellId,
  defaultStruktur = [],
  onDiskusjonEndret,
}: {
  datamodellId: string;
  defaultStruktur?: Struktur;
  /** Kalles etter at delte diskusjonstråder er fjernet, så badges/innboks
   *  oppdateres (parenten henter diskusjonen på nytt). */
  onDiskusjonEndret?: () => void;
}) {
  const { value, setValue, status, revision, stale, reload } = useDokumentData<Struktur>(
    datamodellId,
    'struktur',
    defaultStruktur,
  );
  const [objekter, setObjekter] = useState<Struktur>(defaultStruktur);

  useAdoptOnRevision(status, revision, () => {
    // Respekter alltid den lagrede serververdien – også en tom liste. Default
    // brukes kun når det ikke finnes en lagret verdi ennå (ikke en array), slik
    // at en modell som er redigert (også tømt) aldri faller tilbake til den
    // innebygde standarden.
    setObjekter(Array.isArray(value) ? value : defaultStruktur);
  });

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

  // Fjern de delte diskusjonstrådene for felt som ikke lenger finnes. Konteksten
  // er «ObjektNavn.feltNavn» (samme som DatamodellTab bruker når man kommenterer).
  // 👍/👎-reaksjoner ryddes automatisk via FK on delete cascade. Etterpå ber vi
  // parenten laste diskusjonen på nytt så badges/innboks stemmer.
  const fjernKommentarer = async (kontekster: string[]) => {
    const reelle = kontekster.filter(Boolean);
    if (!reelle.length) return;
    await Promise.all(reelle.map((k) => deleteTraad(datamodellId, k)));
    onDiskusjonEndret?.();
  };

  // Flytt kommentarene med når et felt/objekt døpes om, så de ikke blir liggende
  // foreldreløst på det gamle navnet. `par` = [fraKontekst, tilKontekst].
  const flyttKommentarer = async (par: [string, string][]) => {
    const reelle = par.filter(([fra, til]) => fra && til && fra !== til);
    if (!reelle.length) return;
    await Promise.all(reelle.map(([fra, til]) => flyttTraad(datamodellId, fra, til)));
    onDiskusjonEndret?.();
  };

  // Blur på objektnavn: logg «fra → til» og flytt alle feltenes tråder til det
  // nye objektnavn-prefikset (kontekst «ObjektNavn.feltNavn»).
  const onBlurObjektnavn = (oi: number, ny: string) => {
    const gammel = focusVal.current;
    logBlur('Objektnavn', ny);
    if (gammel && ny && gammel !== ny)
      void flyttKommentarer(
        objekter[oi].felt
          .filter((f) => f.navn)
          .map((f) => [`${gammel}.${f.navn}`, `${ny}.${f.navn}`]),
      );
  };
  // Blur på feltnavn: logg «fra → til» og flytt feltets tråd til det nye navnet.
  const onBlurFeltnavn = (oi: number, ny: string) => {
    const gammel = focusVal.current;
    const objNavn = objekter[oi].navn;
    logBlur(`Feltnavn i «${objNavn}»`, ny);
    if (gammel && ny && gammel !== ny)
      void flyttKommentarer([[`${objNavn}.${gammel}`, `${objNavn}.${ny}`]]);
  };

  const addObjekt = () =>
    update([...objekter, { navn: 'Nytt objekt', beskrivelse: '', felt: [] }], 'La til objekt');
  const deleteObjekt = (oi: number) => {
    if (!confirm('Slette dette objektet?')) return;
    const obj = objekter[oi];
    update(objekter.filter((_, i) => i !== oi), `Slettet objekt «${obj.navn}»`);
    void fjernKommentarer(obj.felt.filter((f) => f.navn).map((f) => `${obj.navn}.${f.navn}`));
  };
  const addFelt = (oi: number) =>
    update(
      objekter.map((o, i) =>
        i === oi ? { ...o, felt: [...o.felt, { navn: '', type: '', beskrivelse: '' }] } : o,
      ),
      `La til felt i «${objekter[oi].navn}»`,
    );
  const deleteFelt = (oi: number, fi: number) => {
    const obj = objekter[oi];
    const felt = obj.felt[fi];
    update(
      objekter.map((o, i) => (i === oi ? { ...o, felt: o.felt.filter((_, j) => j !== fi) } : o)),
      `Slettet felt i «${obj.navn}»`,
    );
    if (felt.navn) void fjernKommentarer([`${obj.navn}.${felt.navn}`]);
  };

  function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseXsd(String(ev.target?.result));
        const gammel = objekter;
        update(parsed, `Importerte XSD (${parsed.length} objekter)`);
        // Rydd kommentarer på felt som forsvant da strukturen ble erstattet.
        void ryddForeldreloeseKontekster(datamodellId, gammel, parsed).then(() =>
          onDiskusjonEndret?.(),
        );
      } catch (err) {
        alert('Kunne ikke lese XSD: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function onExport() {
    if (objekter.length === 0) {
      alert('Ingen objekter å eksportere ennå.');
      return;
    }
    const valgt = prompt('Filnavn for XSD-en:', 'datamodell.xsd');
    if (valgt == null) return; // avbrutt
    let filnavn = valgt.trim() || 'datamodell.xsd';
    if (!/\.xsd$/i.test(filnavn)) filnavn += '.xsd';
    const xsd = serializeXsd(objekter);
    const blob = new Blob([xsd], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filnavn;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // Et navn er ugyldig som XSD-navn hvis det er fylt ut, men ikke et gyldig
  // NCName (mellomrom, spesialtegn, ledende siffer). Tomme (uferdige) navn
  // flagges ikke her – de er ufullstendige, ikke feil.
  const navnUgyldig = (navn: string) => navn.trim() !== '' && !erGyldigNcName(navn.trim());
  const UGYLDIG_NAVN_TIPS =
    'Ugyldig XSD-navn: bruk bokstaver, sifre, «.», «-» eller «_» – uten mellomrom, og ikke start med et siffer.';

  // Forslag til type-feltet: innebygde XSD-typer + alle objektnavn i modellen.
  const typeForslag = Array.from(
    new Set([...TYPE_FORSLAG, ...objekter.map((o) => o.navn).filter(Boolean)]),
  );

  return (
    <div className="validering-wrap">
      <datalist id="struktur-typer">
        {typeForslag.map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
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
          <button
            type="button"
            className="regel-importbtn"
            onClick={onExport}
            disabled={objekter.length === 0}
            title="Last ned struktur som XSD"
          >
            ⬇ Last ned XSD
          </button>
          <span className={`save-status ${status}`} style={{ alignSelf: 'center' }}>
            {status === 'saving' ? '☁ Lagrer …' : status === 'saved' ? '☁ Lagret (delt)' : ''}
          </span>
        </div>
      </div>

      <ConflictBanner visible={status === 'conflict' || stale} onReload={reload} style={{ marginTop: 12 }} />

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
                onBlur={(e) => onBlurObjektnavn(oi, e.target.value)}
                placeholder="Objektnavn"
                style={navnUgyldig(obj.navn) ? { borderColor: 'var(--danger-base)' } : undefined}
                title={navnUgyldig(obj.navn) ? UGYLDIG_NAVN_TIPS : undefined}
                aria-invalid={navnUgyldig(obj.navn) || undefined}
              />
              <button type="button" className="dm-del" onClick={() => deleteObjekt(oi)} title="Slett objekt">
                ×
              </button>
            </div>
            {navnUgyldig(obj.navn) && (
              <p style={{ color: 'var(--danger-text)', fontSize: '0.8rem', margin: '4px 0 0' }}>⚠ {UGYLDIG_NAVN_TIPS}</p>
            )}
            <label className="struktur-gruppe">
              <span className="muted">Gruppe</span>
              <input
                className="struktur-celle"
                value={obj.group ?? ''}
                onChange={(e) => patchObjekt(oi, { group: e.target.value || undefined })}
                onFocus={(e) => (focusVal.current = e.target.value)}
                onBlur={(e) => logBlur(`Gruppe for «${obj.navn}»`, e.target.value)}
                placeholder="valgfri – skriv ditt eget gruppenavn, f.eks. Konvolutt"
              />
            </label>
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
                    <th style={{ width: '24%' }}>Felt</th>
                    <th style={{ width: '20%' }}>Type</th>
                    <th style={{ width: '12%' }}>Kardinalitet</th>
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
                          onBlur={(e) => onBlurFeltnavn(oi, e.target.value)}
                          placeholder="feltnavn"
                          style={navnUgyldig(f.navn) ? { borderColor: 'var(--danger-base)' } : undefined}
                          title={navnUgyldig(f.navn) ? UGYLDIG_NAVN_TIPS : undefined}
                          aria-invalid={navnUgyldig(f.navn) || undefined}
                        />
                      </td>
                      <td>
                        <input
                          className="struktur-celle"
                          list="struktur-typer"
                          value={f.type}
                          onChange={(e) => patchFelt(oi, fi, { type: e.target.value })}
                          onFocus={(e) => (focusVal.current = e.target.value)}
                          onBlur={(e) => logBlur(`Type for «${f.navn}» i «${obj.navn}»`, e.target.value)}
                          placeholder="type"
                        />
                      </td>
                      <td>
                        <select
                          className="struktur-celle"
                          value={f.kardinalitet ?? ''}
                          onChange={(e) => patchFelt(oi, fi, { kardinalitet: e.target.value })}
                          onFocus={(e) => (focusVal.current = e.target.value)}
                          onBlur={(e) => logBlur(`Kardinalitet for «${f.navn}» i «${obj.navn}»`, e.target.value)}
                        >
                          <option value="">—</option>
                          {KARDINALITETER.map((k) => (
                            <option key={k.verdi} value={k.verdi}>
                              {k.etikett}
                            </option>
                          ))}
                          {f.kardinalitet &&
                            !KARDINALITETER.some((k) => k.verdi === f.kardinalitet) && (
                              <option value={f.kardinalitet}>{f.kardinalitet}</option>
                            )}
                        </select>
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
