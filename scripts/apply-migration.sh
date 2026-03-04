#!/bin/bash

# Supabase Migration Script
# This script guides you through applying the migration via Supabase Dashboard

set -e

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "Error: NEXT_PUBLIC_SUPABASE_URL is not set. Source your .env.local first."
  exit 1
fi

# Extract project ID from URL
PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://||' | sed 's|\.supabase\.co||')
MIGRATION_FILE="$(dirname "$0")/../supabase/migrations/001_create_anonymous_submissions.sql"

echo "========================================"
echo "Supabase Migration Application"
echo "========================================"
echo ""
echo "IMPORTANT: This script requires manual execution via Supabase Dashboard"
echo ""
echo "Steps to apply the migration:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/$PROJECT_ID"
echo "2. Click on 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Copy the contents from: $MIGRATION_FILE"
echo "5. Paste into the SQL Editor"
echo "6. Click 'Run' button"
echo ""
echo "The migration will:"
echo "  - Create anonymous_submissions table"
echo "  - Add indexes for performance"
echo "  - Enable Row Level Security (RLS)"
echo "  - Create RLS policies for anonymous users and service role"
echo ""
echo "After running, verify the table exists in Table Editor."
echo ""
echo "========================================"
echo ""
echo "Would you like to open the SQL Editor now? (requires 'open' command)"
read -p "Open SQL Editor? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo "SQL Editor opened in browser."
fi
