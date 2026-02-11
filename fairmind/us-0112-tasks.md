# Tasks for US-2026-0112: Demographic Breakdowns

**Total Tasks:** 5

---

## Task 1: TASK-2026-0120 - Build /api/analytics/demographics API Endpoint for Audience Composition Data
**ID:** 6988d9c1d26c92ba7c533b0c
**Estimated Effort:** 7 hours

### Overview
Create a secure, authenticated API endpoint at `/api/analytics/demographics` that aggregates and returns participant demographic data (professional roles, experience levels, industries, and skills) from the anonymous_submissions table. This endpoint serves as the data source for all demographic visualization components in the organizer dashboard.

### Implementation Details

#### File to Create
- **`src/app/api/analytics/demographics/route.ts`** - Demographics API endpoint (NEW FILE)

#### Key Features
1. **Authentication Verification** - Verify organizer session using Supabase Auth
2. **Date Range Filtering** - Accept optional startDate and endDate query parameters
3. **Selective Field Query** - Query only demographic fields for performance
4. **Professional Roles Aggregation** - Count and calculate percentages for each role
5. **Experience Level Aggregation** - Count seniority distribution
6. **Industries Aggregation with "Other"** - Top 10 industries + combined "Other" category
7. **Skills Aggregation** - Top 15 skills with normalization (lowercase, trimmed)
8. **Comprehensive Error Handling** - 401 for unauthenticated, 500 for database errors

#### Response Format
```json
{
  "totalSubmissions": 150,
  "roles": [
    { "category": "Developer", "count": 45, "percentage": 30.0 },
    { "category": "Designer", "count": 30, "percentage": 20.0 }
  ],
  "experience": [
    { "category": "Mid-level", "count": 50, "percentage": 33.3 },
    { "category": "Senior", "count": 40, "percentage": 26.7 }
  ],
  "industries": [
    { "category": "Technology", "count": 60, "percentage": 40.0 },
    { "category": "Finance", "count": 25, "percentage": 16.7 },
    { "category": "Other", "count": 20, "percentage": 13.3 }
  ],
  "skills": [
    { "category": "javascript", "count": 80, "percentage": 53.3 },
    { "category": "react", "count": 70, "percentage": 46.7 }
  ]
}
```

### Acceptance Criteria
1. ✅ GET endpoint exists at `/api/analytics/demographics`
2. ✅ Returns HTTP 401 for unauthenticated requests
3. ✅ Accepts optional `startDate` and `endDate` query parameters in ISO 8601 format
4. ✅ Returns aggregated counts and percentages for professional roles (all roles present in data)
5. ✅ Returns aggregated counts and percentages for experience levels (all levels present in data)
6. ✅ Returns top 10 industries plus "Other" category with combined counts for remaining industries
7. ✅ Returns top 15 skills with normalized skill names (lowercase, trimmed)
8. ✅ Includes `totalSubmissions` count in response
9. ✅ Percentages are rounded to 1 decimal place (e.g., 33.3%)
10. ✅ Returns empty arrays when no data matches filters (not errors)
11. ✅ Handles missing demographic fields gracefully (skips null/undefined values)
12. ✅ Returns HTTP 500 with error message for database failures
13. ✅ Response time under 2 seconds for datasets up to 10,000 submissions

---

## Task 2: TASK-2026-0121 - Create Bar Chart Visualization for Professional Role Breakdown
**ID:** 6988da4ed26c92ba7c533b10
**Estimated Effort:** 5 hours

### Overview
Build a dedicated bar chart visualization component that displays participant distribution across professional roles (Developer, Designer, Product Manager, Data Scientist, etc.). This component is part of the comprehensive demographics dashboard and provides organizers with insights into the professional composition of their audience.

### Implementation Details

#### Files to Create
- **`src/components/dashboard/RoleBreakdownChart.tsx`** - Professional role bar chart component (NEW FILE)

#### Component Features
- Horizontal bar chart with Recharts
- Custom tooltip showing role name, count, and percentage
- Loading skeleton while data fetches
- Empty state for no data
- Responsive design (desktop, tablet, mobile)
- Top 3 roles summary cards
- Color scheme: Tailwind blue-500 (#3b82f6)

#### Integration
- Wrap in shadcn/ui Card component
- Add to `src/app/dashboard/demographics/page.tsx`
- Fetch data from `/api/analytics/demographics`

### Acceptance Criteria
1. ✅ Component displays horizontal bar chart with professional role categories on X-axis
2. ✅ Each bar labeled with professional role name
3. ✅ Bars colored consistently using Tailwind blue-500 (#3b82f6)
4. ✅ Bars have rounded top corners (8px border radius)
5. ✅ Custom tooltip displays role name, exact count, and percentage on hover
6. ✅ X-axis labels rotated -45° when many roles are present
7. ✅ Y-axis includes label "Number of Participants" positioned vertically
8. ✅ Loading state shows skeleton loader
9. ✅ Empty state displays informative message
10. ✅ Chart is responsive and maintains aspect ratio
11. ✅ Data sorted by count in descending order
12. ✅ Optional summary cards highlight top 3 most common roles

---

## Task 3: TASK-2026-0122 - Create Visualization for Experience Level (Seniority) Distribution
**ID:** 6988dab6d26c92ba7c533b14
**Estimated Effort:** 4 hours

### Overview
Build a visualization component that displays the distribution of participants across different experience/seniority levels (Junior, Mid-level, Senior, Lead, Executive). Provides insights into professional maturity and expertise levels of the audience.

### Implementation Details

#### Files to Create
- **`src/components/dashboard/ExperienceLevelChart.tsx`** - Experience level distribution chart (NEW FILE)

#### Component Features
- Toggle between bar chart and pie chart views
- Experience-themed color palette:
  - Junior: green-500 (#10b981)
  - Mid-level: blue-500 (#3b82f6)
  - Senior: amber-500 (#f59e0b)
  - Lead: red-500 (#ef4444)
  - Executive: purple-500 (#8b5cf6)
- Custom tooltip with contextual insights
- Summary statistics section showing:
  - Most common level
  - Median experience
  - Senior+ percentage
  - Early career percentage
- Standardized ordering: Junior → Mid-level → Senior → Lead → Executive

### Acceptance Criteria
1. ✅ Component displays experience level distribution with bar chart and pie chart options
2. ✅ Toggle buttons allow switching between chart types
3. ✅ Bar chart displays levels in logical order (Junior → Executive)
4. ✅ Pie chart shows proportional distribution with percentage labels
5. ✅ Custom tooltip displays level name, count, percentage, and insight
6. ✅ Colors follow experience-themed palette
7. ✅ Summary statistics section with 4 metrics
8. ✅ Loading and empty states implemented
9. ✅ Experience levels sorted in career progression order
10. ✅ Responsive design
11. ✅ Default chart type is bar chart

---

## Task 4: TASK-2026-0123 - Create Top Industries Visualization with 'Other' Category
**ID:** 6988db32d26c92ba7c533b18
**Estimated Effort:** 4 hours

### Overview
Build a visualization component that displays participant distribution across industries, showing the top 10 most represented industries individually and aggregating all remaining industries into an "Other" category.

### Implementation Details

#### Files to Create
- **`src/components/dashboard/IndustryDistributionChart.tsx`** - Industry distribution chart (NEW FILE)

#### Component Features
- Horizontal bar chart (layout="vertical") for better label readability
- Visual distinction for "Other" category:
  - Top 10 industries: purple-500 (#8b5cf6)
  - Other category: gray-400 (#9ca3af)
- Enhanced tooltip with "Other" category explanation
- Summary statistics:
  - Top industry
  - Industry diversity count
  - Top 3 concentration percentage
  - Other category count
- Y-axis width: 150px for long industry names

### Acceptance Criteria
1. ✅ Component displays horizontal bar chart showing industry distribution
2. ✅ Chart shows top 10 industries individually
3. ✅ "Other" category aggregates industries ranked 11th or lower
4. ✅ "Other" category bar is visually distinct (gray) from top 10 (purple)
5. ✅ Custom tooltip displays industry name, count, and percentage
6. ✅ Tooltip for "Other" includes explanatory text
7. ✅ Summary statistics section with 4 cards
8. ✅ Loading and empty states implemented
9. ✅ Industry names fully readable (not truncated)
10. ✅ Responsive design

---

## Task 5: TASK-2026-0124 - Create Top Skills Bar Chart or Word Cloud
**ID:** 6988dbaad26c92ba7c533b1c
**Estimated Effort:** 6 hours

### Overview
Implement a visual representation of participant skills distribution as either an interactive bar chart showing the top 15 most common skills or a word cloud where skill popularity is indicated by text size.

### Implementation Details

#### Files to Create
- **`src/components/dashboard/SkillsVisualization.tsx`** - Skills visualization component (NEW FILE)

#### Component Features
- Toggle between bar chart and word cloud views (optional)
- Horizontal bar chart showing top 15 skills
- Skills normalized (lowercase, trimmed)
- Color scheme matching dashboard theme (blue-500 to blue-700)
- Interactive tooltips showing skill name, count, and percentage
- Loading skeleton and empty state

#### Backend Requirements
- Extend demographics API to include skills aggregation
- PostgreSQL query using UNNEST() to expand skills arrays
- LOWER() and TRIM() for normalization
- GROUP BY with COUNT() for frequencies
- ORDER BY count DESC, LIMIT 15

#### Query Structure
```sql
SELECT
  LOWER(TRIM(unnest(skills))) as skill_name,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM anonymous_submissions WHERE skills IS NOT NULL)), 1) as percentage
FROM anonymous_submissions
WHERE skills IS NOT NULL AND array_length(skills, 1) > 0
GROUP BY LOWER(TRIM(unnest(skills)))
ORDER BY count DESC
LIMIT 15
```

### Acceptance Criteria
1. ✅ Skills visualization displays top 15 most common skills
2. ✅ Both raw counts and percentages visible
3. ✅ Component handles case-insensitive skill matching
4. ✅ Empty state shown when no skills data exists
5. ✅ Loading state displays skeleton/spinner
6. ✅ Toggle between bar chart and word cloud works (if implemented)
7. ✅ API endpoint returns skills data within 2 seconds
8. ✅ PostgreSQL query uses efficient UNNEST() and aggregation
9. ✅ Component follows shadcn/ui styling patterns
10. ✅ Visualization is responsive
11. ✅ Chart uses accessible color palette (WCAG AA: 4.5:1)

---

## Task Dependencies

```
TASK-2026-0120 (Demographics API)
    ↓
    ├─→ TASK-2026-0121 (Role Chart)
    ├─→ TASK-2026-0122 (Experience Chart)
    ├─→ TASK-2026-0123 (Industries Chart)
    └─→ TASK-2026-0124 (Skills Chart)
```

**Critical Path:**
1. First complete TASK-2026-0120 (API endpoint)
2. Then complete visualization tasks in parallel

**Total Estimated Effort:** 26 hours
