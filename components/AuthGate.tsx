'use client';

import type { ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import SignIn from './SignIn';
import ChangePassword from './ChangePassword';

/**
 * Beskytter innholdet: kun innloggede brukere slipper inn (innlogging kreves).
 * Viser tydelig melding hvis Supabase ikke er konfigurert i bygget.
 */
export default function AuthGate({ children }: { children: ReactNode }) {
  const { loading, user, configured, mustChangePassword } = useAuth();

  if (!configured) {
    return (
      <div className="signin-wrap">
        <div className="card signin-card">
          <h1>Ikke konfigurert</h1>
          <p className="muted">
            Supabase-nøkler mangler i dette bygget. Sett <code>SUPABASE_URL</code> og{' '}
            <code>SUPABASE_PUBLISHABLE_KEY</code> (lokalt i <code>.env</code>, i prod som
            repo-variabler) og bygg på nytt.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="center-msg">Laster …</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  if (mustChangePassword) {
    return (
      <div className="signin-wrap">
        <ChangePassword forced />
      </div>
    );
  }

  return <>{children}</>;
}
