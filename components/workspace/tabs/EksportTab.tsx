'use client';

import { useMemo, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import type { Struktur } from '@/lib/struktur';
import type { XsdKilde } from '@/lib/xsd';
import { byggMeta } from '@/lib/eksport';
import { tilConfluenceHtml, tilHtmlDokument, tilMarkdown } from '@/lib/eksportDok';
import { strukturTilUmlSvg } from '@/lib/umlSvg';
import { strukturTilXsdSvg } from '@/lib/xsdDiagramSvg';
import { filnavnDel } from '@/lib/svgTekst';
import { kopierHtml, kopierTekst, lastNedFil } from '@/lib/nedlasting';
import { ModellView, STATUS_META } from '../types';

function extractNs(src: string): string {
  const m = src.match(/targetNamespace\s*=\s*"([^"]*)"/);
  return m ? m[1] : '';
}

/** Kort med overskrift, forklaring og knapperad. */
function Seksjon({
  tittel,
  forklaring,
  knapper,
  children,
}: {
  tittel: string;
  forklaring: string;
  knapper: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section
      style={{
        border: '1px solid var(--neutral-border-strong)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-1)',
        padding: '16px 18px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 className="h6" style={{ margin: '0 0 4px' }}>
            {tittel}
          </h2>
          <p className="p p-sm" style={{ margin: 0, color: 'var(--fg-2)' }}>
            {forklaring}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>{knapper}</div>
      </div>
      {children}
    </section>
  );
}

/** Forhåndsvisning av et generert SVG, skalert til kortets bredde. */
function SvgForhaandsvisning({ svg }: { svg: string }) {
  return (
    <div
      style={{
        marginTop: 14,
        border: '1px solid var(--neutral-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'auto',
        maxHeight: '54vh',
        background: 'var(--neutral-bg-input)',
      }}
    >
      {/* SVG-en er generert av oss selv (all tekst escapes i svgTekst.esc),
          så innholdet er trygt å sette inn direkte. */}
      <div style={{ minWidth: 'min-content' }} dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}

export default function EksportTab({ model }: { model: ModellView }) {
  const { value: struktur } = useDokumentData<Struktur>(model.id, 'struktur', model.defaultStruktur);
  const { value: kilde } = useDokumentData<XsdKilde | null>(model.id, 'xsdkilde', null);
  const [melding, setMelding] = useState<string | null>(null);
  const [visUml, setVisUml] = useState(true);
  const [visXsd, setVisXsd] = useState(false);

  // Memoisert: uten dette ville `[]`-fallbacken vært en ny referanse for hver
  // render, og alle useMemo-ene under (inkludert SVG-genereringen) kjørt på nytt.
  const objekter = useMemo(() => (Array.isArray(struktur) ? struktur : []), [struktur]);

  const meta = useMemo(
    () =>
      byggMeta(
        {
          navn: model.navn,
          status: STATUS_META[model.status].label,
          dataFormatId: model.dataFormatId,
          provider: model.provider,
          version: model.version,
          root: model.root,
          lede: model.lede,
          ns: (kilde?.src ? extractNs(kilde.src) : model.xsd?.ns) || undefined,
        },
        objekter,
      ),
    [model, kilde, objekter],
  );

  const basis = filnavnDel(model.navn) + (model.version ? '-v' + model.version : '');

  const confluenceHtml = useMemo(() => tilConfluenceHtml(objekter, meta), [objekter, meta]);
  const markdown = useMemo(() => tilMarkdown(objekter, meta), [objekter, meta]);
  const umlSvg = useMemo(() => strukturTilUmlSvg(objekter, meta), [objekter, meta]);
  const xsdSvg = useMemo(() => strukturTilXsdSvg(objekter, meta), [objekter, meta]);

  function kvitter(tekst: string) {
    setMelding(tekst);
    setTimeout(() => setMelding(null), 2500);
  }

  if (!objekter.length) {
    return (
      <div className="callout callout--info">
        <span className="callout-icon" />
        <div>
          <strong className="callout-title">Ingenting å eksportere ennå</strong>
          <div>
            Eksporten bygges fra objektene i Datamodell-fanen. Legg til objekter og felt (eller
            importer en XSD), så blir både tabeller og diagrammer tilgjengelige her.
          </div>
        </div>
      </div>
    );
  }

  function aapneUtskrift() {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    window.open(`${base}/print/?model=${encodeURIComponent(model.id)}`, '_blank', 'noopener');
  }

  return (
    <div>
      <p className="p p-sm" style={{ color: 'var(--fg-2)', marginTop: 0, maxWidth: '72ch' }}>
        Leservennlige utgaver av datamodellen til dokumentasjon – til innliming i Confluence, til
        utskrift/PDF, og som diagrammer du kan legge ved som bilde. Alt genereres fra strukturen
        slik den står nå.
      </p>

      {melding && (
        <div className="callout callout--success" style={{ marginBottom: 14 }}>
          <span className="callout-icon" />
          <div>{melding}</div>
        </div>
      )}

      <Seksjon
        tittel="Confluence"
        forklaring="Kopierer hele datamodellen som formatert HTML. Lim inn direkte i en Confluence-side – du får native tabeller som kan redigeres videre, ikke et bilde."
        knapper={
          <>
            <button
              className="btn btn--primary btn--sm"
              onClick={async () => {
                const res = await kopierHtml(confluenceHtml);
                kvitter(
                  res === 'html'
                    ? 'Kopiert som formatert HTML — lim inn i Confluence.'
                    : res === 'tekst'
                      ? 'Nettleseren tillot ikke formatert kopiering. HTML-kildekoden ligger på utklippstavla.'
                      : 'Kopiering feilet. Last ned HTML-filen i stedet.',
                );
              }}
            >
              Kopier for Confluence
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => lastNedFil(tilHtmlDokument(objekter, meta), basis + '.html', 'text/html')}
            >
              Last ned HTML
            </button>
          </>
        }
      />

      <Seksjon
        tittel="Utskrift og PDF"
        forklaring="Åpner en ren leservisning uten meny og knapper. Skriv ut derfra (Ctrl+P) og velg «Lagre som PDF» for et vedlegg."
        knapper={
          <button className="btn btn--secondary btn--sm" onClick={aapneUtskrift}>
            Åpne utskriftsvisning
          </button>
        }
      />

      <Seksjon
        tittel="Markdown"
        forklaring="Samme innhold som Markdown-tabeller – til README-filer, Jira eller Confluence-import."
        knapper={
          <>
            <button
              className="btn btn--secondary btn--sm"
              onClick={async () =>
                kvitter(
                  (await kopierTekst(markdown))
                    ? 'Markdown kopiert.'
                    : 'Kopiering feilet. Last ned filen i stedet.',
                )
              }
            >
              Kopier Markdown
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => lastNedFil(markdown, basis + '.md', 'text/markdown')}
            >
              Last ned .md
            </button>
          </>
        }
      />

      <Seksjon
        tittel="UML-diagram (SVG)"
        forklaring="Ett kort per objekttype med feltene som «navn : Type [kardinalitet]». Rot-typen er markert i blått."
        knapper={
          <>
            <button className="btn btn--pill btn--sm" onClick={() => setVisUml((v) => !v)}>
              {visUml ? 'Skjul' : 'Vis'}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => lastNedFil(umlSvg, basis + '-uml.svg', 'image/svg+xml')}
            >
              Last ned SVG
            </button>
          </>
        }
      >
        {visUml && <SvgForhaandsvisning svg={umlSvg} />}
      </Seksjon>

      <Seksjon
        tittel="XSD-diagram (SVG)"
        forklaring="Innholdsmodellen tegnet som tre: rotelementet til venstre, én ramme per kompleks type, og piler til typene som refereres. Stiplet ramme = valgfritt element."
        knapper={
          <>
            <button className="btn btn--pill btn--sm" onClick={() => setVisXsd((v) => !v)}>
              {visXsd ? 'Skjul' : 'Vis'}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => lastNedFil(xsdSvg, basis + '-xsd.svg', 'image/svg+xml')}
            >
              Last ned SVG
            </button>
          </>
        }
      >
        {visXsd && <SvgForhaandsvisning svg={xsdSvg} />}
      </Seksjon>
    </div>
  );
}
