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

The schema lives in `db/schema.sql`, with ordered migrations in `db/patches/` (`01`–`08`). Run `schema.sql` first against your Supabase project, then apply the patches in numeric order.

Main tables:

- `datamodell` — one row per data model; `status` drives sidebar grouping.
- `dokument_data` — the shared editable content, one row per (model, type).
- `endring_logg` — audit trail (who/what/when), populated by a trigger.
- `dokument_data_historikk` — content snapshots for version restore.
- `bruker_rolle` — per-user role, set manually; governs proposal approval.
- `diskusjon` — comments and change proposals.
- `dokument` — attached documents (pdf/word/xml/text; binaries in the `dokumenter` storage bucket).
- `varsel` — per-user notifications (new proposals → DiBK, decisions → author, `@`-mentions), populated by triggers on `diskusjon`.
- `traad_lest` — when each user last read a discussion thread; drives the unread badges.

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

Tabs (`components/workspace/tabs/`): **Datamodell** (letter/document view), **Xsd** (canonical XSD), **Diagram** (mermaid UML), **Eksempel** (example data), **ValiderXml** (XML validation), **Diskusjon**, **Historikk** (version history + restore), **Dokumenter**.

Other modules:

- **admin/** — user administration and role assignment.
- **brevmaler/** — letter-template builder/editor; edits are logged from → to.
- **regler/** — editable validation-rule table with statuses.
- **struktur/** — object/field structure with cardinalities, generates UML.
- Root components: `AuthGate`, `SignIn`, `ChangePassword`, `LoggView`, `Logo`.

## Project structure

```
app/         Next.js App Router: layout.tsx, page.tsx, global CSS
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

Tests live in `lib/__tests__/` (`diskusjon`, `regler`, `umlMermaid`, `xsd`).
