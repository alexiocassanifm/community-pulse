# Code Fixes Required: Meetup App Anonymous Form
**Date**: 2026-02-04
**Reviewer**: Echo Code Reviewer
**Status**: Pending Frontend Echo Agent Assignment

## Priority 1: Critical Fixes (Must Complete Before Production)

### Fix 1.1: Remove Type Safety Violation
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`
**Line**: 49
**Priority**: CRITICAL
**Estimated Time**: 30 minutes

**Current Code**:
```typescript
const toggleFormat = (formatId: string) => {
  const fieldName = `event_formats.format_${formatId}` as keyof AnonymousFormData;
  const currentValue = getFormatValue(formatId);
  setValue(fieldName as any, !currentValue, { shouldDirty: true });
};
```

**Replacement Code**:
```typescript
type EventFormatBooleanField =
  | 'event_formats.format_presentations'
  | 'event_formats.format_workshops'
  | 'event_formats.format_discussions'
  | 'event_formats.format_networking'
  | 'event_formats.format_hackathons'
  | 'event_formats.format_mentoring';

const toggleFormat = (formatId: string) => {
  const fieldMap: Record<string, EventFormatBooleanField> = {
    presentations: 'event_formats.format_presentations',
    workshops: 'event_formats.format_workshops',
    discussions: 'event_formats.format_discussions',
    networking: 'event_formats.format_networking',
    hackathons: 'event_formats.format_hackathons',
    mentoring: 'event_formats.format_mentoring',
  };

  const fieldName = fieldMap[formatId];
  if (!fieldName) {
    console.warn(`Invalid format ID: ${formatId}`);
    return;
  }

  const currentValue = getFormatValue(formatId);
  setValue(fieldName, !currentValue, { shouldDirty: true });
};
```

**Validation**: TypeScript should compile without errors, no `as any` usage.

---

### Fix 1.2: Enforce GDPR Consent in Schema
**File**: `/Users/alexiocassani/Projects/meetup-app/src/lib/validations/form-schema.ts`
**Lines**: 51-56, 61-67
**Priority**: CRITICAL
**Estimated Time**: 20 minutes

**Current Code**:
```typescript
export const gdprSchema = z.object({
  data_retention_acknowledged: z.boolean(),
});

export const anonymousFormSchema = z.object({
  professional_background: professionalBackgroundSchema.optional(),
  availability: availabilitySchema.optional(),
  event_formats: eventFormatsSchema.optional(),
  topics: topicsSchema.optional(),
  gdpr: gdprSchema.optional(),
});
```

**Replacement Code**:
```typescript
export const gdprSchema = z.object({
  data_retention_acknowledged: z.literal(true, {
    errorMap: () => ({
      message: "You must acknowledge the data retention policy to submit"
    }),
  }),
});

export const anonymousFormSchema = z.object({
  professional_background: professionalBackgroundSchema.optional(),
  availability: availabilitySchema.optional(),
  event_formats: eventFormatsSchema.optional(),
  topics: topicsSchema.optional(),
  gdpr: gdprSchema, // Required field
});
```

**Side Effects**:
- Update default values in `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-anonymous-form.ts` line 39
- Ensure form reset in `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-multi-step-form.ts` line 274-276 sets this to false

**Validation**:
1. Form should not allow submission without GDPR consent
2. API validation should pass with updated schema
3. TypeScript type for AnonymousFormData should reflect required gdpr field

---

### Fix 1.3: Add Field Validation Error Display
**Files**: All form section components
**Priority**: CRITICAL
**Estimated Time**: 2 hours

**Affected Files**:
1. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx`
2. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/availability.tsx`
3. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`
4. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx`
5. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/gdpr-consent.tsx`

**Example Fix for professional-background.tsx**:

**Current Pattern (lines 41-48)**:
```typescript
<div className="space-y-2">
  <Label htmlFor="professional_role">Current Role</Label>
  <Input
    id="professional_role"
    placeholder="e.g. Software Engineer, Product Manager"
    {...register("professional_background.professional_role")}
  />
</div>
```

**Replacement Pattern**:
```typescript
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

<FormField
  control={form.control}
  name="professional_background.professional_role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Current Role</FormLabel>
      <FormControl>
        <Input
          placeholder="e.g. Software Engineer, Product Manager"
          {...field}
          value={field.value || ''}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Apply Similar Pattern To**:
- All Input fields
- All Select fields
- All Textarea fields
- Checkbox groups (show error below group)

**Validation**:
1. Trigger validation by submitting form with invalid data
2. Error messages should appear below each field
3. Error messages should be accessible via screen reader

---

### Fix 1.4: Add Keyboard Navigation to Custom Checkboxes
**Files**:
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/availability.tsx`
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx`

**Priority**: CRITICAL (Accessibility)
**Estimated Time**: 1 hour

**Current Pattern (availability.tsx lines 89-101)**:
```typescript
<label
  key={day}
  className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors"
>
  <Checkbox
    checked={preferredDays.includes(day)}
    onCheckedChange={() => toggleDay(day)}
  />
  <span className="text-sm">{day}</span>
</label>
```

**Replacement Pattern**:
```typescript
<div
  key={day}
  className="flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
  onClick={() => toggleDay(day)}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDay(day);
    }
  }}
  role="checkbox"
  aria-checked={preferredDays.includes(day)}
  aria-labelledby={`day-label-${day}`}
  tabIndex={0}
>
  <Checkbox
    checked={preferredDays.includes(day)}
    onCheckedChange={() => toggleDay(day)}
    tabIndex={-1}
    aria-hidden="true"
  />
  <span id={`day-label-${day}`} className="text-sm">{day}</span>
</div>
```

**Apply to**:
1. Day checkboxes in availability.tsx
2. Time checkboxes in availability.tsx
3. Event format checkboxes in event-formats-placeholder.tsx
4. Topic checkboxes in topics-placeholder.tsx

**Validation**:
1. Tab through form - each checkbox should be focusable
2. Press Space/Enter on focused checkbox - should toggle
3. Screen reader should announce "checkbox, [label], checked/unchecked"

---

### Fix 1.5: Fix Professional Background Type Assertion
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx`
**Line**: 57
**Priority**: HIGH
**Estimated Time**: 15 minutes

**Current Code**:
```typescript
onValueChange={(value) =>
  setValue(
    "professional_background.experience_level",
    value as AnonymousFormData["professional_background"] extends { experience_level?: infer T } ? T : never,
    { shouldDirty: true }
  )
}
```

**Replacement Code**:
```typescript
import { ExperienceLevel } from "@/types/database.types";

onValueChange={(value) =>
  setValue(
    "professional_background.experience_level",
    value as ExperienceLevel,
    { shouldDirty: true, shouldValidate: true }
  )
}
```

**Validation**: TypeScript compiles without complex type inference errors.

---

## Priority 2: High-Priority Improvements

### Fix 2.1: Remove Unused Hook Files
**Files**:
- `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-form-navigation.ts`
- `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-form-persistence.ts`

**Priority**: MEDIUM
**Estimated Time**: 15 minutes

**Action**:
1. Verify files are not imported anywhere: `grep -r "use-form-navigation\|use-form-persistence" src/`
2. If unused, delete both files
3. If used, document why both patterns exist

**Rationale**: These files duplicate functionality in `use-multi-step-form.ts` and create maintenance confusion.

---

### Fix 2.2: Optimize Progress Calculation
**File**: `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-multi-step-form.ts`
**Lines**: 104-109, 299
**Priority**: MEDIUM
**Estimated Time**: 10 minutes

**Current Code**:
```typescript
const calculateProgress = useCallback((): number => {
  const completedCount = stepStates.filter(
    (s) => s.status === "completed"
  ).length;
  return Math.round((completedCount / FORM_SECTIONS.length) * 100);
}, [stepStates]);

// Later...
progress: calculateProgress(),
```

**Replacement Code**:
```typescript
const progress = useMemo((): number => {
  const completedCount = stepStates.filter(
    (s) => s.status === "completed"
  ).length;
  return Math.round((completedCount / FORM_SECTIONS.length) * 100);
}, [stepStates]);

// Later...
progress,
```

**Validation**: Progress updates correctly when steps complete, no performance regression.

---

### Fix 2.3: Add Error Boundary
**New File**: `/Users/alexiocassani/Projects/meetup-app/src/components/error-boundary.tsx`
**Priority**: MEDIUM
**Estimated Time**: 30 minutes

**Create New Component**:
```typescript
"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Form error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>We encountered an error loading the form. Please try refreshing the page.</p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="text-xs mt-2 p-2 bg-muted rounded">
                {this.state.error.message}
              </pre>
            )}
            <Button
              variant="outline"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Refresh Page
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

**Update**: `/Users/alexiocassani/Projects/meetup-app/src/app/form/page.tsx`
```typescript
import { FormErrorBoundary } from "@/components/error-boundary";

export default function FormPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <FormErrorBoundary>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* existing content */}
        </div>
      </FormErrorBoundary>
    </div>
  );
}
```

---

### Fix 2.4: Add ARIA Live Announcements
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx`
**Priority**: MEDIUM (Accessibility)
**Estimated Time**: 20 minutes

**Add After Line 67** (after Progress component):
```typescript
{/* Screen reader announcement for step changes */}
<div className="sr-only" aria-live="polite" aria-atomic="true">
  Step {currentStep + 1} of {stepStates.length}: {FORM_SECTIONS[currentStep].title}.
  {FORM_SECTIONS[currentStep].description}
</div>
```

**Add useEffect for Focus Management** (after line 31):
```typescript
// Focus first interactive element when step changes
useEffect(() => {
  const container = document.querySelector('[role="region"]');
  if (!container) return;

  const firstInteractive = container.querySelector<HTMLElement>(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );

  if (firstInteractive) {
    // Small delay to ensure content has rendered
    setTimeout(() => firstInteractive.focus(), 100);
  }
}, [currentStep]);
```

---

## Priority 3: Important Non-Blocking Improvements

### Fix 3.1: Add Loading States
**File**: `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-multi-step-form.ts`
**Priority**: LOW
**Estimated Time**: 45 minutes

**Add State**:
```typescript
const [isInitializing, setIsInitializing] = useState(true);

// Add useEffect
useEffect(() => {
  // Small delay to ensure localStorage is loaded
  const timer = setTimeout(() => {
    setIsInitializing(false);
  }, 50);

  return () => clearTimeout(timer);
}, []);
```

**Update anonymous-form-container.tsx**:
```typescript
const { isInitializing, ...rest } = useMultiStepForm();

if (isInitializing) {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="space-y-3 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </CardHeader>
    </Card>
  );
}
```

---

### Fix 3.2: Improve Console Logging
**Files**: All files using console.error
**Priority**: LOW
**Estimated Time**: 30 minutes

**Replace**:
```typescript
console.error("Failed to save form draft:", error);
```

**With**:
```typescript
if (process.env.NODE_ENV === 'development') {
  console.error("Failed to save form draft:", error);
}
// Consider adding error reporting service in production
```

---

### Fix 3.3: Add Character Counters to All Text Fields
**Files**:
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx` (already has)
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx` (already has)
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx` (needs)

**Priority**: LOW
**Estimated Time**: 20 minutes

**Add to professional_role, industry fields**:
```typescript
<div className="flex justify-end mt-1">
  <span className="text-xs text-muted-foreground">
    {(watch("professional_background.professional_role") || "").length} / 100 characters
  </span>
</div>
```

---

## Testing Requirements

After implementing fixes, the following tests MUST be created:

### Critical Test Coverage:
1. **Schema Validation Tests** (`__tests__/lib/form-schema.test.ts`):
   - GDPR consent required
   - Optional fields validation
   - Character limits enforcement

2. **Type Safety Tests** (`__tests__/types/form-types.test.ts`):
   - No `any` types in production code
   - Type inference works correctly
   - Database types match form types

3. **Accessibility Tests** (`__tests__/a11y/form-accessibility.test.tsx`):
   - Keyboard navigation works
   - ARIA labels present
   - Focus management correct
   - Screen reader compatibility

4. **Integration Tests** (`__tests__/integration/form-submission.test.tsx`):
   - Full form submission flow
   - Error handling
   - Validation feedback
   - Success modal

### Test Command:
```bash
npm run test:ci
```

## Validation Checklist

Before marking fixes as complete, verify:

- [ ] TypeScript compiles with no errors (`npm run type-check`)
- [ ] ESLint passes with no warnings (`npm run lint`)
- [ ] All tests pass (`npm run test`)
- [ ] Accessibility audit passes (`npm run test:a11y`)
- [ ] Manual keyboard navigation test completed
- [ ] Manual screen reader test completed
- [ ] Form submission with valid data succeeds
- [ ] Form submission with invalid data shows errors
- [ ] Form persistence works across page refreshes
- [ ] Success modal displays after submission
- [ ] Error states are user-friendly

## Summary

**Total Critical Fixes**: 5
**Total High-Priority Fixes**: 4
**Total Low-Priority Fixes**: 3
**Estimated Total Time**: 6-8 hours

**Recommended Approach**:
1. Fix all Priority 1 items first (4-5 hours)
2. Add basic test coverage (2-3 hours)
3. Fix Priority 2 items (2 hours)
4. Add comprehensive tests (4-5 hours)
5. Fix Priority 3 items as time permits (1-2 hours)

**Assigned To**: Frontend Echo Agent
**Deadline**: Within 3 business days for Priority 1 & 2
