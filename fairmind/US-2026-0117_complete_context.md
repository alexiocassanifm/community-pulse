# Complete Context for User Story US-2026-0117
## Topics of Interest Dashboard Visualization

**Date Generated**: 2026-02-10
**Project**: Meetup App (ID: 6981fb9c4b2c601246796a08)
**Work Session**: MVP (SESSION-2026-0028)
**User Story ID**: US-2026-0117 / 698a2951464d43fdad0a7a0e

---

## Executive Summary

User Story US-2026-0117 requires implementation of a comprehensive Topics of Interest dashboard visualization for meetup organizers. This feature will aggregate anonymous participant preferences across 5 predefined categories and present them through interactive charts, enabling data-driven event content planning.

**Status**: No tasks have been created yet for this user story.

**Story Points**: 8 (Medium-high complexity)

**Key Dependencies**:
- Organizer authentication system (US-2026-0106)
- Main Dashboard Overview (US-2026-0107)
- Analytics API Endpoints (US-2026-0114)
- Date Range Filtering (US-2026-0113)

---

## User Story Details

### Title
Topics of Interest Dashboard Visualization

### User Story Statement
**As a** Meetup Organizer
**I want** to view aggregated topics of interest from participants in visual charts organized by 5 main categories
**So that** I can identify popular topics, understand community interests, and make data-driven decisions about event content planning

### Description
Implement a comprehensive Topics of Interest dashboard visualization that displays anonymous participant preferences across 5 predefined categories. The visualization should help organizers quickly identify trending topics, understand which areas of interest have the most engagement, and use these insights to plan relevant meetup content that aligns with community needs.

This feature will aggregate data from the `topics_of_interest` field (stored as TEXT[] array in PostgreSQL) and present it through interactive charts that make it easy to spot patterns and popular topics at a glance.

**Current Context**: The anonymous_submissions table stores topics_of_interest as a TEXT[] array field. Participants can select multiple topics across different categories during the preference form submission.

---

## Acceptance Criteria

### AC1: Display Topics by Category
**Given** an authenticated organizer accesses the Topics of Interest dashboard section
**When** the page loads
**Then** the system displays 5 distinct category sections:
- **Claude Products**: Claude Code, Claude Desktop, Claude API, Claude Code SDK, Cowork
- **Agentic AI**: Building Agents, Multi-Agent Swarms, Subagents & Delegation, Agentic Workflow Design, Autonomous Task Execution
- **Skills & MCP**: Creating Skills, MCP Servers & Tools, Integrations & Connectors
- **Development Practices**: Coding with Claude, Automation & Pipelines, Prompt Engineering
- **Session Formats**: Hands-on Labs, Live Building Sessions, Demo Sessions

**And** each category displays the number of participants interested in each topic within that category

### AC2: Visual Chart Representation
**Given** topic data has been aggregated
**When** the organizer views the dashboard
**Then** the system displays visual charts (bar charts or horizontal bar charts) for each category
**And** each chart shows topic names on one axis and participant count on the other axis
**And** charts are color-coded for visual distinction between categories
**And** charts are responsive and render properly on desktop and tablet devices

### AC3: Interactive Tooltips and Details
**Given** an organizer hovers over a chart element (bar or data point)
**When** the hover event occurs
**Then** a tooltip displays showing:
- Exact topic name
- Number of participants interested in that topic
- Percentage of total submissions with this topic selected

### AC4: Data Aggregation and Accuracy
**Given** multiple participants have selected topics of interest
**When** the system aggregates the data
**Then** each topic selection is counted independently (participants can select multiple topics)
**And** the count reflects the total number of submissions where that specific topic appears in the topics_of_interest array
**And** data is fetched from `/api/analytics/topics` endpoint with proper authentication

### AC5: Empty State Handling
**Given** no submissions exist with topics of interest data
**When** the organizer views the Topics of Interest dashboard
**Then** the system displays a user-friendly message: "No topic data available yet"
**And** provides guidance on how data will appear once participants start submitting preferences

### AC6: Performance and Loading
**Given** the organizer navigates to the Topics of Interest dashboard
**When** data is being fetched from the backend
**Then** a loading skeleton or spinner is displayed
**And** the charts render within 2 seconds for datasets up to 10,000 submissions
**And** the page remains responsive during data loading

### AC7: Date Range Filtering Integration
**Given** the organizer has applied a date range filter on the dashboard
**When** the Topics of Interest visualization updates
**Then** only topics from submissions within the selected date range are displayed
**And** all charts update simultaneously to reflect the filtered data
**And** a clear indicator shows the active date range affecting the visualization

---

## Definition of Done

- [ ] Dashboard component created at `src/components/dashboard/TopicsOfInterestChart.tsx` (or similar path)
- [ ] API endpoint `/api/analytics/topics` implemented with authentication middleware
- [ ] PostgreSQL aggregation query implemented to unnest and count topics_of_interest arrays
- [ ] Chart visualization library integrated (Recharts or Chart.js as per tech stack)
- [ ] 5 category sections rendered with accurate topic lists as specified in epic
- [ ] Interactive tooltips implemented with hover functionality
- [ ] Empty state UI component created and tested
- [ ] Loading states implemented (skeleton loaders or spinners)
- [ ] Responsive design tested on desktop (1920px, 1366px) and tablet (768px) viewports
- [ ] Date range filtering integration tested and working
- [ ] Unit tests written for aggregation logic and chart rendering
- [ ] Integration tests completed for API endpoint
- [ ] Performance tested with dataset of 1000+ submissions (load time < 2s)
- [ ] Code reviewed and approved
- [ ] Documentation updated (API endpoint, component usage)
- [ ] Accessibility tested (WCAG 2.1 AA compliance, keyboard navigation, screen reader support)

---

## Technical Implementation Details

### Database Query Pattern
```sql
-- Example aggregation query for topics of interest
SELECT
  unnest(topics_of_interest) as topic,
  COUNT(*) as participant_count
FROM anonymous_submissions
WHERE submission_timestamp >= $1 AND submission_timestamp <= $2  -- Date filtering
GROUP BY topic
ORDER BY participant_count DESC;
```

### API Endpoint Structure
- **Route**: `/api/analytics/topics`
- **Method**: GET
- **Query Parameters**: `start_date`, `end_date` (optional for date filtering)
- **Authentication**: Required (organizer session)
- **Response Format**:
```json
{
  "data": {
    "Claude Products": [
      { "topic": "Claude Code", "count": 45, "percentage": 65 },
      { "topic": "Claude API", "count": 32, "percentage": 46 }
    ],
    "Agentic AI": [...],
    ...
  },
  "total_submissions": 69,
  "date_range": { "start": "2024-01-01", "end": "2024-12-31" }
}
```

### Component Architecture
- **Container Component**: Fetches data from API, manages state, handles date filtering
- **Chart Components**: Reusable chart components for each category (5 instances)
- **Tooltip Component**: Custom tooltip for displaying detailed information on hover
- **Empty State Component**: Displayed when no data is available

### File Paths (Based on Existing Project Structure)
- **Component**: `src/components/dashboard/TopicsOfInterestChart.tsx`
- **API Route**: `src/app/api/analytics/topics/route.ts`
- **Types**: `src/types/analytics.ts` (for TypeScript interfaces)
- **Utilities**: `src/lib/analytics/topics.ts` (for data aggregation logic)

---

## Technology Stack Context

### Current Project Stack (from Architecture Spec)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL)
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Hook Form + Zod
- **Hosting**: Netlify
- **Testing**: Jest + React Testing Library, Playwright

### Required Additions for This Feature
- **Charting Library**:
  - **Recharts** (Recommended): React-native, good TypeScript support, responsive
  - **Chart.js**: Alternative with react-chartjs-2 wrapper, highly customizable
  - Installation: `npm install recharts` or `npm install chart.js react-chartjs-2`

### Database Schema Context
The `anonymous_submissions` table already includes:
- `topics_of_interest` field (TEXT[] array type in PostgreSQL)
- `submission_timestamp` field (timestamptz) for date filtering

---

## Related User Stories in MVP Session

### Prerequisite User Stories (Must Be Complete)
1. **US-2026-0106**: Secure Organizer Authentication System
   - Status: Must be implemented first
   - Provides: Authentication middleware for protected routes

2. **US-2026-0107**: Main Dashboard Overview with Key Metrics
   - Status: Must be implemented first
   - Provides: Dashboard layout and navigation structure

3. **US-2026-0114**: Analytics API Endpoints
   - Status: Must be implemented first
   - Provides: API infrastructure and patterns

4. **US-2026-0113**: Date Range Filtering
   - Status: Recommended (can be stubbed initially)
   - Provides: Date filtering functionality across dashboard

### Parallel User Stories (Similar Visualization Features)
- **US-2026-0108**: Response Trends Over Time Visualization
- **US-2026-0110**: Availability Heatmap for Optimal Event Scheduling
- **US-2026-0111**: Event Format Preference Charts
- **US-2026-0112**: Demographic Breakdowns

### Related Backend Stories
- **US-2026-0109**: Data Export Functionality with Date Filtering

---

## Project Attachments

### Architecture Documentation
**File**: `Meetup App - Technology Stack & Architecture Specification_v1.md`
- Complete technology stack definitions
- Project structure details
- Database schema
- Environment variables
- Deployment configuration

### Business Requirements
**File**: `Meetup App - Anonymous User Profiling System - Project Description_v2.md`
- Project overview and business context
- Target users
- Core functionality
- Success metrics
- Future enhancements

---

## Repository Information

**Repository**: meetup-app
**GitHub URL**: https://github.com/alexiocassanifm/meetup-app
**Repository ID**: 698267b83ffffd4dafbae5ce

### Current Repository State
Based on git status:
- Active branch: master
- Working directory contains existing work on other features
- Recent work includes:
  - Event format preference charts (US-0111)
  - Availability heatmap (US-0110)
  - Various frontend work packages

---

## 5 Topic Categories (EXACT SPECIFICATIONS)

### Category 1: Claude Products
- Claude Code
- Claude Desktop
- Claude API
- Claude Code SDK
- Cowork

### Category 2: Agentic AI
- Building Agents
- Multi-Agent Swarms
- Subagents & Delegation
- Agentic Workflow Design
- Autonomous Task Execution

### Category 3: Skills & MCP
- Creating Skills
- MCP Servers & Tools
- Integrations & Connectors

### Category 4: Development Practices
- Coding with Claude
- Automation & Pipelines
- Prompt Engineering

### Category 5: Session Formats
- Hands-on Labs
- Live Building Sessions
- Demo Sessions

**CRITICAL**: These topic lists MUST match exactly during implementation for proper data aggregation.

---

## Testing Requirements

### Unit Tests
- Data aggregation logic correctness
- Topic categorization accuracy
- Percentage calculation accuracy
- Chart component rendering

### Integration Tests
- `/api/analytics/topics` endpoint with authentication
- Date range filtering functionality
- Database query performance
- Data transformation accuracy

### E2E Tests
- Organizer login → navigate to topics dashboard → view charts
- Apply date range filter → verify chart updates
- Hover over chart elements → verify tooltip display
- Empty state display when no data exists

### Performance Tests
- Load time with 1,000 submissions: < 2s
- Load time with 10,000 submissions: < 2s
- Chart rendering performance
- API response time

### Accessibility Tests
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast verification
- Focus management

---

## Future Enhancements (Out of Scope)

1. Export topics chart as PNG or PDF for reports
2. Comparison view to see how topic interests change over different time periods
3. Filtering by participant demographics (role, experience level) to see topic preferences by segment
4. Word cloud visualization as an alternative to bar charts
5. Real-time updates using Supabase Realtime subscriptions
6. Trend analysis showing which topics are gaining or losing interest over time
7. Cross-category analysis to identify correlations between topic selections

---

## Key Implementation Notes

1. **Topics are stored as free-form text strings** in the database array - ensure exact string matching during aggregation
2. **Consider adding database indexes** on topics_of_interest column if performance issues arise with large datasets
3. **Coordinate with the form submission feature** to ensure consistent topic naming conventions
4. **Implement caching strategy** for topic aggregation queries (5-10 minute cache) to reduce database load
5. **Use horizontal bar charts** for better readability of topic names
6. **Implement consistent color palette** across all category charts
7. **Handle null/empty arrays** gracefully in aggregation queries

---

## Known Constraints & Considerations

1. **Data Dependency**: Requires existing submissions with topics_of_interest data populated
2. **Authentication Dependency**: Requires completed organizer authentication system
3. **Performance**: PostgreSQL array unnesting can be slow on large datasets - monitor query performance
4. **Data Quality**: Topics must be consistently named across submissions for accurate aggregation
5. **Mobile Support**: Charts should be responsive but may have reduced functionality on small screens
6. **Browser Compatibility**: Charting library must support all modern browsers

---

## Questions for Clarification

1. Should topics that aren't in the predefined lists be displayed in an "Other" category?
2. What should be the default sorting order within each category (alphabetical or by count)?
3. Should there be a minimum threshold for displaying topics (e.g., hide topics with < 3 selections)?
4. Is there a preference between Recharts and Chart.js for the charting library?
5. Should the visualization support drill-down functionality (click to see more details)?
6. What color scheme should be used for the 5 categories?
7. Should there be an option to toggle between different chart types (bar, pie, horizontal bar)?

---

## Summary for Work Package Creation

This user story requires:
- **Frontend work**: Dashboard component with 5 category charts
- **Backend work**: API endpoint for topic aggregation
- **Database work**: Aggregation queries with array unnesting
- **Testing work**: Comprehensive test coverage across all layers

**Primary Agent**: Echo (Software Engineer)
**Skills Required**:
- `frontend-react-nextjs` (for dashboard component)
- `backend-nextjs` (for API endpoint)

**Estimated Implementation Time**: 2-3 days for experienced developer

**Complexity Factors**:
- Multi-category aggregation logic
- PostgreSQL array operations
- Chart library integration
- Interactive features (tooltips, hover states)
- Date range filtering integration
- Responsive design requirements

---

## Next Steps

1. **Create Backend API Endpoint Task** (TASK-XXXX):
   - Implement `/api/analytics/topics` route
   - PostgreSQL query for array unnesting and aggregation
   - Authentication middleware
   - Date range filtering support

2. **Create Frontend Component Task** (TASK-XXXX):
   - Install and configure charting library
   - Build TopicsOfInterestChart component
   - Implement 5 category sections
   - Add tooltips and interactivity
   - Integrate date filtering

3. **Create Testing Task** (TASK-XXXX):
   - Unit tests for aggregation logic
   - Integration tests for API
   - E2E tests for full user flow
   - Accessibility testing

---

**Document Status**: Complete Context Gathered
**Ready for Work Package Creation**: Yes
**Missing Information**: None (all available context has been captured)
