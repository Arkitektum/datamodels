import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import './legacy.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Datamodell-portal',
  description: 'Intern portal for Dibk-datamodeller – brevmaler og valideringsregler.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
