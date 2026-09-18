'use client';

// Utskriftsvisning: én ren, leservennlig side per datamodell, uten meny,
// sidepanel og knapper. Åpnes fra Eksport-fanen som `/print/?model=<id>` og er
// ment for Ctrl+P → «Lagre som PDF».
//
// Siden leser `?model=` fra URL-en i nettleseren (ikke `useSearchParams`), slik
// at den fungerer uendret i den statiske eksporten.
import { useEffect, useMemo, useState } from 'react';
import AuthGate from '@/components/AuthGate';
import { DATAMODELLER } from '@/lib/datamodeller';
import { listCustomModels, type CustomModell } from '@/lib/customModels';
import { useDokumentData } from '@/lib/useDokumentData';
import type { Struktur } from '@/lib/struktur';
import type { XsdKilde } from '@/lib/xsd';
import { byggMeta } from '@/lib/eksport';
import { tilConfluenceHtml } from '@/lib/eksportDok';
import { strukturTilUmlSvg } from '@/lib/umlSvg';
import { strukturTilXsdSvg } from '@/lib/xsdDiagramSvg';
import { STATUS_META } from '@/components/workspace/types';
import type { ModellStatus } from '@/lib/datamodeller';

function extractNs(src: string): string {
  const m = src.match(/targetNamespace\s*=\s*"([^"]*)"/);
  return m ? m[1] : '';
}

interface Valgt {
  id: string;
  navn: string;
  status: ModellStatus;
  dataFormatId?: string;
  provider?: string;
  version?: string;
  root?: string;
  lede?: string;
  ns?: string;
  defaultStruktur: Struktur;
}

/** Selve dokumentet. Egen komponent fordi hooks trenger en kjent modell-id. */
function Dokument({ modell }: { modell: Valgt }) {
  const { value: struktur } = useDokumentData<Struktur>(
    modell.id,
    'struktur',
    modell.defaultStruktur,
  );
  const { value: kilde } = useDokumentData<XsdKilde | null>(modell.id, 'xsdkilde', null);
  const [medUml, setMedUml] = useState(true);
  const [medXsd, setMedXsd] = useState(false);

  const objekter = useMemo(() => (Array.isArray(struktur) ? struktur : []), [struktur]);
  const meta = useMemo(
    () =>
      byggMeta(
        {
          navn: modell.navn,
          status: STATUS_META[modell.status].label,
          dataFormatId: modell.dataFormatId,
          provider: modell.provider,
          version: modell.version,
          root: modell.root,
          lede: modell.lede,
          ns: (kilde?.src ? extractNs(kilde.src) : modell.ns) || undefined,
        },
        objekter,
      ),
    [modell, kilde, objekter],
  );

  const html = useMemo(() => tilConfluenceHtml(objekter, meta), [objekter, meta]);
  const umlSvg = useMemo(() => (medUml ? strukturTilUmlSvg(objekter, meta) : ''), [medUml, objekter, meta]);
  const xsdSvg = useMemo(() => (medXsd ? strukturTilXsdSvg(objekter, meta) : ''), [medXsd, objekter, meta]);

  return (
    <div className="print-side">
      <div className="print-verktoey">
        <button className="btn btn--primary btn--sm" onClick={() => window.print()}>
          Skriv ut / PDF
        </button>
        <label>
          <input type="checkbox" checked={medUml} onChange={(e) => setMedUml(e.target.checked)} />
          UML-diagram
        </label>
        <label>
          <input type="checkbox" checked={medXsd} onChange={(e) => setMedXsd(e.target.checked)} />
          XSD-diagram
        </label>
      </div>

      {/* HTML-en er generert av eksportDok.ts, der all brukertekst escapes. */}
      <article className="print-dok" dangerouslySetInnerHTML={{ __html: html }} />

      {umlSvg && (
        <section className="print-diagram">
          <h2>UML-oversikt</h2>
          <div dangerouslySetInnerHTML={{ __html: umlSvg }} />
        </section>
      )}
      {xsdSvg && (
        <section className="print-diagram">
          <h2>XSD-innholdsmodell</h2>
          <div dangerouslySetInnerHTML={{ __html: xsdSvg }} />
        </section>
      )}
    </div>
  );
}

function PrintInnhold() {
  const [modellId, setModellId] = useState<string | null>(null);
  const [custom, setCustom] = useState<CustomModell[]>([]);
  const [lastet, setLastet] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setModellId(sp.get('model') || DATAMODELLER[0]?.id || null);
    listCustomModels().then((m) => {
      setCustom(m);
      setLastet(true);
    });
  }, []);

  const modell: Valgt | null = useMemo(() => {
    if (!modellId) return null;
    const innebygd = DATAMODELLER.find((d) => d.id === modellId);
    const db = custom.find((c) => c.id === modellId);
    if (innebygd) {
      return {
        id: innebygd.id,
        navn: innebygd.navn,
        status: db?.status ?? innebygd.status,
        dataFormatId: innebygd.dataFormatId,
        provider: innebygd.provider,
        version: innebygd.version,
        root: innebygd.root,
        lede: innebygd.lede,
        ns: innebygd.xsd?.ns,
        defaultStruktur: innebygd.struktur ?? [],
      };
    }
    if (db) {
      return {
        id: db.id,
        navn: db.navn,
        status: db.status,
        lede: db.beskrivelse ?? undefined,
        defaultStruktur: [],
      };
    }
    return null;
  }, [modellId, custom]);

  if (!lastet) return <div className="center-msg">Laster …</div>;
  if (!modell) {
    return (
      <div className="center-msg">
        Fant ingen datamodell med id «{modellId}». Åpne utskriftsvisningen fra Eksport-fanen.
      </div>
    );
  }
  return <Dokument key={modell.id} modell={modell} />;
}

export default function PrintPage() {
  return (
    <AuthGate>
      <PrintInnhold />
    </AuthGate>
  );
}
