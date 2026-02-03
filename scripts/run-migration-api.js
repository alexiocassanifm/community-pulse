const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = 'https://zqogpxtskltcfbcowtfe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MTk5MywiZXhwIjoyMDg1NzE3OTkzfQ.yxdD8bTcLxd0ECfXjDMhD0Vd6HLgeth0H5L2buTc4RQ';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: 'zqogpxtskltcfbcowtfe.supabase.co',
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data, statusCode: res.statusCode });
        } else {
          reject({ success: false, data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (e) => {
      reject({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../supabase/migrations/001_create_anonymous_submissions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing migration...');
    const result = await executeSql(sql);

    console.log('Migration result:', result);
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
