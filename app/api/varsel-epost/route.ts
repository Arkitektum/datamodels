/**
 * POST /api/varsel-epost
 *
 * Kjører én runde av varsel-e-postjobben (send usendte rader i `varsel` via
 * Microsoft Graph). Beregnet for ekstern planlegging (Logic App, cron,
 * GitHub Actions) eller manuell trigging — den periodiske kjøringen i
 * instrumentation.ts bruker jobben direkte og går ikke via denne ruta.
 *
 * Beskyttet med VARSEL_JOBB_SECRET (Authorization: Bearer <secret>). Uten
 * konfigurert secret svarer ruta 503 — endepunktet er bevisst stengt som
 * standard, siden det utløser utgående e-post.
 */
import { NextResponse } from 'next/server';
import { sendUsendteVarsler } from '@/lib/varselEpostJobb';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const secret = process.env.VARSEL_JOBB_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'VARSEL_JOBB_SECRET er ikke konfigurert — endepunktet er avslått.' },
      { status: 503 },
    );
  }
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Ugyldig eller manglende Authorization.' }, { status: 401 });
  }

  const resultat = await sendUsendteVarsler();
  if (resultat.hoppetOver) {
    return NextResponse.json(
      { ...resultat, error: 'Jobben kjørte ikke — sjekk Supabase service-role og Graph-konfigurasjon.' },
      { status: 503 },
    );
  }
  return NextResponse.json(resultat);
}
