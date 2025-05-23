const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get config from env vars
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndCreateAuditLogsTable() {
  try {
    console.log('Checking if audit_logs table exists...');
    
    // Check if the audit_logs table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'audit_logs')
      .eq('table_schema', 'public')
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking if audit_logs table exists:', checkError);
      return;
    }
    
    // If table doesn't exist, create it
    if (!tableExists) {
      console.log('audit_logs table does not exist. Creating it...');
      
      // Read the SQL file
      const sqlFilePath = path.join(__dirname, '..', 'sql', 'create_audit_logs_table.sql');
      const sqlQuery = fs.readFileSync(sqlFilePath, 'utf8');
      
      // Execute the SQL query
      const { error: createError } = await supabase.rpc('exec_sql', { sql: sqlQuery });
      
      if (createError) {
        console.error('Error creating audit_logs table:', createError);
        return;
      }
      
      console.log('Successfully created audit_logs table');
    } else {
      console.log('audit_logs table already exists');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
checkAndCreateAuditLogsTable(); 