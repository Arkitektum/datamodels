'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { jsonDiff, type DiffLinje } from '@/lib/diff';
import DiffListe from './DiffListe';

/**
 * Felles konfliktbanner for delt data (useDokumentData). Vises når en annen
 * bruker har lagret nyere endringer (status === 'conflict') eller mens du har
 * ulagrede lokale endringer (stale). Knappen kaller reload() som henter
 * ferskeste serververdi og får hooken ut av conflict-tilstanden.
 *
 * Gis `lokal` + `hentServer` (useDokumentData → hentServerVerdi) kan brukeren
 * i tillegg se forskjellene mellom sin ulagrede versjon og den sist lagrede
 * før hun velger å laste inn på nytt.
 */
export default function ConflictBanner({
  visible,
  onReload,
  style,
  lokal,
  hentServer,
}: {
  visible: boolean;
  onReload: () => void;
  style?: CSSProperties;
  lokal?: unknown;
  hentServer?: () => Promise<unknown>;
}) {
  const [diff, setDiff] = useState<DiffLinje[] | null>(null);
  const [henter, setHenter] = useState(false);

  // Nullstill en åpen diff når banneret forsvinner (f.eks. etter reload).
  useEffect(() => {
    if (!visible) setDiff(null);
  }, [visible]);

  if (!visible) return null;

  async function visForskjeller() {
    if (!hentServer) return;
    setHenter(true);
    try {
      const server = await hentServer();
      setDiff(jsonDiff(lokal, server));
    } finally {
      setHenter(false);
    }
  }

  return (
    <div style={style}>
      <div className="dd-conflict">
        <span>Andre har lagret nyere endringer</span>
        {hentServer && diff === null && (
          <button type="button" onClick={visForskjeller} disabled={henter}>
            {henter ? 'Henter …' : 'Vis forskjeller'}
          </button>
        )}
        <button type="button" onClick={onReload}>
          Last inn på nytt
        </button>
      </div>
      {diff !== null && (
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--fg-2)', marginTop: 6 }}>
            Din ulagrede versjon → sist lagrede versjon. «Last inn på nytt» forkaster din versjon.
          </div>
          <DiffListe linjer={diff} />
        </div>
      )}
    </div>
  );
}
