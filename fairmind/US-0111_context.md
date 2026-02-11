# User Story US-2026-0111: Event Format Preference Charts - Complete Context

**Generated:** 2026-02-09
**Project:** Meetup App
**Session:** MVP (SESSION-2026-0028)
**Project ID:** 6981fb9c4b2c601246796a08

---

## User Story Details

**ID:** US-2026-0111 (mindstreamId: 6988b69b4a70cbc8ae23a606)
**Title:** Event Format Preference Charts
**Need:** NEED-2026-0072 - Data-Driven Event Planning Dashboard
**Role:** Meetup Organizer (roleId: 6982012fcea45201216764bc)
**Status:** Active
**Created:** 2026-02-08T16:15:00
**Session:** MVP

### Description

As a Meetup Organizer, I want to visualize event format preferences through interactive bar and pie charts so that I can quickly understand which event formats are most popular among participants and make data-driven decisions about event programming.

### User Steps

1. Navigate to the organizer dashboard and access the "Event Format Analysis" section
2. View a bar chart showing the count of participants who selected each format type (presentations, workshops, discussions, networking sessions)
3. View a pie chart displaying the percentage distribution of format preferences across all submissions
4. Toggle between different chart types (bar chart vs pie chart) based on preference
5. Hover over chart elements to see detailed tooltips with exact counts and percentages
6. Review hybrid format preferences shown separately to understand interest in combined in-person/virtual events
7. Filter chart data by date range or other criteria to see format preference trends over time

### Acceptance Criteria

- The system must display a bar chart showing participant counts for each predefined format type: presentations, workshops, discussions, and networking sessions
- Users can view a pie chart showing percentage distribution of format preferences with clear labels and color coding
- Given multiple formats can be selected by participants, when aggregating data, then the system counts each format selection independently (not mutually exclusive)
- Chart tooltips must display on hover showing exact counts, percentages, and format names
- The interface must include a toggle or tabs to switch between bar chart and pie chart views
- Hybrid format interest must be displayed as a separate metric or chart element showing percentage of participants interested in hybrid events
- Given the organizer filters by date range, when the filter is applied, then all charts update to reflect only submissions within that date range
- Charts must be responsive and display properly on desktop, tablet, and mobile devices
- The visualization must handle zero data gracefully with appropriate "No data available" messages

### Additional Considerations

- Implement using a charting library compatible with React and Next.js (recommend: Recharts, Chart.js with react-chartjs-2, or Tremor)
- Store chart data in component state fetched from `/api/analytics/formats` endpoint
- Use shadcn/ui Card components to wrap each chart for consistent styling
- Consider implementing a "Custom Formats" section showing free-text format preferences as a word cloud or frequency list
- Chart colors should follow the application's design system and be accessible (sufficient contrast, colorblind-friendly palette)
- Include export functionality allowing organizers to download chart images as PNG or SVG
- Performance consideration: Cache aggregated chart data on the backend to avoid recalculating on every request
- Future enhancement: Allow organizers to compare format preferences across different time periods side-by-side
- Accessibility: Ensure charts have proper ARIA labels and keyboard navigation support
- The anonymous_submissions table has boolean fields for format preferences: format_presentations, format_workshops, format_discussions, format_networking, format_hybrid, and format_other_text

---

## Parent Need

**ID:** NEED-2026-0072 (mindstreamId: 698200bdcea45201216764af)
**Title:** Data-Driven Event Planning Dashboard

**Description:**
As a meetup organizer, I need a dashboard that aggregates anonymous participant data (profiles, availability, format preferences, feedback) so that I can make evidence-based decisions on event timing, format, and frequency.

---

## Related User Stories

The following user stories are part of the same need and may have dependencies or shared components:

### US-2026-0106: Secure Organizer Authentication System
Authentication system for organizers to access the dashboard.

### US-2026-0107: Main Dashboard Overview with Key Metrics
Dashboard landing page with key metrics (total submissions, completion rate, trends).

### US-2026-0108: Response Trends Over Time Visualization
Time-series charts showing submission trends by day/week/month.

### US-2026-0109: Data Export Functionality with Date Filtering
CSV/JSON export with optional date range filtering.

### US-2026-0110: Availability Heatmap for Optimal Event Scheduling
Calendar heatmap showing preferred meeting days and times.

### US-2026-0112: Demographic Breakdowns
Charts showing participant distribution by role, seniority, industry, and skills.

### US-2026-0113: Date Range Filtering
Global date range filter for all dashboard visualizations.

### US-2026-0114: Analytics API Endpoints
Backend API endpoints for aggregating and serving dashboard data.

---

## Database Schema

The format preference data is stored in the `anonymous_submissions` table:

```sql
-- Event Formats (from migrations/001_create_anonymous_submissions.sql)
format_presentations BOOLEAN DEFAULT false,
format_workshops BOOLEAN DEFAULT false,
format_discussions BOOLEAN DEFAULT false,
format_networking BOOLEAN DEFAULT false,
format_hackathons BOOLEAN DEFAULT false,
format_mentoring BOOLEAN DEFAULT false,
format_hybrid TEXT CHECK (format_hybrid IN ('in_person', 'virtual', 'hybrid', 'no_preference', NULL)),
format_custom TEXT,
```

### Format Fields Breakdown

**Boolean Format Fields:**
- `format_presentations` - Traditional talks, lightning talks, keynotes
- `format_workshops` - Hands-on coding, group exercises, pair programming
- `format_discussions` - Panel discussions, roundtables, Q&A sessions
- `format_networking` - Structured networking, informal mingling
- `format_hackathons` - Hackathon events
- `format_mentoring` - Mentoring sessions

**Hybrid Delivery Preference:**
- `format_hybrid` - Enum: 'in_person', 'virtual', 'hybrid', 'no_preference'

**Custom Formats:**
- `format_custom` - Free-text field for additional format suggestions

**Note:** Multiple formats can be selected simultaneously (non-mutually exclusive).

---

## Existing Implementation

### Implemented Features

✅ **Authentication System (US-2026-0106):**
- Login page at `/dashboard/login`
- Supabase Auth with email/password
- Protected dashboard routes
- Logout functionality

✅ **Dashboard Overview (US-2026-0107):**
- Main dashboard at `/dashboard`
- Key metrics: total submissions, completion rate, trends
- API endpoint: `/api/analytics/overview`

✅ **Availability Heatmap (US-2026-0110):**
- Availability page at `/dashboard/availability`
- Heatmap visualization with day/time preferences
- Segment filtering capabilities
- API endpoint: `/api/analytics/availability`

✅ **Date Range Filtering:**
- Filter options API: `/api/analytics/filter-options`

### Not Yet Implemented

❌ **Event Format Preference Charts (US-2026-0111 - THIS STORY)**
❌ **Response Trends Over Time (US-2026-0108)**
❌ **Data Export Functionality (US-2026-0109)**
❌ **Demographic Breakdowns (US-2026-0112)**
❌ **Complete Analytics API Endpoints (US-2026-0114)**

---

## Technology Stack

### Frontend
- **React 18+** with **Next.js 14 App Router**
- **TypeScript** (strict mode)
- **shadcn/ui** component library
- **Tailwind CSS** for styling
- **Recharts** (recommended for this story) or Chart.js for visualizations

### Backend
- **Next.js API Routes** (`src/app/api/`)
- **Supabase** (PostgreSQL database)
- **Supabase Auth** for organizer authentication

### Hosting
- **Netlify** deployment

---

## API Endpoints

### To Be Created for This Story

**`GET /api/analytics/formats`**

**Purpose:** Aggregate event format preference data for visualization

**Query Parameters:**
- `startDate` (optional): ISO date string
- `endDate` (optional): ISO date string

**Expected Response Format:**
```json
{
  "data": {
    "presentations": {
      "count": 45,
      "percentage": 65.2
    },
    "workshops": {
      "count": 30,
      "percentage": 43.5
    },
    "discussions": {
      "count": 28,
      "percentage": 40.6
    },
    "networking": {
      "count": 35,
      "percentage": 50.7
    },
    "hackathons": {
      "count": 12,
      "percentage": 17.4
    },
    "mentoring": {
      "count": 18,
      "percentage": 26.1
    }
  },
  "hybrid": {
    "in_person": {
      "count": 25,
      "percentage": 36.2
    },
    "virtual": {
      "count": 15,
      "percentage": 21.7
    },
    "hybrid": {
      "count": 20,
      "percentage": 29.0
    },
    "no_preference": {
      "count": 9,
      "percentage": 13.0
    }
  },
  "custom_formats": [
    { "text": "Coffee chats", "count": 3 },
    { "text": "Book clubs", "count": 2 }
  ],
  "total_submissions": 69,
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

**SQL Query Logic:**
```sql
SELECT
  COUNT(*) FILTER (WHERE format_presentations = true) as presentations_count,
  COUNT(*) FILTER (WHERE format_workshops = true) as workshops_count,
  COUNT(*) FILTER (WHERE format_discussions = true) as discussions_count,
  COUNT(*) FILTER (WHERE format_networking = true) as networking_count,
  COUNT(*) FILTER (WHERE format_hackathons = true) as hackathons_count,
  COUNT(*) FILTER (WHERE format_mentoring = true) as mentoring_count,
  COUNT(*) FILTER (WHERE format_hybrid = 'in_person') as in_person_count,
  COUNT(*) FILTER (WHERE format_hybrid = 'virtual') as virtual_count,
  COUNT(*) FILTER (WHERE format_hybrid = 'hybrid') as hybrid_count,
  COUNT(*) FILTER (WHERE format_hybrid = 'no_preference') as no_preference_count,
  COUNT(*) as total_submissions
FROM anonymous_submissions
WHERE submission_timestamp BETWEEN $1 AND $2;
```

---

## UI/UX Requirements

### Component Structure

**Page:** `/dashboard/formats` (new page to create)

**Component Hierarchy:**
```
FormatPreferencesPage
├── Card (shadcn/ui)
│   ├── CardHeader
│   │   ├── CardTitle: "Event Format Preferences"
│   │   └── ChartTypeToggle (Bar/Pie)
│   └── CardContent
│       ├── FormatBarChart (when bar mode)
│       │   └── Recharts BarChart
│       └── FormatPieChart (when pie mode)
│           └── Recharts PieChart
├── Card (shadcn/ui)
│   ├── CardHeader
│   │   └── CardTitle: "Hybrid Delivery Preference"
│   └── CardContent
│       └── HybridFormatChart
│           └── Recharts PieChart or BarChart
└── Card (shadcn/ui) [optional]
    ├── CardHeader
    │   └── CardTitle: "Custom Format Suggestions"
    └── CardContent
        └── CustomFormatsList (or WordCloud)
```

### Chart Specifications

**Bar Chart:**
- X-axis: Format types (Presentations, Workshops, Discussions, etc.)
- Y-axis: Participant count
- Colors: Consistent with app design system
- Tooltips: Show count and percentage on hover

**Pie Chart:**
- Segments: Each format type
- Labels: Format name + percentage
- Legend: Below or beside chart
- Tooltips: Show format name, count, and percentage on hover

**Hybrid Preference Chart:**
- Separate visualization for in-person/virtual/hybrid preference
- Can be pie chart or horizontal bar chart

### Responsive Design

- Desktop: Side-by-side layout for multiple charts
- Tablet: Stacked layout
- Mobile: Single column, scrollable

### Accessibility Requirements

- WCAG 2.1 AA compliance
- Proper ARIA labels for all charts
- Keyboard navigation support
- Color-blind friendly color palette
- Alt text for chart descriptions

---

## File Structure

### Files to Create

```
src/
├── app/
│   ├── api/
│   │   └── analytics/
│   │       └── formats/
│   │           └── route.ts              [CREATE] API endpoint
│   └── dashboard/
│       └── (dashboard)/
│           └── formats/
│               ├── page.tsx              [CREATE] Main page
│               ├── format-charts.tsx     [CREATE] Client component
│               └── types.ts              [CREATE] Type definitions
└── components/
    └── dashboard/
        ├── format-bar-chart.tsx          [CREATE] Bar chart component
        ├── format-pie-chart.tsx          [CREATE] Pie chart component
        └── hybrid-preference-chart.tsx   [CREATE] Hybrid chart component
```

### Files to Update

```
src/app/dashboard/(dashboard)/layout.tsx  [UPDATE] Add "Formats" to navigation
```

---

## Testing Requirements

### Test Cases

**TC-01: Display Bar Chart**
- Navigate to /dashboard/formats
- Verify bar chart displays with correct data
- Verify all format types are represented

**TC-02: Display Pie Chart**
- Toggle to pie chart view
- Verify percentages sum to 100% (accounting for multiple selections)
- Verify labels are readable

**TC-03: Chart Toggle**
- Switch between bar and pie chart
- Verify smooth transition
- Verify data consistency

**TC-04: Tooltips**
- Hover over chart elements
- Verify tooltip shows count and percentage
- Verify tooltip follows cursor

**TC-05: Date Range Filtering**
- Apply date range filter
- Verify charts update with filtered data
- Verify "No data" message when filter returns empty set

**TC-06: Hybrid Preference Display**
- Verify hybrid preference chart exists
- Verify all hybrid options represented
- Verify correct percentages

**TC-07: Custom Formats**
- Verify custom format section displays free-text entries
- Verify duplicates are consolidated

**TC-08: Responsive Design**
- Test on mobile viewport
- Test on tablet viewport
- Test on desktop viewport
- Verify charts resize appropriately

**TC-09: Empty State**
- Mock empty database
- Verify "No data available" message displays
- Verify no chart rendering errors

**TC-10: Accessibility**
- Test keyboard navigation
- Test screen reader compatibility
- Verify color contrast ratios

---

## Implementation Notes

### Charting Library Recommendation: Recharts

**Why Recharts:**
- React-native integration
- TypeScript support
- Responsive by default
- Good documentation
- Active community
- Similar to existing patterns in the codebase

**Installation:**
```bash
npm install recharts
```

**Example Bar Chart:**
```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Presentations', count: 45, percentage: 65.2 },
  { name: 'Workshops', count: 30, percentage: 43.5 },
  // ...
];

<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="count" fill="#3b82f6" />
  </BarChart>
</ResponsiveContainer>
```

### Performance Considerations

- **Backend Caching:** Cache aggregated results for 5-10 minutes
- **Client-side Caching:** Use React Query or SWR for client-side caching
- **Lazy Loading:** Load chart library only on formats page
- **Debounced Filtering:** Debounce date range filter changes

### Security Considerations

- **Authentication:** Ensure API endpoint checks for authenticated organizer
- **Rate Limiting:** Prevent abuse of analytics endpoints
- **Data Sanitization:** Sanitize custom format text before display

---

## Dependencies

### Prerequisite User Stories (Must be Complete)

✅ US-2026-0106: Secure Organizer Authentication System
✅ US-2026-0107: Main Dashboard Overview with Key Metrics

### Parallel User Stories (Can be worked on simultaneously)

- US-2026-0108: Response Trends Over Time Visualization
- US-2026-0109: Data Export Functionality
- US-2026-0112: Demographic Breakdowns

### Dependent User Stories (Blocks these stories)

- US-2026-0113: Date Range Filtering (already partially implemented)
- US-2026-0114: Analytics API Endpoints (this story implements one endpoint)

---

## Tasks for This User Story

**Status:** No development tasks found in FairMind for this user story yet.

**Recommended Task Breakdown:**

1. **TASK: Create Analytics Formats API Endpoint**
   - Implement `/api/analytics/formats/route.ts`
   - Add SQL aggregation queries
   - Implement date range filtering
   - Add response caching
   - Write unit tests

2. **TASK: Create Format Charts Page**
   - Create `/dashboard/formats/page.tsx`
   - Set up page layout with shadcn/ui Cards
   - Add navigation link in dashboard layout
   - Implement loading states

3. **TASK: Implement Format Bar Chart Component**
   - Install Recharts library
   - Create `format-bar-chart.tsx`
   - Implement tooltips
   - Add responsive design
   - Handle empty states

4. **TASK: Implement Format Pie Chart Component**
   - Create `format-pie-chart.tsx`
   - Implement legends and labels
   - Add tooltips
   - Handle percentage calculations

5. **TASK: Implement Chart Toggle Functionality**
   - Add toggle/tabs UI component
   - Manage chart type state
   - Smooth transitions between views

6. **TASK: Implement Hybrid Preference Visualization**
   - Create `hybrid-preference-chart.tsx`
   - Visualize in-person/virtual/hybrid preferences
   - Add tooltips and legends

7. **TASK: Integrate Date Range Filtering**
   - Connect to existing date filter component
   - Pass date range to API calls
   - Update charts on filter change

8. **TASK: Implement Custom Formats Display**
   - Query custom format text field
   - Aggregate and count unique entries
   - Display as list or word cloud

9. **TASK: Add Accessibility Features**
   - Add ARIA labels to charts
   - Implement keyboard navigation
   - Test with screen readers
   - Verify color contrast

10. **TASK: Write E2E Tests**
    - Test chart rendering
    - Test toggle functionality
    - Test filtering
    - Test responsive behavior

---

## Test Cases

**Status:** No test cases found in FairMind for this user story yet.

**Recommended Test Cases:** See "Testing Requirements" section above (TC-01 through TC-10).

---

## Related Requirements

**Status:** No formal requirements found for this project.

The acceptance criteria within the user story serve as the functional requirements.

---

## Project Documentation

### Technology Stack Document
Location: `fairmind/attachments/698340b684819a4696393473`
Key points for this story:
- Next.js 14 with App Router
- React 18+ with TypeScript
- shadcn/ui for UI components
- Supabase for backend
- Recharts recommended for charts

### Project Description Document
Location: `fairmind/attachments/698340c484819a4696393474`
Key points for this story:
- Anonymous data collection system
- Event format preferences capture
- Dashboard for organizer insights

---

## Questions & Clarifications

### Open Questions

1. **Chart Library:** Should we use Recharts (recommended) or another library already in the project?
2. **Page Location:** Should formats be a separate page at `/dashboard/formats` or integrated into the main dashboard?
3. **Export:** Should format charts include image export functionality (PNG/SVG)?
4. **Custom Formats:** Should custom formats be displayed as a list, word cloud, or another visualization?
5. **Caching Duration:** What's the acceptable cache duration for format analytics (recommendation: 5-10 minutes)?

### Assumptions

- Recharts library will be used (not yet installed)
- Formats will be a dedicated page at `/dashboard/formats`
- Date range filtering uses existing filter component from US-2026-0113
- Multiple format selections by single user are independent (counted separately)
- Custom format text is sanitized and safe to display

---

## Success Criteria Summary

**This user story will be considered complete when:**

✅ Organizers can navigate to a dedicated formats page
✅ Bar chart displays format preference counts
✅ Pie chart displays format preference percentages
✅ Toggle between bar and pie chart views works smoothly
✅ Hover tooltips show detailed counts and percentages
✅ Hybrid preference (in-person/virtual/hybrid) is visualized separately
✅ Date range filtering updates all charts
✅ Charts are responsive on all device sizes
✅ Empty state ("No data available") displays correctly
✅ Charts are accessible (WCAG 2.1 AA)
✅ API endpoint `/api/analytics/formats` returns aggregated data
✅ All acceptance criteria are met
✅ E2E tests pass

---

**Document Status:** Complete
**Last Updated:** 2026-02-09
**Prepared By:** Atlas (Tech Lead Agent)
