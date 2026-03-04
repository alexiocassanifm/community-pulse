const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required');
  process.exit(1);
}

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
