'use client';

import { useEffect, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import StrukturView from '@/components/struktur/StrukturView';
import SjekklisteSeksjon from '@/components/struktur/SjekklisteSeksjon';
import { parseXsd, type XsdKilde } from '@/lib/xsd';
import type { Struktur } from '@/lib/struktur';
import { ModellView } from '../types';

const GROUP_ORDER = ['Konvolutt', 'Parter og aktører', 'Plan', 'Eiendom', 'Felles typer'];
const FALLBACK_GROUP = 'Objekttyper';

export default function DatamodellTab({
  model,
  activeCtx,
  fieldCount,
  onComment,
  isEditing,
  onToggleEdit,
}: {
  model: ModellView;
  activeCtx: string | null;
  fieldCount: (ctx: string) => number;
  onComment: (ctx: string) => void;
  isEditing: boolean;
  onToggleEdit: (v: boolean) => void;
}) {
  const { value: struktur, setValue } = useDokumentData<Struktur>(model.id, 'struktur', model.defaultStruktur);
  const { setValue: setXsdKilde } = useDokumentData<XsdKilde | null>(model.id, 'xsdkilde', null);
  const objekter = Array.isArray(struktur) ? struktur : [];
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  function onImportXsd(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target?.result);
        const parsed = parseXsd(text);
        if (!parsed.length) {
          window.alert('Fant ingen objekttyper i XSD-en.');
          return;
        }
        if (objekter.length && !window.confirm('Importere XSD og erstatte dagens datamodell?')) return;
        // Strukturen brukes til den grupperte visningen; den rå XSD-en lagres
        // ordrett og vises uendret i XSD-fanen (ingen verdier går tapt).
        setValue(parsed, `Importerte XSD (${parsed.length} objekttyper)`);
        setXsdKilde({ src: text, file: file.name }, `Lastet opp XSD «${file.name}»`);
      } catch (err) {
        window.alert('Kunne ikke lese XSD: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  }

  const importKnapp = (
    <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
      📦 Importer XSD
      <input type="file" accept=".xsd,.xml,application/xml,text/xml" onChange={onImportXsd} style={{ display: 'none' }} />
    </label>
  );

  // Frø ekspandert-tilstand fra obj.open første gang strukturen er lastet.
  useEffect(() => {
    const seed: Record<string, boolean> = {};
    objekter.forEach((o) => {
      if (o.open) seed[o.navn] = true;
    });
    setExpanded((prev) => ({ ...seed, ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objekter.length]);

  if (isEditing) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <button className="btn btn--pill btn--sm" onClick={() => onToggleEdit(false)}>
            ← Ferdig redigert
          </button>
        </div>
        <StrukturView datamodellId={model.id} defaultStruktur={model.defaultStruktur} />
      </div>
    );
  }

  if (objekter.length === 0) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 8 }}>
          {importKnapp}
          <button className="btn btn--secondary btn--sm" onClick={() => onToggleEdit(true)}>
            Rediger struktur
          </button>
        </div>
        <div className="callout callout--info">
          <span className="callout-icon" />
          <div>
            <strong className="callout-title">Modellering ikke startet</strong>
            <div>
              Denne datamodellen er ikke modellert ennå. Trykk «Rediger struktur» for å bygge
              objekter og felter, eller bruk diskusjonspanelet til å planlegge med DiBK.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bygg gruppe-rekkefølge: kjente grupper først, så øvrige i rekkefølge de dukker opp.
  const seen: string[] = [];
  objekter.forEach((o) => {
    const g = o.group || FALLBACK_GROUP;
    if (!seen.includes(g)) seen.push(g);
  });
  const groupSeq = [
    ...GROUP_ORDER.filter((g) => seen.includes(g)),
    ...seen.filter((g) => !GROUP_ORDER.includes(g)),
  ];

  const refExists = (navn: string) => objekter.some((o) => o.navn === navn);
  const jumpTo = (navn: string) => {
    if (!refExists(navn)) return;
    setExpanded((e) => ({ ...e, [navn]: true }));
    requestAnimationFrame(() => {
      document.getElementById('obj-' + navn)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
        {importKnapp}
        <button className="btn btn--secondary btn--sm" onClick={() => onToggleEdit(true)}>
          Rediger struktur
        </button>
      </div>

      <SjekklisteSeksjon modellId={model.id} />

      {groupSeq.map((gl) => {
        const objs = objekter.filter((o) => (o.group || FALLBACK_GROUP) === gl);
        if (!objs.length) return null;
        return (
          <div key={gl}>
            <div className="eyebrow" style={{ margin: '20px 0 8px' }}>
              {gl}
            </div>
            {objs.map((obj) => {
              const isOpen = !!expanded[obj.navn];
              return (
                <div
                  key={obj.navn}
                  id={'obj-' + obj.navn}
                  style={{
                    border: '1px solid var(--neutral-border-strong)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 12,
                    overflow: 'hidden',
                    background: 'var(--bg-1)',
                  }}
                >
                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [obj.navn]: !isOpen }))}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      appearance: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      background: 'var(--accent-tinted)',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <svg
                      viewBox="0 0 16 16"
                      width="13"
                      height="13"
                      aria-hidden="true"
                      style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', flexShrink: 0 }}
                    >
                      <path d="M6 4 L10 8 L6 12" fill="none" stroke="#003045" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent-text)' }}>
                      {obj.navn}
                    </span>
                    {obj.note && <span style={{ fontSize: '0.76rem', color: 'var(--fg-2)' }}>{obj.note}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--fg-2)' }}>
                      {(obj.felt?.length || 0) + ' felt'}
                    </span>
                  </button>

                  {isOpen &&
                    (obj.felt || []).map((fld, fi) => {
                      const ctx = obj.navn + '.' + fld.navn;
                      const count = fieldCount(ctx);
                      const active = activeCtx === ctx;
                      const isRef = !!fld.ref && refExists(fld.ref);
                      return (
                        <div
                          key={fi}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 10,
                            flexWrap: 'wrap',
                            padding: '10px 16px',
                            borderTop: '1px solid var(--neutral-border)',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.82rem',
                              color: 'var(--accent-text)',
                              minWidth: 200,
                              flexShrink: 0,
                              paddingTop: 2,
                            }}
                          >
                            {fld.navn}
                          </span>
                          <span
                            onClick={isRef ? () => jumpTo(fld.ref as string) : undefined}
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.74rem',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'var(--neutral-bg-input)',
                              minWidth: 150,
                              flexShrink: 0,
                              whiteSpace: 'nowrap',
                              color: isRef ? 'var(--accent-text)' : 'var(--fg-2)',
                              cursor: isRef ? 'pointer' : 'default',
                              textDecoration: isRef ? 'underline' : 'none',
                              textUnderlineOffset: 2,
                            }}
                          >
                            {fld.type}
                          </span>
                          {fld.kardinalitet && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--fg-3)', paddingTop: 3, flexShrink: 0 }}>
                              {fld.kardinalitet}
                            </span>
                          )}
                          {fld.req && (
                            <span className="tag tag--neutral" style={{ marginTop: 1 }}>
                              Påkrevd
                            </span>
                          )}
                          <span style={{ color: 'var(--fg-2)', fontSize: '0.86rem', flex: 1, minWidth: 140, paddingTop: 2 }}>
                            {fld.beskrivelse}
                          </span>
                          <button
                            className={active ? 'btn btn--primary btn--sm' : count ? 'btn btn--secondary btn--sm' : 'btn btn--pill btn--sm'}
                            onClick={() => onComment(ctx)}
                            style={{ flexShrink: 0 }}
                          >
                            {count ? 'Diskusjon · ' + count : 'Kommenter'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
