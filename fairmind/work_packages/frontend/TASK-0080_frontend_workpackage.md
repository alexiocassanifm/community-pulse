# Work Package: Echo (Software Engineer) - Integrate Duplicate Detection into Form Submission Flow

**Task ID**: TASK-2026-0080
**Date Created**: 2026-02-08
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: `frontend-react-nextjs`

## Task Overview

Integrate the duplicate submission prevention system across the entire form flow: hook, API route, and form container. Create the AlreadySubmittedMessage component. This implements AC1-AC7 from the user story.

## Prerequisites (must be completed)

- `src/lib/submission-storage.ts` (TASK-0071) - client storage service
- `supabase/migrations/002_add_duplicate_prevention.sql` (TASK-0079) - DB schema
- Updated `src/types/database.types.ts` (TASK-0079) - TypeScript types

## Execution Plan

### Step 1: Create Supabase server client

**File**: `src/lib/supabase/server.ts`

The existing `src/lib/supabase/client.ts` uses the anon key (INSERT only per RLS). The API route needs to SELECT to check for existing submissions. Create a server-side client with the service role key:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey);
```

This file should ONLY be imported in server-side code (API routes). Never import in client components.

### Step 2: Modify the multi-step form hook

**File**: `src/hooks/use-multi-step-form.ts`

Changes:
1. Add imports at top:
   ```typescript
   import { checkSubmissionStatus, markAsSubmitted, generateDeviceId } from "@/lib/submission-storage";
   ```

2. Add state variables inside `useMultiStepForm()`:
   ```typescript
   const [hasAlreadySubmitted, setHasAlreadySubmitted] = useState(false);
   const [submissionTimestamp, setSubmissionTimestamp] = useState<string | undefined>();
   ```

3. Add useEffect to check submission status on mount:
   ```typescript
   useEffect(() => {
     const status = checkSubmissionStatus();
     if (status.hasSubmitted) {
       setHasAlreadySubmitted(true);
       setSubmissionTimestamp(status.timestamp);
     }
   }, []);
   ```

4. Modify `handleFormSubmit`:
   - Add client-side duplicate check at the start:
     ```typescript
     const status = checkSubmissionStatus();
     if (status.hasSubmitted) {
       setHasAlreadySubmitted(true);
       setSubmissionTimestamp(status.timestamp);
       return;
     }
     ```
   - Get deviceId: `const deviceId = generateDeviceId();`
   - Add `device_id` to the POST body: `body: JSON.stringify({ ...currentValues, device_id: deviceId })`
   - Handle 429 response specifically:
     ```typescript
     if (response.status === 429) {
       markAsSubmitted(deviceId);
       setHasAlreadySubmitted(true);
       return;
     }
     ```
   - After successful submission (after `clearFormDraft()`):
     ```typescript
     markAsSubmitted(deviceId);
     ```

5. Add to return object:
   ```typescript
   hasAlreadySubmitted,
   submissionTimestamp,
   ```

### Step 3: Enhance the API route

**File**: `src/app/api/submit-preferences/route.ts`

Changes:
1. Add import at top:
   ```typescript
   import { createHash } from "crypto";
   import { supabaseAdmin } from "@/lib/supabase/server";
   ```

2. Add IP hashing helper (inside file, not exported):
   ```typescript
   function hashIP(ip: string): string {
     return createHash("sha256").update(ip).digest("hex");
   }
   ```

3. In POST handler, after content-type validation but BEFORE body parsing:
   - Extract IP:
     ```typescript
     const forwarded = request.headers.get("x-forwarded-for");
     const realIp = request.headers.get("x-real-ip");
     const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
     const ipHash = hashIP(ip);
     ```

4. After body validation, BEFORE the insert:
   - Check for recent submission from same IP:
     ```typescript
     const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
     const { data: existing } = await supabaseAdmin
       .from("anonymous_submissions")
       .select("id, submitted_at")
       .eq("ip_hash", ipHash)
       .gte("submitted_at", twentyFourHoursAgo)
       .limit(1);

     if (existing && existing.length > 0) {
       return NextResponse.json(
         { message: "You have already submitted your preferences recently. Please try again later." },
         { status: 429 }
       );
     }
     ```

5. Extract `device_id` from body: `const deviceId = body.device_id;`
   - Remove `device_id` from the validated data before insert (it's not part of the form schema)

6. Add to insertData:
   ```typescript
   ip_hash: ipHash,
   device_id: deviceId || null,
   submitted_at: new Date().toISOString(),
   ```

7. Keep using the existing `supabase` (anon) client for INSERT (RLS allows it).

### Step 4: Create AlreadySubmittedMessage component

**File**: `src/components/form/already-submitted-message.tsx`

Create a new component following the style of `submission-success-modal.tsx`:
- Use Shadcn `Card`, `CardHeader`, `CardContent`
- CheckCircle2 icon from lucide-react (green)
- Title: "Thank You!"
- Message: "You've already submitted your response."
- Show submission date/time if `timestamp` prop provided (format nicely)
- Contact text: "Need to update your response? Contact us at [organizer email or link]"
- Props: `{ timestamp?: string }`
- Mark as `"use client"` component

### Step 5: Update the form container

**File**: `src/components/form/anonymous-form-container.tsx`

Changes:
1. Import the new component:
   ```typescript
   import { AlreadySubmittedMessage } from "./already-submitted-message";
   ```

2. Destructure new values from hook:
   ```typescript
   const { ..., hasAlreadySubmitted, submissionTimestamp } = useMultiStepForm();
   ```

3. Add conditional render at the TOP of the return, before the form:
   ```typescript
   if (hasAlreadySubmitted) {
     return <AlreadySubmittedMessage timestamp={submissionTimestamp} />;
   }
   ```

## Files to Create/Modify

1. **CREATE**: `src/lib/supabase/server.ts` (service role client)
2. **CREATE**: `src/components/form/already-submitted-message.tsx`
3. **MODIFY**: `src/hooks/use-multi-step-form.ts`
4. **MODIFY**: `src/app/api/submit-preferences/route.ts`
5. **MODIFY**: `src/components/form/anonymous-form-container.tsx`

## Acceptance Criteria

- [ ] Returning users see AlreadySubmittedMessage instead of form
- [ ] Client-side check runs on mount (no unnecessary API calls)
- [ ] deviceId included in POST body
- [ ] API extracts and hashes IP with SHA256
- [ ] API checks for existing submission within 24h
- [ ] 429 returned for duplicate IP within 24h
- [ ] Hook handles 429 by marking as submitted locally
- [ ] `markAsSubmitted()` called after successful submission
- [ ] AlreadySubmittedMessage shows timestamp when available
- [ ] No plain IP stored anywhere
- [ ] Service role client in server-only file
- [ ] All error cases handled gracefully

## Integration Points

- Uses `src/lib/submission-storage.ts` (TASK-0071)
- Uses updated `src/types/database.types.ts` (TASK-0079)
- Uses existing Shadcn components (Card, Button)
- Uses existing Supabase client for INSERT
- New server client for SELECT queries

## Expected Deliverables

1. `src/lib/supabase/server.ts`
2. `src/components/form/already-submitted-message.tsx`
3. Modified `src/hooks/use-multi-step-form.ts`
4. Modified `src/app/api/submit-preferences/route.ts`
5. Modified `src/components/form/anonymous-form-container.tsx`

## Journal Requirements

Maintain journal at: `fairmind/journals/TASK-0080_echo_journal.md`
Update after each significant action or decision.
