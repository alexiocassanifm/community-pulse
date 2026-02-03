# Work Package: Frontend - Anonymous Form Container with Multi-Step Navigation

**Task IDs**: TASK-2026-0050, TASK-2026-0051, TASK-2026-0052
**Date Created**: 2026-02-03
**Created By**: Atlas (Tech Lead)
**Skill(s) to Load**: frontend-react-nextjs
**Agent**: Echo (Software Engineer)

## Task Overview

Implement the main anonymous form container component that orchestrates the multi-section preference submission system. This work package combines three tightly coupled tasks that must be implemented together:

1. **Form Container with Progress Indicator** (Task 7/TASK-2026-0050)
2. **Form State Management with localStorage** (Task 8/TASK-2026-0051)
3. **Multi-Step Navigation** (Task 9/TASK-2026-0052)

The result will be a complete, functional anonymous form with 4 sections, visual progress tracking, automatic save/restore, and intuitive navigation.

## Context from FairMind

**User Stories**:
- US-2026-0093: Submit preferences anonymously with flexible completion and clear feedback
- US-2026-0094: Access and complete preference form on mobile devices

**Project**: Meetup App (ID: 6981fb9c4b2c601246796a08)
**Working Directory**: /Users/alexiocassani/Projects/meetup-app

## Existing Infrastructure (Already Built)

You have the following infrastructure already in place:

1. **Validation Schemas**: `/Users/alexiocassani/Projects/meetup-app/src/lib/validations/form-schema.ts`
   - Complete Zod schemas for all 5 sections
   - TypeScript types exported

2. **Form Hook**: `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-anonymous-form.ts`
   - Basic React Hook Form setup with Zod resolver
   - Default values structure

3. **Persistence Utilities**: `/Users/alexiocassani/Projects/meetup-app/src/lib/form-persistence.ts`
   - saveFormDraft(), loadFormDraft(), clearFormDraft()
   - 7-day TTL, corrupted data handling

4. **Form Types**: `/Users/alexiocassani/Projects/meetup-app/src/types/form.ts`
   - FormSection interface
   - StepStatus type: "completed" | "active" | "visited" | "available" | "locked"
   - StepState interface
   - FORM_SECTIONS array (4 sections)

5. **Existing Components**:
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/step-indicator.tsx` (visual step indicator)
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/form-navigation.tsx` (Previous/Next/Submit buttons)
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/privacy-notice.tsx` (privacy banner)
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx` (section 1)
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/availability.tsx` (section 2)
   - `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx` (section 4 placeholder)

6. **shadcn/ui Components**: button, input, label, checkbox, radio-group, select, textarea, card, form, progress, toast

7. **Project Stack**: Next.js 14, TypeScript, App Router, Tailwind CSS, React Hook Form, Zod

## Execution Plan

### Phase 1: Enhanced Form State Hook with Auto-Save

**Objective**: Extend the existing useAnonymousForm hook to support multi-step navigation, section completion tracking, auto-save with debounce, and progress calculation.

**File to Create**: `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-multi-step-form.ts`

**Requirements**:
1. Import and extend the existing useAnonymousForm hook
2. Add multi-step state management:
   - currentStep (0-3)
   - stepStates array tracking completion/visited/active status for each section
3. Implement debounced auto-save (1 second delay):
   - Use React Hook Form's watch() to subscribe to form changes
   - Save to localStorage using existing saveFormDraft() utility
   - Handle errors gracefully
4. Load saved draft on initialization:
   - Use loadFormDraft() to restore data
   - Restore step states from localStorage
   - Calculate which step to start on based on saved progress
5. Section completion tracking:
   - Function to check if a section has any filled fields
   - Update stepStates when sections are completed
   - Persist stepStates to localStorage separately
6. Progress calculation:
   - calculateProgress(): percentage based on completed sections
   - calculateStepProgress(): percentage based on current position
7. Navigation functions:
   - goToNext(): validate current section, mark as completed/visited, advance
   - goToPrevious(): move back one step
   - goToStep(index): direct navigation with validation
   - canNavigateToStep(index): permission checking
8. Form submission:
   - handleSubmit(): validate all fields, submit to API, clear localStorage on success
   - Error handling with toast notifications

**Dependencies**:
- Existing: useAnonymousForm, saveFormDraft, loadFormDraft, clearFormDraft
- New: debounce utility (create inline or import from lodash if available)
- localStorage keys: 'anonymous-form-draft' (data), 'anonymous-form-steps' (step states)

**Expected Output**: A comprehensive custom hook that returns:
```typescript
{
  form: UseFormReturn<AnonymousFormData>,
  currentStep: number,
  stepStates: StepState[],
  progress: number,
  goToNext: () => void,
  goToPrevious: () => void,
  goToStep: (index: number) => void,
  canNavigateToStep: (index: number) => boolean,
  handleFormSubmit: () => Promise<void>,
  isSubmitting: boolean,
  formValues: AnonymousFormData
}
```

### Phase 2: Event Formats Placeholder Component

**Objective**: Create a placeholder component for the Event Formats section (to be fully built in Phase 2 Tasks 12-13).

**File to Create**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`

**Requirements**:
1. Accept form prop: UseFormReturn<AnonymousFormData>
2. Render section header: "Event Formats"
3. Display description: "How do you like to learn and engage?"
4. Show placeholder content in dashed border box: "Event Formats section — coming in Phase 2"
5. Use same styling pattern as topics-placeholder.tsx

**Expected Output**: Functional placeholder component matching the design system.

### Phase 3: Main Form Container Component

**Objective**: Create the main AnonymousFormContainer that orchestrates all sections, navigation, and progress visualization.

**File to Create**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx`

**Requirements**:
1. Use the custom useMultiStepForm hook for state management
2. Wrap form in FormProvider from react-hook-form
3. Render the following in order:
   - Card component wrapping entire form
   - PrivacyNotice at the top
   - StepIndicator component (pass stepStates, currentStep, onStepClick handler)
   - Progress component from shadcn/ui showing completion percentage
   - Current section component based on currentStep:
     - 0: ProfessionalBackground
     - 1: Availability
     - 2: EventFormatsPlaceholder
     - 3: TopicsPlaceholder
   - FormNavigation component at the bottom
4. Handle navigation callbacks:
   - onPrevious: call goToPrevious()
   - onNext: call goToNext()
   - onSubmit: call handleFormSubmit()
   - onStepClick: call goToStep(index)
5. Show toast notifications:
   - Auto-save success (optional, subtle)
   - Submission success
   - Errors
6. Smooth transitions between sections (optional fade/slide animation)
7. Responsive layout (mobile-first)
8. Screen reader announcements for progress updates

**Expected Output**: Complete form container component ready to be rendered on a page.

### Phase 4: Form Page Integration

**Objective**: Create or update the form page to render the AnonymousFormContainer.

**File to Create/Update**: `/Users/alexiocassani/Projects/meetup-app/src/app/form/page.tsx`

**Requirements**:
1. Create new app/form directory if it doesn't exist
2. Create page.tsx with:
   - Page metadata (title, description)
   - Import AnonymousFormContainer
   - Render with appropriate layout (centered, max-width, padding)
   - Add page heading "Share Your Preferences Anonymously"
   - Add optional subheading explaining the purpose
3. Ensure the page is accessible from the main navigation (if applicable)

**Expected Output**: Accessible form page at /form route.

### Phase 5: API Route for Form Submission

**Objective**: Create the API endpoint to receive and store anonymous form submissions.

**File to Create**: `/Users/alexiocassani/Projects/meetup-app/src/app/api/submit-preferences/route.ts`

**Requirements**:
1. Create POST handler
2. Validate request body using anonymousFormSchema
3. Store to Supabase 'anonymous_preferences' table:
   - All form fields from the schema
   - submitted_at timestamp
   - Handle optional fields correctly (store null if not provided)
4. Return success response with submission ID (optional)
5. Error handling:
   - Validation errors: return 400 with details
   - Database errors: return 500
   - Log errors for debugging
6. CORS headers if needed
7. Rate limiting consideration (future enhancement, just add TODO comment)

**Expected Output**: Functional API endpoint accepting anonymous form submissions.

### Phase 6: Testing and Refinement

**Objective**: Test the complete flow and fix any issues.

**Testing Checklist**:
1. Form loads with default empty state
2. Form fields can be filled and update state
3. Auto-save works after 1 second of inactivity
4. Progress indicator updates as sections are completed
5. Navigation between sections works (Previous/Next/Direct)
6. Step states update correctly (completed, active, visited, available, locked)
7. Returning users see restored progress
8. Form submission works and clears localStorage
9. Validation errors display correctly
10. Mobile responsive design works
11. Keyboard navigation works
12. Screen reader announces progress
13. Edge cases:
    - Corrupted localStorage data
    - Network errors on submission
    - localStorage quota exceeded
    - Expired draft data (7 days)

**Refinement Tasks**:
- Adjust debounce timing if needed
- Fine-tune animations
- Improve error messages
- Optimize performance
- Fix any accessibility issues

## Architectural Constraints

1. **All fields are optional**: Users can submit with minimal information
2. **No authentication required**: Form is completely anonymous
3. **Client-side persistence only**: localStorage for drafts, Supabase for final submissions
4. **7-day draft expiry**: Auto-clear old drafts
5. **Graceful degradation**: Form works even if localStorage is disabled
6. **Mobile-first responsive design**: Works on all screen sizes
7. **WCAG 2.1 AA compliance**: Full accessibility support

## Dependencies

**Existing Infrastructure**:
- useAnonymousForm hook
- Form persistence utilities (save/load/clear)
- Zod schemas
- Form types
- Existing section components
- StepIndicator, FormNavigation, PrivacyNotice components

**External Libraries** (already installed):
- react-hook-form
- @hookform/resolvers
- zod
- @radix-ui components (via shadcn/ui)
- lucide-react (icons)

**No new dependencies required**.

## Acceptance Criteria

### Form Container (Task 7):
- [x] AnonymousFormContainer renders with all four sections defined
- [x] Progress indicator displays current step and percentage completion
- [x] Users can navigate forward through sections using Next button
- [x] Users can navigate backward through sections using Previous button
- [x] Completed sections are visually marked in progress indicator
- [x] Privacy notice is prominently displayed
- [x] Final section shows Submit button instead of Next
- [x] Submission displays loading state
- [x] Successful submission shows confirmation
- [x] Component is responsive and works on mobile devices
- [x] All navigation is keyboard accessible

### Form State Management (Task 8):
- [x] React Hook Form is initialized with proper configuration
- [x] Form loads with default empty values on first visit
- [x] Form automatically saves to localStorage as user fills fields (debounced)
- [x] Returning users see their previous progress restored
- [x] Data expires after 7 days and is automatically cleared
- [x] Section completion status is calculated correctly
- [x] Overall progress percentage is calculated and updates in real-time
- [x] Form submission validates all fields before sending to API
- [x] localStorage is cleared after successful submission
- [x] localStorage errors are handled gracefully
- [x] Corrupted localStorage data is cleared and defaults are restored

### Multi-Step Navigation (Task 9):
- [x] Progress bar displays both completion percentage and current position
- [x] Step indicators show all four sections with appropriate states
- [x] Current step is visually highlighted
- [x] Completed sections display checkmark icon
- [x] Previous button is disabled on first step
- [x] Next button changes to Submit button on last step
- [x] Users can click on step indicators to navigate to available sections
- [x] Cannot skip ahead to sections that haven't been visited
- [x] Smooth animations occur between section transitions (optional)
- [x] Progress percentage updates in real-time
- [x] Navigation state persists in localStorage
- [x] Fully responsive across all devices
- [x] All interactive elements are keyboard accessible
- [x] Screen readers announce progress updates

## Expected Deliverables

1. `/Users/alexiocassani/Projects/meetup-app/src/hooks/use-multi-step-form.ts` - Enhanced form state hook
2. `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx` - Placeholder component
3. `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx` - Main container component
4. `/Users/alexiocassani/Projects/meetup-app/src/app/form/page.tsx` - Form page
5. `/Users/alexiocassani/Projects/meetup-app/src/app/api/submit-preferences/route.ts` - API endpoint
6. Updated journal at `/Users/alexiocassani/Projects/meetup-app/fairmind/journals/TASK-0050-0051-0052_echo_journal.md`

## Journal Requirements

Maintain your work journal at: `/Users/alexiocassani/Projects/meetup-app/fairmind/journals/TASK-0050-0051-0052_echo_journal.md`

Update after each phase with:
- What was implemented
- Key decisions made
- Any deviations from the plan
- Issues encountered and resolutions
- Next steps

When complete, create a completion flag: `/Users/alexiocassani/Projects/meetup-app/fairmind/work_packages/frontend/TASK-0050-0051-0052_frontend_complete.flag`

## Success Criteria

The implementation is complete when:
1. All files are created and functional
2. Form loads and displays correctly
3. All navigation works (Previous/Next/Direct)
4. Auto-save persists data to localStorage
5. Form submission successfully stores to Supabase
6. All acceptance criteria are met
7. Build passes without errors (`npm run build`)
8. Form works on mobile, tablet, and desktop
9. Keyboard navigation and screen readers work
10. All placeholders are in place for Phase 2 sections

## Notes

- **Focus on placeholders**: Event Formats and Topics sections are placeholders only. They will be fully implemented in Phase 2 Tasks 12-13.
- **Reuse existing components**: StepIndicator, FormNavigation, and PrivacyNotice are already built and styled.
- **localStorage keys**: Use consistent prefixing (e.g., 'anonymous-form-draft', 'anonymous-form-steps')
- **Error boundaries**: Consider adding error boundary around form container for graceful error handling
- **Performance**: Debounce is critical to prevent excessive localStorage writes
- **Accessibility**: Test with keyboard-only navigation and screen readers
- **Future enhancements**: Route-based navigation (/form/professional, /form/availability) can be added later

## Additional Context

This is a critical Phase 1 milestone. The form container is the foundation for the entire anonymous preference submission system. All subsequent sections (Phase 2) will plug into this container architecture.

The three tasks are tightly coupled because:
- Form state management (Task 8) depends on the container structure (Task 7)
- Multi-step navigation (Task 9) requires the state management from Task 8
- All three must work together seamlessly for a functional form

Take your time to implement this correctly. Test thoroughly at each phase before moving to the next.

## Ready to Begin

Echo, please load the `frontend-react-nextjs` skill and begin implementation following the execution plan above. Start with Phase 1 (Enhanced Form State Hook), then proceed through each phase sequentially. Maintain your journal throughout and create the completion flag when done.

Good luck!
