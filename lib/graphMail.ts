// Server-only: send e-post via Microsoft Graph (sendMail fra en delt postboks).
// Ingen SDK-avhengigheter — token hentes med ren fetch via én av to flyter:
//
//   1) Client credentials (lokalt/dev): AZURE_TENANT_ID + AZURE_CLIENT_ID +
//      AZURE_CLIENT_SECRET fra en app-registrering med application-tillatelsen
//      Graph → Mail.Send (admin consent). Avgrens gjerne til én postboks med
//      en Application Access Policy i Exchange Online.
//   2) Managed Identity (Azure App Service / Container Apps): plattformen
//      setter IDENTITY_ENDPOINT + IDENTITY_HEADER; identiteten må være tildelt
//      Graph-approllen Mail.Send. Ingen hemmeligheter i miljøet.
//
// Avsenderpostboksen settes i VARSEL_POSTBOKS (f.eks. varsel@arkitektum.no).

const GRAPH_RESSURS = 'https://graph.microsoft.com';

/** True når en av innloggingsflytene OG avsenderpostboksen er konfigurert. */
export function erGraphMailKonfigurert(): boolean {
  const clientCreds =
    !!process.env.AZURE_TENANT_ID && !!process.env.AZURE_CLIENT_ID && !!process.env.AZURE_CLIENT_SECRET;
  const managedIdentity = !!process.env.IDENTITY_ENDPOINT && !!process.env.IDENTITY_HEADER;
  return (clientCreds || managedIdentity) && !!process.env.VARSEL_POSTBOKS;
}

let tokenCache: { token: string; utloeperMs: number } | null = null;

async function hentGraphToken(): Promise<string> {
  // 60 s margin så vi aldri sender med et token som utløper underveis.
  if (tokenCache && Date.now() < tokenCache.utloeperMs - 60_000) return tokenCache.token;

  const tenant = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const identityEndpoint = process.env.IDENTITY_ENDPOINT;
  const identityHeader = process.env.IDENTITY_HEADER;

  let res: Response;
  if (tenant && clientId && clientSecret) {
    res = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: `${GRAPH_RESSURS}/.default`,
        grant_type: 'client_credentials',
      }),
    });
  } else if (identityEndpoint && identityHeader) {
    const url = new URL(identityEndpoint);
    url.searchParams.set('resource', GRAPH_RESSURS);
    url.searchParams.set('api-version', '2019-08-01');
    // Ved user-assigned Managed Identity: pek på riktig identitet.
    if (clientId) url.searchParams.set('client_id', clientId);
    res = await fetch(url, { headers: { 'X-IDENTITY-HEADER': identityHeader } });
  } else {
    throw new Error(
      'Graph-innlogging mangler: sett AZURE_TENANT_ID/AZURE_CLIENT_ID/AZURE_CLIENT_SECRET, eller kjør med Managed Identity.',
    );
  }

  const data = (await res.json().catch(() => ({}))) as {
    access_token?: string;
    expires_in?: number | string;
    expires_on?: number | string;
    error_description?: string;
  };
  if (!res.ok || !data.access_token) {
    throw new Error(`Token-henting feilet (${res.status}): ${data.error_description ?? 'ukjent årsak'}`);
  }
  // Client credentials gir expires_in (sekunder fra nå); Managed Identity gir
  // expires_on (epoke-sekunder). Normaliser til absolutt tidspunkt i ms.
  const utloeperMs = data.expires_on
    ? Number(data.expires_on) * 1000
    : Date.now() + Number(data.expires_in ?? 300) * 1000;
  tokenCache = { token: data.access_token, utloeperMs };
  return data.access_token;
}

/** Sender én HTML-e-post fra VARSEL_POSTBOKS. Kaster ved feil (med Graph-status,
 *  aldri mottaker/innhold — personopplysninger skal ikke i logger). */
export async function sendGraphMail(til: string, emne: string, html: string): Promise<void> {
  const postboks = process.env.VARSEL_POSTBOKS;
  if (!postboks) throw new Error('VARSEL_POSTBOKS er ikke satt.');
  const token = await hentGraphToken();

  const res = await fetch(
    `${GRAPH_RESSURS}/v1.0/users/${encodeURIComponent(postboks)}/sendMail`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          subject: emne,
          body: { contentType: 'HTML', content: html },
          toRecipients: [{ emailAddress: { address: til } }],
        },
        saveToSentItems: false,
      }),
    },
  );
  if (res.status !== 202) {
    const feil = (await res.json().catch(() => ({}))) as { error?: { code?: string } };
    throw new Error(`Graph sendMail feilet (${res.status} ${feil.error?.code ?? ''})`.trim());
  }
}
