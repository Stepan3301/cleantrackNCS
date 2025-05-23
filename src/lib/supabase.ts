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

// Safe localStorage access with proper error handling
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error(`Error getting item ${key} from localStorage:`, err);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error(`Error setting item ${key} in localStorage:`, err);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`Error removing item ${key} from localStorage:`, err);
    }
  },
  clear: (): void => {
    try {
      // Only clear Supabase-related items, not the entire localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.') || key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.error('Error clearing localStorage:', err);
    }
  }
};

// Clear stale Supabase data on startup
const clearStaleData = () => {
  try {
    // Get the last session time
    const lastSessionTime = safeStorage.getItem('supabase_session_timestamp');
    if (lastSessionTime) {
      const lastTime = parseInt(lastSessionTime, 10);
      const now = Date.now();
      // If the session is older than 1 day (86400000 ms), clear it
      if (now - lastTime > 86400000) {
        console.log('🧹 Clearing stale Supabase session data...');
        // Only clear Supabase-related items, not entire localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.') || key === 'supabase_session_timestamp') {
            safeStorage.removeItem(key);
          }
        });
      }
    }
    // Set the current timestamp
    safeStorage.setItem('supabase_session_timestamp', Date.now().toString());
  } catch (err) {
    console.error('Failed to clear stale session data:', err);
  }
};

clearStaleData();

// Create client with enhanced session handling and safety features
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      // Persist session in localStorage for better UX across page refreshes
      persistSession: true,
      
      // Use our safe localStorage wrapper to avoid errors
      storage: safeStorage,
      
      // Auto refreshes the token before it expires
      autoRefreshToken: true,
      
      // Detect session changes across tabs
      detectSessionInUrl: true,
      
      // Maximum retries for token refresh
      flowType: 'implicit'
    },
    // Optimize data fetching with proper cache control
    global: {
      headers: {
        // Use no-cache to ensure fresh data on each request
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    },
    // Add retries for network issues
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    },
    // Better db error handling
    db: {
      schema: 'public'
    }
  }
)

// Helper function to check Supabase connection
export const checkSupabaseConnection = async () => {
  try {
    // Attempt to refresh the session before checking it
    await supabase.auth.refreshSession();
    
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