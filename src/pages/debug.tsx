import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { workingHoursService } from '@/lib/services/working-hours-service';
import { format } from 'date-fns';
import ErrorBoundary from '../ErrorBoundary';
import { useAuth } from '@/contexts/auth-context';

function DebugPageContent() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>('Checking...');
  const [supabaseDetails, setSupabaseDetails] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [insertResult, setInsertResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [manualUserId, setManualUserId] = useState<string>('d4c08f66-8a60-4464-b7a4-5a818063277a'); // Default test ID
  const [testingAction, setTestingAction] = useState<string | null>(null);

  // Get authenticated user from auth context
  const { user: authUser } = useAuth();

  const addLog = (message: string) => {
    console.log(message); // Also log to console for debugging
    setLogs(prevLogs => [message, ...prevLogs]);
  };

  const checkSupabase = async () => {
    try {
      addLog("Checking Supabase connection...");
      
      // First, check if supabase client is available
      if (!supabase) {
        setSupabaseStatus("Error: Supabase client not available");
        addLog("❌ Supabase client not available");
        return;
      }
      
      addLog("✅ Supabase client is available");
      
      // Next, check if we can access the Supabase API
      try {
        const { data, error } = await supabase.from('_test').select('*').limit(1);
        
        if (error && error.code !== 'PGRST116') {
          // If we get any error besides "relation does not exist", something's wrong
          setSupabaseStatus(`Error: ${error.message}`);
          addLog(`❌ Supabase API error: ${error.message}`);
          return;
        }
        
        // We expect a "relation does not exist" error for a non-existent table
        // This actually means the connection is working
        addLog("✅ Supabase API is accessible");
      } catch (apiError) {
        setSupabaseStatus(`Error: ${apiError.message}`);
        addLog(`❌ Supabase API exception: ${apiError.message}`);
        return;
      }
      
      // Set the user from auth context first if available
      if (authUser) {
        setUser(authUser);
        addLog(`✅ User authenticated from context: ${authUser.email}`);
      } else {
        // Check authentication status
        const { data: { user: authData }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          addLog(`⚠️ Auth check error: ${authError.message}`);
        } else if (authData) {
          setUser(authData);
          addLog(`✅ User authenticated: ${authData.email}`);
        } else {
          addLog("⚠️ No user authenticated");
        }
      }
      
      // Check if we can access working hours table
      try {
        const { data, error } = await supabase.from('working_hours').select('id').limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            addLog("⚠️ working_hours table does not exist yet");
          } else {
            addLog(`❌ Error accessing working_hours table: ${error.message}`);
          }
        } else {
          addLog(`✅ working_hours table accessible, returned ${data.length} records`);
        }
      } catch (tableError) {
        addLog(`❌ Exception accessing working_hours table: ${tableError.message}`);
      }
      
      // Success!
      setSupabaseStatus("Connected");
      addLog("✅ Supabase connection check completed successfully");
      
      // Get available functions
      try {
        const functionsResult = await supabase.rpc('list_functions');
        const objectsResult = await supabase.rpc('list_objects');
        
        if (!functionsResult.error && !objectsResult.error) {
          setSupabaseDetails({
            functions: functionsResult.data || [],
            objects: objectsResult.data || []
          });
        }
      } catch (error) {
        // Ignore errors with listing functions
        addLog("Note: Could not list functions and objects");
      }
      
    } catch (error) {
      setSupabaseStatus(`Error: ${error.message}`);
      addLog(`❌ Unexpected error checking Supabase: ${error.message}`);
    }
  };

  useEffect(() => {
    checkSupabase();
  }, []);
  
  const handleTestInsert = async () => {
    try {
      setTestingAction('insert');
      addLog("Running test insertion...");
      
      // Use authenticated user ID or manual ID
      const userId = user?.id || manualUserId;
      
      if (!userId) {
        addLog("❌ Cannot insert: No user ID available");
        setTestingAction(null);
        return;
      }
      
      addLog(`Using user ID: ${userId}`);
      
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const timestamp = Date.now().toString().slice(-4);
      
      // Create test record
      const testRecord = {
        user_id: userId,
        date: `${formattedDate}-test-${timestamp}`,
        hours_worked: 1,
        location: "Debug Test",
        description: "Created from debug page"
      };
      
      addLog(`Inserting test record: ${JSON.stringify(testRecord)}`);
      
      // Try direct Supabase insert
      const { data: directData, error: directError } = await supabase
        .from('working_hours')
        .insert(testRecord)
        .select();
      
      if (directError) {
        addLog(`❌ Direct insert failed: ${directError.message}`);
        
        // Check for specific errors
        if (directError.code === '42501') {
          addLog('⚠️ This might be a permissions issue. Check RLS policies.');
        } else if (directError.code === '23505') {
          addLog('⚠️ Unique constraint violation. This record might already exist.');
        }
      } else {
        addLog(`✅ Direct insert successful: ${JSON.stringify(directData)}`);
        setInsertResult(directData);
      }
      
    } catch (error) {
      addLog(`❌ Exception in test insert: ${error.message}`);
      console.error("Full error:", error);
    } finally {
      setTestingAction(null);
    }
  };
  
  const handleTestService = async () => {
    try {
      setTestingAction('service');
      addLog("Testing working hours service...");
      
      // Use authenticated user ID or manual ID
      const userId = user?.id || manualUserId;
      
      if (!userId) {
        addLog("❌ Cannot insert: No user ID available");
        setTestingAction(null);
        return;
      }
      
      addLog(`Using user ID: ${userId}`);
      
      if (!workingHoursService) {
        addLog("❌ Working hours service not available");
        setTestingAction(null);
        return;
      }
      
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const timestamp = Date.now().toString().slice(-4);
      
      // Create test data
      const testData = {
        user_id: userId,
        date: `${formattedDate}-srv-${timestamp}`,
        hours_worked: 2,
        location: "Service Test",
        description: "Created via service from debug page"
      };
      
      addLog(`Submitting via service: ${JSON.stringify(testData)}`);
      
      const result = await workingHoursService.submitWorkingHours(testData);
      
      if (result) {
        addLog(`✅ Service submission successful: ${JSON.stringify(result)}`);
        setInsertResult(result);
      } else {
        addLog("❌ Service returned no result");
      }
      
    } catch (error) {
      addLog(`❌ Exception in service test: ${error.message}`);
      console.error("Full error:", error);
    } finally {
      setTestingAction(null);
    }
  };
  
  // Add a function to test RLS policies specifically
  const handleCheckRLS = async () => {
    try {
      setTestingAction('rls');
      addLog("Checking Row Level Security policies...");
      
      // Try to read from working_hours table
      addLog("1. Testing SELECT permission on working_hours table");
      const { data: selectData, error: selectError } = await supabase
        .from('working_hours')
        .select('*')
        .limit(5);
      
      if (selectError) {
        addLog(`❌ SELECT test failed: ${selectError.message} [Code: ${selectError.code}]`);
      } else {
        addLog(`✅ SELECT test passed. Retrieved ${selectData?.length || 0} records.`);
      }

      // Try to insert a test record
      const userId = user?.id || manualUserId;
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const timestamp = Date.now().toString().slice(-4);
      
      addLog("2. Testing INSERT permission on working_hours table");
      const testRecord = {
        user_id: userId,
        date: `${formattedDate}-rls-${timestamp}`,
        hours_worked: 0.5,
        location: "RLS Test",
        description: "Testing RLS permissions"
      };

      const { data: insertData, error: insertError } = await supabase
        .from('working_hours')
        .insert(testRecord)
        .select();
      
      if (insertError) {
        addLog(`❌ INSERT test failed: ${insertError.message} [Code: ${insertError.code}]`);
      } else {
        addLog(`✅ INSERT test passed. New record created with ID: ${insertData?.[0]?.id || 'unknown'}`);
      }
      
    } catch (error) {
      addLog(`❌ Exception in RLS check: ${error.message}`);
      console.error("Full error:", error);
    } finally {
      setTestingAction(null);
    }
  };

  const setupDatabase = async () => {
    setTestingAction('setup');
    addLog("Starting database setup...");
    
    try {
      // Step 1: Create the SQL content
      addLog("Creating SQL statements for database setup...");
      
      const sqlContent = `
-- Function to ensure the extension for UUID generation exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or replace the function for setting timestamps
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
  ) THEN
    -- Create the profiles table
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK (role IN ('owner', 'head_manager', 'manager', 'supervisor', 'staff')),
      supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Enable RLS on the table
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Create a policy for users to see their own profile
    CREATE POLICY "Users can view their own profile" 
      ON public.profiles 
      FOR SELECT 
      USING (auth.uid() = id);

    -- Create a policy for supervisors
    CREATE POLICY "Supervisors can view their staff profiles" 
      ON public.profiles 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid()
          AND (
            p.id = profiles.supervisor_id
            OR p.role IN ('manager', 'head_manager', 'owner')
          )
        )
      );

    -- Create triggers for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();

    RAISE NOTICE 'Created profiles table';
  ELSE
    RAISE NOTICE 'profiles table already exists';
  END IF;
END;
$$;

-- Function to create the working_hours table if it doesn't exist
CREATE OR REPLACE FUNCTION create_working_hours_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'working_hours'
  ) THEN
    -- Create the working_hours table
    CREATE TABLE public.working_hours (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      hours_worked NUMERIC(5, 2) NOT NULL,
      description TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'approved',
      approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id, date)
    );

    -- Enable RLS on the table
    ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

    -- Create a policy for select
    CREATE POLICY "Users can view their own hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (auth.uid() = user_id);

    -- Create a policy for insert
    CREATE POLICY "Users can insert their own hours" 
      ON public.working_hours 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);

    -- Create a policy for update
    CREATE POLICY "Users can update their own hours" 
      ON public.working_hours 
      FOR UPDATE 
      USING (auth.uid() = user_id);

    -- Create a policy that allows supervisors to view their staff's hours
    CREATE POLICY "Supervisors can view their staff's hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = working_hours.user_id
          AND profiles.supervisor_id = auth.uid()
        )
      );

    -- Create triggers for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.working_hours
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();

    RAISE NOTICE 'Created working_hours table';
  ELSE
    RAISE NOTICE 'working_hours table already exists';
  END IF;
END;
$$;

-- Function to initialize all tables
CREATE OR REPLACE FUNCTION initialize_all_tables()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_profiles_table();
  PERFORM create_working_hours_table();
  RAISE NOTICE 'All tables initialized';
END;
$$;

-- Execute the initialization
SELECT initialize_all_tables();
`;

      // Split SQL into statements
      const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
      
      // Execute each SQL statement
      addLog("Executing SQL statements...");
      for (const statement of sqlStatements) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            addLog(`[SQL ERROR] ${error.message}`);
          } else {
            addLog(`[SQL] Executed statement successfully`);
          }
        } catch (sqlError: any) {
          addLog(`[SQL EXCEPTION] ${sqlError.message}`);
        }
      }
      
      // Check if the current user has a profile
      addLog("Checking current user profile...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          addLog("No profile found for current user. Creating one...");
          
          // Create a profile for the current user
          const { data: newProfile, error: createProfileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              email: user.email || 'user@example.com',
              role: 'staff',
              is_active: true
            })
            .select();
            
          if (createProfileError) {
            addLog(`Error creating profile: ${createProfileError.message}`);
          } else {
            addLog(`Profile created successfully: ${JSON.stringify(newProfile)}`);
          }
        } else {
          addLog(`User profile exists: ${JSON.stringify(profile)}`);
        }
      } else if (manualUserId) {
        // If we have a manual user ID but no authenticated user
        addLog(`Using manual user ID: ${manualUserId}`);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', manualUserId)
          .single();
          
        if (profileError) {
          addLog(`No profile found for manual user ID. Please create a profile or use a valid user ID.`);
        } else {
          addLog(`Found profile for manual user ID: ${JSON.stringify(profile)}`);
        }
      } else {
        addLog("No authenticated user and no manual user ID provided.");
      }
      
      addLog("Database setup completed!");
    } catch (error: any) {
      addLog(`Error during database setup: ${error.message}`);
    } finally {
      setTestingAction(null);
    }
  };

  const setupWorkingHoursRPCs = async () => {
    setTestingAction('setup-rpc');
    setLogs(prev => [...prev, '[SETUP-RPC] Setting up working hours RPCs...']);
    
    try {
      const sqlContent = `
-- Create a function to setup the working hours table
CREATE OR REPLACE FUNCTION setup_working_hours_table()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Create the working hours table if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'working_hours'
  ) THEN
    CREATE TABLE public.working_hours (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      hours_worked NUMERIC(5, 2) NOT NULL,
      description TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      UNIQUE(user_id, date)
    );
    
    -- Enable RLS
    ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view their own hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own hours" 
      ON public.working_hours 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own hours" 
      ON public.working_hours 
      FOR UPDATE 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Supervisors can view their staff's hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = working_hours.user_id
          AND profiles.supervisor_id = auth.uid()
        )
      );
      
    CREATE POLICY "Supervisors can update their staff's hours" 
      ON public.working_hours 
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = working_hours.user_id
          AND profiles.supervisor_id = auth.uid()
        )
      );
      
    -- Create a policy for managers to view all hours
    CREATE POLICY "Managers can view all hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('manager', 'head_manager', 'owner')
        )
      );
      
    -- Create a policy for managers to update all hours
    CREATE POLICY "Managers can update all hours" 
      ON public.working_hours 
      FOR UPDATE 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('manager', 'head_manager', 'owner')
        )
      );
    
    result = jsonb_build_object('success', true, 'message', 'Working hours table created');
  ELSE
    result = jsonb_build_object('success', true, 'message', 'Working hours table already exists');
  END IF;
  
  RETURN result;
END;
$$;

-- Create a function to update working hours status
CREATE OR REPLACE FUNCTION update_working_hours_status(
  p_hours_id UUID,
  p_status TEXT,
  p_approved_by UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_user_id UUID;
  v_approver_role TEXT;
  v_hours_user_id UUID;
  v_is_supervisor BOOLEAN;
  v_is_manager BOOLEAN;
BEGIN
  -- Validate parameters
  IF p_hours_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Hours ID is required');
  END IF;
  
  IF p_status IS NULL OR p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid status. Must be pending, approved, or rejected');
  END IF;
  
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL AND p_approved_by IS NOT NULL THEN
    v_user_id := p_approved_by;
  END IF;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'User must be authenticated or approved_by must be provided');
  END IF;
  
  -- Get user role from profiles
  SELECT role INTO v_approver_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Get the user ID of the hours record
  SELECT user_id INTO v_hours_user_id
  FROM public.working_hours
  WHERE id = p_hours_id;
  
  IF v_hours_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Working hours record not found');
  END IF;
  
  -- Check if user is supervisor of the hours user
  SELECT COUNT(*) > 0 INTO v_is_supervisor
  FROM public.profiles
  WHERE id = v_hours_user_id AND supervisor_id = v_user_id;
  
  -- Check if user is manager or higher
  v_is_manager := v_approver_role IN ('manager', 'head_manager', 'owner');
  
  -- Users can only set their own hours to pending
  IF v_user_id = v_hours_user_id AND p_status != 'pending' THEN
    RETURN jsonb_build_object('success', false, 'message', 'Users can only set their own hours to pending');
  END IF;
  
  -- Only supervisors or managers can approve/reject
  IF NOT (v_is_supervisor OR v_is_manager) AND v_user_id != v_hours_user_id THEN
    RETURN jsonb_build_object('success', false, 'message', 'Only supervisors or managers can update status for other users');
  END IF;
  
  -- Update the working hours record
  UPDATE public.working_hours
  SET 
    status = p_status,
    approved_by = CASE WHEN p_status = 'approved' THEN v_user_id ELSE NULL END,
    updated_at = now()
  WHERE id = p_hours_id;
  
  result = jsonb_build_object(
    'success', true, 
    'message', 'Working hours status updated',
    'hours_id', p_hours_id,
    'status', p_status,
    'approved_by', CASE WHEN p_status = 'approved' THEN v_user_id ELSE NULL END
  );
  
  RETURN result;
END;
$$;

-- Create a function to get pending approvals for a supervisor
CREATE OR REPLACE FUNCTION get_pending_approvals()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  user_name TEXT,
  date TEXT,
  hours_worked NUMERIC(5, 2),
  description TEXT,
  location TEXT,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Get user role
  SELECT role INTO v_user_role
  FROM public.profiles
  WHERE id = v_user_id;
  
  -- Return different results based on role
  IF v_user_role IN ('manager', 'head_manager', 'owner') THEN
    -- Managers see all pending hours
    RETURN QUERY
    SELECT 
      wh.id,
      wh.user_id,
      p.name AS user_name,
      wh.date,
      wh.hours_worked,
      wh.description,
      wh.location,
      wh.status,
      wh.created_at
    FROM 
      public.working_hours wh
      JOIN public.profiles p ON wh.user_id = p.id
    WHERE 
      wh.status = 'pending'
    ORDER BY 
      wh.created_at DESC;
  ELSIF v_user_role = 'supervisor' THEN
    -- Supervisors see their staff's pending hours
    RETURN QUERY
    SELECT 
      wh.id,
      wh.user_id,
      p.name AS user_name,
      wh.date,
      wh.hours_worked,
      wh.description,
      wh.location,
      wh.status,
      wh.created_at
    FROM 
      public.working_hours wh
      JOIN public.profiles p ON wh.user_id = p.id
    WHERE 
      wh.status = 'pending'
      AND p.supervisor_id = v_user_id
    ORDER BY 
      wh.created_at DESC;
  ELSE
    -- Staff see nothing
    RETURN QUERY
    SELECT 
      NULL::UUID,
      NULL::UUID,
      NULL::TEXT,
      NULL::TEXT,
      NULL::NUMERIC(5,2),
      NULL::TEXT,
      NULL::TEXT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ
    WHERE 1=0;
  END IF;
END;
$$;

-- Create a function to execute arbitrary SQL
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SQL executed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RETURN SQLERRM;
END;
$$;
      `;
      
      // Split SQL into statements and execute each one
      const sqlStatements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (const statement of sqlStatements) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            addLog(`[SETUP-RPC] Error executing SQL: ${error.message}`);
          } else {
            addLog('[SETUP-RPC] SQL executed successfully');
          }
        } catch (sqlError: any) {
          addLog(`[SETUP-RPC] Exception executing SQL: ${sqlError.message}`);
        }
      }
      
      addLog('[SETUP-RPC] Working hours RPCs setup completed!');
    } catch (error: any) {
      setLogs(prev => [...prev, `[SETUP-RPC] Error setting up working hours RPCs: ${error.message}`]);
    } finally {
      setTestingAction(null);
    }
  };

  const handleSetupWorkingHoursTable = async () => {
    setTestingAction('setup-hours-table');
    setLogs(prev => [...prev, '[SETUP-TABLE] Setting up working hours table...']);
    
    try {
      const { data, error } = await supabase.rpc('setup_working_hours_table');
      
      if (error) {
        throw error;
      }
      
      setLogs(prev => [...prev, `[SETUP-TABLE] Working hours table setup result: ${JSON.stringify(data)}`]);
      
      // Test with inserting a record
      if (manualUserId) {
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const { data: insertData, error: insertError } = await supabase
          .from('working_hours')
          .insert({
            user_id: manualUserId,
            date: formattedDate,
            hours: 8,
            status: 'pending'
          });
        
        if (insertError) {
          setLogs(prev => [...prev, `[SETUP-TABLE] Test insert failed: ${insertError.message}`]);
        } else {
          setLogs(prev => [...prev, `[SETUP-TABLE] Test insert successful: ${JSON.stringify(insertData)}`]);
        }
      } else {
        setLogs(prev => [...prev, `[SETUP-TABLE] No manual user ID set, skipping test insert`]);
      }
      
    } catch (error) {
      setLogs(prev => [...prev, `[SETUP-TABLE] Error setting up working hours table: ${error.message}`]);
    } finally {
      setTestingAction(null);
    }
  };

  const handleTestApproval = async () => {
    try {
      setTestingAction('test-approval');
      addLog("Testing working hours approval...");
      
      // Use authenticated user ID or manual ID
      const userId = authUser?.id || manualUserId;
      
      if (!userId) {
        addLog("❌ Cannot test approval: No user ID available");
        setTestingAction(null);
        return;
      }
      
      addLog(`Using user ID: ${userId}`);
      
      if (!workingHoursService) {
        addLog("❌ Working hours service not available");
        setTestingAction(null);
        return;
      }
      
      const today = new Date();
      const formattedDate = format(today, 'yyyy-MM-dd');
      const timestamp = Date.now().toString().slice(-4);
      
      // Create test data
      const testData = {
        user_id: userId,
        date: `${formattedDate}-approval-${timestamp}`,
        hours_worked: 2,
        location: "Approval Test",
        description: "Created for approval testing"
      };
      
      addLog(`Submitting for approval: ${JSON.stringify(testData)}`);
      
      const result = await workingHoursService.submitWorkingHours(testData);
      
      if (result) {
        addLog(`✅ Approval test successful: ${JSON.stringify(result)}`);
        setInsertResult(result);
      } else {
        addLog("❌ Approval test failed");
      }
      
    } catch (error) {
      addLog(`❌ Exception in approval test: ${error.message}`);
      console.error("Full error:", error);
    } finally {
      setTestingAction(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Debug Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          <p className="mb-2">
            <span className="font-medium">Status:</span> 
            <span className={supabaseStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}>
              {supabaseStatus}
            </span>
          </p>
          
          {user ? (
            <div className="mb-4">
              <p className="font-medium">Authenticated User:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">{JSON.stringify(user, null, 2)}</pre>
            </div>
          ) : (
            <div className="mb-4">
              <p className="font-medium">Manual Test User ID:</p>
              <input 
                type="text" 
                value={manualUserId} 
                onChange={(e) => setManualUserId(e.target.value)}
                className="w-full p-2 border rounded text-sm font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Using manual ID since no user is authenticated
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={handleTestInsert} 
              disabled={isLoading || testingAction !== null}
              className="w-full sm:w-auto"
            >
              {testingAction === 'insert' ? 'Testing...' : 'Test Direct Insert'}
            </Button>
            
            <Button 
              onClick={handleTestService} 
              disabled={isLoading || testingAction !== null}
              className="w-full sm:w-auto"
            >
              {testingAction === 'service' ? 'Testing...' : 'Test Service'}
            </Button>
            
            <Button 
              onClick={handleCheckRLS} 
              disabled={isLoading || testingAction !== null}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {testingAction === 'rls' ? 'Checking...' : 'Check RLS Policies'}
            </Button>
            
            <Button 
              variant="default" 
              onClick={setupDatabase}
              disabled={testingAction === 'setup'}
            >
              {testingAction === 'setup' ? 'Setting up...' : 'Setup Database'}
            </Button>
            
            <Button 
              variant="default" 
              onClick={setupWorkingHoursRPCs}
              disabled={testingAction === 'setup-rpc'}
            >
              {testingAction === 'setup-rpc' ? 'Setting up...' : 'Setup Working Hours RPCs'}
            </Button>
            
            <Button 
              variant="default" 
              onClick={handleSetupWorkingHoursTable}
              disabled={testingAction === 'setup-hours-table'}
            >
              {testingAction === 'setup-hours-table' ? 'Setting up...' : 'Setup Working Hours Table'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleTestApproval}
              disabled={testingAction === 'test-approval' || !manualUserId}
            >
              {testingAction === 'test-approval' ? 'Testing...' : 'Test Hours Approval'}
            </Button>
          </div>
          
          {insertResult && (
            <div className="mt-4">
              <p className="font-medium">Last Insert Result:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-[200px]">{JSON.stringify(insertResult, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          
          <div className="bg-black text-green-400 p-3 rounded h-[400px] overflow-y-auto font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))}
            {logs.length === 0 && <div>No logs yet...</div>}
          </div>
        </div>
      </div>
      
      {supabaseDetails && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Supabase Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-1">Functions:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs h-[200px] overflow-y-auto">
                {supabaseDetails.functions.join('\n')}
              </pre>
            </div>
            
            <div>
              <p className="font-medium mb-1">Objects:</p>
              <pre className="bg-gray-100 p-2 rounded text-xs h-[200px] overflow-y-auto">
                {supabaseDetails.objects.join('\n')}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export a wrapped version
export default function DebugPage() {
  return (
    <ErrorBoundary>
      <DebugPageContent />
    </ErrorBoundary>
  );
} 