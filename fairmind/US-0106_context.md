# US-0106: Secure Organizer Authentication System - Complete Context

**Date Generated**: 2026-02-08
**Project**: Meetup App (ID: 6981fb9c4b2c601246796a08)
**Session**: SESSION-2026-0028 (MVP)
**Need**: NEED-2026-0072 - Data-Driven Event Planning Dashboard

---

## Executive Summary

US-0106 establishes the authentication foundation for the organizer dashboard, enabling secure email/password authentication via Supabase Auth. This is the first user story in the Data-Driven Event Planning Dashboard need and is a prerequisite for all analytics and dashboard features (US-0107 through US-0114).

**Scope**: Authentication infrastructure including login, logout, route protection, and session management.

**Key Deliverables**:
- Supabase Auth configuration
- Database schema with organizers table and RLS policies
- Login page with form validation
- Server-side authentication handlers
- Next.js middleware for route protection
- Logout functionality
- Dashboard layout with navigation

**Dependencies**: None (first story in dashboard epic)
**Dependents**: US-0107 (Dashboard Overview), US-0108 (Trends), US-0109 (Export), US-0110 (Heatmap), US-0111 (Format Charts), US-0112 (Demographics), US-0113 (Date Filtering), US-0114 (API Endpoints)

---

## User Story Details

### User Story: US-2026-0106
**Title**: Secure Organizer Authentication System
**ID**: 6988b5651cf6a704a4f479d0
**Need**: Data-Driven Event Planning Dashboard (NEED-2026-0072)
**Role**: Meetup Organizer

### Description
As a Meetup Organizer, I want to securely log in and log out of the dashboard using email and password authentication so that only authorized organizers can access anonymous participant data and make evidence-based event planning decisions.

### User Steps
1. Navigate to the organizer login page at `/dashboard/login`
2. Enter registered email address and password in the authentication form
3. Click the "Sign In" button to submit credentials
4. Upon successful authentication, get redirected to the main dashboard page at `/dashboard`
5. View dashboard content with access to anonymous submission data
6. Click the "Logout" button in the navigation header when finished
7. Get redirected back to the login page with session cleared

### Acceptance Criteria

**AC1: Supabase Auth Configuration**
- The system must implement Supabase Auth with email/password authentication strategy
- Environment variables must be configured (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Authentication helpers must be available in `src/lib/supabase/server.ts`

**AC2: Login Page**
- A dedicated login page must exist at `/dashboard/login` with email and password input fields
- Form must use React Hook Form with Zod validation
- Given an organizer enters valid credentials, when they submit the form, then they are authenticated and redirected to `/dashboard`
- Given an organizer enters invalid credentials, when they submit the form, then an error message is displayed without redirecting

**AC3: Route Protection**
- All `/dashboard/*` routes must be protected by authentication middleware
- Middleware must redirect unauthenticated users to `/dashboard/login`
- Middleware must verify organizer status in database before allowing access
- Original URL must be preserved in `redirectTo` query parameter for post-login redirect

**AC4: Session Management**
- The system must maintain persistent sessions using Supabase's session management with cookies
- Sessions must refresh automatically when tokens expire
- Cookie-based authentication must use HTTP-only cookies for security

**AC5: Logout Functionality**
- A logout button must be present in the dashboard navigation
- Given an authenticated organizer clicks logout, when the action completes, then their session is terminated and they cannot access protected routes
- Logout must clear all session cookies and redirect to `/dashboard/login`

**AC6: Security Requirements**
- The authentication system must comply with security best practices
- Password hashing handled by Supabase Auth (bcrypt)
- No passwords stored in client state or logs
- Error messages must be generic to prevent username enumeration

### Additional Considerations

**Technical Implementation**:
- Use `@supabase/ssr` package for Next.js App Router authentication
- Leverage existing `createServerClient()` pattern from `src/lib/supabase/server.ts`
- Follow middleware pattern from Supabase SSR documentation

**Database Schema**:
- Create `organizers` table in Supabase with columns: `id` (UUID, primary key), `email` (text, unique), `created_at` (timestamp)
- Link to Supabase Auth users via foreign key
- Implement RLS policies to restrict dashboard data access

**UI Components**:
- Reuse shadcn/ui components (Button, Input, Label, Card) for consistent styling
- Follow existing form patterns from anonymous submission form

**Future Enhancements**:
- Password reset functionality
- Multi-factor authentication (MFA)
- Organizer registration flow with admin approval
- Last login tracking

---

## Related User Stories

### Parent Need: NEED-2026-0072
**Title**: Data-Driven Event Planning Dashboard
**Description**: As a meetup organizer, I need a dashboard that aggregates anonymous participant data (profiles, availability, format preferences, feedback) so that I can make evidence-based decisions on event timing, format, and frequency.

### Dependent User Stories
All following user stories in the dashboard epic depend on US-0106 being completed:

1. **US-0107**: Main Dashboard Overview with Key Metrics
2. **US-0108**: Response Trends Over Time Visualization
3. **US-0109**: Data Export Functionality with Date Filtering
4. **US-0110**: Availability Heatmap for Optimal Event Scheduling
5. **US-0111**: Event Format Preference Charts
6. **US-0112**: Demographic Breakdowns
7. **US-0113**: Date Range Filtering
8. **US-0114**: Analytics API Endpoints

---

## Implementation Tasks

US-0106 is decomposed into 7 technical tasks:

### TASK-2026-0094: Configure Supabase Authentication for Organizer Access
**Estimated Effort**: 4 hours
**Description**: Set up Supabase Auth infrastructure with email/password authentication. Enable email provider, configure environment variables, and create authentication helper functions.

**Key Deliverables**:
- Email authentication enabled in Supabase dashboard
- Helper functions: `getSession()`, `getUser()`, `signIn()`, `signOut()`
- `Organizer` TypeScript interface defined
- Test organizer account created

**Files to Modify**:
- `src/lib/supabase/server.ts` - Add authentication helpers
- `src/types/database.types.ts` - Add Organizer interface

---

### TASK-2026-0095: Design and Implement Organizers Table with RLS Policies
**Estimated Effort**: 3 hours
**Description**: Create database schema for organizers with Row Level Security policies to protect dashboard data.

**Key Deliverables**:
- `organizers` table with columns: id, email, created_at, updated_at
- Foreign key to `auth.users(id)` with CASCADE delete
- RLS policies: organizers can view own record, service role has full access
- Updated RLS on `anonymous_submissions` to restrict reads to authenticated organizers

**Files to Create**:
- `supabase/migrations/002_create_organizers_table.sql`

**Database Schema**:
```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizers_email ON organizers(email);
CREATE INDEX idx_organizers_created_at ON organizers(created_at);

ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizers can view own record"
ON organizers FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Service role full access"
ON organizers FOR ALL
USING (auth.role() = 'service_role');

-- Update anonymous_submissions RLS
DROP POLICY IF EXISTS "Allow public read access" ON anonymous_submissions;

CREATE POLICY "Organizers can read all submissions"
ON anonymous_submissions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organizers WHERE organizers.id = auth.uid()
  )
);
```

---

### TASK-2026-0096: Create Organizer Login Page with Form Validation
**Estimated Effort**: 6 hours
**Description**: Build login page at `/dashboard/login` with client-side validation, error handling, and Supabase Auth integration.

**Key Deliverables**:
- Login page at `/dashboard/login`
- Form with email and password fields
- React Hook Form + Zod validation
- User-friendly error messages
- Loading states during authentication
- Post-login redirect to `/dashboard`

**Files to Create**:
- `src/app/dashboard/login/page.tsx` - Login page route
- `src/components/dashboard/LoginForm.tsx` - Login form component
- `src/lib/validations/login.ts` - Zod validation schema

**Validation Schema**:
```typescript
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});
```

---

### TASK-2026-0097: Build Server-Side Authentication Handlers and Session Management
**Estimated Effort**: 5 hours
**Description**: Implement server actions and API routes for authentication operations with secure session handling.

**Key Deliverables**:
- Logout API route at `/api/auth/logout`
- Server actions: `signInAction`, `signOutAction`, `getSessionAction`, `getUserAction`
- Authentication utilities: `requireAuth()`, `getAuthUser()`, `isOrganizer()`, `requireOrganizerAuth()`
- Session management with cookie-based persistence

**Files to Create**:
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/lib/actions/auth.ts` - Server actions for authentication
- `src/lib/auth.ts` - Authentication utility functions

**Server Actions**:
```typescript
'use server';

export async function signInAction(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { data: null, error: error.message };
  revalidatePath('/dashboard', 'layout');
  return { data, error: null };
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { error: error.message };
  revalidatePath('/dashboard', 'layout');
  redirect('/dashboard/login');
}
```

---

### TASK-2026-0098: Implement Next.js Middleware for Route Protection
**Estimated Effort**: 4 hours
**Description**: Create Next.js middleware to protect all `/dashboard/*` routes, automatically redirecting unauthenticated users to login.

**Key Deliverables**:
- Middleware at `middleware.ts` (root level)
- Route protection for all `/dashboard/*` paths
- Session validation and automatic token refresh
- Organizer verification (checks `organizers` table)
- Post-login redirect support with `redirectTo` parameter

**Files to Create**:
- `middleware.ts` - Next.js middleware for authentication

**Middleware Logic**:
```typescript
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isLoginPage = pathname === '/dashboard/login';

  // Redirect authenticated users away from login
  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !isLoginPage && !session) {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify organizer status
  if (isProtectedRoute && !isLoginPage && session) {
    const { data: organizer } = await supabase
      .from('organizers')
      .select('id')
      .eq('id', session.user.id)
      .single();

    if (!organizer) {
      const loginUrl = new URL('/dashboard/login', request.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

---

### TASK-2026-0099: Implement Logout Button with Session Termination
**Estimated Effort**: 3 hours
**Description**: Create reusable logout button component that clears session and redirects to login.

**Key Deliverables**:
- Logout API endpoint at `/api/auth/logout` (POST and GET)
- LogoutButton component with loading states
- Session clearing and redirect to login
- Error handling for logout failures

**Files to Create**:
- `src/app/api/auth/logout/route.ts` - Logout endpoint
- `src/components/auth/LogoutButton.tsx` - Logout button component

**Logout Button Component**:
```typescript
'use client';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        router.push('/dashboard/login');
        router.refresh();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Logging out...' : 'Logout'}
    </Button>
  );
}
```

---

### TASK-2026-0100: Build Dashboard Layout with Navigation and Authentication Context
**Estimated Effort**: 6 hours
**Description**: Create dashboard layout structure with navigation sidebar, organizer context, and authentication verification.

**Key Deliverables**:
- Dashboard layout at `src/app/dashboard/layout.tsx`
- Navigation component with links to all dashboard sections
- Organizer profile display (email)
- Logout button integration
- Responsive design (sidebar on desktop, hamburger on mobile)
- Active route highlighting

**Files to Create**:
- `src/app/dashboard/layout.tsx` - Dashboard layout wrapper
- `src/components/dashboard/DashboardNav.tsx` - Navigation component

**Dashboard Layout**:
```typescript
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/dashboard/login');
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav user={session.user} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
```

**Navigation Links**:
- Overview (`/dashboard`)
- Trends (`/dashboard/trends`)
- Availability (`/dashboard/availability`)
- Formats (`/dashboard/formats`)
- Demographics (`/dashboard/demographics`)

---

## Task Summary Table

| Task ID | Title | Effort | Key Files |
|---------|-------|--------|-----------|
| TASK-2026-0094 | Configure Supabase Authentication | 4h | `src/lib/supabase/server.ts`, `src/types/database.types.ts` |
| TASK-2026-0095 | Design and Implement Organizers Table | 3h | `supabase/migrations/002_create_organizers_table.sql` |
| TASK-2026-0096 | Create Organizer Login Page | 6h | `src/app/dashboard/login/page.tsx`, `src/components/dashboard/LoginForm.tsx`, `src/lib/validations/login.ts` |
| TASK-2026-0097 | Build Server-Side Authentication Handlers | 5h | `src/app/api/auth/logout/route.ts`, `src/lib/actions/auth.ts`, `src/lib/auth.ts` |
| TASK-2026-0098 | Implement Next.js Middleware | 4h | `middleware.ts` |
| TASK-2026-0099 | Implement Logout Button | 3h | `src/components/auth/LogoutButton.tsx` |
| TASK-2026-0100 | Build Dashboard Layout | 6h | `src/app/dashboard/layout.tsx`, `src/components/dashboard/DashboardNav.tsx` |
| **TOTAL** | | **31h** | |

---

## Test Coverage

### Test Cases Required

**No test cases currently defined in FairMind for US-0106.**

### Recommended Test Scenarios

#### Authentication Flow Tests
1. **Successful Login**
   - Navigate to `/dashboard/login`
   - Enter valid credentials
   - Verify redirect to `/dashboard`
   - Verify session cookie is set

2. **Failed Login - Invalid Credentials**
   - Navigate to `/dashboard/login`
   - Enter invalid credentials
   - Verify error message displays
   - Verify no redirect occurs

3. **Failed Login - Empty Fields**
   - Navigate to `/dashboard/login`
   - Submit empty form
   - Verify validation errors display

#### Route Protection Tests
4. **Unauthenticated Access to Dashboard**
   - Navigate to `/dashboard` without login
   - Verify redirect to `/dashboard/login?redirectTo=/dashboard`

5. **Post-Login Redirect**
   - Attempt to access `/dashboard/trends` without auth
   - Redirected to login with `redirectTo` parameter
   - Login successfully
   - Verify redirect back to `/dashboard/trends`

6. **Authenticated Access to Login Page**
   - Login successfully
   - Navigate to `/dashboard/login`
   - Verify redirect to `/dashboard`

#### Session Management Tests
7. **Session Persistence**
   - Login successfully
   - Refresh page
   - Verify session persists

8. **Logout Flow**
   - Login successfully
   - Click logout button
   - Verify redirect to `/dashboard/login`
   - Verify session cleared
   - Attempt to access `/dashboard`
   - Verify redirect to login

#### Organizer Verification Tests
9. **Non-Organizer User Access**
   - Create Auth user NOT in organizers table
   - Attempt to login
   - Verify redirect to login with `error=unauthorized`

10. **Organizer User Access**
    - Create Auth user IN organizers table
    - Login successfully
    - Verify dashboard access granted

---

## Technical Architecture

### Technology Stack

**Frontend**:
- Next.js 14 (App Router)
- React 18
- TypeScript (strict mode)
- shadcn/ui components
- Tailwind CSS
- React Hook Form 7.54.2
- Zod 3.24.1

**Backend**:
- Supabase (PostgreSQL + Auth)
- @supabase/ssr v0.5.2
- @supabase/supabase-js v2.48.1
- Next.js API Routes

**Authentication**:
- Supabase Auth (email/password)
- Cookie-based sessions (HTTP-only)
- Next.js Middleware for route protection
- Row Level Security (RLS) policies

### Database Schema

#### Existing Tables
- `anonymous_submissions` - Stores anonymous user preference submissions

#### New Tables
- `organizers` - Stores authorized organizer accounts

**Organizers Table**:
```sql
CREATE TABLE organizers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    User Accesses /dashboard             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│             Next.js Middleware (Edge Runtime)           │
│                 - Check Session Cookie                  │
│                 - Validate Session Token                │
│                 - Verify Organizer Status               │
└────────────┬───────────────────────┬─────────────────────┘
             │                       │
        Session Valid?               │
             │                       │
       ┌─────┴─────┐                 │
       │           │                 │
      YES          NO                │
       │           │                 │
       │           ▼                 │
       │  ┌─────────────────────┐   │
       │  │ Redirect to Login   │   │
       │  │ with redirectTo     │   │
       │  └─────────────────────┘   │
       │                             │
       ▼                             │
┌────────────────┐                   │
│ Dashboard Page │◄──────────────────┘
│  - Layout      │
│  - Navigation  │
│  - Content     │
└────────────────┘
```

### Security Model

**Defense in Depth**:
1. **Middleware**: First layer - checks session before route access
2. **Layout**: Second layer - server component verifies auth
3. **RLS Policies**: Third layer - database enforces row-level security
4. **API Routes**: Fourth layer - endpoints verify authentication

**Password Security**:
- Passwords hashed with bcrypt by Supabase Auth
- Never stored in client state or logs
- Generic error messages prevent username enumeration

**Session Security**:
- HTTP-only cookies (XSS protection)
- Secure flag (HTTPS only in production)
- SameSite=Strict (CSRF protection)
- Automatic token refresh on expiration

---

## Integration Points

### Existing Codebase Integration

**Leverages Existing Patterns**:
- `src/lib/supabase/server.ts` - Extends existing Supabase client pattern
- `src/lib/supabase/client.ts` - Anonymous client for submissions (unchanged)
- shadcn/ui components - Reuses Button, Input, Label, Card components
- Form validation pattern - Follows React Hook Form + Zod pattern from submission form

**Database Integration**:
- Extends existing `anonymous_submissions` table with RLS policies
- Links to Supabase Auth `auth.users` table
- Maintains existing anonymous submission flow (no breaking changes)

**Environment Variables** (already configured):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### API Endpoints

**New Endpoints**:
- `POST /api/auth/logout` - Logout endpoint
- `GET /api/auth/logout` - Logout endpoint (link-based)

**Protected Endpoints** (future user stories):
- `/api/analytics/summary` - Dashboard metrics
- `/api/analytics/trends` - Submission trends
- `/api/analytics/formats` - Format preferences
- `/api/analytics/demographics` - Demographic data
- `/api/analytics/availability` - Availability heatmap
- `/api/analytics/export` - Data export

---

## Dependencies

### External Dependencies
- Supabase project with Auth enabled ✅ (already configured)
- @supabase/ssr package ✅ (installed v0.5.2)
- @supabase/supabase-js package ✅ (installed v2.48.1)
- React Hook Form ✅ (installed v7.54.2)
- Zod ✅ (installed v3.24.1)
- shadcn/ui components ✅ (Button, Input, Label, Card, Sheet)

### Internal Dependencies
- None (first user story in dashboard epic)

### Dependent User Stories
All dashboard analytics features depend on US-0106:
- US-0107: Main Dashboard Overview
- US-0108: Response Trends
- US-0109: Data Export
- US-0110: Availability Heatmap
- US-0111: Event Format Charts
- US-0112: Demographic Breakdowns
- US-0113: Date Range Filtering
- US-0114: Analytics API Endpoints

---

## Recommended Implementation Approach

### Phase 1: Infrastructure (Tasks 1-2) - 7 hours
**Goal**: Set up authentication infrastructure and database schema

1. **Configure Supabase Auth** (Task 94)
   - Enable email authentication in Supabase dashboard
   - Add authentication helper functions to `src/lib/supabase/server.ts`
   - Create `Organizer` TypeScript interface
   - Test helpers with temporary test account

2. **Create Organizers Table** (Task 95)
   - Write migration SQL with RLS policies
   - Apply migration via Supabase CLI or dashboard
   - Update `anonymous_submissions` RLS policies
   - Create first test organizer account
   - Verify RLS policies work correctly

**Checkpoint**: Authentication infrastructure ready, database secured

---

### Phase 2: Login UI (Task 3) - 6 hours
**Goal**: Build login page with form validation

3. **Create Login Page** (Task 96)
   - Create login page route at `/dashboard/login`
   - Build LoginForm component with React Hook Form
   - Implement Zod validation schema
   - Add error handling and loading states
   - Style with shadcn/ui components
   - Test form submission with test account

**Checkpoint**: Users can login via UI

---

### Phase 3: Server-Side Handlers (Task 4) - 5 hours
**Goal**: Implement authentication operations and session management

4. **Build Authentication Handlers** (Task 97)
   - Create logout API route
   - Implement server actions for auth operations
   - Create authentication utility functions
   - Update LoginForm to use server actions
   - Test authentication flows end-to-end

**Checkpoint**: Authentication operations work correctly

---

### Phase 4: Route Protection (Tasks 5-6) - 7 hours
**Goal**: Secure dashboard routes and add logout functionality

5. **Implement Middleware** (Task 98)
   - Create Next.js middleware at root level
   - Add session validation and token refresh
   - Implement organizer verification
   - Add post-login redirect support
   - Update login page to handle redirects
   - Test protection on all dashboard routes

6. **Implement Logout Button** (Task 99)
   - Create LogoutButton component
   - Integrate with logout API endpoint
   - Test logout flow and session clearing

**Checkpoint**: Dashboard fully protected, users can logout

---

### Phase 5: Dashboard Layout (Task 7) - 6 hours
**Goal**: Create dashboard structure with navigation

7. **Build Dashboard Layout** (Task 100)
   - Create dashboard layout wrapper
   - Build navigation component with links
   - Integrate logout button into navigation
   - Add responsive mobile menu
   - Implement active route highlighting
   - Test navigation and layout responsiveness

**Checkpoint**: Dashboard structure complete and ready for analytics pages

---

### Total Implementation Time
**31 hours** across 7 tasks

### Recommended Team Assignment

**Backend Engineer (Echo with backend-nextjs skill)**:
- Tasks 1, 2, 4, 5 (Infrastructure, database, server actions, middleware)
- Estimated: 19 hours

**Frontend Engineer (Echo with frontend-react-nextjs skill)**:
- Tasks 3, 6, 7 (Login page, logout button, dashboard layout)
- Estimated: 15 hours

**Note**: Can be done by single full-stack engineer sequentially, or parallelized with backend tasks first, then frontend.

---

## Quality Assurance

### Testing Strategy

**Manual Testing Checklist**:
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Empty form submission shows validation errors
- [ ] Unauthenticated access to dashboard redirects to login
- [ ] Post-login redirect preserves original URL
- [ ] Authenticated user cannot access login page
- [ ] Session persists after page refresh
- [ ] Logout clears session and redirects
- [ ] Non-organizer user receives unauthorized error
- [ ] Session automatically refreshes on token expiration
- [ ] Dashboard navigation works correctly
- [ ] Active route is highlighted in navigation
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Loading states display correctly
- [ ] Error messages are user-friendly

**Playwright E2E Test Scenarios** (recommended):
```typescript
test.describe('Organizer Authentication', () => {
  test('login flow redirects to dashboard', async ({ page }) => {
    await page.goto('/dashboard/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('unauthenticated access redirects to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard\/login/);
    expect(page.url()).toContain('redirectTo=%2Fdashboard');
  });

  test('logout clears session', async ({ page }) => {
    // Login first
    await page.goto('/dashboard/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Logout
    await page.click('text=Logout');
    await page.waitForURL('/dashboard/login');

    // Verify cannot access dashboard
    await page.goto('/dashboard');
    await page.waitForURL(/\/dashboard\/login/);
  });
});
```

### Code Review Focus Areas
- [ ] Authentication logic is server-side (no client-side auth checks)
- [ ] Passwords never logged or stored in client state
- [ ] Error messages don't leak sensitive information
- [ ] Session cookies are HTTP-only and secure
- [ ] RLS policies correctly restrict data access
- [ ] Middleware matcher only runs on dashboard routes
- [ ] Post-login redirect is safe (no open redirect vulnerability)
- [ ] TypeScript types are properly defined (no `any` types)
- [ ] Loading states provide user feedback
- [ ] Accessibility: ARIA labels, keyboard navigation, focus states

### Security Validation
- [ ] OWASP Top 10 compliance (no SQL injection, XSS, CSRF)
- [ ] Session management follows best practices
- [ ] Password requirements enforced (min 8 characters)
- [ ] Rate limiting considered for production (future enhancement)
- [ ] Environment variables properly secured
- [ ] No sensitive data in client-side code
- [ ] Database RLS policies tested and verified

---

## Risk Assessment

### High Priority Risks

**Risk 1: Session Management Complexity**
- **Impact**: High
- **Probability**: Medium
- **Mitigation**: Use proven @supabase/ssr package, follow official Supabase patterns, thorough testing

**Risk 2: Middleware Configuration Errors**
- **Impact**: High (could block all dashboard access or leave routes unprotected)
- **Probability**: Medium
- **Mitigation**: Comprehensive testing of all protected routes, verify matcher configuration

**Risk 3: RLS Policy Gaps**
- **Impact**: High (could expose anonymous submission data)
- **Probability**: Low
- **Mitigation**: Careful policy design, test with service role and authenticated users

### Medium Priority Risks

**Risk 4: Organizer Account Creation Process**
- **Impact**: Medium (organizers cannot access dashboard)
- **Probability**: Medium
- **Mitigation**: Document manual account creation process, plan for future registration flow

**Risk 5: Session Expiration Handling**
- **Impact**: Medium (users unexpectedly logged out)
- **Probability**: Low
- **Mitigation**: Automatic token refresh in middleware, graceful error handling

### Low Priority Risks

**Risk 6: Mobile Responsiveness Issues**
- **Impact**: Low
- **Probability**: Low
- **Mitigation**: Mobile-first design, thorough responsive testing

---

## Project Context

### Existing System Overview

**Meetup App** is an anonymous user profiling system that collects meetup participant preferences without requiring authentication. The existing system includes:

- **Anonymous Form Submission**: Multi-step form for collecting preferences
- **Supabase Backend**: PostgreSQL database with `anonymous_submissions` table
- **Next.js 14 App Router**: React-based frontend
- **Duplicate Prevention**: Client and server-side duplicate submission checks (US-0095)
- **Responsive Design**: Mobile-friendly form interface

**Current State**:
- ✅ Anonymous users can submit preferences
- ✅ Data stored in Supabase with RLS allowing public inserts
- ✅ No organizer dashboard (target of this user story)
- ✅ No authentication system (to be added)

### Technology Stack (from Architecture Specification)

**Frontend**:
- React 18+ with Next.js 14 App Router
- TypeScript (strict mode)
- shadcn/ui + Tailwind CSS
- React Hook Form + Zod validation

**Backend**:
- Supabase (PostgreSQL + Auth + Storage)
- Next.js API Routes
- Row Level Security (RLS)

**Deployment**:
- Netlify (with Next.js plugin)
- Continuous deployment from Git
- Edge functions for serverless operations

**Current Installed Packages**:
- `@supabase/ssr@0.5.2`
- `@supabase/supabase-js@2.48.1`
- `react-hook-form@7.54.2`
- `zod@3.24.1`
- `@hookform/resolvers`
- shadcn/ui components

### File Structure Context

```
meetup-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                          # Homepage (anonymous form)
│   │   ├── api/
│   │   │   └── submit-preferences/
│   │   │       └── route.ts                  # Submission endpoint
│   │   └── [NEW] dashboard/
│   │       ├── login/page.tsx                # Login page
│   │       ├── layout.tsx                    # Dashboard layout
│   │       └── page.tsx                      # Dashboard overview (future US)
│   ├── components/
│   │   ├── ui/                               # shadcn/ui components
│   │   ├── [NEW] dashboard/
│   │   │   ├── LoginForm.tsx                 # Login form
│   │   │   └── DashboardNav.tsx              # Navigation
│   │   └── [NEW] auth/
│   │       └── LogoutButton.tsx              # Logout button
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── server.ts                     # Server Supabase client
│   │   │   └── client.ts                     # Client Supabase client
│   │   ├── validations/
│   │   │   └── [NEW] login.ts                # Login validation schema
│   │   ├── [NEW] actions/
│   │   │   └── auth.ts                       # Server actions
│   │   └── [NEW] auth.ts                     # Auth utilities
│   ├── types/
│   │   └── database.types.ts                 # TypeScript types
│   └── hooks/
│       └── use-multi-step-form.ts            # Form state management
├── supabase/
│   └── migrations/
│       ├── 001_create_anonymous_submissions.sql  # Existing
│       └── [NEW] 002_create_organizers_table.sql # New migration
├── [NEW] middleware.ts                       # Route protection
├── .env.local                                # Environment variables
├── next.config.js                            # Next.js configuration
└── package.json                              # Dependencies
```

---

## Glossary

**Authentication**: Process of verifying user identity (login)
**Authorization**: Process of verifying access permissions (organizer check)
**Session**: Server-maintained state tracking authenticated user
**RLS (Row Level Security)**: Database-level security restricting data access by user
**Middleware**: Edge function running before route handlers
**Server Component**: React component rendering on server (no client JS)
**Client Component**: React component with client-side interactivity
**Server Action**: Server-side function callable from client components
**HTTP-only Cookie**: Cookie inaccessible to JavaScript (XSS protection)
**CSRF**: Cross-Site Request Forgery attack
**Organizer**: Meetup organizer with dashboard access
**Anonymous Submission**: User preference submission without authentication

---

## References

### FairMind Resources
- **User Story**: US-2026-0106 (ID: 6988b5651cf6a704a4f479d0)
- **Need**: NEED-2026-0072 (ID: 698200bdcea45201216764af)
- **Session**: SESSION-2026-0028 (MVP)
- **Project**: Meetup App (ID: 6981fb9c4b2c601246796a08)

### Project Documentation
- `fairmind/attachments/Meetup App - Technology Stack & Architecture Specification_v1.md`
- `fairmind/attachments/Meetup App - Anonymous User Profiling System - Project Description_v2.md`
- `CLAUDE.md` - Project conventions and commands
- `supabase/migrations/001_create_anonymous_submissions.sql` - Existing schema

### External Documentation
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side-rendering)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-02-08 | 1.0 | Initial context document created | Atlas (Tech Lead) |

---

**Document Status**: ✅ Ready for Implementation
**Next Steps**: Distribute work packages to implementation agents (Echo for backend/frontend, Tess for QA)
