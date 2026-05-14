# Work Package: Backend — Fix Build System

**Task ID:** TASK-2026-0511
**Date Created:** 2026-03-30
**Created By:** Atlas (Tech Lead)
**Skill(s) to Load:** `backend-nextjs`

## Task Overview

Add a single-command bootstrap script (`npm run setup`) to `package.json` and document the full onboarding flow in a new "Getting Started" section in `README.md`. This resolves the `single_command_setup (L2)` and `unit_tests_runnable (L1)` readiness criteria.

## Execution Plan

### Step 1 — Modify `package.json`

File: `/package.json`

In the `"scripts"` block, add the following entry after `"lint"`:

```json
"setup": "cp -n .env.local.example .env.local && npm install"
```

The resulting `"scripts"` block must contain:

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

The `-n` flag on `cp` is critical — it makes the command idempotent (will not overwrite an existing `.env.local`).

### Step 2 — Modify `README.md`

File: `/README.md`

Insert a new **"Getting Started"** section between the existing introductory paragraph (line 6) and the "## Features" heading (line 8).

The section must contain:

1. A one-liner showing `npm run setup` as the bootstrap command
2. A table of environment variables with required/optional status
3. An "Available Commands" subsection listing all npm scripts

The exact content to insert:

```markdown
## Getting Started

```bash
git clone <repo-url>
cd community-pulse
npm run setup
```

`npm run setup` copies `.env.local.example` to `.env.local` (without overwriting an existing file) and runs `npm install`. Fill in the credentials in `.env.local` before starting the dev server.

### Environment Variables

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
| `npm run test:e2e` | Run Playwright end-to-end tests (headless) |

```

**Placement:** Insert between line 6 (`Community events organizer app...`) and line 8 (`## Features`).

## Architectural Constraints

- Do NOT change any logic or existing scripts
- Do NOT add platform-specific logic (e.g. Windows `copy` vs Unix `cp`) — the existing codebase uses Unix tooling
- Keep all existing README sections intact — only INSERT a new section, do not rewrite or remove existing content
- The "Getting Started" section must appear before "## Features" to be visible to new developers without scrolling

## Dependencies

- Other agents: None
- External systems: None

## Acceptance Criteria

1. `package.json` contains `"setup": "cp -n .env.local.example .env.local && npm install"` in the `scripts` block
2. Running `npm run setup` when no `.env.local` exists: creates `.env.local` (copy of example) and installs deps
3. Running `npm run setup` when `.env.local` already exists: installs deps only, does not overwrite `.env.local`
4. `README.md` contains a "Getting Started" section positioned before "## Features"
5. The "Getting Started" section includes `npm run setup` as the documented bootstrap command
6. The "Getting Started" section includes the 8-variable env table with required/optional column
7. The "Getting Started" section includes an Available Commands table listing dev, build, lint, test:e2e
8. `npm run build` and `npm run lint` complete without errors after the changes

## Validation Requirements

After implementation:
- Run `npm run lint` — must pass with no errors
- Run `npm run build` — must complete successfully
- Verify `package.json` is valid JSON: `node -e "require('./package.json')"` must succeed
- Visually verify README.md renders correctly (check markdown syntax is valid)

## Expected Deliverables

1. Modified `package.json` with `setup` script
2. Modified `README.md` with "Getting Started" section

## Journal Requirements

Maintain journal at:
`/Users/alexiocassani/Projects/.conductor-worktrees/24d8b945-22bf-4a90-8a2c-177ecadd161e/.fairmind/meetup-app/mvp/journals/TASK-2026-0511_echo_journal.md`

Update after each significant action. Create a completion flag at:
`/Users/alexiocassani/Projects/.conductor-worktrees/24d8b945-22bf-4a90-8a2c-177ecadd161e/.fairmind/meetup-app/mvp/work_packages/backend/TASK-2026-0511_backend_complete.flag`
when all changes are verified and done.
