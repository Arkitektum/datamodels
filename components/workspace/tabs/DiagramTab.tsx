'use client';

import { useMemo, useState } from 'react';
import { useDokumentData } from '@/lib/useDokumentData';
import type { Struktur } from '@/lib/struktur';
import { strukturTilMermaid } from '@/lib/umlMermaid';
import UmlDiagram from '@/components/struktur/UmlDiagram';
import { ModellView } from '../types';

export default function DiagramTab({ model }: { model: ModellView }) {
  const { value: struktur } = useDokumentData<Struktur>(model.id, 'struktur', model.defaultStruktur);
  const objekter = Array.isArray(struktur) ? struktur : [];
  const [ledetekster, setLedetekster] = useState(true);
  const definition = useMemo(
    () => strukturTilMermaid(objekter, { ledetekster }),
    [struktur, ledetekster], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!objekter.length) {
    return (
      <div className="callout callout--info">
        <span className="callout-icon" />
        <div>
          <strong className="callout-title">Ingen struktur ennå</strong>
          <div>
            Diagrammet bygges fra objektene i Datamodell-fanen. Legg til objekter og felt, så
            tegnes UML-klassediagrammet automatisk.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
        <p className="muted" style={{ margin: 0, flex: 1, minWidth: 240 }}>
          Automatisk UML-klassediagram fra datamodellen. Objekter = klasser, felt = attributter, og
          felt som peker på en annen objekttype (relasjon) = piler med kardinalitet.
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.84rem', flexShrink: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={ledetekster} onChange={(e) => setLedetekster(e.target.checked)} />
          Vis ledetekster
        </label>
      </div>
      <UmlDiagram definition={definition} />
    </div>
  );
}
