# Work Package: Backend - Fix Build System — Add setup script and Getting Started README section

**Task ID**: TASK-2026-0511
**Date Created**: 2026-04-01
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `backend-nextjs`

## Task Overview

The repository currently fails the `single_command_setup (L2)` readiness criterion. A developer or AI agent cloning the repo must manually determine the correct steps: copy the env template, fill in credentials, and install dependencies. There is no documented single bootstrap command and no `setup` npm script in `package.json`.

This task adds that script and documents the full onboarding flow in `README.md`, also resolving the related `unit_tests_runnable (L1)` criterion by documenting the existing `test:e2e` script.

## Execution Plan

### Step 1 — Add `setup` script to `package.json`

File: `package.json`

In the `scripts` block, add the following entry after `"lint"`:

```json
"setup": "cp -n .env.local.example .env.local && npm install"
```

The `-n` flag on `cp` ensures idempotency: re-running `npm run setup` on an existing setup does NOT overwrite `.env.local`.

### Step 2 — Add "Getting Started" section to `README.md`

File: `README.md`

Insert a new **"Getting Started"** section immediately after the `## Features` section header block (before `## Built With`). The section must include:

1. A single bootstrap command: `npm run setup`
2. A post-setup instruction: fill in credentials in `.env.local`, then run `npm run dev`
3. An environment variables table covering all 8 variables from `.env.local.example`
4. An "Available Commands" subsection listing the 4 main npm scripts

Content to insert:

```markdown
## Getting Started

```bash
npm run setup
```

This single command copies `.env.local.example` to `.env.local` (without overwriting an existing file) and installs all dependencies. It is idempotent — safe to re-run.

After setup, fill in your credentials in `.env.local`, then start the dev server:

```bash
npm run dev
```

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
| `npm run test:e2e` | Run Playwright end-to-end tests |
```

## Files to Modify

- `package.json` — add `setup` script to the `scripts` block
- `README.md` — add Getting Started section between Features and Built With

## Architectural Constraints

- The `-n` flag on `cp` is POSIX-standard and works on macOS and Linux but NOT on Windows native cmd. This is acceptable for this project (Node.js/Mac-first dev environment).
- Do not remove or modify any existing scripts in `package.json`.
- Do not remove or reorder any existing sections in `README.md`.
- The Getting Started section must appear high in the document — before "Built With" — so first-time readers encounter setup instructions immediately.

## Dependencies

- No other agents are involved. This is a pure documentation and configuration task.

## Acceptance Criteria

- [ ] `package.json` contains `"setup": "cp -n .env.local.example .env.local && npm install"`
- [ ] Running `npm run setup` on a fresh clone creates `.env.local` and installs all dependencies
- [ ] Re-running `npm run setup` on an existing setup does NOT overwrite `.env.local`
- [ ] `README.md` has a "Getting Started" section with `npm run setup` as the documented bootstrap command
- [ ] README includes the env variable table (8 variables) and all available npm scripts
- [ ] Readiness criterion `single_command_setup (L2)` passes
- [ ] Readiness criterion `unit_tests_runnable (L1)` passes

## Validation Requirements

- Verify `package.json` parses as valid JSON after modification
- Verify `npm run setup` can be executed without error
- Verify the `-n` flag prevents overwriting an existing `.env.local`

## Expected Deliverables

- Modified `package.json` with `setup` script added
- Modified `README.md` with Getting Started section inserted between Features and Built With

## Journal Requirements

Maintain journal at: .fairmind/meetup-app/mvp/journals/TASK-2026-0511_echo_journal.md
Update after each significant action or decision.
