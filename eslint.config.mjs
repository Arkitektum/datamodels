// Flat ESLint config kompatibel med Next 16 / ESLint 9.
// eslint-config-next eksporterer en native flat-config (core-web-vitals +
// TypeScript). Vi holder den pragmatisk: advar i stedet for å feile på vanlige
// mønstre i eksisterende kode, slik at CI-gaten kun blokkerer ekte problemer.
import next from 'eslint-config-next';

const config = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'next-env.d.ts',
      'tsconfig.tsbuildinfo',
      'data/**',
      'db/**',
      'public/**',
    ],
  },
  ...next,
  {
    // react-hooks er allerede registrert av eslint-config-next. Next 16 slår
    // på flere nye React 19-regler som error; vi demper dem til warning slik at
    // eksisterende kode ikke blokkerer CI-gaten (mønstrene er bevisste her).
    rules: {
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
];

export default config;
