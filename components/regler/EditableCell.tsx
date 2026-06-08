'use client';

import { useEffect, useRef } from 'react';

/**
 * Redigerbar tabellcelle (contentEditable). Ukontrollert: teksten settes bare
 * via ref når `resetKey` endrer seg, aldri fra React-children (bevarer markøren).
 * - onInput: løpende (stille) lagring.
 * - onCommit(gammel, ny): kalles ved blur hvis verdien er endret – brukes til logg.
 */
export default function EditableCell({
  value,
  className,
  resetKey,
  onInput,
  onCommit,
}: {
  value: string;
  className?: string;
  resetKey: number;
  onInput: (text: string) => void;
  onCommit?: (gammel: string, ny: string) => void;
}) {
  const ref = useRef<HTMLTableCellElement>(null);
  const focusValue = useRef('');

  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <td
      className={className}
      contentEditable
      suppressContentEditableWarning
      ref={ref}
      onFocus={() => {
        focusValue.current = ref.current?.innerText ?? '';
      }}
      onInput={() => onInput(ref.current?.innerText ?? '')}
      onBlur={() => {
        const ny = ref.current?.innerText ?? '';
        if (onCommit && ny !== focusValue.current) onCommit(focusValue.current, ny);
      }}
    />
  );
}
