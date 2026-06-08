'use client';

import { useState, type FormEvent } from 'react';
import { useAuth } from '@/lib/auth';

export default function ChangePassword({
  forced,
  onDone,
  onCancel,
}: {
  forced?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
}) {
  const { updatePassword, user } = useAuth();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pw.length < 8) {
      setError('Passordet må være minst 8 tegn.');
      return;
    }
    if (pw !== pw2) {
      setError('Passordene er ikke like.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await updatePassword(pw);
    setBusy(false);
    if (error) setError(error);
    else onDone?.();
  }

  return (
    <form className="card signin-card" onSubmit={onSubmit}>
      <h1>{forced ? 'Velg nytt passord' : 'Bytt passord'}</h1>
      <p className="muted">
        {forced
          ? 'Du logget inn med et midlertidig passord. Velg et nytt passord for å fortsette.'
          : `Innlogget som ${user?.email}.`}
      </p>
      <label>
        Nytt passord
        <input
          type="password"
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />
      </label>
      <label>
        Gjenta nytt passord
        <input
          type="password"
          autoComplete="new-password"
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
          required
        />
      </label>
      {error && <p className="signin-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Lagrer …' : 'Lagre nytt passord'}
      </button>
      {!forced && onCancel && (
        <button type="button" className="btn-link" style={{ marginTop: 12 }} onClick={onCancel}>
          Avbryt
        </button>
      )}
    </form>
  );
}
