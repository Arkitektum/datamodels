/**
 * GET /api/bibliotek/oppslag?navn=<navn>&kind=felt|objekt
 *
 * Returnerer rådgivende oppslag mot datamodell-biblioteket: eksakte og
 * liknende forekomster av et felt-/objektnavn på tvers av korpuset og
 * portalens egne modeller. Brukes av StrukturView til navngivningshjelp.
 */
import { NextResponse } from 'next/server';
import { sokFelt, sokObjekt } from '@/lib/bibliotek';

// Indeksen bygges server-side ved behov; ruta må kjøre dynamisk.
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const navn = (searchParams.get('navn') ?? '').trim();
  const kind = searchParams.get('kind') === 'objekt' ? 'objekt' : 'felt';

  if (navn.length < 2) {
    return NextResponse.json(
      { error: 'Oppgi minst 2 tegn i «navn».' },
      { status: 400 },
    );
  }

  try {
    const treff = kind === 'objekt' ? await sokObjekt(navn) : await sokFelt(navn);
    return NextResponse.json({ navn, kind, ...treff });
  } catch (e) {
    return NextResponse.json(
      { error: `Bibliotek utilgjengelig: ${(e as Error).message}` },
      { status: 502 },
    );
  }
}
