// Verification script for Supabase connection
// This script can be run with: node scripts/verify-supabase.js

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('\n🔍 Checking Supabase configuration:');
console.log(`URL: ${SUPABASE_URL ? '✅ Found' : '❌ Missing'}`);
console.log(`Key: ${SUPABASE_KEY ? '✅ Found' : '❌ Missing'}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERROR: Missing Supabase configuration in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Check connection to Supabase
console.log('\n🔄 Testing Supabase connection...');

try {
  // Try to get session to check basic connection
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    process.exit(1);
  }
  
  console.log('✅ Successfully connected to Supabase');
  
  // Try to query the announcements table
  console.log('\n🔄 Testing announcements table access...');
  const { data: tableData, error: tableError } = await supabase
    .from('announcements')
    .select('count(*)', { count: 'exact' })
    .limit(1);
  
  if (tableError) {
    if (tableError.message.includes('does not exist')) {
      console.error('❌ Table "announcements" does not exist');
      console.log('ℹ️ You may need to create the table using the admin debug panel');
    } else if (tableError.code === 'PGRST301') {
      console.error('❌ Row Level Security policy prevented access to the table');
      console.log('ℹ️ You may need to fix RLS policies using the admin debug panel');
    } else {
      console.error(`❌ Table access error: ${tableError.message}`);
    }
  } else {
    console.log('✅ Successfully accessed the announcements table');
    console.log(`ℹ️ Table has ${tableData[0].count} announcement(s)`);
  }
  
  // Check if exec_sql RPC function is available
  console.log('\n🔄 Testing exec_sql RPC function...');
  const { error: rpcError } = await supabase.rpc('exec_sql', { 
    sql_query: 'SELECT 1 as test' 
  });
  
  if (rpcError) {
    if (rpcError.message.includes('function') && rpcError.message.includes('does not exist')) {
      console.error('❌ The "exec_sql" function does not exist');
      console.log('ℹ️ You need to create this function in your database for debugging features to work');
      console.log('ℹ️ SQL Function definition:');
      console.log(`
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json AS $$
BEGIN
  EXECUTE sql_query;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
      `);
    } else {
      console.error(`❌ RPC function error: ${rpcError.message}`);
    }
  } else {
    console.log('✅ Successfully called the exec_sql RPC function');
  }
  
} catch (err) {
  console.error('❌ Unexpected error:', err.message);
  process.exit(1);
} 