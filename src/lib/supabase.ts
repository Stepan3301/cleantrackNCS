import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Add validation to check if environment variables are properly set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: supabaseAnonKey ? 'Found' : 'Missing'
  });
}

console.log(`🔍 Initializing Supabase client for URL: ${supabaseUrl?.substring(0, 20)}...`);

// Create client with enhanced session handling
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      // Persist session in localStorage for better UX across page refreshes
      persistSession: true,
      
      // Store auth in localStorage for offline capability
      storage: localStorage,
      
      // Auto refreshes the token before it expires
      autoRefreshToken: true,
      
      // Detect session changes across tabs
      detectSessionInUrl: true,
      
      // Flowbite UI uses hash-based routing
      flowType: 'implicit'
    },
    // Optimize data fetching with cache
    global: {
      headers: {
        'Cache-Control': 'max-age=30'
      }
    },
    // Add retries for network issues
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
)

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Supabase connection check failed:', error);
      return { success: false, error: error.message };
    }
    return { success: true, session: data.session };
  } catch (err) {
    console.error('❌ Unexpected error during Supabase connection check:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown connection error' 
    };
  }
}

// Helper to diagnose server connection issues more precisely
export const checkServerConnection = async () => {
  console.log('🔍 Performing detailed Supabase server connection check...');
  
  try {
    // Test 1: Basic auth check
    console.log('Test 1: Basic auth check');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth check result:', authError ? '❌ Failed' : '✅ Passed');
    
    if (authError) {
      console.error('Auth error details:', {
        message: authError.message,
        status: authError.status,
        name: authError.name
      });
      return { 
        success: false, 
        stage: 'auth',
        error: authError.message
      };
    }
    
    // Test 2: Check if we can execute a simple query to verify RPC
    console.log('Test 2: RPC function access');
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('exec_sql', {
        sql_query: 'SELECT 1 as test'
      });
      
      console.log('RPC check result:', rpcError ? '❌ Failed' : '✅ Passed');
      
      if (rpcError) {
        if (rpcError.message.includes('does not exist')) {
          return {
            success: false,
            stage: 'rpc_missing',
            error: 'The exec_sql function is missing on the server'
          };
        }
        
        console.error('RPC error details:', {
          message: rpcError.message,
          code: rpcError.code,
          details: rpcError.details,
          hint: rpcError.hint
        });
        
        return {
          success: false,
          stage: 'rpc',
          error: rpcError.message
        };
      }
    } catch (rpcExec) {
      console.error('RPC execution exception:', rpcExec);
      return {
        success: false,
        stage: 'rpc_exception', 
        error: rpcExec instanceof Error ? rpcExec.message : 'Unknown RPC error'
      };
    }
    
    // Test 3: Try to access the announcements table
    console.log('Test 3: Announcements table access');
    const { data: tableData, error: tableError } = await supabase
      .from('announcements')
      .select('count(*)', { count: 'exact', head: true })
      .limit(1);
      
    console.log('Table check result:', tableError ? '❌ Failed' : '✅ Passed');
    
    if (tableError) {
      if (tableError.message.includes('does not exist')) {
        return {
          success: false,
          stage: 'table_missing',
          error: 'The announcements table does not exist'
        };
      }
      
      if (tableError.code === 'PGRST301') {
        return {
          success: false,
          stage: 'rls_issue',
          error: 'Row Level Security policy is preventing access'
        };
      }
      
      console.error('Table error details:', {
        message: tableError.message,
        code: tableError.code,
        details: tableError.details,
        hint: tableError.hint
      });
      
      return {
        success: false,
        stage: 'table',
        error: tableError.message
      };
    }
    
    // All tests passed
    console.log('✅ All connection tests passed successfully');
    return { 
      success: true 
    };
  } catch (err) {
    console.error('❌ Unexpected server connection error:', err);
    return { 
      success: false, 
      stage: 'unexpected',
      error: err instanceof Error ? err.message : 'Unknown connection error' 
    };
  }
}

// First check if file exists by reading it 

// Helper to create the exec_sql function directly when it doesn't exist
export const createExecSqlFunction = async () => {
  console.log('🔧 Attempting to create exec_sql function directly via REST API...');
  
  try {
    // Basic simplified version of exec_sql for bootstrap purposes
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
      RETURNS json AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN json_build_object('success', true);
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
      
      -- Set security options
      ALTER FUNCTION public.exec_sql(text) SET search_path = public;
    `;
    
    // Get the Supabase URL and key for direct REST API call
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL or anon key is missing in environment variables');
    }
    
    // Use direct REST API to execute SQL (bypasses RPC)
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: createFunctionSQL
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ REST API error:', errorData);
      return { success: false, error: errorData };
    }
    
    console.log('✅ Successfully created exec_sql function via REST API');
    return { success: true };
  } catch (err) {
    console.error('❌ Error creating exec_sql function:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}; 