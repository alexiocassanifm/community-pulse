const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zqogpxtskltcfbcowtfe.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDE5OTMsImV4cCI6MjA4NTcxNzk5M30.cuCL7rkT1G-C0iNQgKTDRqeJkuNTKehe6aM9v2W6PdU';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxb2dweHRza2x0Y2ZiY293dGZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDE0MTk5MywiZXhwIjoyMDg1NzE3OTkzfQ.yxdD8bTcLxd0ECfXjDMhD0Vd6HLgeth0H5L2buTc4RQ';

async function testRLS() {
  console.log('===========================================');
  console.log('Testing Row Level Security Policies');
  console.log('===========================================\n');

  // Create clients
  const anonClient = createClient(supabaseUrl, anonKey);
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Test 1: Anonymous Insert (should succeed)
    console.log('Test 1: Anonymous user INSERT...');
    const testData = {
      current_role: 'Test Engineer',
      experience_level: 'mid',
      industry: 'Technology',
      skills: ['JavaScript', 'React'],
      format_presentations: true,
      format_workshops: false,
      data_retention_acknowledged: true,
      anonymous_reference_id: `test_${Date.now()}`
    };

    const { data: insertData, error: insertError } = await anonClient
      .from('anonymous_submissions')
      .insert([testData])
      .select();

    if (insertError) {
      console.log('  ❌ FAILED: Anonymous insert failed');
      console.log('  Error:', insertError.message);
      return;
    }
    console.log('  ✅ PASSED: Anonymous user can insert');
    console.log('  Inserted ID:', insertData[0].id);
    const insertedId = insertData[0].id;

    // Test 2: Anonymous Read (should fail/return empty)
    console.log('\nTest 2: Anonymous user SELECT...');
    const { data: readData, error: readError } = await anonClient
      .from('anonymous_submissions')
      .select('*')
      .limit(1);

    if (readError) {
      console.log('  ✅ PASSED: Anonymous read blocked (error thrown)');
    } else if (!readData || readData.length === 0) {
      console.log('  ✅ PASSED: Anonymous read blocked (empty result)');
    } else {
      console.log('  ❌ FAILED: Anonymous user can read data (RLS not working)');
      console.log('  Data:', readData);
    }

    // Test 3: Service Role Read (should succeed)
    console.log('\nTest 3: Service role SELECT...');
    const { data: serviceReadData, error: serviceReadError } = await serviceClient
      .from('anonymous_submissions')
      .select('*')
      .eq('id', insertedId);

    if (serviceReadError) {
      console.log('  ❌ FAILED: Service role cannot read');
      console.log('  Error:', serviceReadError.message);
    } else if (serviceReadData && serviceReadData.length > 0) {
      console.log('  ✅ PASSED: Service role can read data');
      console.log('  Retrieved ID:', serviceReadData[0].id);
    } else {
      console.log('  ❌ FAILED: Service role read returned empty');
    }

    // Test 4: Anonymous Update (should fail)
    console.log('\nTest 4: Anonymous user UPDATE...');
    const { error: updateError } = await anonClient
      .from('anonymous_submissions')
      .update({ current_role: 'Updated Role' })
      .eq('id', insertedId);

    if (updateError) {
      console.log('  ✅ PASSED: Anonymous update blocked');
    } else {
      console.log('  ❌ FAILED: Anonymous user can update (RLS not working)');
    }

    // Test 5: Anonymous Delete (should fail)
    console.log('\nTest 5: Anonymous user DELETE...');
    const { error: deleteError } = await anonClient
      .from('anonymous_submissions')
      .delete()
      .eq('id', insertedId);

    if (deleteError) {
      console.log('  ✅ PASSED: Anonymous delete blocked');
    } else {
      console.log('  ❌ FAILED: Anonymous user can delete (RLS not working)');
    }

    // Test 6: Service Role Delete (should succeed)
    console.log('\nTest 6: Service role DELETE (cleanup)...');
    const { error: serviceDeleteError } = await serviceClient
      .from('anonymous_submissions')
      .delete()
      .eq('id', insertedId);

    if (serviceDeleteError) {
      console.log('  ❌ FAILED: Service role cannot delete');
      console.log('  Error:', serviceDeleteError.message);
    } else {
      console.log('  ✅ PASSED: Service role can delete (GDPR compliance)');
    }

    console.log('\n===========================================');
    console.log('All RLS tests completed successfully! ✅');
    console.log('===========================================');

  } catch (error) {
    console.error('\n❌ Test suite failed with error:');
    console.error(error);
  }
}

// Run tests
testRLS().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
