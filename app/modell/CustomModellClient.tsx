'use client';

import { useState } from 'react';
import TopBar from '@/components/TopBar';
import StrukturView from '@/components/struktur/StrukturView';
import BrevmalBuilder from '@/components/brevmaler/BrevmalBuilder';
import ValideringsreglerView from '@/components/regler/ValideringsreglerView';
import LoggView from '@/components/LoggView';

type Tab = 'datamodell' | 'brevmaler' | 'validering' | 'logg';

export default function CustomModellClient({ id, navn }: { id: string; navn: string }) {
  const [tab, setTab] = useState<Tab>('datamodell');

  return (
    <>
      <TopBar title={navn} />
      <nav className="tabs" role="tablist">
        <button type="button" className={tab === 'datamodell' ? 'active' : ''} onClick={() => setTab('datamodell')}>
          📦 Datamodell
        </button>
        <button type="button" className={tab === 'brevmaler' ? 'active' : ''} onClick={() => setTab('brevmaler')}>
          📝 Brevmaler
        </button>
        <button type="button" className={tab === 'validering' ? 'active' : ''} onClick={() => setTab('validering')}>
          ✅ Valideringsregler
        </button>
        <button type="button" className={tab === 'logg' ? 'active' : ''} onClick={() => setTab('logg')}>
          🕓 Logg
        </button>
      </nav>

      <main className="tab-content">
        {tab === 'datamodell' && <StrukturView datamodellId={id} />}
        {tab === 'brevmaler' && <BrevmalBuilder datamodellId={id} />}
        {tab === 'validering' && <ValideringsreglerView datamodellId={id} defaultGrupper={[]} root="" />}
        {tab === 'logg' && <LoggView datamodellId={id} />}
      </main>
    </>
  );
}
