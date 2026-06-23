/**
 * GET /api/sjekkliste/relevante?modell=<id>
 *
 * Rådgivende: returnerer sjekkpunkt fra Sjekkliste-API-et som er relevante for
 * datamodellen, utledet fra modellens forventede vedlegg → SOSI-dokumenttype.
 */
import { NextResponse } from 'next/server';
import { relevanteSjekkpunkter } from '@/lib/sjekklisteRelevante';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const modell = (searchParams.get('modell') ?? '').trim();
  if (!modell) {
    return NextResponse.json({ error: 'Mangler «modell».' }, { status: 400 });
  }
  try {
    const resultat = await relevanteSjekkpunkter(modell);
    return NextResponse.json(resultat);
  } catch (e) {
    return NextResponse.json(
      { error: `Sjekkliste utilgjengelig: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
