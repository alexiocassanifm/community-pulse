# Work Package: Frontend - Topics & Event Formats Sections

**Task IDs**: TASK-2026-0055, TASK-2026-0056
**Date Created**: 2026-02-03
**Created By**: Atlas (Tech Lead)
**Skill to Load**: `frontend-react-nextjs`

## Task Overview

Implement the final two form sections (Topics of Interest and Event Format Preferences) by replacing placeholder components with full-featured, interactive sections. Both sections must integrate with existing form state management, validation, and localStorage persistence.

**User Stories:**
- US-2026-0092: Indicate topics of interest for future events
- US-2026-0091: Select and specify comprehensive event format preferences

## Critical Context

### Schema Already Exists
The validation schemas are already defined in `/Users/alexiocassani/Projects/meetup-app/src/lib/validations/form-schema.ts`:

**Topics Schema:**
```typescript
topicsSchema = z.object({
  predefined_topics: z.array(z.string()).optional(),
  custom_topics: z.string().max(300).optional(),
})
```

**Event Formats Schema:**
```typescript
eventFormatsSchema = z.object({
  format_presentations: z.boolean().optional(),
  format_workshops: z.boolean().optional(),
  format_discussions: z.boolean().optional(),
  format_networking: z.boolean().optional(),
  format_hackathons: z.boolean().optional(),
  format_mentoring: z.boolean().optional(),
  format_hybrid: z.enum(["in_person", "virtual", "hybrid", "no_preference"]).optional(),
  format_custom: z.string().max(500).optional(),
})
```

### Placeholder Files to Replace
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx`
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`

### Form Container Integration
The file `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx` imports and renders these components in the switch statement (cases 2 and 3). You will need to update the imports after creating the new components.

### Reference Components
Use these existing section components as patterns for implementation:
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx` - text inputs and selects
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/availability.tsx` - checkboxes and selects

## Execution Plan

### TASK 1: Topics of Interest Section (TASK-2026-0055)

#### Step 1.1: Create Topics Constants File
**File**: `/Users/alexiocassani/Projects/meetup-app/src/constants/topics.ts`

Define predefined topics with metadata:
```typescript
export const PREDEFINED_TOPICS = [
  { id: 'web-development', label: 'Web Development', category: 'Technical' },
  { id: 'mobile-development', label: 'Mobile Development', category: 'Technical' },
  { id: 'cloud-architecture', label: 'Cloud Architecture', category: 'Technical' },
  { id: 'devops-ci-cd', label: 'DevOps & CI/CD', category: 'Technical' },
  { id: 'data-science', label: 'Data Science & ML', category: 'Technical' },
  { id: 'ui-ux-design', label: 'UI/UX Design', category: 'Design' },
  { id: 'product-management', label: 'Product Management', category: 'Business' },
  { id: 'agile-scrum', label: 'Agile & Scrum', category: 'Methodologies' },
  { id: 'leadership', label: 'Leadership & Management', category: 'Soft Skills' },
  { id: 'communication', label: 'Communication Skills', category: 'Soft Skills' },
  { id: 'career-development', label: 'Career Development', category: 'Professional Growth' },
  { id: 'entrepreneurship', label: 'Entrepreneurship', category: 'Business' },
  { id: 'blockchain', label: 'Blockchain & Web3', category: 'Emerging Tech' },
  { id: 'ai-ethics', label: 'AI Ethics', category: 'Emerging Tech' },
  { id: 'sustainability', label: 'Sustainable Tech', category: 'Industry Trends' }
];

export const TOPIC_CATEGORIES = [
  'Technical',
  'Design',
  'Business',
  'Methodologies',
  'Soft Skills',
  'Professional Growth',
  'Emerging Tech',
  'Industry Trends'
];
```

#### Step 1.2: Replace Topics Placeholder Component
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/topics-placeholder.tsx`

Implementation requirements:
1. Import React Hook Form hooks (setValue, watch) from form prop
2. Import Checkbox, Label, Textarea from shadcn/ui components
3. Import PREDEFINED_TOPICS from constants file
4. Watch form state: `topics.predefined_topics` and `topics.custom_topics`
5. Create handler for topic checkbox toggle (add/remove from array)
6. Create handler for custom topics textarea (max 300 chars)
7. Group topics by category for organized display
8. Render section header (reuse existing from placeholder)
9. Render topics grouped by category in responsive grid (2-3 columns desktop, 1-2 mobile)
10. Render each topic as Checkbox with label
11. Render custom topics Textarea with character counter (show when > 200 chars)
12. Add helper text explaining optional nature and purpose
13. Ensure proper form field registration for React Hook Form
14. Follow patterns from availability.tsx for checkbox handling

**Character Counter Logic:**
- Always display counter: `{customTopics.length} / 300 characters`
- Show warning styling when approaching limit (> 280 chars)
- Prevent input beyond 300 characters

**Accessibility:**
- Proper aria-labels on all checkboxes
- Keyboard navigation support
- Screen reader friendly

#### Step 1.3: Rename Topics Placeholder Component
Since we're replacing the content but keeping the file:
1. Rename component from `TopicsPlaceholder` to `TopicsSection`
2. Keep the same props interface structure
3. Maintain same export pattern

### TASK 2: Event Format Preferences Section (TASK-2026-0056)

#### Step 2.1: Create Event Formats Constants File
**File**: `/Users/alexiocassani/Projects/meetup-app/src/constants/event-formats.ts`

Define format types and hybrid options:
```typescript
export const EVENT_FORMATS = [
  {
    id: 'presentations',
    label: 'Presentations & Talks',
    description: 'Structured presentations on specific topics (30-60 minutes)',
    icon: 'Presentation'
  },
  {
    id: 'workshops',
    label: 'Hands-on Workshops',
    description: 'Interactive sessions with practical exercises',
    icon: 'Wrench'
  },
  {
    id: 'discussions',
    label: 'Panel Discussions & Roundtables',
    description: 'Group conversations and Q&A sessions',
    icon: 'MessageCircle'
  },
  {
    id: 'networking',
    label: 'Networking Sessions',
    description: 'Structured or informal networking opportunities',
    icon: 'Users'
  },
  {
    id: 'hackathons',
    label: 'Hackathons & Challenges',
    description: 'Collaborative problem-solving events',
    icon: 'Code'
  },
  {
    id: 'mentoring',
    label: 'Mentoring & 1-on-1 Sessions',
    description: 'Individual or small group guidance sessions',
    icon: 'UserCheck'
  }
];

export const HYBRID_OPTIONS = [
  {
    value: 'in_person',
    label: 'In-Person Only',
    description: 'I prefer attending events physically at the venue'
  },
  {
    value: 'virtual',
    label: 'Virtual Only',
    description: 'I prefer attending events remotely online'
  },
  {
    value: 'hybrid',
    label: 'Hybrid (Flexible)',
    description: 'I want the option to choose in-person or virtual per event'
  },
  {
    value: 'no_preference',
    label: 'No Preference',
    description: 'I am comfortable with any attendance format'
  }
];
```

#### Step 2.2: Replace Event Formats Placeholder Component
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/event-formats-placeholder.tsx`

Implementation requirements:
1. Import React Hook Form hooks (setValue, watch) from form prop
2. Import Checkbox, Label, Textarea from shadcn/ui components
3. Import RadioGroup, RadioGroupItem from shadcn/ui
4. Import EVENT_FORMATS and HYBRID_OPTIONS from constants
5. Watch form state: all `event_formats.format_*` boolean fields, `event_formats.format_hybrid`, `event_formats.format_custom`
6. Create handler for format checkbox toggle (boolean field update)
7. Create handler for hybrid radio selection
8. Create handler for custom formats textarea (max 500 chars)
9. Render section header (reuse existing from placeholder)
10. Render "Preferred Event Types" subsection with format checkboxes in grid layout
11. Render "Attendance Preference" subsection with hybrid options as radio group
12. Render custom formats Textarea with character counter
13. Add informational callout explaining purpose
14. Follow patterns from availability.tsx for checkbox handling
15. Use proper form field registration

**Format Checkboxes:**
- Map each EVENT_FORMATS item to a Checkbox
- Use `event_formats.format_{id}` as field name
- Display icon (optional, can use lucide-react if desired), label, and description
- Grid layout: 2 columns on desktop, 1 on mobile

**Hybrid Radio Group:**
- Single selection behavior
- Map HYBRID_OPTIONS to RadioGroupItem components
- Display label and description for each option
- Use `event_formats.format_hybrid` as field name

**Custom Formats Field:**
- Textarea with max 500 characters
- Always show character counter: `{customFormats.length} / 500 characters`
- Placeholder with examples

**Accessibility:**
- Proper aria-labels on checkboxes and radio buttons
- Radio group has proper role and aria-checked states
- Keyboard navigation support

#### Step 2.3: Rename Event Formats Placeholder Component
Since we're replacing the content but keeping the file:
1. Rename component from `EventFormatsPlaceholder` to `EventFormatsSection`
2. Keep the same props interface structure
3. Maintain same export pattern

### TASK 3: Update Form Container Imports

#### Step 3.1: Update Anonymous Form Container
**File**: `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx`

Changes required:
1. Update import statement:
   - Change `EventFormatsPlaceholder` to `EventFormatsSection`
   - Change `TopicsPlaceholder` to `TopicsSection`
2. Update component references in switch statement (cases 2 and 3):
   - `<EventFormatsSection form={form} />` at case 2
   - `<TopicsSection form={form} />` at case 3

### TASK 4: Testing & Validation

#### Step 4.1: Manual Testing Checklist
Test both sections thoroughly:

**Topics Section:**
- Multiple topic selection works (add/remove topics)
- Topics grouped by category display correctly
- Custom topics textarea accepts input up to 300 chars
- Character counter displays and updates correctly
- Character limit enforcement prevents > 300 chars
- Form state persists when navigating between sections
- Keyboard navigation works (Tab, Space to toggle)
- All fields remain optional (can skip entire section)

**Event Formats Section:**
- Multiple format checkboxes can be selected simultaneously
- Format descriptions display clearly
- Hybrid radio group allows single selection only
- Hybrid selection can be changed freely
- Custom formats textarea accepts input up to 500 chars
- Character counter displays and updates correctly
- Character limit enforcement prevents > 500 chars
- Form state persists when navigating between sections
- Keyboard navigation works for both checkboxes and radio buttons
- All fields remain optional

**Integration Testing:**
- Form navigation works (Previous/Next buttons)
- Progress bar updates correctly
- Data persists to localStorage
- Form submission includes topics and event_formats data
- No console errors
- Responsive design works on mobile, tablet, desktop

#### Step 4.2: Accessibility Testing
- Test keyboard-only navigation
- Verify screen reader announcements (if possible)
- Check focus indicators are visible
- Verify proper ARIA labels

## Success Criteria

### Topics Section (TASK-2026-0055):
1. Display 15 predefined topics grouped by category
2. Multi-select functionality works without restrictions
3. Topics visually grouped with category headers
4. Selected topics show clear visual indication (checked state)
5. Custom topics textarea max 300 characters enforced
6. Character counter displays when appropriate
7. Placeholder text provides examples
8. All fields optional
9. Form state persists to localStorage
10. Fully keyboard accessible
11. Responsive design works on all screen sizes
12. Data submitted correctly with form payload

### Event Formats Section (TASK-2026-0056):
1. Display 6 predefined format options with descriptions
2. Multi-select checkboxes work simultaneously
3. Selected formats show clear visual indication
4. Four hybrid attendance options displayed
5. Hybrid options enforce single-selection (radio behavior)
6. Selected hybrid option shows visual indication
7. Custom formats textarea max 500 characters enforced
8. Character counter always displayed
9. Placeholder text provides examples
10. All fields optional
11. Form state persists to localStorage
12. Fully keyboard accessible (checkboxes and radio)
13. Responsive design works on all screen sizes
14. Data submitted correctly with form payload

### Integration:
15. Form container imports updated correctly
16. No TypeScript errors
17. No runtime errors
18. Navigation between sections works smoothly
19. Progress indicator updates correctly
20. Both sections integrate seamlessly with existing form flow

## Dependencies

- Existing schemas in form-schema.ts (already defined, do not modify)
- shadcn/ui components: Checkbox, Label, Textarea, RadioGroup, RadioGroupItem
- React Hook Form integration
- localStorage persistence (handled by existing form hooks)
- Existing form container and navigation structure

## Technical Notes

- **Do NOT modify form-schema.ts** - schemas are already defined and correct
- **Do NOT create new TypeScript type files** - use existing AnonymousFormData type
- **Follow existing patterns** from professional-background.tsx and availability.tsx
- **Component naming**: Rename from "Placeholder" to "Section" but keep files at same paths
- **No emojis** in code or UI text
- **Character limits**: Topics = 300 chars, Event Formats = 500 chars
- **Form field paths**: Use dot notation like `topics.predefined_topics` and `event_formats.format_presentations`
- **Optional validation**: All fields are optional, no required validation needed
- **Icons**: lucide-react icons are available if desired for visual enhancement (optional)
- **Responsive grid**: Use Tailwind classes like `grid grid-cols-1 md:grid-cols-2 gap-4`

## Resources

### Existing Files to Reference:
- `/Users/alexiocassani/Projects/meetup-app/src/lib/validations/form-schema.ts` - schemas and types
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/professional-background.tsx` - input patterns
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/sections/availability.tsx` - checkbox patterns
- `/Users/alexiocassani/Projects/meetup-app/src/components/form/anonymous-form-container.tsx` - form container

### shadcn/ui Documentation:
- Checkbox: Used for multi-select options
- RadioGroup: Used for single-select hybrid options
- Textarea: Used for custom input fields
- Label: Used for form field labels

## Journal Requirements

Maintain your journal at: `/Users/alexiocassani/Projects/meetup-app/fairmind/journals/TASK-0055-0056_echo_journal.md`

Update after completing each major step:
- Constants files creation
- Topics section implementation
- Event formats section implementation
- Form container updates
- Testing completion

Mark completion by creating flag file: `/Users/alexiocassani/Projects/meetup-app/fairmind/work_packages/frontend/TASK-0055-0056_frontend_complete.flag`

## Estimated Time

**Total: 4-6 hours**

- Topics constants + section: 2 hours
- Event formats constants + section: 2 hours
- Form container updates: 30 minutes
- Testing and refinement: 1-1.5 hours

## Implementation Notes

This work package combines two related tasks that share similar patterns and components. Both sections follow the same structure:
1. Constants file with predefined options
2. Multi-select capability (checkboxes)
3. Custom text input with character limits
4. Optional validation
5. localStorage persistence via existing form hooks

The event formats section adds a radio group for hybrid options, which is a new pattern but follows standard React Hook Form practices similar to the select components in professional-background.tsx.
