# Database Migrations

This directory contains SQL migration files for the Supabase database.

## How to Execute Migrations

Since direct database access via psql is not available, you need to execute migrations manually through the Supabase Dashboard:

### Option 1: Supabase Dashboard SQL Editor (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/zqogpxtskltcfbcowtfe
2. Navigate to the SQL Editor in the left sidebar
3. Click "New Query"
4. Copy the contents of the migration file (e.g., `001_create_anonymous_submissions.sql`)
5. Paste into the SQL Editor
6. Click "Run" to execute the migration

### Option 2: Supabase CLI (if available)

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Available Migrations

### 001_create_anonymous_submissions.sql

Creates the `anonymous_submissions` table with:

- Complete schema for anonymous meetup preference submissions
- Indexes for performance (timestamp, experience level, industry, topics)
- Row Level Security (RLS) policies:
  - Anonymous users can INSERT only
  - Anonymous users CANNOT read, update, or delete
  - Service role can read and delete (for GDPR compliance)
- Automatic `updated_at` trigger
- Full GDPR compliance fields

The migration is idempotent and safe to run multiple times.

## Verifying Migration

After running the migration, verify in the Supabase Dashboard:

1. Go to Table Editor
2. Check if `anonymous_submissions` table exists
3. Go to Authentication > Policies
4. Verify RLS policies are active

## Testing RLS Policies

You can test RLS policies work correctly:

```sql
-- This should work (anonymous insert)
INSERT INTO public.anonymous_submissions (current_role, experience_level)
VALUES ('Software Engineer', 'mid');

-- This should return empty (anonymous cannot read)
SELECT * FROM public.anonymous_submissions;
```

Then switch to service role to read:

```sql
-- Using service role key, this should return data
SELECT * FROM public.anonymous_submissions;
```
