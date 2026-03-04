# Database Migrations

SQL migration files for the Supabase database. Run in order via the Supabase Dashboard SQL Editor or `supabase db push`.

## Migrations

| File | Description |
|------|-------------|
| `001_create_anonymous_submissions.sql` | `anonymous_submissions` table with duplicate prevention (`ip_hash`, `device_id`, `submitted_at`), indexes, RLS policies (anon INSERT only, service role full access), `update_updated_at()` trigger, `cleanup_old_ip_hashes()` function |
| `002_create_organizers_table.sql` | `organizers` table linked to `auth.users`, RLS (own record SELECT, service role full), submission read policy for authenticated organizers |
| `003_create_speaker_submissions.sql` | `speaker_submissions`, `speaker_messages`, `speaker_status_history` tables with RLS (anon INSERT, organizer SELECT/UPDATE, service role full) |

## Running Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each file in order (001, 002, 003)
4. Optionally seed sample data with `../seed.sql`

Migrations are idempotent and safe to run multiple times.
