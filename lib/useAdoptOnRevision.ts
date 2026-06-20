'use client';

import { useEffect, useRef } from 'react';
import type { SaveStatus } from './useDokumentData';

/**
 * Re-adopterer serververdien én gang per revision. `adopt` kalles når data er
 * lastet (status 'idle') og hookens revision har endret seg siden forrige
 * adopsjon — dvs. ved montering og ved reload etter at en annen bruker har
 * lagret. Lokale setValue endrer IKKE revision, så brukerens egne, ulagrede
 * endringer overskrives ikke.
 *
 * `adopt` holdes i en ref slik at kalleren slipper å memoisere den; effekten
 * trigges kun av status/revision og leser ferskeste closure-verdier når den
 * kjører.
 */
export function useAdoptOnRevision(
  status: SaveStatus,
  revision: number,
  adopt: () => void,
): void {
  const lastRevisionRef = useRef(-1);
  const adoptRef = useRef(adopt);
  adoptRef.current = adopt;

  useEffect(() => {
    if (status === 'idle' && revision !== lastRevisionRef.current) {
      lastRevisionRef.current = revision;
      adoptRef.current();
    }
  }, [status, revision]);
}
