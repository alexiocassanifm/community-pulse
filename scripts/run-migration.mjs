import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://zqogpxtskltcfbcowtfe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MTk5MywiZXhwIjoyMDg1NzE3OTkzfQ.yxdD8bTcLxd0ECfXjDMhD0Vd6HLgeth0H5L2buTc4RQ';

async function runMigration() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Reading migration file...');
    const migrationPath = join(__dirname, '../supabase/migrations/001_create_anonymous_submissions.sql');
    const sql = readFileSync(migrationPath, 'utf8');

    console.log('Executing migration via Supabase RPC...');

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      const { data, error } = await supabase.rpc('exec_sql', {
        sql: statement
      });

      if (error) {
        console.error(`Error in statement ${i + 1}:`, error);
        throw error;
      }
    }

    console.log('Migration executed successfully!');

  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
