# Migration Guide: anonymous_submissions Table

This guide walks you through applying the database migration for the anonymous_submissions table with Row Level Security.

## Prerequisites

- Access to Supabase Dashboard: https://supabase.com/dashboard/project/zqogpxtskltcfbcowtfe
- Project ID: `zqogpxtskltcfbcowtfe`

## Step 1: Apply the Migration

### Option A: Via Supabase Dashboard (Recommended)

1. Open the Supabase Dashboard SQL Editor:
   ```
   https://supabase.com/dashboard/project/zqogpxtskltcfbcowtfe/sql/new
   ```

2. Copy the entire contents of the migration file:
   ```
   /Users/alexiocassani/Projects/meetup-app/supabase/migrations/001_create_anonymous_submissions.sql
   ```

3. Paste into the SQL Editor

4. Click the "Run" button (▶️)

5. Verify success - you should see "Success. No rows returned"

### Option B: Via Command Line (if Supabase CLI is installed)

```bash
cd /Users/alexiocassani/Projects/meetup-app
supabase db push
```

## Step 2: Verify the Migration

### Check Table Created

1. Go to Table Editor in Supabase Dashboard
2. Look for `anonymous_submissions` table
3. Verify all columns are present:
   - Professional Background: current_role, experience_level, industry, skills
   - Availability: preferred_days, preferred_times, frequency
   - Event Formats: format_* fields
   - Topics: predefined_topics, custom_topics
   - Metadata: submission_timestamp, form_version, completion_percentage, anonymous_reference_id
   - GDPR: data_retention_acknowledged, created_at, updated_at

### Check RLS Policies

1. Go to Authentication > Policies
2. Verify these policies exist for `anonymous_submissions`:
   - `allow_anonymous_insert` - INSERT for anon role
   - `prevent_anonymous_read` - SELECT for anon role (blocking)
   - `service_role_read_all` - SELECT for service_role
   - `prevent_anonymous_update` - UPDATE for anon role (blocking)
   - `prevent_anonymous_delete` - DELETE for anon role (blocking)
   - `service_role_delete` - DELETE for service_role

### Check Indexes

Run this query in SQL Editor to verify indexes:

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'anonymous_submissions';
```

Expected indexes:
- `idx_submissions_timestamp` - On submission_timestamp DESC
- `idx_submissions_experience` - On experience_level
- `idx_submissions_industry` - On industry
- `idx_submissions_topics` - GIN index on predefined_topics

## Step 3: Test RLS Policies

Run the automated test script:

```bash
node /Users/alexiocassani/Projects/meetup-app/scripts/test-rls.js
```

This will test:
- ✅ Anonymous users can INSERT
- ✅ Anonymous users CANNOT read
- ✅ Service role CAN read
- ✅ Anonymous users CANNOT update
- ✅ Anonymous users CANNOT delete
- ✅ Service role CAN delete (GDPR)

Expected output: All tests should pass with ✅

## Step 4: Verify Build

```bash
npm run build
```

Should complete successfully without TypeScript errors.

## What Was Created

### Database Schema
- **Table**: `public.anonymous_submissions` with 23 columns
- **Indexes**: 4 indexes for query optimization
- **Trigger**: `update_updated_at` - Auto-updates updated_at field
- **RLS**: Enabled with 6 policies

### TypeScript Types
- Updated `/Users/alexiocassani/Projects/meetup-app/src/types/database.types.ts`
- Added type definitions: ExperienceLevel, PreferredTime, Frequency, HybridFormat
- Complete Row, Insert, Update types for anonymous_submissions

### Scripts
- `scripts/apply-migration.sh` - Interactive migration guide
- `scripts/test-rls.js` - Automated RLS policy testing

## RLS Security Model

### Anonymous Users (anon role)
- **CAN**: Insert new submissions (fully anonymous)
- **CANNOT**: Read, update, or delete any submissions
- This prevents data harvesting and ensures anonymity

### Service Role (service_role)
- **CAN**: Read all submissions (for analytics)
- **CAN**: Delete submissions (for GDPR right to erasure)
- **CANNOT**: Be accessed from client-side code (server-only)

## Troubleshooting

### Migration Fails
- Check if table already exists: `SELECT * FROM information_schema.tables WHERE table_name = 'anonymous_submissions';`
- If exists, the migration is idempotent and safe to re-run

### RLS Test Fails
- Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'anonymous_submissions';`
- Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'anonymous_submissions';`

### Build Fails
- Check TypeScript types match: `npm run build`
- Verify all imports use correct types from `database.types.ts`

## GDPR Compliance

The schema includes GDPR-compliant features:
- No personally identifiable information (PII) stored
- `data_retention_acknowledged` field for consent tracking
- Service role can delete data (right to erasure)
- Anonymous reference IDs for data subject access requests

## Next Steps

After successful migration:
1. Implement form submission API endpoint
2. Create React form component
3. Add analytics dashboard (service role only)
4. Implement GDPR data deletion endpoint
