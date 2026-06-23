'use client';

import { useMemo, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import { parseXsd, serializeXsd, xsdGyldighetsproblemer, type XsdKilde } from '@/lib/xsd';
import type { Struktur } from '@/lib/struktur';
import { ModellView } from '../types';

function extractNs(src: string): string {
  const m = src.match(/targetNamespace\s*=\s*"([^"]*)"/);
  return m ? m[1] : '';
}

export default function XsdTab({ model }: { model: ModellView }) {
  const { value: struktur } = useDokumentData<Struktur>(model.id, 'struktur', model.defaultStruktur);
  const { value: kilde } = useDokumentData<XsdKilde | null>(model.id, 'xsdkilde', null);
  const [kopiert, setKopiert] = useState(false);

  const s = useMemo(() => (Array.isArray(struktur) ? struktur : []), [struktur]);

  // Utgangspunktet XSD-en ble bygd på: den opplastede XSD-en (parset) eller den
  // innebygde standardstrukturen. Brukes til å avgjøre om brukeren har redigert
  // datamodellen vekk fra dette.
  const kildeStruktur = useMemo<Struktur | null>(() => {
    if (kilde?.src) {
      try {
        return parseXsd(kilde.src);
      } catch {
        return null;
      }
    }
    return model.defaultStruktur?.length ? model.defaultStruktur : null;
  }, [kilde, model.defaultStruktur]);

  // Sann når strukturen er endret fra utgangspunktet (opplastet/innebygd).
  const redigert = useMemo(() => {
    if (!kildeStruktur) return s.length > 0;
    return JSON.stringify(s) !== JSON.stringify(kildeStruktur);
  }, [s, kildeStruktur]);

  const generert = useMemo(() => {
    if (s.length === 0) return null;
    try {
      return serializeXsd(s);
    } catch {
      return null;
    }
  }, [s]);

  // Er datamodellen redigert, viser vi XSD generert fra strukturen slik at
  // endringene gjenspeiles. Er den uendret, viser vi den ordrette opplastede /
  // håndskrevne innebygde XSD-en.
  const brukGenerert = redigert && !!generert;
  const opplastet = !!kilde?.src && !brukGenerert;
  const src = brukGenerert ? (generert as string) : (kilde?.src ?? model.xsd?.src ?? generert ?? '');
  const file = kilde?.file ?? model.xsd?.file ?? (model.root || model.navn) + '.xsd';
  const ns = extractNs(src) || model.xsd?.ns || s[0]?.targetNamespace || '';

  // Når XSD-en er generert fra strukturen, kan redigerte navn gjøre den ugyldig
  // (velformet, men ikke skjema-gyldig). Vis det før man laster ned. Ordrett
  // opplastet/innebygd XSD sjekkes ikke – den kommer fra en ferdig fil.
  const viserGenerert = generert != null && src === generert;
  const problemer = useMemo(() => (viserGenerert ? xsdGyldighetsproblemer(s) : []), [viserGenerert, s]);

  if (!src) {
    return (
      <div className="callout callout--info">
        <span className="callout-icon" />
        <div>
          <strong className="callout-title">XSD ikke opprettet ennå</strong>
          <div>
            Skjemaet (XSD) genereres fra objekt-/feltdefinisjonene. Legg til objekter i
            Datamodell-fanen, eller bruk diskusjonspanelet til å planlegge struktur og
            namespace med DiBK.
          </div>
        </div>
      </div>
    );
  }

  function kopier() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(src);
      setKopiert(true);
      setTimeout(() => setKopiert(false), 1500);
    }
  }
  function lastNed() {
    const blob = new Blob([src], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  return (
    <div>
      {problemer.length > 0 && (
        <div className="callout callout--warning" style={{ marginBottom: 12 }}>
          <span className="callout-icon" />
          <div>
            <strong className="callout-title">
              XSD-en er generert fra datamodellen, men har {problemer.length} gyldighetsproblem
              {problemer.length === 1 ? '' : 'er'}
            </strong>
            <div>XSD-en er velformet, men ikke skjema-gyldig før dette er rettet i Datamodell-fanen:</div>
            <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
              {problemer.slice(0, 8).map((p, i) => (
                <li key={i}>
                  <code>{p.sti}</code> – {p.melding}
                </li>
              ))}
              {problemer.length > 8 && <li>… og {problemer.length - 8} til</li>}
            </ul>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            background: 'var(--neutral-bg-input)',
            padding: '3px 9px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent-text)',
            fontWeight: 600,
          }}
        >
          {file}
        </span>
        {opplastet && <span className="tag tag--success" title="Vises ordrett slik den ble lastet opp">opplastet</span>}
        {ns && (
          <>
            <span style={{ fontSize: '0.76rem', color: 'var(--fg-2)' }}>målnamespace</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.74rem', color: 'var(--fg-2)' }}>{ns}</span>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn btn--pill btn--sm" onClick={kopier}>
            {kopiert ? 'Kopiert ✓' : 'Kopier XSD'}
          </button>
          <button className="btn btn--pill btn--sm" onClick={lastNed}>
            Last ned
          </button>
        </div>
      </div>
      <pre
        className="pv-scroll"
        style={{
          background: '#0c2230',
          color: '#d6e3ee',
          padding: '16px 18px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
          maxHeight: '66vh',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          lineHeight: 1.55,
          margin: 0,
          border: '1px solid var(--neutral-border-strong)',
        }}
      >
        {src}
      </pre>
    </div>
  );
}
