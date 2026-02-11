# Test Cases for US-2026-0112: Demographic Breakdowns

**Project:** Meetup App
**Session:** MVP (SESSION-2026-0028)

---

## No Formal Test Cases Found

The FairMind system did not return any formal test cases for user story US-2026-0112.

However, the tasks contain comprehensive testing guidance:

---

## Test Scenarios Derived from Tasks

### API Endpoint Testing (TASK-2026-0120)

#### TC1: Authenticated Request Returns Demographics Data
**Given:** An authenticated organizer session
**When:** GET request to `/api/analytics/demographics`
**Then:** Returns 200 OK with complete demographics data including roles, experience, industries, and skills

#### TC2: Unauthenticated Request Rejected
**Given:** No valid session cookie
**When:** GET request to `/api/analytics/demographics`
**Then:** Returns 401 Unauthorized

#### TC3: Date Range Filtering
**Given:** Authenticated organizer with valid date range parameters
**When:** GET `/api/analytics/demographics?startDate=2024-01-01&endDate=2024-12-31`
**Then:** Returns only submissions within specified date range

#### TC4: Empty Data Handling
**Given:** Date range filter that matches zero submissions
**When:** GET request with those parameters
**Then:** Returns empty arrays (not errors) with totalSubmissions: 0

#### TC5: Top 10 Industries with Other
**Given:** 15 different industries in dataset
**When:** Request demographics data
**Then:** Returns top 10 industries individually + "Other" category with count of remaining 5

#### TC6: Skills Normalization
**Given:** Submissions with "JavaScript", "javascript", "JAVASCRIPT"
**When:** Request demographics data
**Then:** All counted as single skill "javascript" with combined count

#### TC7: Missing Demographic Fields
**Given:** Some submissions have null professional_role
**When:** Request demographics data
**Then:** Null values skipped, percentages calculated from non-null submissions only

#### TC8: Percentage Calculation Accuracy
**Given:** 150 submissions, 50 are "Developer"
**When:** Request demographics data
**Then:** Developer percentage is 33.3 (rounded to 1 decimal)

#### TC9: Performance Test
**Given:** 10,000 submissions in database
**When:** Request demographics data
**Then:** Response time is under 2 seconds

---

### Professional Role Chart Testing (TASK-2026-0121)

#### TC10: Bar Chart Renders with Roles
**Given:** Demographics API returns role data
**When:** Component loads
**Then:** Horizontal bar chart displays with roles on X-axis, counts on Y-axis

#### TC11: Custom Tooltip on Hover
**Given:** Bar chart is rendered
**When:** User hovers over a bar
**Then:** Tooltip appears showing role name, count, and percentage

#### TC12: Loading State
**Given:** API request is pending
**When:** Component is mounting
**Then:** Skeleton loader is displayed

#### TC13: Empty State
**Given:** No role data exists
**When:** Component receives empty data
**Then:** Empty state message displayed: "No role data available"

#### TC14: Data Sorting
**Given:** Multiple roles with different counts
**When:** Chart renders
**Then:** Roles are sorted by count in descending order (most common first)

#### TC15: Responsive Design - Mobile
**Given:** Viewport width 320px
**When:** Component renders
**Then:** Chart maintains readability with appropriate scaling

#### TC16: Top 3 Roles Summary
**Given:** At least 3 roles in dataset
**When:** Chart renders
**Then:** Summary cards below chart highlight top 3 roles with counts and percentages

---

### Experience Level Chart Testing (TASK-2026-0122)

#### TC17: Chart Type Toggle
**Given:** Experience level chart component loaded
**When:** User clicks "Pie Chart" button
**Then:** Chart switches from bar chart to pie chart instantly

#### TC18: Experience Level Ordering
**Given:** All 5 experience levels present
**When:** Bar chart renders
**Then:** Levels displayed in order: Junior, Mid-level, Senior, Lead, Executive

#### TC19: Color Coding
**Given:** Pie chart with 5 experience levels
**When:** Chart renders
**Then:** Each level has distinct color (Junior=green, Mid=blue, Senior=amber, Lead=red, Executive=purple)

#### TC20: Summary Statistics Calculation
**Given:** Experience level data
**When:** Component renders
**Then:** Summary shows: most common level, median experience, senior+ %, early career %

#### TC21: Contextual Tooltip Insights
**Given:** User hovers on "Senior" slice with 40% representation
**When:** Tooltip appears
**Then:** Shows: "Senior, 40 participants, 26.7%, Strong senior presence in your community"

---

### Industry Distribution Chart Testing (TASK-2026-0123)

#### TC22: Horizontal Bar Chart Layout
**Given:** Industry data with long names
**When:** Chart renders
**Then:** Horizontal bars displayed with industry names on Y-axis (fully readable)

#### TC23: "Other" Category Visual Distinction
**Given:** 12 industries in dataset (top 10 + Other)
**When:** Chart renders
**Then:** Top 10 bars are purple, "Other" bar is gray

#### TC24: "Other" Category Tooltip
**Given:** User hovers on "Other" category bar
**When:** Tooltip appears
**Then:** Tooltip includes explanation: "Represents all industries outside the top 10 most represented sectors"

#### TC25: Industry Concentration Metrics
**Given:** Industry data loaded
**When:** Summary statistics render
**Then:** Shows: Top industry, Industry diversity count, Top 3 concentration %, Other count

#### TC26: Y-axis Width for Long Names
**Given:** Industry name "Healthcare and Pharmaceuticals"
**When:** Chart renders
**Then:** Y-axis width (150px) accommodates full name without truncation

---

### Skills Visualization Testing (TASK-2026-0124)

#### TC27: Top 15 Skills Limit
**Given:** 50 different skills in dataset
**When:** Skills chart renders
**Then:** Only top 15 skills by frequency are displayed

#### TC28: Case-Insensitive Aggregation
**Given:** Skills: ["React", "react", "REACT"]
**When:** API aggregates skills
**Then:** All counted as single skill "react" with combined count

#### TC29: Word Cloud (if implemented)
**Given:** User toggles to word cloud view
**When:** View changes
**Then:** Skills displayed with font size proportional to frequency

#### TC30: Skills Array Handling
**Given:** Some submissions have NULL skills, others have empty arrays
**When:** API processes data
**Then:** Only submissions with non-empty skills arrays are included in aggregation

---

## Integration Testing

#### TC31: Date Range Filter Integration
**Given:** Dashboard-wide date range filter set to "Last 30 days"
**When:** User navigates to demographics page
**Then:** All 4 charts (roles, experience, industries, skills) show data from last 30 days only

#### TC32: Authentication Check on Page Load
**Given:** Unauthenticated user attempts to access `/dashboard/demographics`
**When:** Page loads
**Then:** User is redirected to login page

#### TC33: Simultaneous Chart Updates
**Given:** All 4 demographic charts are visible
**When:** User changes date range filter
**Then:** All charts update simultaneously with new filtered data

---

## Performance Testing

#### TC34: API Caching
**Given:** Demographics API implements caching
**When:** Second request made within cache TTL (10-15 min)
**Then:** Response is served from cache (faster response time)

#### TC35: Large Dataset Performance
**Given:** 10,000 submissions in database
**When:** Demographics page loads
**Then:** All charts render within acceptable time (<5 seconds total)

---

## Accessibility Testing

#### TC36: Keyboard Navigation
**Given:** User navigating with keyboard only
**When:** Tab through demographic charts
**Then:** Can focus on interactive elements (toggles, tooltips accessible)

#### TC37: Screen Reader Compatibility
**Given:** User with screen reader
**When:** Demographics page loads
**Then:** Screen reader announces chart purpose and data (proper ARIA labels)

#### TC38: Color Contrast Verification
**Given:** Charts rendered with color-coded data
**When:** Checking contrast ratios
**Then:** All colors meet WCAG AA standard (4.5:1 minimum)

---

## Edge Cases

#### TC39: Single Role in Dataset
**Given:** All participants have same professional role
**When:** Role chart renders
**Then:** Chart displays single bar correctly (100% of submissions)

#### TC40: Zero Submissions with Skills
**Given:** No submissions have skills data
**When:** Skills chart loads
**Then:** Empty state displayed: "No skills data available"

#### TC41: Very Long Industry Name
**Given:** Industry name exceeds 50 characters
**When:** Industry chart renders
**Then:** Name is either wrapped or truncated with ellipsis

#### TC42: API Error Handling
**Given:** Database connection failure
**When:** API request to `/api/analytics/demographics`
**Then:** Returns 500 with error message "Failed to fetch demographics data"

---

## Visual Regression Testing

#### TC43: Desktop Viewport (1920px)
**When:** Demographics page rendered at 1920px width
**Then:** All 4 charts display side-by-side in 2x2 grid

#### TC44: Tablet Viewport (768px)
**When:** Demographics page rendered at 768px width
**Then:** Charts stack vertically or display 2 per row

#### TC45: Mobile Viewport (320px)
**When:** Demographics page rendered at 320px width
**Then:** Charts stack vertically, maintain readability

---

## Manual Testing Checklist

- [ ] All charts fetch data from correct API endpoint
- [ ] Loading states appear before data loads
- [ ] Empty states display when no data exists
- [ ] Tooltips show on hover with correct information
- [ ] Chart type toggles work (where applicable)
- [ ] Colors are distinct and accessible
- [ ] Summary statistics calculate correctly
- [ ] Responsive design works at all breakpoints
- [ ] Date range filtering updates all charts
- [ ] Authentication prevents unauthorized access
- [ ] "Other" category appears when needed (industries)
- [ ] Skills are normalized (case-insensitive)
- [ ] Percentages round to 1 decimal place
- [ ] API returns within performance requirements (<2s)
