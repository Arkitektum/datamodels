// Edge Function: sender e-post for nye rader i `varsel` (db/patches/08).
// Kalles av en Database Webhook (INSERT på public.varsel). Uten RESEND_API_KEY
// svarer funksjonen 200 og hopper over utsending — appens in-app-varsler
// fungerer uavhengig av denne.
//
// Secrets (Supabase Studio → Edge Functions → Secrets):
//   RESEND_API_KEY   – API-nøkkel fra resend.com (kreves for utsending)
//   VARSEL_FRA       – avsenderadresse, f.eks. 'Datamodell-portalen <varsel@ditt-domene.no>'
//   APP_URL          – base-URL til portalen for lenker i e-posten (valgfri)
//   VARSEL_WEBHOOK_SECRET – hvis satt, må webhooken sende samme verdi i
//                     Authorization-headeren (Bearer) — hindrer at andre
//                     kan trigge utsending.
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY settes automatisk av plattformen.

interface VarselRad {
  id: number;
  mottaker_epost: string;
  kind: 'forslag_ny' | 'forslag_godkjent' | 'forslag_avvist' | 'omtale';
  datamodell_id: string;
  kontekst: string | null;
  aktor_navn: string | null;
  tekst: string | null;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function emne(v: VarselRad): string {
  switch (v.kind) {
    case 'forslag_ny':
      return `Nytt endringsforslag på ${v.datamodell_id}`;
    case 'forslag_godkjent':
      return `Forslaget ditt på ${v.datamodell_id} ble godkjent`;
    case 'forslag_avvist':
      return `Forslaget ditt på ${v.datamodell_id} ble avvist`;
    case 'omtale':
      return `${v.aktor_navn ?? 'Noen'} nevnte deg i en diskusjon på ${v.datamodell_id}`;
  }
}

function brodtekst(v: VarselRad, appUrl: string): string {
  const hvem = escapeHtml(v.aktor_navn ?? 'En kollega');
  const hvor = v.kontekst ? `feltet <code>${escapeHtml(v.kontekst)}</code>` : 'hele modellen';
  const intro =
    v.kind === 'forslag_ny'
      ? `${hvem} har sendt et nytt endringsforslag på ${hvor}.`
      : v.kind === 'forslag_godkjent'
        ? `${hvem} har godkjent endringsforslaget ditt (${hvor}).`
        : v.kind === 'forslag_avvist'
          ? `${hvem} har avvist endringsforslaget ditt (${hvor}).`
          : `${hvem} nevnte deg i en diskusjon om ${hvor}.`;
  const utdrag = v.tekst
    ? `<blockquote style="border-left:3px solid #ccc;margin:12px 0;padding:4px 12px;color:#444">${escapeHtml(v.tekst)}</blockquote>`
    : '';
  const lenke = appUrl
    ? `<p><a href="${appUrl}/?model=${encodeURIComponent(v.datamodell_id)}&fane=diskusjon">Åpne diskusjonen i Datamodell-portalen</a></p>`
    : '';
  return `<p>Hei,</p><p>${intro}</p>${utdrag}${lenke}<p style="color:#888;font-size:12px">Du får denne e-posten fordi du har en bruker i Datamodell-portalen.</p>`;
}

Deno.serve(async (req) => {
  const webhookSecret = Deno.env.get('VARSEL_WEBHOOK_SECRET');
  if (webhookSecret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${webhookSecret}`) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401 });
    }
  }

  let payload: { type?: string; table?: string; record?: VarselRad };
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'ugyldig payload' }), { status: 400 });
  }
  if (payload.type !== 'INSERT' || payload.table !== 'varsel' || !payload.record) {
    return new Response(JSON.stringify({ skipped: 'ikke varsel-INSERT' }), { status: 200 });
  }
  const v = payload.record;

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    // Bevisst 200: manglende nøkkel = e-post er ikke skrudd på (kun in-app).
    return new Response(JSON.stringify({ skipped: 'RESEND_API_KEY ikke satt' }), { status: 200 });
  }
  const fra = Deno.env.get('VARSEL_FRA') ?? 'Datamodell-portalen <onboarding@resend.dev>';
  const appUrl = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fra,
      to: [v.mottaker_epost],
      subject: emne(v),
      html: brodtekst(v, appUrl),
    }),
  });
  if (!res.ok) {
    // Logg kun status — aldri mottaker/innhold (personopplysninger).
    console.error(`[send-varsel-epost] Resend svarte ${res.status} for varsel ${v.id}`);
    return new Response(JSON.stringify({ error: 'utsending feilet' }), { status: 502 });
  }

  // Marker varselet som sendt (service role går forbi RLS).
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (supabaseUrl && serviceKey) {
    await fetch(`${supabaseUrl}/rest/v1/varsel?id=eq.${v.id}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ epost_sendt: true }),
    });
  }

  return new Response(JSON.stringify({ sent: true }), { status: 200 });
});
