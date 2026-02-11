# Meetup-App Repository Analysis

**Project ID**: 6981fb9c4b2c601246796a08
**Repository**: meetup-app (698267b83ffffd4dafbae5ce)
**GitHub URL**: https://github.com/alexiocassanifm/meetup-app
**Analysis Date**: 2026-02-08

---

## Executive Summary

The meetup-app is an **anonymous form submission application** built with Next.js 14 App Router, TypeScript, Supabase, and Tailwind CSS. Users submit meetup preferences through a multi-step form without authentication. The application implements robust duplicate prevention, client-side persistence, and strict security through Supabase RLS policies.

**Key Characteristics:**
- **Tech Stack**: Next.js 14, TypeScript (strict), Supabase (Postgres + RLS), Tailwind CSS, shadcn/ui, react-hook-form + Zod, Playwright
- **Security Model**: Anonymous INSERT-only via RLS, server-side admin access for GDPR compliance
- **Form Management**: Multi-step form with auto-save (7-day TTL), localStorage persistence, 24h duplicate prevention (IP hash + device ID)
- **Data Retention**: IP hashes expire after 90 days via `cleanup_old_ip_hashes()` DB function

---

## 1. Directory Structure

```
meetup-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   │   └── route.ts           # Health check endpoint
│   │   │   └── submit-preferences/
│   │   │       └── route.ts           # Main submission API (POST)
│   │   ├── form/
│   │   │   └── page.tsx               # Multi-step form page
│   │   ├── layout.tsx                 # Root layout with Navigation + Toaster
│   │   ├── page.tsx                   # Landing page with hero + sections
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (16 components)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── accordion.tsx
│   │   │   └── sheet.tsx
│   │   ├── form/
│   │   │   ├── anonymous-form-container.tsx
│   │   │   ├── already-submitted-message.tsx
│   │   │   ├── step-indicator.tsx
│   │   │   ├── form-navigation.tsx
│   │   │   ├── privacy-notice.tsx
│   │   │   ├── submission-success-modal.tsx
│   │   │   └── sections/
│   │   │       ├── professional-background.tsx
│   │   │       ├── availability.tsx
│   │   │       ├── event-formats-placeholder.tsx
│   │   │       ├── topics-placeholder.tsx
│   │   │       └── gdpr-consent.tsx
│   │   ├── hero/
│   │   │   └── HeroSection.tsx
│   │   ├── landing/
│   │   │   ├── CTASection.tsx
│   │   │   ├── FAQSection.tsx
│   │   │   ├── FeaturesGridSection.tsx
│   │   │   ├── PrivacyFirstSection.tsx
│   │   │   └── WhatWeCollectSection.tsx
│   │   ├── layout/
│   │   │   └── SectionContainer.tsx
│   │   ├── navigation/
│   │   │   ├── MobileMenu.tsx
│   │   │   └── Navigation.tsx
│   │   ├── sections/
│   │   │   ├── HowItWorksSection.tsx
│   │   │   └── WhyShareSection.tsx
│   │   └── error-boundary.tsx
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   ├── use-anonymous-form.ts        # react-hook-form + Zod integration
│   │   └── use-multi-step-form.ts       # Multi-step orchestration + auto-save
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Anonymous Supabase client (INSERT-only)
│   │   │   └── server.ts                # Admin client (service role, server-only)
│   │   ├── validations/
│   │   │   └── form-schema.ts           # Zod schemas for all form sections
│   │   ├── form-persistence.ts          # localStorage draft management (7-day TTL)
│   │   ├── submission-storage.ts        # Duplicate tracking (localStorage + cookie)
│   │   └── utils.ts                     # cn() utility for Tailwind
│   ├── constants/
│   │   ├── topics.ts                    # Predefined topics (5 categories, 21 topics)
│   │   └── event-formats.ts             # Event format options (6 formats, 4 hybrid options)
│   └── types/
│       ├── database.types.ts            # Supabase Database TypeScript types
│       └── form.ts                      # Form section definitions + StepState types
├── supabase/
│   └── migrations/
│       ├── 001_create_anonymous_submissions.sql  # Table + RLS policies
│       └── 002_add_duplicate_prevention.sql      # IP hash + cleanup function
├── tests/
│   └── duplicate-submission.spec.ts     # Playwright E2E tests
├── fairmind/                            # FairMind integration directory
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
└── CLAUDE.md                            # Project conventions for Claude Code
```

---

## 2. Core File Contents

### 2.1 Supabase Clients

#### `/src/lib/supabase/client.ts` (Anonymous Client)
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Purpose**: Client-side Supabase instance using anonymous key. Can only INSERT (enforced by RLS).

#### `/src/lib/supabase/server.ts` (Admin Client)
```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey
);
```

**Purpose**: Server-side admin client with full access (service role). Used for duplicate checks and GDPR operations.

---

### 2.2 Main API Endpoint

#### `/src/app/api/submit-preferences/route.ts`
**POST endpoint** that handles form submissions with:
1. **Content-Type validation** (must be `application/json`)
2. **IP extraction** from `x-forwarded-for` or `x-real-ip` headers
3. **IP hashing** with SHA-256 for privacy
4. **Zod validation** against `anonymousFormSchema`
5. **Duplicate detection**: Query last 24h using `supabaseAdmin` (anon role can't SELECT)
6. **Completion percentage calculation** (5 sections)
7. **INSERT** using anonymous `supabase` client
8. **Error handling**:
   - 415: Invalid Content-Type
   - 400: Validation failure
   - 429: Duplicate within 24h
   - 409: Database constraint violation (code 23505)
   - 500: Generic server error

**Key Function**:
```typescript
function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}
```

**Response**:
- **201**: Success with `completion_percentage`
- **429**: Duplicate submission detected
- **400**: Validation errors with field details

---

### 2.3 Form Schema & Validation

#### `/src/lib/validations/form-schema.ts`
Defines **5 Zod schemas** for form sections:

1. **professionalBackgroundSchema**
   - `professional_role`: string (max 100) optional
   - `experience_level`: enum (junior|mid|senior|lead|executive) optional
   - `industry`: string (max 100) optional
   - `skills`: array of strings optional

2. **availabilitySchema**
   - `preferred_days`: array of strings optional
   - `preferred_times`: array of enum (morning|afternoon|evening|flexible) optional
   - `frequency`: enum (weekly|biweekly|monthly|quarterly) optional

3. **eventFormatsSchema**
   - 6 boolean flags: `format_presentations`, `format_workshops`, `format_discussions`, `format_networking`, `format_hackathons`, `format_mentoring`
   - `format_hybrid`: enum (in_person|virtual|hybrid|no_preference) optional
   - `format_custom`: string (max 500) optional

4. **topicsSchema**
   - `predefined_topics`: array of strings optional
   - `custom_topics`: string (max 300) optional

5. **gdprSchema**
   - `data_retention_acknowledged`: boolean (must be `true` - refined with error message)

**Combined Schema**:
```typescript
export const anonymousFormSchema = z.object({
  professional_background: professionalBackgroundSchema.optional(),
  availability: availabilitySchema.optional(),
  event_formats: eventFormatsSchema.optional(),
  topics: topicsSchema.optional(),
  gdpr: gdprSchema, // REQUIRED
});
```

---

### 2.4 Client-Side Form Management

#### `/src/hooks/use-multi-step-form.ts`
**Multi-step orchestration hook** with:
- **Step navigation**: `goToNext()`, `goToPrevious()`, `goToStep(index)`
- **Auto-save**: Debounced (1s) localStorage persistence via `form.watch()`
- **Step state tracking**: 5 statuses (completed|active|visited|available|locked)
- **Progress calculation**: Percentage based on completed sections
- **Duplicate check**: Client-side check via `checkSubmissionStatus()` before submission
- **Submission**: POST to `/api/submit-preferences` with `device_id`
- **State cleanup**: Clears localStorage + resets form on success
- **Already-submitted handling**: Sets `hasAlreadySubmitted` flag on 429 response

**Key Storage Keys**:
- `anonymous-form-draft`: Form data with timestamp (7-day TTL)
- `anonymous-form-steps`: Step states array

#### `/src/hooks/use-anonymous-form.ts`
**react-hook-form wrapper** with:
- Zod resolver for validation
- Default values for all 5 sections
- Validation mode: `onBlur`

---

### 2.5 Persistence & Duplicate Prevention

#### `/src/lib/form-persistence.ts`
**localStorage draft management**:
- `saveFormDraft(data)`: Stores form data with timestamp
- `loadFormDraft()`: Retrieves draft if < 7 days old, auto-clears expired
- `clearFormDraft()`: Removes draft
- `hasValidDraft()`: Boolean check
- `getDraftAge()`: Days since last save

**Storage Format**:
```typescript
interface FormDraft {
  data: Partial<AnonymousFormData>;
  timestamp: number;
}
```

#### `/src/lib/submission-storage.ts`
**Client-side duplicate tracking**:
- `generateDeviceId()`: Creates/retrieves device ID (`timestamp-random9chars`)
- `checkSubmissionStatus()`: Checks localStorage + cookie fallback
- `markAsSubmitted(deviceId)`: Writes to localStorage + cookie (30-day expiry, SameSite=Strict)
- `clearSubmissionStatus()`: Removes all tracking data

**Storage Keys**:
- `meetup_form_submitted`: Boolean flag
- `meetup_device_id`: Anonymous device identifier
- `meetup_submission_time`: ISO timestamp
- Cookie: `meetup_form_submitted` (30-day max-age)

---

### 2.6 Database Schema & Migrations

#### `/supabase/migrations/001_create_anonymous_submissions.sql`
**Table Structure**:
```sql
CREATE TABLE public.anonymous_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Professional Background
  professional_role TEXT,
  experience_level TEXT CHECK (experience_level IN ('junior', 'mid', 'senior', 'lead', 'executive', NULL)),
  industry TEXT,
  skills TEXT[],

  -- Availability
  preferred_days TEXT[],
  preferred_times TEXT[] CHECK (preferred_times <@ ARRAY['morning', 'afternoon', 'evening', 'flexible']::TEXT[]),
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', NULL)),

  -- Event Formats
  format_presentations BOOLEAN DEFAULT false,
  format_workshops BOOLEAN DEFAULT false,
  format_discussions BOOLEAN DEFAULT false,
  format_networking BOOLEAN DEFAULT false,
  format_hackathons BOOLEAN DEFAULT false,
  format_mentoring BOOLEAN DEFAULT false,
  format_hybrid TEXT CHECK (format_hybrid IN ('in_person', 'virtual', 'hybrid', 'no_preference', NULL)),
  format_custom TEXT,

  -- Topics
  predefined_topics TEXT[],
  custom_topics TEXT,

  -- Metadata
  submission_timestamp TIMESTAMPTZ DEFAULT NOW(),
  form_version TEXT DEFAULT '1.0',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  anonymous_reference_id TEXT UNIQUE,

  -- GDPR
  data_retention_acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- `idx_submissions_timestamp` on `submission_timestamp DESC`
- `idx_submissions_experience` on `experience_level`
- `idx_submissions_industry` on `industry`
- `idx_submissions_topics` GIN index on `predefined_topics`

**RLS Policies**:
- `allow_anonymous_insert`: INSERT allowed for `anon` role
- `prevent_anonymous_read`: SELECT blocked for `anon` role
- `prevent_anonymous_update`: UPDATE blocked for `anon` role
- `prevent_anonymous_delete`: DELETE blocked for `anon` role
- `service_role_read_all`: Full SELECT for `service_role`
- `service_role_delete`: DELETE allowed for `service_role` (GDPR compliance)

#### `/supabase/migrations/002_add_duplicate_prevention.sql`
**Added Columns**:
- `ip_hash TEXT NOT NULL`: SHA-256 hash of submitter IP
- `device_id TEXT`: Client-generated anonymous identifier
- `submitted_at TIMESTAMPTZ NOT NULL`: Precise submission timestamp

**Indexes**:
- `idx_ip_hash_submitted_at`: Composite index for rate limiting queries
- `idx_device_id`: Partial index (non-null only)
- `idx_submitted_at_desc`: Descending index for cleanup/reporting

**Cleanup Function**:
```sql
CREATE FUNCTION cleanup_old_ip_hashes(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
  UPDATE public.anonymous_submissions
  SET ip_hash = 'expired-' || id::TEXT, device_id = NULL
  WHERE submitted_at < NOW() - (retention_days || ' days')::INTERVAL
    AND ip_hash NOT LIKE 'expired-%'
    AND ip_hash NOT LIKE 'legacy-%';
  RETURN ROW_COUNT;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Purpose**: Anonymizes IP hashes after 90 days for GDPR compliance.

---

### 2.7 Constants & Static Data

#### `/src/constants/topics.ts`
**21 Predefined Topics** across **5 Categories**:

| Category | Topics |
|----------|--------|
| Claude Products | Claude Code, Claude Desktop, Claude API, Claude Code SDK, Cowork |
| Agentic AI | Building Agents, Multi-Agent Swarms, Subagents & Delegation, Agentic Workflow Design, Autonomous Task Execution |
| Skills & MCP | Creating Skills, MCP Servers & Tools, Integrations & Connectors |
| Development Practices | Coding with Claude, Automation & Pipelines, Prompt Engineering |
| Session Formats | Hands-on Labs, Live Building Sessions, Demo Sessions |

#### `/src/constants/event-formats.ts`
**6 Event Formats**:
1. Presentations & Talks (30-60 min)
2. Hands-on Workshops (practical exercises)
3. Panel Discussions & Roundtables (Q&A)
4. Networking Sessions (structured/informal)
5. Hackathons & Challenges (collaborative problem-solving)
6. Mentoring & 1-on-1 Sessions (small group guidance)

**4 Hybrid Options**:
- `in_person`: In-Person Only
- `virtual`: Virtual Only
- `hybrid`: Hybrid (Flexible)
- `no_preference`: No Preference

---

### 2.8 Type Definitions

#### `/src/types/database.types.ts`
**Supabase-generated types** with:
- `Database.public.Tables.anonymous_submissions.Row`: Full row type
- `Database.public.Tables.anonymous_submissions.Insert`: Insert type (optional fields)
- `Database.public.Tables.anonymous_submissions.Update`: Update type
- `Database.public.Functions.cleanup_old_ip_hashes`: Function signature

**Type Aliases**:
- `ExperienceLevel`: 'junior' | 'mid' | 'senior' | 'lead' | 'executive'
- `PreferredTime`: 'morning' | 'afternoon' | 'evening' | 'flexible'
- `Frequency`: 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
- `HybridFormat`: 'in_person' | 'virtual' | 'hybrid' | 'no_preference'

#### `/src/types/form.ts`
**Form-specific types**:
- `FormSection`: Section metadata (id, title, description, icon)
- `StepStatus`: 'completed' | 'active' | 'visited' | 'available' | 'locked'
- `StepState`: Step tracking (sectionId, status, completionPercentage)
- `FORM_SECTIONS`: Array of 5 FormSection objects

---

### 2.9 Configuration Files

#### `/package.json`
**Key Dependencies**:
- **Next.js**: ^14.2.35
- **React**: ^18.3.1
- **Supabase**: @supabase/supabase-js ^2.94.0
- **Forms**: react-hook-form ^7.71.1, @hookform/resolvers ^5.2.2
- **Validation**: zod ^4.3.6
- **UI**: Radix UI components, lucide-react ^0.563.0
- **Styling**: tailwindcss ^3.4.19, tailwind-merge ^3.4.0, class-variance-authority ^0.7.1
- **Testing**: @playwright/test ^1.58.1

**Scripts**:
- `npm run dev`: Start dev server (port 3000)
- `npm run build`: Production build
- `npm run lint`: ESLint
- `npm run test:e2e`: Playwright headless tests (auto-starts dev server on port 3001)
- `npm run test:e2e:ui`: Playwright interactive UI
- `npm run test:e2e:headed`: Playwright with visible browser

#### `/next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```
**Note**: Empty config (defaults used).

#### `/tailwind.config.ts`
**Key Config**:
- Dark mode: `class` strategy
- Custom color system using CSS variables (HSL)
- Container centering with 2rem padding
- Custom animations: `accordion-down`, `accordion-up`
- Plugin: `tailwindcss-animate`

---

## 3. Architecture & Data Flow

### 3.1 User Journey

```
1. User visits landing page (/)
   ↓
2. Clicks "Share Your Preferences" → Navigates to /form
   ↓
3. Client checks localStorage + cookie for prior submission
   ↓ (if not submitted)
4. Loads draft from localStorage (if < 7 days old)
   ↓
5. User fills multi-step form (5 sections):
   - Professional Background
   - Availability
   - Event Formats
   - Topics
   - GDPR Consent (required)
   ↓
6. Auto-save to localStorage every 1s (debounced)
   ↓
7. User clicks "Submit"
   ↓
8. Client-side duplicate check (localStorage + cookie)
   ↓
9. POST to /api/submit-preferences with device_id
   ↓
10. API validates → hashes IP → checks 24h duplicate (DB query)
    ↓
11. INSERT into Supabase (anon client)
    ↓
12. Success: Clear localStorage + cookie → Show success modal
    Error: Display toast with error message
```

### 3.2 Security Model

**Supabase RLS Policies**:
- **Anonymous users** (`anon` role):
  - ✅ INSERT into `anonymous_submissions`
  - ❌ SELECT (no read access)
  - ❌ UPDATE
  - ❌ DELETE

- **Service role** (server-side only):
  - ✅ Full access (SELECT, INSERT, UPDATE, DELETE)
  - Used for: Duplicate detection, GDPR deletion, admin queries

**IP Privacy**:
1. IP extracted from headers (`x-forwarded-for`, `x-real-ip`)
2. Hashed with SHA-256 before storage
3. Expired after 90 days via `cleanup_old_ip_hashes()`
4. Never returned to client

**Device ID**:
- Client-generated (format: `timestamp-random9chars`)
- Stored in localStorage
- Sent with submission for duplicate tracking
- Nullable in database (privacy-friendly)

### 3.3 Duplicate Prevention Strategy

**3-Tier Protection**:

1. **Client-Side (Immediate)**:
   - localStorage flag: `meetup_form_submitted`
   - Cookie fallback (30-day expiry)
   - Prevents accidental re-submissions

2. **API-Side (24h Window)**:
   - Query last 24h submissions by `ip_hash`
   - Uses `supabaseAdmin` (anon can't SELECT)
   - Returns 429 status if found

3. **Database-Side (90-Day Retention)**:
   - Composite index on `(ip_hash, submitted_at)`
   - Auto-cleanup function for expired hashes
   - `device_id` for multi-device tracking

### 3.4 Form Persistence

**Auto-Save Mechanism**:
```typescript
// Debounced save (1s delay)
useEffect(() => {
  const subscription = form.watch((data) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      saveFormDraft(data);
    }, 1000);
  });
  return () => subscription.unsubscribe();
}, [form]);
```

**Storage Structure**:
```typescript
{
  "anonymous-form-draft": {
    "data": { /* form data */ },
    "timestamp": 1707398400000
  },
  "anonymous-form-steps": [
    { "sectionId": "professional_background", "status": "completed", "completionPercentage": 100 },
    { "sectionId": "availability", "status": "active", "completionPercentage": 60 },
    // ...
  ]
}
```

**TTL Policy**:
- Form draft: **7 days** (cleared if older)
- Submission tracking: **30 days** (cookie max-age)
- IP hashes: **90 days** (DB-level cleanup)

---

## 4. Key Components

### 4.1 shadcn/ui Components (16 total)

Available components in `/src/components/ui/`:
- **Form Controls**: button, input, label, checkbox, radio-group, select, textarea
- **Layout**: card, dialog, sheet, accordion
- **Feedback**: alert, toast, toaster, progress
- **Form Integration**: form (react-hook-form wrapper)

### 4.2 Form Components

**Container**: `/src/components/form/anonymous-form-container.tsx`
- Main form orchestrator
- Integrates `useMultiStepForm()` hook
- Renders section components based on `currentStep`
- Handles submission success modal

**Navigation**: `/src/components/form/form-navigation.tsx`
- Previous/Next buttons
- Submit button (final step)
- Disabled states based on `canNavigateToStep()`

**Progress**: `/src/components/form/step-indicator.tsx`
- Visual step progress (1-5)
- Clickable step circles (if not locked)
- Status colors (completed: green, active: blue, visited: yellow, available: gray, locked: gray)

**Sections**: `/src/components/form/sections/`
- `professional-background.tsx`
- `availability.tsx`
- `event-formats-placeholder.tsx`
- `topics-placeholder.tsx`
- `gdpr-consent.tsx`

Each section receives `UseFormReturn<AnonymousFormData>` from parent `FormProvider`.

### 4.3 Landing Page Components

**Landing Page** (`/src/app/page.tsx`) includes:
1. `HeroSection`: Main hero with CTA
2. `WhyShareSection`: Benefits of sharing preferences
3. `HowItWorksSection`: 3-step process
4. `WhatWeCollectSection`: Data transparency
5. `PrivacyFirstSection`: Privacy guarantees
6. `FeaturesGridSection`: Feature highlights
7. `FAQSection`: Accordion FAQ
8. `CTASection`: Final call-to-action

**Layout**: `/src/app/layout.tsx`
- Global Navigation component
- Footer with copyright
- Toaster for notifications
- Metadata: "Claude Code Milan"

---

## 5. Environment Variables

**Required Variables** (not found in repository - must be configured):
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anonymous (public) key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-side only)

**Note**: No `.env.example` file found. Variables are documented in code comments.

---

## 6. Testing

### 6.1 Playwright E2E Tests

**Test File**: `/tests/duplicate-submission.spec.ts` (exists in file listing)

**Playwright Config**: Auto-starts dev server on port 3001 before tests.

**Test Commands**:
- `npm run test:e2e`: Headless Chromium
- `npm run test:e2e:ui`: Interactive UI mode
- `npm run test:e2e:headed`: Headed mode (visible browser)

---

## 7. Code Conventions (from CLAUDE.md)

### 7.1 File Naming
- **Files**: kebab-case (`form-navigation.tsx`)
- **Components**: PascalCase (`FormNavigation`)
- **Path alias**: `@/*` → `./src/*`

### 7.2 Component Patterns
- **"use client"** directive on components using React hooks
- **cn()** utility for conditional Tailwind classes
- **Form sections** receive `UseFormReturn<AnonymousFormData>` from parent `FormProvider`

### 7.3 Database Patterns
- **Migrations** in `supabase/migrations/` (sequential numbering)
- **RLS** enforced on all tables
- **Type safety** via `Database` type from `database.types.ts`

### 7.4 FairMind Integration
- **Journals** in `fairmind/journals/` track agent work per task
- **CI workflow** (`.github/workflows/claude-code-review.yml`) auto-reviews PRs by comparing journals and code against FairMind task acceptance criteria via MCP, including security spot-checks

---

## 8. Git Status Snapshot

**Current Branch**: `master`
**Main Branch**: `master`

**Modified Files**:
- `src/constants/topics.ts`

**Untracked Files/Directories**:
- `fairmind/US-0106_context.md`
- `fairmind/attachments/`
- `fairmind/work_packages/backend/`
- `fairmind/work_packages/frontend/TASK-0071_frontend_workpackage.md`
- `fairmind/work_packages/frontend/TASK-0080_frontend_workpackage.md`
- `supabase/.temp/`
- `test-results/`
- `tests/duplicate-submission.spec.ts`
- `work-pages/`

**Recent Commits**:
1. `f51987e`: Merge pull request #3 - duplicate submission prevention (US-0095)
2. `2bacb62`: Add project CLAUDE.md with architecture and conventions
3. `e4010d4`: Enhance Phase 4 report with structured checklist and emoji flags
4. `1e257f7`: Add security spot-check phase to code review workflow
5. `65149a8`: Add FairMind task journals for US-2026-0095

---

## 9. Notable Patterns & Best Practices

### 9.1 Security
- ✅ IP hashing (SHA-256) before storage
- ✅ RLS policies prevent anonymous reads
- ✅ Service role isolated to server-side
- ✅ Content-Type validation on API routes
- ✅ 90-day data retention with auto-cleanup
- ✅ GDPR-compliant deletion via service role

### 9.2 Performance
- ✅ Debounced auto-save (1s delay)
- ✅ Composite indexes for rate limiting queries
- ✅ Partial indexes on optional fields
- ✅ GIN index for array searches (topics)
- ✅ Client-side duplicate check (no unnecessary API calls)

### 9.3 User Experience
- ✅ Multi-step form with progress indicator
- ✅ Draft persistence (7-day TTL)
- ✅ Auto-restore on page reload
- ✅ Clear success/error feedback (toast + modal)
- ✅ Graceful duplicate submission handling
- ✅ All fields optional (except GDPR consent)

### 9.4 Code Quality
- ✅ TypeScript strict mode
- ✅ Zod schemas for runtime validation
- ✅ Type-safe Supabase client
- ✅ ESLint + Next.js lint rules
- ✅ Reusable shadcn/ui components
- ✅ Separation of concerns (hooks, lib, components)

### 9.5 Developer Experience
- ✅ Clear directory structure
- ✅ Comprehensive CLAUDE.md conventions
- ✅ FairMind task journals
- ✅ Playwright E2E tests
- ✅ Hot reload in dev mode
- ✅ Path alias for clean imports

---

## 10. Potential Improvements & Considerations

### 10.1 Missing/Incomplete Elements
- ⚠️ **No middleware.ts**: No custom Next.js middleware (uses defaults)
- ⚠️ **No .env.example**: Environment variables not documented in repository
- ⚠️ **Placeholder sections**: `event-formats-placeholder.tsx` and `topics-placeholder.tsx` suggest incomplete implementation
- ⚠️ **No error monitoring**: No integration with Sentry/Datadog for production errors
- ⚠️ **No analytics**: No tracking of form abandonment/completion rates

### 10.2 Security Enhancements
- 💡 **Rate limiting**: Consider API-level rate limiting (per IP, not just 24h duplicate check)
- 💡 **CAPTCHA**: Add CAPTCHA for bot prevention
- 💡 **CSP headers**: Add Content Security Policy headers
- 💡 **CORS**: Explicit CORS configuration for API routes

### 10.3 Data & Privacy
- 💡 **GDPR dashboard**: Admin interface for handling deletion requests
- 💡 **Data export**: Allow users to request their data (by device ID)
- 💡 **Retention policy automation**: Scheduled job to run `cleanup_old_ip_hashes()`
- 💡 **Anonymization audit**: Regular review of anonymization effectiveness

### 10.4 Testing Coverage
- 💡 **Unit tests**: Add unit tests for hooks, utilities, validation
- 💡 **Integration tests**: Test Supabase interactions in isolation
- 💡 **E2E coverage**: Expand beyond duplicate submission (test full form flow)
- 💡 **Accessibility tests**: Automated a11y testing (axe-core, pa11y)

### 10.5 Performance Optimization
- 💡 **Code splitting**: Dynamic imports for form sections (reduce initial bundle)
- 💡 **Image optimization**: Use Next.js Image component if images added
- 💡 **Database query optimization**: Analyze slow queries with EXPLAIN
- 💡 **CDN**: Configure CDN for static assets in production

### 10.6 User Experience
- 💡 **Mobile optimization**: Dedicated mobile testing (responsive design)
- 💡 **Offline support**: Service worker for offline draft saving
- 💡 **Multi-language**: i18n support for international users
- 💡 **Progress save notification**: Visual feedback when draft auto-saves

---

## 11. Summary for Atlas Tech Lead

### Repository Readiness Assessment

**Strengths**:
- ✅ Clean, well-structured codebase with clear separation of concerns
- ✅ Comprehensive type safety (TypeScript + Zod + Supabase types)
- ✅ Robust security model (RLS + IP hashing + service role isolation)
- ✅ Strong privacy practices (data retention, anonymization, GDPR compliance)
- ✅ Excellent developer documentation (CLAUDE.md)
- ✅ Modern tech stack (Next.js 14, React 18, Tailwind CSS)
- ✅ E2E testing infrastructure (Playwright)
- ✅ FairMind integration for agent coordination

**Areas for Attention**:
- ⚠️ Environment variables not documented (no `.env.example`)
- ⚠️ Placeholder components suggest incomplete features
- ⚠️ No monitoring/analytics in production
- ⚠️ Limited test coverage beyond E2E duplicate submission tests
- ⚠️ No custom middleware (may need for future features)

**Recommended Next Steps for Work Package Creation**:
1. **Review placeholder components**: Determine if event-formats and topics sections need full implementation
2. **Environment setup**: Create `.env.example` with all required variables
3. **Testing expansion**: Add unit tests for critical utilities (IP hashing, duplicate detection)
4. **Production readiness**: Set up monitoring, analytics, error tracking
5. **Documentation**: Add API documentation (OpenAPI/Swagger)
6. **CI/CD**: Review existing GitHub Actions workflow, ensure comprehensive coverage

**Agent Engagement Readiness**:
- **Frontend (React/NextJS)**: ✅ Ready - clear component structure, shadcn/ui components available
- **Backend (NextJS)**: ✅ Ready - API routes well-defined, Supabase integration complete
- **QA (Playwright)**: ✅ Ready - test infrastructure in place, can expand coverage
- **Security**: ✅ Ready - strong foundation, can audit and enhance
- **Code Review**: ✅ Ready - consistent patterns, clear conventions

**Skill Assignment Recommendations**:
- **Form enhancements**: `frontend-react-nextjs` (placeholder completion, UX improvements)
- **API additions**: `backend-nextjs` (rate limiting, GDPR endpoints)
- **Testing expansion**: `qa-playwright` (full E2E flow, accessibility tests)
- **Database optimizations**: `backend-nextjs` (query analysis, migration enhancements)
- **Security audit**: Engage Shield agent for comprehensive security review

---

**End of Repository Analysis**
