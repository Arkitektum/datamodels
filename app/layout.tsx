import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import './legacy.css';
import './globals.css';
import './designsystem.css';
import './workspace.css';

export const metadata: Metadata = {
  title: 'Datamodell-portal',
  description: 'Intern portal for Dibk-datamodeller – brevmaler og valideringsregler.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="no">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
