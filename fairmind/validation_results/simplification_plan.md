# Simplification Plan

## 1. Extract Shared Checkbox-List Pattern Across Section Components

**Current code**: The `availability.tsx`, `event-formats-placeholder.tsx`, and `topics-placeholder.tsx` components each repeat the same interactive checkbox-item pattern -- a clickable `div` with `role="checkbox"`, `aria-checked`, `onKeyDown` handler for Enter/Space, a nested `<Checkbox>` with `tabIndex={-1}` and `aria-hidden="true"`, and a label span. The pattern appears 3 times with nearly identical markup (approximately 15 lines each occurrence).

Additionally, `availability.tsx` and `topics-placeholder.tsx` both implement identical `toggleX` functions that copy an array, splice or push an item, then call `setValue`. This toggle-array logic is duplicated verbatim 3 times (`toggleDay`, `toggleTime`, `toggleTopic`).

**Simplified version**: Extract a reusable `CheckboxListItem` component that encapsulates the clickable container, keyboard handling, aria attributes, and inner Checkbox. Also extract a generic `toggleArrayItem` utility function.

```tsx
// src/components/form/checkbox-list-item.tsx
interface CheckboxListItemProps {
  id: string;
  checked: boolean;
  onToggle: () => void;
  label: string;
  description?: string;
  className?: string;
}

export function CheckboxListItem({ id, checked, onToggle, label, description, className }: CheckboxListItemProps) {
  return (
    <div
      className={cn("flex items-center gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2", className)}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      role="checkbox"
      aria-checked={checked}
      aria-labelledby={`label-${id}`}
      tabIndex={0}
    >
      <Checkbox checked={checked} onCheckedChange={onToggle} tabIndex={-1} aria-hidden="true" />
      <div>
        <span id={`label-${id}`} className="text-sm font-medium">{label}</span>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
```

```ts
// src/lib/form-utils.ts
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index >= 0) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }
  return [...array, item];
}
```

**Files affected**:
- `src/components/form/checkbox-list-item.tsx` (new)
- `src/lib/form-utils.ts` (new)
- `src/components/form/sections/availability.tsx` (use CheckboxListItem + toggleArrayItem)
- `src/components/form/sections/event-formats-placeholder.tsx` (use CheckboxListItem)
- `src/components/form/sections/topics-placeholder.tsx` (use CheckboxListItem + toggleArrayItem)

**Risk**: Low -- purely presentational extraction with identical behavior.

---

## 2. Simplify Event Formats Section: Eliminate Manual Field Mapping

**Current code**: `event-formats-placeholder.tsx` has a verbose pattern where 6 individual `watch()` calls produce 6 boolean variables, a `getFormatValue` switch statement maps format IDs back to those variables, a `toggleFormat` function uses a `fieldMap` Record to map format IDs to field paths, and a local `EventFormatBooleanField` type is defined just for this mapping. This is approximately 45 lines of boilerplate to manage 6 boolean fields.

**Simplified version**: Use a single `watch("event_formats")` call and derive values dynamically using template literal field paths. The format IDs in `EVENT_FORMATS` already correspond 1:1 with the `format_` prefixed field names.

```tsx
export function EventFormatsSection({ form }: EventFormatsSectionProps) {
  const { setValue, watch } = form;
  const eventFormats = watch("event_formats");

  function isFormatSelected(formatId: string): boolean {
    const key = `format_${formatId}` as keyof typeof eventFormats;
    return Boolean(eventFormats?.[key]);
  }

  function toggleFormat(formatId: string): void {
    const fieldPath = `event_formats.format_${formatId}` as const;
    setValue(fieldPath, !isFormatSelected(formatId), { shouldDirty: true });
  }
  // ... rest stays the same
}
```

This eliminates `getFormatValue`, the switch statement, `EventFormatBooleanField`, the `fieldMap` Record, and the 6 individual `watch()` calls (approximately 35 lines removed).

**Files affected**:
- `src/components/form/sections/event-formats-placeholder.tsx`

**Risk**: Low -- the field name convention `format_${formatId}` is already established in the schema and the existing `fieldMap`.

---

## 3. Extract Duplicate "Section Filled" Logic

**Current code**: The `isSectionFilled` function in `use-multi-step-form.ts` (lines 42-55) and the completion calculation in `api/submit-preferences/route.ts` (lines 60-71) contain the exact same value-checking logic:

```ts
// Both check: Array? length > 0. Boolean? true. String? trimmed length > 0. Otherwise non-null.
```

The logic is duplicated verbatim between client-side (hook) and server-side (API route).

**Simplified version**: Extract a shared `isSectionFilled` utility into `src/lib/form-utils.ts` and import it in both locations.

```ts
// src/lib/form-utils.ts
export function hasMeaningfulValues(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value === true;
    if (typeof value === "string") return value.trim().length > 0;
    return value !== undefined && value !== null;
  });
}
```

**Files affected**:
- `src/lib/form-utils.ts` (new or extended from proposal 1)
- `src/hooks/use-multi-step-form.ts` (import and use)
- `src/app/api/submit-preferences/route.ts` (import and use)

**Risk**: Low -- pure function, easily testable, same logic.

---

## 4. Extract Duplicate Default Values Constant

**Current code**: The `defaultValues` object in `use-anonymous-form.ts` (lines 12-41) is duplicated nearly identically in the `form.reset()` call inside `use-multi-step-form.ts` (lines 248-277). Both define the same structure with the same initial values for all 5 form sections.

**Simplified version**: Export `defaultValues` from `use-anonymous-form.ts` (or a shared constants location) and reference it in the `form.reset()` call.

```ts
// In use-anonymous-form.ts
export const DEFAULT_FORM_VALUES: AnonymousFormData = { ... };

// In use-multi-step-form.ts
form.reset(DEFAULT_FORM_VALUES);
```

**Files affected**:
- `src/hooks/use-anonymous-form.ts` (export the constant)
- `src/hooks/use-multi-step-form.ts` (import and use in `form.reset()`)

**Risk**: Low -- eliminates 25 lines of duplicated literal values.

---

## 5. Remove Dead Code and Unused Exports

**Current code**: Several exports are never imported anywhere else in the codebase:
- `hasValidDraft()` and `getDraftAge()` in `form-persistence.ts` -- only referenced within the same file (and `hasValidDraft` just calls `loadFormDraft`)
- `AnonymousFormInstance` type in `use-anonymous-form.ts` -- never imported
- `MultiStepFormInstance` type in `use-multi-step-form.ts` -- never imported
- `ProfessionalBackgroundData`, `AvailabilityData`, `EventFormatsData`, `TopicsData`, `GdprData` in `form-schema.ts` -- none are imported anywhere
- `EventFormatsPlaceholder` and `TopicsPlaceholder` backward-compat re-exports at bottom of their files -- neither alias is imported anywhere
- `ShadcnTest` component in `shadcn-test.tsx` -- test/demo component never used in the app
- `FormSection.icon` field in `types/form.ts` -- defined as a string but never read by any component (step-indicator uses numeric indices, not icon strings)
- `StepState.completionPercentage` field -- always initialized to `0` in `initializeStepStates` and never updated or read on the client side

**Simplified version**: Remove all dead exports. Delete `shadcn-test.tsx`. Remove `icon` from `FormSection` interface and from the `FORM_SECTIONS` constant entries. Remove `completionPercentage` from `StepState` (only used server-side where it is computed independently).

**Files affected**:
- `src/lib/form-persistence.ts` (remove `hasValidDraft`, `getDraftAge`)
- `src/hooks/use-anonymous-form.ts` (remove `AnonymousFormInstance`)
- `src/hooks/use-multi-step-form.ts` (remove `MultiStepFormInstance`, remove `completionPercentage: 0`)
- `src/lib/validations/form-schema.ts` (remove 5 unused individual section types)
- `src/components/form/sections/event-formats-placeholder.tsx` (remove `EventFormatsPlaceholder` re-export)
- `src/components/form/sections/topics-placeholder.tsx` (remove `TopicsPlaceholder` re-export)
- `src/components/shadcn-test.tsx` (delete file)
- `src/types/form.ts` (remove `icon` from `FormSection`, remove `completionPercentage` from `StepState`)

**Risk**: Low -- none of these exports are consumed. Search confirmed zero external references.

---

## 6. Simplify `goToPrevious` / `goToStep` Step-State Update Logic

**Current code**: `use-multi-step-form.ts` has three navigation functions (`goToNext`, `goToPrevious`, `goToStep`) that each independently map over `stepStates` to update the active/visited/completed status. `goToPrevious` also calls `updateStepState` before doing its own `setStepStates` map -- resulting in two state updates for a single navigation action. The `goToStep` function similarly has a redundant `updateStepState` call before the main `setStepStates` map that overwrites the same state.

**Simplified version**: Extract a single `navigateToStep(targetIndex)` function that handles all the step-state transitions in one pass, replacing the three separate functions. `goToNext`, `goToPrevious`, and `goToStep` become thin wrappers.

```ts
function navigateToStep(targetIndex: number, markCurrentCompleted: boolean): void {
  setStepStates((prev) =>
    prev.map((state, i) => {
      if (i === targetIndex) return { ...state, status: "active" };
      if (i === currentStep) {
        if (markCurrentCompleted) return { ...state, status: "completed" };
        return { ...state, status: state.status === "completed" ? "completed" : "visited" };
      }
      return state;
    })
  );
  setCurrentStep(targetIndex);
}
```

This eliminates the `updateStepState` helper (only used in navigation, now inlined) and removes approximately 30 lines of duplicated mapping logic.

**Files affected**:
- `src/hooks/use-multi-step-form.ts`

**Risk**: Medium -- navigation logic is critical; thorough testing needed. The behavior is preserved but the code path is consolidated.

---

## 7. Extract Shared Textarea-With-Counter Pattern

**Current code**: `event-formats-placeholder.tsx` and `topics-placeholder.tsx` both implement the same textarea-with-character-counter pattern:
- A controlled `<Textarea>` with a max-length check in `onChange`
- A character counter `span` that turns red near the limit
- Each has its own `handleCustomXChange` function that guards `value.length <= N`

The only differences are the max length (500 vs 300), the warning threshold (480 vs 280), the field path, and the placeholder text.

**Simplified version**: Extract a `TextareaWithCounter` component:

```tsx
interface TextareaWithCounterProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  warningThreshold?: number;  // defaults to maxLength - 20
  placeholder?: string;
  label?: string;
}
```

**Files affected**:
- `src/components/form/textarea-with-counter.tsx` (new)
- `src/components/form/sections/event-formats-placeholder.tsx` (use it)
- `src/components/form/sections/topics-placeholder.tsx` (use it)

**Risk**: Low -- presentational extraction only.

---

## 8. Consolidate localStorage Helpers Into a Single Utility

**Current code**: `form-persistence.ts` and `use-multi-step-form.ts` both implement the same `typeof window === "undefined"` guard + `try/catch` + `localStorage.get/set/remove` pattern. There are 7 separate functions across these two files that each independently guard against SSR and catch errors.

**Simplified version**: Create a thin `safeLocalStorage` utility with `get`, `set`, and `remove` methods that handle the SSR guard and error handling once.

```ts
// src/lib/safe-storage.ts
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {}
}
```

Then `form-persistence.ts` and `use-multi-step-form.ts` become much simpler -- each localStorage operation is a one-liner.

**Files affected**:
- `src/lib/safe-storage.ts` (new)
- `src/lib/form-persistence.ts` (simplify to use safe-storage)
- `src/hooks/use-multi-step-form.ts` (simplify `loadStepStates`, `saveStepStates`)

**Risk**: Low -- the behavior is identical, just centralized.

---

## 9. Rename Placeholder-Suffixed Files

**Current code**: `event-formats-placeholder.tsx` and `topics-placeholder.tsx` are fully implemented components despite their `-placeholder` suffix in the filename. The container imports them by these misleading names. This is leftover from when they were actual placeholders.

**Simplified version**: Rename files to `event-formats.tsx` and `topics.tsx`. Update the import in `anonymous-form-container.tsx`.

**Files affected**:
- `src/components/form/sections/event-formats-placeholder.tsx` -> `src/components/form/sections/event-formats.tsx`
- `src/components/form/sections/topics-placeholder.tsx` -> `src/components/form/sections/topics.tsx`
- `src/components/form/anonymous-form-container.tsx` (update imports)

**Risk**: Low -- file rename only, no logic changes.

---

## 10. Remove Redundant JSDoc Comments

**Current code**: Several files have JSDoc comments that repeat what the function signature already communicates. Examples:

```ts
/** Hook return type export */
export type MultiStepFormInstance = ReturnType<typeof useMultiStepForm>;

/** Storage key for localStorage */
const STORAGE_KEY = "anonymous-form-draft";

/** Time-to-live for form drafts (7 days in milliseconds) */
const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000;

/** Calculate overall progress percentage */
const progress = useMemo((): number => { ... });

/** Navigate to next step */
const goToNext = useCallback(() => { ... });
```

These comments restate the variable/function name without adding information. The code is self-documenting in these cases.

**Simplified version**: Remove comments that merely restate the declaration name. Keep comments that explain non-obvious behavior (such as the auto-save subscription comment in `use-multi-step-form.ts` line 81).

**Files affected**:
- `src/hooks/use-multi-step-form.ts`
- `src/hooks/use-anonymous-form.ts`
- `src/lib/form-persistence.ts`

**Risk**: Low -- no code changes, only comment removal.

---

## Summary Table

| # | Proposal | Lines Saved (est.) | Risk | Files |
|---|----------|--------------------|------|-------|
| 1 | Extract CheckboxListItem + toggleArrayItem | ~60 | Low | 5 |
| 2 | Simplify event formats field mapping | ~35 | Low | 1 |
| 3 | Extract shared isSectionFilled logic | ~15 | Low | 3 |
| 4 | Export and reuse default form values | ~25 | Low | 2 |
| 5 | Remove dead code and unused exports | ~45 | Low | 8 |
| 6 | Consolidate navigation step-state logic | ~30 | Medium | 1 |
| 7 | Extract TextareaWithCounter component | ~25 | Low | 3 |
| 8 | Consolidate localStorage helpers | ~30 | Low | 3 |
| 9 | Rename placeholder-suffixed files | 0 | Low | 3 |
| 10 | Remove redundant JSDoc comments | ~20 | Low | 3 |

**Total estimated lines saved**: ~285 across the codebase (approximately 1350 total lines of application code currently).

## Recommended Order of Execution

1. **#5** (dead code removal) -- zero-risk cleanup that reduces noise before other changes
2. **#9** (file renames) -- housekeeping, do early to avoid confusion during later changes
3. **#10** (redundant comments) -- quick cleanup pass
4. **#4** (default values) -- simple deduplication
5. **#8** (localStorage consolidation) -- foundation for other persistence work
6. **#3** (isSectionFilled extraction) -- depends on #8 being done
7. **#1** (CheckboxListItem) -- largest UI deduplication
8. **#7** (TextareaWithCounter) -- additional UI deduplication
9. **#2** (event formats simplification) -- can be combined with #1
10. **#6** (navigation consolidation) -- highest risk, do last with thorough testing
