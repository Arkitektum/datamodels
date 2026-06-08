'use client';

import { useState } from 'react';
import AuthGate from '@/components/AuthGate';
import TopBar from '@/components/TopBar';
import StrukturView from '@/components/struktur/StrukturView';
import ValideringsreglerView from '@/components/regler/ValideringsreglerView';
import BrevmalEditor from '@/components/brevmaler/BrevmalEditor';
import LoggView from '@/components/LoggView';
import { STRUKTUR_DEFAULT } from '@/data/hoeringOgOffentligEttersynV2.struktur';

type Tab = 'datamodell' | 'brevmaler' | 'validering' | 'logg';

export default function DatamodellClient({ id, navn }: { id: string; navn: string }) {
  const [tab, setTab] = useState<Tab>('datamodell');

  return (
    <AuthGate>
      <TopBar title={navn} />
      <nav className="tabs" role="tablist">
        <button type="button" className={tab === 'datamodell' ? 'active' : ''} onClick={() => setTab('datamodell')}>
          📦 Datamodell
        </button>
        <button type="button" className={tab === 'brevmaler' ? 'active' : ''} onClick={() => setTab('brevmaler')}>
          📝 Brevmaler &amp; dokumentasjon
        </button>
        <button type="button" className={tab === 'validering' ? 'active' : ''} onClick={() => setTab('validering')}>
          ✅ Valideringsregler
        </button>
        <button type="button" className={tab === 'logg' ? 'active' : ''} onClick={() => setTab('logg')}>
          🕓 Logg
        </button>
      </nav>

      <main className="tab-content">
        {tab === 'datamodell' && <StrukturView datamodellId={id} defaultStruktur={STRUKTUR_DEFAULT} />}
        {tab === 'brevmaler' && <BrevmalEditor datamodellId={id} />}
        {tab === 'validering' && <ValideringsreglerView datamodellId={id} />}
        {tab === 'logg' && <LoggView datamodellId={id} />}
      </main>
    </AuthGate>
  );
}
