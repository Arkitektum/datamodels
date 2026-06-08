'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGate from '@/components/AuthGate';
import CustomModellClient from './CustomModellClient';

function Inner() {
  const sp = useSearchParams();
  const id = sp.get('id') || '';
  const navn = sp.get('navn') || 'Datamodell';

  if (!id) {
    return (
      <main className="container">
        <h1>Fant ikke modellen</h1>
        <p className="muted">Mangler modell-id i URL-en.</p>
      </main>
    );
  }
  return <CustomModellClient id={id} navn={navn} />;
}

export default function Page() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="center-msg">Laster …</div>}>
        <Inner />
      </Suspense>
    </AuthGate>
  );
}
