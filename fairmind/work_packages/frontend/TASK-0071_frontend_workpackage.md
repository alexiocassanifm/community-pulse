# Work Package: Echo (Software Engineer) - Client-Side Submission Storage Service

**Task ID**: TASK-2026-0071
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `frontend-react-nextjs`

## Task Overview

Create `src/lib/submission-storage.ts` - a localStorage + cookie service for tracking form submissions to prevent duplicates. This implements AC1 (Client-Side Submission Tracking), AC2 (Submission Status Check), and AC4 (Anonymous Device Identification).

## Reference Pattern

You MUST follow the exact code style of `src/lib/form-persistence.ts`:
- SSR guard: `typeof window === "undefined"`
- try-catch every storage operation
- `console.error` for failures (never throw)
- Return boolean for success/failure functions
- Export all functions individually
- JSDoc comments on all exported functions

## Execution Plan

### Step 1: Create the SubmissionStatus type

```typescript
interface SubmissionStatus {
  hasSubmitted: boolean;
  deviceId: string;
  timestamp?: string;
}
```

### Step 2: Define storage constants

```typescript
const STORAGE_KEYS = {
  SUBMITTED: "meetup_form_submitted",
  DEVICE_ID: "meetup_device_id",
  SUBMISSION_TIME: "meetup_submission_time",
} as const;

const COOKIE_NAME = "meetup_form_submitted";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds
```

### Step 3: Implement `generateDeviceId()`

- Check localStorage for existing `meetup_device_id`, return if found
- Generate: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
- Store in localStorage
- SSR-safe: return a new generated ID without storing if `window` is undefined
- Example output: `1704067200000-x7k9m2p`

### Step 4: Implement `checkSubmissionStatus()`

- SSR guard returns `{ hasSubmitted: false, deviceId: generateDeviceId() }`
- Check localStorage `meetup_form_submitted === 'true'`
- If not in localStorage, check cookie fallback: `document.cookie.includes('meetup_form_submitted=true')`
- Get `deviceId` from localStorage or generate new
- Get `timestamp` from localStorage (optional)
- Return `SubmissionStatus` object

### Step 5: Implement `markAsSubmitted(deviceId: string)`

- Set localStorage: `meetup_form_submitted` = `'true'`
- Set localStorage: `meetup_device_id` = deviceId
- Set localStorage: `meetup_submission_time` = `new Date().toISOString()`
- Set cookie: `meetup_form_submitted=true; max-age=2592000; path=/; SameSite=Strict`
  - NOT HttpOnly (needs JS access for `checkSubmissionStatus`)
  - SameSite=Strict for CSRF protection
- Return `true` on success, `false` on failure

### Step 6: Implement `clearSubmissionStatus()` (optional utility)

- Remove all three localStorage keys
- Expire cookie by setting `max-age=0`
- Return boolean success

## File to Create

`src/lib/submission-storage.ts`

## Acceptance Criteria

- [ ] `checkSubmissionStatus()` returns correct state for: no submission, after submission, localStorage cleared (cookie fallback)
- [ ] `generateDeviceId()` returns `timestamp-random9chars` format
- [ ] `generateDeviceId()` returns existing ID if already in localStorage
- [ ] `markAsSubmitted()` writes to both localStorage AND cookie
- [ ] Cookie has 30-day expiry (`max-age=2592000`)
- [ ] Cookie uses `SameSite=Strict`
- [ ] All functions are SSR-safe
- [ ] No PII stored anywhere
- [ ] Code style matches `form-persistence.ts` exactly
- [ ] All functions exported with JSDoc comments
- [ ] `SubmissionStatus` type exported

## Dependencies

- No external packages needed (browser APIs only)
- Must follow patterns from `src/lib/form-persistence.ts`

## Expected Deliverables

- `src/lib/submission-storage.ts` with all functions implemented

## Journal Requirements

Maintain journal at: `fairmind/journals/TASK-0071_echo_journal.md`
Update after each significant action or decision.
