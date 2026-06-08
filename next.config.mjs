/**
 * Next.js – statisk eksport for GitHub Pages.
 *
 * - output: 'export'  => `next build` skriver rene statiske filer til ./out
 * - basePath/assetPrefix settes til repo-navnet i prod (PAGES_BASE_PATH),
 *   tomt lokalt. GitHub Actions setter PAGES_BASE_PATH='/<repo>'.
 * - Supabase-nøkler eksponeres til nettleseren. Vi godtar både NEXT_PUBLIC_*-
 *   navnene og de korte SUPABASE_*-navnene fra .env, så det bare virker.
 */
const basePath = process.env.PAGES_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
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
