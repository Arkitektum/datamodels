/**
 * Next.js instrumentation: kjøres én gang når Node-serveren starter.
 * Starter den periodiske varsel-e-postjobben når VARSEL_EPOST_INTERVALL_MIN
 * er satt (> 0). Uten variabelen skjer ingenting — e-post kan da i stedet
 * trigges eksternt via POST /api/varsel-epost.
 *
 * Jobben har egen overlapp-vakt, så et langt kjør aldri dobles av intervallet.
 * MERK: intervallet kjører per instans — kjør appen med én instans, eller la
 * claim-mekanismen i jobben håndtere samtidighet (den gjør det trygt, men
 * flere instanser gir bare unødvendige tomme kjøringer).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const intervallMin = Number(process.env.VARSEL_EPOST_INTERVALL_MIN || 0);
  if (!intervallMin || intervallMin <= 0 || !Number.isFinite(intervallMin)) return;

  const { sendUsendteVarsler } = await import('./lib/varselEpostJobb');

  const kjoer = async () => {
    const r = await sendUsendteVarsler();
    if (!r.hoppetOver && (r.sendt > 0 || r.feilet > 0)) {
      console.log(`[varselEpost] sendt=${r.sendt} feilet=${r.feilet}`);
    }
  };

  // Første kjøring kort tid etter oppstart, deretter fast intervall.
  setTimeout(kjoer, 15_000);
  setInterval(kjoer, intervallMin * 60_000);
  console.log(`[varselEpost] periodisk utsending aktiv (hvert ${intervallMin}. minutt)`);
}
