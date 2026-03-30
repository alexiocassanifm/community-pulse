# Work Package: Backend/Config — Fix Build System

**Task ID**: TASK-2026-0511
**Date Created**: 2026-03-30
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `backend-nextjs`

## Task Overview

The repository currently fails the `single_command_setup (L2)` readiness criterion. A developer cloning the repo must manually determine the correct sequence of steps: copy the env template, fill in credentials, and install dependencies. There is no documented single bootstrap command and no `setup` npm script in `package.json`.

This task adds that script and documents the full onboarding flow in `README.md`, also resolving the related `unit_tests_runnable (L1)` criterion by documenting the existing `test:e2e` script.

## Execution Plan

### Step 1 — Add `setup` script to `package.json`

File: `/Users/alexiocassani/Projects/.conductor-worktrees/03ae596a-061e-4778-813c-0618dcd88ce0/package.json`

In the `scripts` block, add the following entry after `"lint"`:

```json
"setup": "cp -n .env.local.example .env.local && npm install"
```

The `-n` flag ensures idempotency: it will NOT overwrite an existing `.env.local` on repeated runs.

The resulting `scripts` block must be:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint src/",
  "setup": "cp -n .env.local.example .env.local && npm install",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:headed": "playwright test --headed"
}
```

### Step 2 — Add "Getting Started" section to `README.md`

File: `/Users/alexiocassani/Projects/.conductor-worktrees/03ae596a-061e-4778-813c-0618dcd88ce0/README.md`

Insert a new **"Getting Started"** section immediately after the opening badges/description block (after line 6 — the community events description line), before the existing `## Features` section.

The section must contain:

1. A single bootstrap command:
   ```bash
   npm run setup
   ```

2. An environment variables table with required/optional status:

   | Variable | Required | Description |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Required | Supabase service role key (server-side only) |
   | `RESEND_API_KEY` | Optional | Email delivery — skipped if not set |
   | `EMAIL_FROM` | Optional | Sender address for emails |
   | `ADMIN_NOTIFICATION_EMAIL` | Optional | Recipient for admin alerts |
   | `NEXT_PUBLIC_APP_URL` | Required | App base URL (use `http://localhost:3000` locally) |
   | `NEXT_PUBLIC_COMMUNITY_NAME` | Optional | Branding — defaults to generic values |

3. An "Available Commands" subsection listing:
   - `npm run dev` — start dev server at http://localhost:3000
   - `npm run build` — production build
   - `npm run lint` — run ESLint on `src/`
   - `npm run test:e2e` — run Playwright end-to-end tests

The exact markdown to insert (between the description line and `## Features`):

```markdown
## Getting Started

Clone the repository and run the single setup command:

```bash
git clone <repo-url>
cd community-pulse
npm run setup
```

This copies `.env.local.example` to `.env.local` (without overwriting an existing file) and installs all dependencies.

Then open `.env.local` and fill in the required values:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Required | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Required | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Optional | Email delivery — skipped if not set |
| `EMAIL_FROM` | Optional | Sender address for emails |
| `ADMIN_NOTIFICATION_EMAIL` | Optional | Recipient for admin alerts |
| `NEXT_PUBLIC_APP_URL` | Required | App base URL (use `http://localhost:3000` locally) |
| `NEXT_PUBLIC_COMMUNITY_NAME` | Optional | Branding — defaults to generic values |

### Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint on `src/` |
| `npm run test:e2e` | Run Playwright end-to-end tests |
```

## Architectural Constraints

- Do NOT remove or modify any existing content in `README.md` other than inserting the new section.
- Do NOT modify any application source code — this task is limited to `package.json` and `README.md`.
- The `setup` script must use `cp -n` (not `cp`) to guarantee idempotency.
- The new README section must be named exactly `## Getting Started`.

## Dependencies

- Other agents: none
- External systems: none

## Acceptance Criteria

- [ ] `package.json` contains `"setup": "cp -n .env.local.example .env.local && npm install"` in the `scripts` block
- [ ] Running `npm run setup` on a fresh clone creates `.env.local` and installs all dependencies
- [ ] Re-running `npm run setup` on an existing setup does NOT overwrite `.env.local`
- [ ] `README.md` has a `## Getting Started` section positioned before `## Features`
- [ ] The Getting Started section documents `npm run setup` as the bootstrap command
- [ ] The Getting Started section includes the 8-row env variable table with Required/Optional status
- [ ] The Getting Started section includes the Available Commands subsection with `npm run dev`, `npm run build`, `npm run lint`, `npm run test:e2e`
- [ ] `npm run lint` passes with no errors after the change

## Validation Requirements

- Verify `package.json` is valid JSON after modification (parse check)
- Verify `npm run setup` creates `.env.local` when it does not exist
- Verify `npm run setup` does NOT overwrite `.env.local` when it already exists
- Verify `npm run lint` exits 0

## Expected Deliverables

1. Modified `package.json` with the `setup` script added
2. Modified `README.md` with the `## Getting Started` section inserted before `## Features`

## Journal Requirements

Maintain journal at:
`/Users/alexiocassani/Projects/.conductor-worktrees/03ae596a-061e-4778-813c-0618dcd88ce0/.fairmind/meetup-app/mvp/journals/TASK-2026-0511_echo_journal.md`

Update after each significant action. Mark completion by creating:
`/Users/alexiocassani/Projects/.conductor-worktrees/03ae596a-061e-4778-813c-0618dcd88ce0/.fairmind/meetup-app/mvp/work_packages/backend/TASK-2026-0511_backend_complete.flag`
