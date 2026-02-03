#!/bin/bash

# Supabase Migration Script
# This script applies the migration using Supabase REST API

set -e

SUPABASE_URL="https://zqogpxtskltcfbcowtfe.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MTk5MywiZXhwIjoyMDg1NzE3OTkzfQ.yxdD8bTcLxd0ECfXjDMhD0Vd6HLgeth0H5L2buTc4RQ"
MIGRATION_FILE="$(dirname "$0")/../supabase/migrations/001_create_anonymous_submissions.sql"

echo "========================================"
echo "Supabase Migration Application"
echo "========================================"
echo ""
echo "IMPORTANT: This script requires manual execution via Supabase Dashboard"
echo ""
echo "Steps to apply the migration:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/zqogpxtskltcfbcowtfe"
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
    open "https://supabase.com/dashboard/project/zqogpxtskltcfbcowtfe/sql/new"
    echo "SQL Editor opened in browser."
fi
