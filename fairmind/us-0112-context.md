# User Story US-2026-0112: Demographic Breakdowns

**Project:** Meetup App
**Session:** MVP (SESSION-2026-0028)
**User Story ID:** US-2026-0112 (Internal ID: 6988b6c84a70cbc8ae23a60a)
**Type:** Agile User Story
**Created:** 2026-02-08T16:16:00

---

## Title
Demographic Breakdowns

---

## Description

As a Meetup Organizer, I want to view comprehensive demographic visualizations showing participant distribution by role, seniority level, and industry so that I can understand my audience composition and tailor event content to match their backgrounds and expertise levels.

---

## User Steps

1. Navigate to the organizer dashboard and access the "Audience Demographics" section
2. View a breakdown of participants by professional role (e.g., Developer, Designer, Product Manager, Data Scientist) displayed as a bar chart or pie chart
3. Review a seniority level distribution showing counts or percentages across experience levels (e.g., Junior, Mid-level, Senior, Lead, Executive)
4. Examine an industry distribution chart showing which industries participants work in (e.g., Technology, Finance, Healthcare, Education)
5. View a skills distribution visualization showing the most common skills among participants as a bar chart or word cloud
6. Filter demographic views by date range to see how audience composition changes over time
7. Compare demographics across different dimensions simultaneously using multi-dimensional charts or side-by-side views

---

## Acceptance Criteria

### AC1: Professional Role Distribution
- The system must display a professional role distribution chart with clear labels and counts for each role category

### AC2: Seniority Level Breakdown
- A seniority level breakdown must be presented showing the experience distribution of participants (Junior through Executive levels)

### AC3: Industry Distribution with Top 10 + Other
- Given multiple industries are represented, when displaying the industry breakdown, then the top 10 industries must be shown with an "Other" category for remaining industries

### AC4: Skills Visualization
- Skills must be visualized either as a bar chart showing top 15 skills by frequency or as an interactive word cloud where size indicates popularity

### AC5: Data Completeness
- Each demographic chart must display both absolute counts and percentages to provide complete context

### AC6: Date Range Filtering
- Given an organizer filters by date range, when applied, then all demographic visualizations update to reflect only submissions within that period

### AC7: Graceful Handling of Missing Data
- The interface must handle missing demographic data gracefully (e.g., participants who skipped role or industry fields)

### AC8: Responsive Design
- Charts must be responsive and maintain readability on desktop, tablet, and mobile devices

### AC9: Interactive Tooltips
- Tooltips must provide additional details on hover, including exact counts, percentages, and category names

---

## Additional Considerations

- The anonymous_submissions table stores demographic data in fields: professional_role, experience_level, industry, and skills (array)
- Use the same charting library as the Event Format Preference Charts for consistency (Recharts, Chart.js, or Tremor)
- Implement caching for aggregated demographic queries to improve performance with large datasets
- Consider adding a "Download Demographics Report" button to export demographic data as PDF or CSV
- Display a summary card at the top showing total unique participants and date range of data
- Skills should be normalized for consistent aggregation (handle case sensitivity and common variations)

### Future Enhancements
- Add demographic cross-analysis (e.g., "What's the most common role among Senior participants?")
- Show demographic trends over time with line charts
- Accessibility: Ensure charts include proper ARIA labels, screen reader descriptions, and keyboard navigation
- Color scheme should be consistent with the application's design system and accessible (WCAG AA compliant)
- Handle edge cases: zero participants in a category, extremely long industry/role names, or very large skills arrays

---

## Technical Context

### Database Schema
The `anonymous_submissions` table contains:
- `professional_role` (TEXT) - Job role (Developer, Designer, Product Manager, etc.)
- `experience_level` (TEXT) - Seniority (Junior, Mid-level, Senior, Lead, Executive)
- `industry` (TEXT) - Industry sector
- `skills` (TEXT[]) - Array of skills

### Technology Stack
- **Frontend**: Next.js 14 with App Router, React 18+, TypeScript (strict mode)
- **UI Components**: shadcn/ui components with Tailwind CSS
- **Charting**: Recharts (already installed for trends visualization)
- **Backend**: Supabase (PostgreSQL + RLS)
- **API Pattern**: Next.js App Router API routes using `createServerClient()` from `src/lib/supabase/server.ts`

### Integration Points
- Requires authentication system (US-2026-0106 - Secure Organizer Authentication)
- Requires dashboard layout (US-2026-0107 - Main Dashboard Overview)
- Should integrate with date range filtering (US-2026-0113 - Date Range Filtering)
- Part of Analytics API infrastructure (US-2026-0114 - Analytics API Endpoints)

---

## Related User Stories
- US-2026-0106: Secure Organizer Authentication System
- US-2026-0107: Main Dashboard Overview with Key Metrics
- US-2026-0108: Response Trends Over Time Visualization
- US-2026-0109: Data Export Functionality with Date Filtering
- US-2026-0110: Availability Heatmap for Optimal Event Scheduling
- US-2026-0111: Event Format Preference Charts
- US-2026-0113: Date Range Filtering
- US-2026-0114: Analytics API Endpoints

---

## Notes
This user story is part of the organizer dashboard suite for viewing anonymous participant data and making data-driven decisions about event planning.
