# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run lint             # ESLint
npm run test:e2e         # Playwright E2E tests (headless)
npm run test:e2e:ui      # Playwright interactive UI mode
npm run test:e2e:headed  # Playwright with visible browser
```

Playwright auto-starts a dev server on port 3001. Tests run in Chromium only.

## Architecture

Anonymous form submission app built with Next.js 14 App Router. Users submit meetup preferences through a multi-step form without authentication.

**Stack:** Next.js 14, TypeScript (strict), Supabase (Postgres + RLS), Tailwind CSS, shadcn/ui, react-hook-form + Zod, Playwright.

### Key paths

- `src/app/api/submit-preferences/route.ts` — Main POST endpoint: validates with Zod, hashes IP (SHA-256), checks 24h duplicate window, inserts via anon Supabase client
- `src/hooks/use-multi-step-form.ts` — Orchestrates form state, step navigation, localStorage draft persistence (7-day TTL), debounced auto-save
- `src/lib/validations/form-schema.ts` — Zod schemas for all form sections
- `src/lib/supabase/client.ts` — Anonymous Supabase client (INSERT-only via RLS)
- `src/lib/supabase/server.ts` — Admin Supabase client (service role, server-only)
- `src/lib/submission-storage.ts` — Client-side duplicate tracking (localStorage + 30-day cookie)
- `src/constants/` — Static data arrays (topics, event formats)
- `supabase/migrations/` — SQL migrations with RLS policies

### Data flow

1. Client checks localStorage/cookie for prior submission
2. Multi-step form collects data across 5 sections with Zod validation (mode: onBlur)
3. POST to `/api/submit-preferences` → IP hash + rate limit check → Supabase INSERT
4. Returns 201 (success), 429 (duplicate within 24h), or 400 (validation error)

### Security model

Supabase RLS enforces access: anon role can only INSERT, never READ/UPDATE/DELETE. Service role (server-only) has full access for admin operations and GDPR deletion. IP hashes are cleaned up after 90 days via `cleanup_old_ip_hashes()` DB function.

## Conventions

- Use English for all code, comments, and documentation
- `"use client"` directive on components that use React hooks
- Files: kebab-case (`form-navigation.tsx`). Components: PascalCase (`FormNavigation`)
- Path alias: `@/*` maps to `./src/*`
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- Form sections receive `UseFormReturn<AnonymousFormData>` from parent FormProvider
- Database migrations in `supabase/migrations/`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## FairMind Integration

Journals in `fairmind/journals/` track agent work per task. The CI workflow (`.github/workflows/claude-code-review.yml`) auto-reviews PRs by comparing journals and code against FairMind task acceptance criteria via MCP, including security spot-checks.
