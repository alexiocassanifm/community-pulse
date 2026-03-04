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

Community events app built with Next.js 14 App Router. Three main areas: anonymous preference form, speaker submission portal, and admin analytics dashboard.

**Stack:** Next.js 14, TypeScript (strict), Supabase (Postgres + RLS + Auth), Tailwind CSS, shadcn/ui, react-hook-form + Zod, Recharts, Resend (email), Playwright.

### Key paths

**Public form:**
- `src/app/form/page.tsx` — Multi-step anonymous form
- `src/hooks/use-multi-step-form.ts` — Form state, step navigation, localStorage draft persistence (7-day TTL), debounced auto-save
- `src/components/form/` — Form sections and container
- `src/lib/validations/form-schema.ts` — Zod schemas for form sections
- `src/lib/submission-storage.ts` — Client-side duplicate tracking (localStorage + 30-day cookie)

**Speaker portal:**
- `src/app/speaker/submit/page.tsx` — Speaker submission form
- `src/app/speaker/portal/page.tsx` — Speaker status view (access via token)
- `src/components/speakers/` — Speaker portal components
- `src/lib/validations/speaker-schema.ts` — Speaker form validation

**Admin dashboard:**
- `src/app/dashboard/` — Dashboard pages (auth-protected)
- `src/components/dashboard/` — Charts, metrics, filters (20+ components)
- `src/components/auth/` — Login components

**API routes:**
- `src/app/api/submit-preferences/route.ts` — Anonymous form POST: Zod validation, IP hash (SHA-256), 24h duplicate window, anon Supabase INSERT
- `src/app/api/speakers/submit/route.ts` — Speaker submission POST
- `src/app/api/speakers/portal/route.ts` — Speaker portal GET (token auth)
- `src/app/api/speakers/portal/reply/route.ts` — Speaker reply POST
- `src/app/api/speakers/portal/withdraw/route.ts` — Speaker withdrawal POST
- `src/app/api/speakers/admin/list/route.ts` — List speakers (organizer auth)
- `src/app/api/speakers/admin/[id]/route.ts` — Speaker detail (organizer auth)
- `src/app/api/speakers/admin/[id]/status/route.ts` — Update speaker status
- `src/app/api/speakers/admin/[id]/message/route.ts` — Send message to speaker
- `src/app/api/analytics/*` — Dashboard data endpoints (overview, availability, formats, topics, demographics, trends, filter-options)
- `src/app/api/auth/logout/route.ts` — Logout
- `src/app/api/health/route.ts` — Health check

**Configuration:**
- `src/config/site.ts` — Branding constants (community name, creator info) backed by `NEXT_PUBLIC_*` env vars

**Infrastructure:**
- `src/lib/supabase/client.ts` — Anonymous Supabase client (INSERT-only via RLS)
- `src/lib/supabase/server.ts` — Admin Supabase client (service role, server-only)
- `src/lib/supabase/auth-server.ts` — Server-side auth helpers
- `src/lib/supabase/middleware.ts` — Supabase request/response middleware
- `src/lib/auth.ts` — Auth utilities
- `src/lib/actions/auth.ts` — Server actions for auth
- `src/lib/email/resend.ts` — Resend client setup
- `src/lib/email/send-speaker-email.ts` — Email sending utility
- `src/lib/email/templates/` — React Email templates (confirmation, status change, new message)
- `src/constants/` — Static data arrays (topics, event formats, speakers)
- `supabase/migrations/` — SQL migrations with RLS policies

### Data flows

**Anonymous form:** Client checks localStorage/cookie for prior submission → multi-step form with Zod validation (mode: onBlur) → POST `/api/submit-preferences` → IP hash + rate limit check → Supabase INSERT → 201/429/400

**Speaker portal:** Speaker submits via `/speaker/submit` → POST `/api/speakers/submit` → Supabase INSERT + confirmation email via Resend → speaker accesses portal via token URL → can reply/withdraw → admin manages via dashboard

**Admin dashboard:** Organizer logs in via Supabase Auth → dashboard loads analytics from `/api/analytics/*` endpoints → can manage speakers, view trends, filter data

### Security model

- **RLS:** anon can INSERT submissions + speaker submissions; authenticated organizers can SELECT/UPDATE; service role has full access
- **Auth:** Supabase Auth for organizer login. Organizers table links to `auth.users`. API routes check organizer status via `auth.uid()` + organizers table lookup
- **Speaker access:** Token-based (UUID access_token per submission). Service role validates tokens server-side
- **IP privacy:** SHA-256 hashed IPs, cleaned up after 90 days via `cleanup_old_ip_hashes()` DB function
- **Email:** Resend for transactional emails (speaker notifications). Optional — app works without it

## Conventions

- Use English for all code, comments, and documentation
- `"use client"` directive on components that use React hooks
- Files: kebab-case (`form-navigation.tsx`). Components: PascalCase (`FormNavigation`)
- Path alias: `@/*` maps to `./src/*`
- Use `cn()` from `src/lib/utils.ts` for conditional Tailwind classes
- Form sections receive `UseFormReturn<AnonymousFormData>` from parent FormProvider
- Database migrations in `supabase/migrations/`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`, `NEXT_PUBLIC_APP_URL`
- Branding variables: `NEXT_PUBLIC_COMMUNITY_NAME`, `NEXT_PUBLIC_CREATOR_NAME`, `NEXT_PUBLIC_CREATOR_URL`, `NEXT_PUBLIC_CREATOR_ROLE`
