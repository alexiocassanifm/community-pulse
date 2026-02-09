# Work Package: QA - US-0106 Secure Organizer Authentication

**Task ID**: US-2026-0106
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `qa-playwright`

## Task Overview

Create and execute E2E tests for the organizer authentication system. Tests cover login flow, route protection, session management, and logout functionality.

**Depends on**: Both backend and frontend work packages must be completed first.

**Pre-requisite**: A test organizer account must exist in both Supabase Auth and the `organizers` table. The test credentials should be set as environment variables or configured in a test fixture.

## Test Scenarios

### Scenario 1: Successful Login Flow

**Test**: `login flow redirects to dashboard`
1. Navigate to `/dashboard/login`
2. Fill email field with valid test organizer email
3. Fill password field with valid password
4. Click "Sign In" button
5. Assert: URL changes to `/dashboard`
6. Assert: Dashboard page content is visible
7. Assert: Navigation sidebar is visible with user email

### Scenario 2: Failed Login - Invalid Credentials

**Test**: `invalid credentials show error message`
1. Navigate to `/dashboard/login`
2. Fill email with `wrong@example.com`
3. Fill password with `wrongpassword`
4. Click "Sign In"
5. Assert: Error message "Invalid email or password" is visible
6. Assert: URL remains `/dashboard/login`
7. Assert: Form fields are still editable

### Scenario 3: Failed Login - Empty Fields (Client Validation)

**Test**: `empty form shows validation errors`
1. Navigate to `/dashboard/login`
2. Click "Sign In" without filling fields (or tab through fields to trigger onBlur)
3. Assert: "Email is required" error message visible
4. Assert: "Password is required" error message visible

### Scenario 4: Unauthenticated Access Redirect

**Test**: `unauthenticated access redirects to login`
1. Clear all cookies
2. Navigate to `/dashboard`
3. Assert: URL redirected to `/dashboard/login?redirectTo=%2Fdashboard`

### Scenario 5: Post-Login Redirect

**Test**: `post-login redirect preserves original URL`
1. Clear all cookies
2. Navigate to `/dashboard/trends`
3. Assert: URL redirected to `/dashboard/login?redirectTo=%2Fdashboard%2Ftrends`
4. Fill valid credentials
5. Click "Sign In"
6. Assert: URL changes to `/dashboard/trends`

### Scenario 6: Authenticated User on Login Page

**Test**: `authenticated user redirected from login page`
1. Login with valid credentials
2. Navigate to `/dashboard/login`
3. Assert: URL redirected to `/dashboard`

### Scenario 7: Session Persistence

**Test**: `session persists after page refresh`
1. Login with valid credentials
2. Assert: URL is `/dashboard`
3. Reload the page
4. Assert: URL remains `/dashboard` (not redirected to login)
5. Assert: Dashboard content is visible

### Scenario 8: Logout Flow

**Test**: `logout clears session and redirects`
1. Login with valid credentials
2. Assert: Dashboard visible
3. Click "Sign Out" button
4. Assert: URL changes to `/dashboard/login`
5. Navigate to `/dashboard`
6. Assert: URL redirected to `/dashboard/login`

### Scenario 9: Login Page UI Elements

**Test**: `login page displays correct elements`
1. Navigate to `/dashboard/login`
2. Assert: "Organizer Dashboard" heading visible
3. Assert: "Sign in to access event analytics" text visible
4. Assert: Email input field present
5. Assert: Password input field present
6. Assert: "Sign In" button present

### Scenario 10: Loading State

**Test**: `submit button shows loading state`
1. Navigate to `/dashboard/login`
2. Fill valid credentials
3. Click "Sign In"
4. Assert: Button text changes to "Signing in..." (or is disabled)

## Test File Structure

```
tests/
  auth/
    login.spec.ts          - Scenarios 1-3, 9-10
    route-protection.spec.ts - Scenarios 4-6
    session.spec.ts        - Scenarios 7-8
```

## Test Configuration Notes

- Tests require a running dev server (Playwright auto-starts on port 3001)
- Test organizer credentials must be available (environment variables or hardcoded test account)
- Tests should use `test.describe` to group related scenarios
- Use `page.waitForURL()` for navigation assertions
- Use Playwright's `storageState` for sharing auth state between tests when needed
- Consider creating an auth helper/fixture for login that can be reused across tests

## Acceptance Criteria Mapping

| AC | Test Scenarios |
|----|---------------|
| AC2: Login Page | 1, 2, 3, 9, 10 |
| AC3: Route Protection | 4, 5, 6 |
| AC4: Session Management | 7 |
| AC5: Logout | 8 |

## Expected Deliverables

| File | Description |
|------|-------------|
| `tests/auth/login.spec.ts` | Login flow E2E tests |
| `tests/auth/route-protection.spec.ts` | Route protection E2E tests |
| `tests/auth/session.spec.ts` | Session and logout E2E tests |

## Journal Requirements

Maintain journal at: `fairmind/journals/US-0106_tess_journal.md`
Update after each test run with results.
