# datamodels

Server-utgaven av Datamodell-portalen (Next.js med route handlers). Deployes
til en Node-host (f.eks. Azure Container Apps) — se `next.config.mjs`.
Miljøvariabler dokumenteres i `.env.example`.

## E-postvarsler (Microsoft Graph)

Usendte rader i `varsel`-tabellen (fylles av databasetriggere, se
`db/patches/08-varsler.sql` på main) sendes som e-post fra en delt
M365-postboks via Graph `sendMail`. Ingen ekstra npm-avhengigheter — token
hentes med ren `fetch`.

- **Jobben** (`lib/varselEpostJobb.ts`) claimer hver rad med en betinget
  oppdatering av `epost_sendt` før sending (trygt ved samtidige kjøringer), og
  ruller tilbake ved feil så raden prøves igjen. Varsler eldre enn
  `VARSEL_EPOST_MAKS_ALDER_TIMER` (24) hoppes over.
- **Periodisk kjøring**: sett `VARSEL_EPOST_INTERVALL_MIN` (f.eks. `5`) —
  `instrumentation.ts` starter da jobben ved serveroppstart.
- **Ekstern trigging**: `POST /api/varsel-epost` med
  `Authorization: Bearer $VARSEL_JOBB_SECRET` (503 uten konfigurert secret).

### Graph-tilgang

| Miljø | Innlogging | Oppsett |
| --- | --- | --- |
| Azure | Managed Identity (anbefalt — ingen secrets) | Tildel identiteten Graph-approllen `Mail.Send` (via PowerShell `New-MgServicePrincipalAppRoleAssignment`); sett `VARSEL_POSTBOKS`. Ved user-assigned identity: sett også `AZURE_CLIENT_ID`. |
| Lokalt/dev | Client credentials | App-registrering i Entra ID med application-tillatelsen `Mail.Send` + admin consent; sett `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `VARSEL_POSTBOKS`. |

Avgrens hva identiteten kan sende fra med en **Application Access Policy** i
Exchange Online, så `Mail.Send` kun gjelder varsel-postboksen:

```powershell
New-ApplicationAccessPolicy -AppId <client-id> -PolicyScopeGroupId varsel@ditt-domene.no `
  -AccessRight RestrictAccess -Description "Datamodell-portalen: kun varsel-postboksen"
```
