import type { CSSProperties } from 'react';

/**
 * Felles konfliktbanner for delt data (useDokumentData). Vises når en annen
 * bruker har lagret nyere endringer (status === 'conflict') eller mens du har
 * ulagrede lokale endringer (stale). Knappen kaller reload() som henter
 * ferskeste serververdi og får hooken ut av conflict-tilstanden.
 */
export default function ConflictBanner({
  visible,
  onReload,
  style,
}: {
  visible: boolean;
  onReload: () => void;
  style?: CSSProperties;
}) {
  if (!visible) return null;
  return (
    <div className="dd-conflict" style={style}>
      <span>Andre har lagret nyere endringer</span>
      <button type="button" onClick={onReload}>
        Last inn på nytt
      </button>
    </div>
  );
}
