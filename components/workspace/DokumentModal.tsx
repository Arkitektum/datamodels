'use client';

import { useEffect, useState } from 'react';
import { type Dokument, type DokKind, signertUrl, lastNedDok } from '@/lib/dokumenter';
import { sanitizeHtml } from '@/lib/sanitizeHtml';

const KIND_LABEL: Record<DokKind, string> = { pdf: 'PDF', word: 'Word', xml: 'XML', bilde: 'Bilde', text: 'Dokument' };

export default function DokumentModal({ dok, onClose }: { dok: Dokument; onClose: () => void }) {
  const [url, setUrl] = useState('');
  const [laster, setLaster] = useState(false);

  useEffect(() => {
    setUrl('');
    if ((dok.kind === 'pdf' || dok.kind === 'bilde') && dok.lager_sti) {
      setLaster(true);
      signertUrl(dok).then((u) => {
        setUrl(u || '');
        setLaster(false);
      });
    }
  }, [dok]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const erPdf = dok.kind === 'pdf';
  const erBilde = dok.kind === 'bilde';
  const erXml = dok.kind === 'xml';
  const erTekst = dok.kind === 'text';

  return (
    <div className="modal-overlay" style={{ zIndex: 1000, padding: 24 }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-1)',
          borderRadius: 'var(--radius-lg)',
          width: 'min(1100px, 94vw)',
          height: '92vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--neutral-border)', flexShrink: 0 }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-text)', fontSize: '1rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dok.navn}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--fg-2)', fontFamily: 'var(--font-mono)' }}>{KIND_LABEL[dok.kind]}</span>
          {dok.kind !== 'text' && (
            <button className="btn btn--secondary btn--sm" onClick={() => lastNedDok(dok)}>
              Last ned
            </button>
          )}
          <button className="btn btn--primary btn--sm" onClick={onClose}>
            Lukk
          </button>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: erPdf || erBilde ? 'var(--bg-2)' : 'var(--bg-1)' }}>
          {erPdf && url && <iframe src={url} title={dok.navn} style={{ width: '100%', height: '100%', border: 'none', display: 'block' }} />}
          {erBilde && url && (
            <img src={url} alt={dok.navn} style={{ display: 'block', maxWidth: '100%', margin: '0 auto', padding: 16 }} />
          )}
          {(erPdf || erBilde) && !url && (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--fg-2)', fontSize: '0.9rem' }}>
              {laster ? 'Laster forhåndsvisning …' : 'Forhåndsvisning ikke tilgjengelig. Last ned filen for å åpne den.'}
            </div>
          )}
          {erXml && (
            <pre
              style={{
                margin: 0,
                padding: '18px 20px',
                background: '#0c2230',
                color: '#d6e3ee',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                minHeight: '100%',
              }}
            >
              {dok.fil_tekst}
            </pre>
          )}
          {erTekst && (
            <div
              className="doc-editor"
              style={{ padding: '28px 32px', maxWidth: '70ch', margin: '0 auto', fontFamily: 'var(--font-sans)', fontSize: '1rem', lineHeight: 1.7, color: 'var(--fg-1)' }}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(dok.html) || '<p><em>Tomt dokument.</em></p>' }}
            />
          )}
          {dok.kind === 'word' && (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', textAlign: 'center', color: 'var(--fg-2)', fontSize: '0.9rem', padding: 32 }}>
              <div style={{ maxWidth: '40ch', lineHeight: 1.5 }}>
                Word-dokumenter kan ikke forhåndsvises i nettleseren. Bruk «Last ned» for å åpne filen.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
