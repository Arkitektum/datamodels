'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import Logo from './Logo';

export default function SignIn() {
  const { signInWithPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signInWithPassword(email.trim(), password);
    if (error) setError(error);
    setBusy(false);
  }

  return (
    <div className="signin-wrap">
      <form className="card signin-card" onSubmit={onSubmit}>
        <div className="signin-brand">
          <Logo />
        </div>
        <h1>Datamodell-portal</h1>
        <p className="muted">Logg inn for å se og redigere.</p>
        <label>
          E-post
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Passord
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="signin-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Logger inn …' : 'Logg inn'}
        </button>
      </form>
    </div>
  );
}
