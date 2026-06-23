/**
 * Next.js – server-app (route handlers under app/api kjører på en Node-host).
 *
 * - Tidligere `output: 'export'` (statisk GitHub Pages) er fjernet fordi
 *   bibliotek-funksjonen trenger server-route handlers (proxy mot
 *   sjekkliste-API + feltindeks). Deployes til en Node-host (f.eks. Azure
 *   Container App eller Vercel), ikke GitHub Pages.
 * - basePath/assetPrefix beholdes (tomt uten PAGES_BASE_PATH), uskadelig på
 *   server-host.
 * - Supabase-nøkler eksponeres til nettleseren. Vi godtar både NEXT_PUBLIC_*-
 *   navnene og de korte SUPABASE_*-navnene fra .env, så det bare virker.
 */
const basePath = process.env.PAGES_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      '',
    NEXT_PUBLIC_SUPABASE_TABLE:
      process.env.NEXT_PUBLIC_SUPABASE_TABLE ||
      process.env.SUPABASE_TABLE ||
      'dokument_data',
  },
};

export default nextConfig;
