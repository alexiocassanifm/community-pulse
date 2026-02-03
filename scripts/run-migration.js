const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the connection pooler endpoint with IPv4 and SSL
const connectionString = 'postgresql://postgres.zqogpxtskltcfbcowtfe:oZgKlc0FRecEIH05@aws-0-eu-central-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_anonymous_submissions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration executed successfully!');

  } catch (error) {
    console.error('Error running migration:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Connection closed.');
  }
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
