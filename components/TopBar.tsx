'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import ChangePassword from './ChangePassword';
import Logo from './Logo';

export default function TopBar({ title }: { title?: string }) {
  const { user, signOut } = useAuth();
  const [showPw, setShowPw] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link href="/" className="topbar-home" aria-label="Til forsiden">
          <Logo className="topbar-logo" />
        </Link>
        {title && <span className="topbar-title">{title}</span>}
      </div>
      <div className="topbar-right">
        {user && <span className="muted">{user.email}</span>}
        {user && (
          <button className="btn-link" onClick={() => setShowPw(true)}>
            Bytt passord
          </button>
        )}
        <button className="btn-link" onClick={() => signOut()}>
          Logg ut
        </button>
      </div>

      {showPw && (
        <div className="modal-overlay" onClick={() => setShowPw(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <ChangePassword onDone={() => setShowPw(false)} onCancel={() => setShowPw(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
