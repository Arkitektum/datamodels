# Datamodell-portal

Internal web portal for DiBK data models, centered on the **Høring og offentlig ettersyn V2** (public consultation) model. It lets developers and domain experts view, edit and collaborate on letter templates, validation rules, structure/UML and example data — with authentication, version history and inline discussion/change proposals.

The entire app is a single authenticated workspace: `app/page.tsx` renders `AuthGate` → `WorkspaceClient`, a tabbed single-page surface around the selected model.

## Tech stack

- **Next.js 16** (App Router, no `pages/`), configured with `output: 'export'` — a static export to `./out`.
- **React 19**
- **Supabase** (`@supabase/supabase-js`) — auth, Postgres, realtime and storage.
- **mermaid** — UML diagrams.
- **TypeScript 5.7**, **ESLint 9** (`eslint-config-next`).
- **Vitest** + jsdom — tests.

## Getting started

Requirements: Node.js (with npm) and a Supabase project.

```bash
npm install
cp .env.example .env   # then fill in real values (see note below)
npm run dev            # http://localhost:3000
```

The app degrades gracefully without Supabase credentials — `isSupabaseConfigured` puts the UI in a "not configured" state rather than crashing.

### Environment variables

Read in `lib/supabase.ts`. Because these values are used in client code, Next.js requires the `NEXT_PUBLIC_` prefix:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | Publishable frontend key (`sb_publishable_…`) — never use the `sb_secret_…` key here |
| `NEXT_PUBLIC_SUPABASE_TABLE` | no | Table name, defaults to `dokument_data` |

> **Note:** `.env.example` currently lists these names *without* the `NEXT_PUBLIC_` prefix. The prefix is required for the variables to reach the browser, so use the names in the table above.

### Database

The schema lives in `db/schema.sql`, with ordered migrations in `db/patches/` (`01`–`10`). Run `schema.sql` first against your Supabase project, then apply the patches in numeric order.

Main tables:

- `datamodell` — one row per data model; `status` drives sidebar grouping, `synlighet` (`delt`/`privat`) + `eier_epost` control who can see it (patch `09`).
- `dokument_data` — the shared editable content, one row per (model, type).
- `endring_logg` — audit trail (who/what/when), populated by a trigger.
- `dokument_data_historikk` — content snapshots for version restore.
- `bruker_rolle` — per-user role, set manually; governs proposal approval.
- `diskusjon` — comments and change proposals.
- `dokument` — attached documents (pdf/word/xml/text; binaries in the `dokumenter` storage bucket).
- `varsel` — per-user notifications (new proposals → DiBK, decisions → author, `@`-mentions), populated by triggers on `diskusjon`.
- `traad_lest` — when each user last read a discussion thread; drives the unread badges.

### Model visibility

Patch `09` adds `synlighet` to `datamodell`: a custom model can be kept **private** (visible only to the user who created it) until it is ready to share. Row-level security enforces it on both `datamodell` and `dokument_data`, so the content of a private model is not readable by others either. Existing models are migrated as `delt` (shared).

Until the patch is applied the app keeps working — it falls back to the old columns and treats every model as shared — but the visibility selector will report that the patch is missing.

### Uploaded files

Patch `10` hardens the `dokumenter` storage bucket: a MIME allowlist and a 50 MB size limit, enforced by Storage itself. `text/html`, `image/svg+xml` and scripts are deliberately excluded — without the allowlist, any authenticated user could call the Storage API directly with `contentType: 'text/html'`, request a signed URL and have it rendered inline on the project's `*.supabase.co` domain. The client mirrors the same list (`MIME_FOR_ENDELSE` in `lib/dokumenter.ts`) and derives the content type from the file extension rather than trusting `file.type`, so rejected files get a clear message instead of a silent failure.

Download links use `createSignedUrl(..., { download: true })` so files are downloaded rather than rendered; the inline preview (`<img>` / `<iframe>`) is the only place a file is shown in place.

### Email notifications (optional)

In-app notifications (the *Mine varsler* inbox filter and badges) work with patch `08` alone. To also send email:

1. Deploy the Edge Function: `supabase functions deploy send-varsel-epost` (code in `supabase/functions/send-varsel-epost/`).
2. Set secrets under *Edge Functions → Secrets*: `RESEND_API_KEY` (from [resend.com](https://resend.com)), `VARSEL_FRA` (sender address on a verified domain), `APP_URL` (portal base URL for deep links) and optionally `VARSEL_WEBHOOK_SECRET`.
3. Create a Database Webhook (*Database → Webhooks*): table `public.varsel`, event `INSERT`, type *Supabase Edge Function*, function `send-varsel-epost`. If you set `VARSEL_WEBHOOK_SECRET`, add an `Authorization: Bearer <secret>` header on the webhook.

Without the API key the function no-ops (HTTP 200) and the portal keeps working with in-app notifications only. A different provider (SendGrid, SMTP relay) can be swapped in by replacing the single `fetch` against `api.resend.com`.

## Modules

The workspace (`components/workspace/`) is a tabbed client around a selected model:

- **WorkspaceClient / Header / Sidebar** — model selection, "new model" flow, tab orchestration and navigation.
- **GlobalSearch** — search across models and content.
- **InnboksView / DiskusjonPanel** — discussion and change-proposal overview and per-field threads.

Tabs (`components/workspace/tabs/`): **Datamodell** (letter/document view), **Xsd** (canonical XSD), **Diagram** (mermaid UML), **Eksport** (documentation export, see below), **Eksempel** (example data), **ValiderXml** (XML validation), **Diskusjon**, **Historikk** (version history + restore), **Dokumenter**.

### Documentation export

The **Eksport** tab turns the current structure into reader-friendly documentation, all generated client-side (no server, works in the static export):

- **Confluence** — copies the model to the clipboard as real `text/html`, so pasting into a Confluence page yields native, editable tables rather than an image. Falls back to copying the HTML source when the browser blocks rich clipboard writes.
- **Utskrift/PDF** — opens `/print/?model=<id>`, a clean read-only page with print CSS (`Ctrl+P` → *Save as PDF*). Optionally includes the diagrams.
- **Markdown** — the same tables as Markdown.
- **UML-diagram (SVG)** — one card per object type with `name : Type [cardinality]`; root type highlighted.
- **XSD-diagram (SVG)** — the content model drawn as a tree (root element, one frame per complex type, arrows to referenced types; dashed frame = optional element).

The generators live in `lib/`: `eksport.ts` (shared metadata + grouping), `eksportDok.ts` (HTML/Markdown), `umlSvg.ts`, `xsdDiagramSvg.ts` and `svgTekst.ts` (text measurement — SVG is produced without a browser, so glyph widths are estimated).

Other modules:

- **admin/** — user administration and role assignment.
- **brevmaler/** — letter-template builder/editor; edits are logged from → to.
- **regler/** — editable validation-rule table with statuses.
- **struktur/** — object/field structure with cardinalities, generates UML.
- Root components: `AuthGate`, `SignIn`, `ChangePassword`, `LoggView`, `Logo`.

## Project structure

```
app/         Next.js App Router: layout.tsx, page.tsx, print/page.tsx, global CSS
components/   React components (admin, brevmaler, regler, shared, struktur, workspace/tabs)
lib/         Domain logic + Supabase integration, and __tests__/
data/         Static seed data for Høring og offentlig ettersyn V2
db/           schema.sql + patches/ (numbered SQL migrations)
public/       Static assets
```

The `data/hoeringOgOffentligEttersynV2.*.ts` files hold the model's static/seed data: `.xsd` (canonical XSD), `.kodelister` (code lists + attachments), `.brevmaler` (letter-template HTML), `.rules` (validation rules), `.struktur` (object/field structure) and `.eksempel` (example data).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Static export to `./out` |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | Run tests (Vitest) |

Tests live in `lib/__tests__/` (`diskusjon`, `diff`, `eksport`, `omtaler`, `regler`, `sistLest`, `umlMermaid`, `xsd`).
