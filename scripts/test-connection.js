const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqogpxtskltcfbcowtfe.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MTk5MywiZXhwIjoyMDg1NzE3OTkzfQ.yxdD8bTcLxd0ECfXjDMhD0Vd6HLgeth0H5L2buTc4RQ';

async function testConnection() {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    console.log('Testing connection to Supabase...');

    // Try to list tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Connection test failed:', error);
    } else {
      console.log('Connection successful!');
      console.log('Sample data:', data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testConnection();
