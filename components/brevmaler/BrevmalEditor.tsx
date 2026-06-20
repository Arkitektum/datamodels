'use client';

import { useEffect, useRef } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import { useAdoptOnRevision } from '@/lib/useAdoptOnRevision';
import ConflictBanner from '@/components/shared/ConflictBanner';
import { initBrevmalEditor, type BrevmalData, type BrevmalEditorHandle } from '@/lib/brevmalEditor';
import { DATAMODELL_HTML } from '@/data/hoeringOgOffentligEttersynV2.brevmaler';

/**
 * Datamodell & brevmaler. Det statiske innholdet (doktabeller, XML, sidebar,
 * svarskjema) gjengis som original-HTML; de redigerbare brevfeltene + knappene
 * kobles opp av lib/brevmalEditor.ts og lagres delt via useDokumentData.
 */
export default function BrevmalEditor({ datamodellId }: { datamodellId: string }) {
  const { value, setValue, status, revision, stale, reload } = useDokumentData<BrevmalData>(
    datamodellId,
    'brevmaler',
    {},
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<BrevmalEditorHandle | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  // Init editor én gang (fester lyttere + globale onclick-funksjoner).
  useEffect(() => {
    if (!containerRef.current) return;
    const handle = initBrevmalEditor(containerRef.current, (data) => setValue(data, 'Endret brevmal'));
    handleRef.current = handle;
    return () => {
      handle.destroy();
      handleRef.current = null;
    };
    // setValue er stabil (useCallback i useDokumentData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAdoptOnRevision(status, revision, () => {
    handleRef.current?.load(valueRef.current || {});
  });

  return (
    <>
      <ConflictBanner
        visible={status === 'conflict' || stale}
        onReload={reload}
        style={{ marginBottom: 12 }}
      />
      <div ref={containerRef} dangerouslySetInnerHTML={{ __html: DATAMODELL_HTML }} />
    </>
  );
}
