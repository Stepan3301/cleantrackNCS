-- Create the exec_sql function in the public schema for database maintenance
-- This function allows executing arbitrary SQL from the client, which is normally a security risk
-- However, it's needed for admin database operations and will be restricted by RLS and app permissions

-- First, check if the function already exists and drop it if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'exec_sql'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    DROP FUNCTION IF EXISTS public.exec_sql(text);
    RAISE NOTICE 'Dropped existing exec_sql function';
  END IF;
END$$;

-- Create the function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Check if query looks dangerous (simple heuristic)
  IF sql_query ~* 'drop\s+database|drop\s+schema|truncate\s+all|delete\s+from\s+auth|delete\s+from\s+profiles' THEN
    RAISE EXCEPTION 'Potentially dangerous query detected';
  END IF;

  -- Only allow head_managers and owners to run SQL commands
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('head_manager', 'owner')
  ) THEN
    RAISE EXCEPTION 'Permission denied - only head managers and owners can execute SQL commands';
  END IF;

  EXECUTE sql_query;
  result := json_build_object('success', true);
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- The function itself checks for head_manager/owner role
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;

-- Set security options
ALTER FUNCTION public.exec_sql(text) SET search_path = public;
COMMENT ON FUNCTION public.exec_sql IS 'Execute arbitrary SQL (admin only). Security risk - restricted to head_manager and owner roles.';

-- For client reference, provide metadata about the function
CREATE OR REPLACE FUNCTION public.check_exec_sql_permissions()
RETURNS json AS $$
DECLARE
  user_has_permission boolean;
  current_role text;
BEGIN
  -- Check user permission
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  user_has_permission := current_role IN ('head_manager', 'owner');
  
  RETURN json_build_object(
    'function_exists', true,
    'has_permission', user_has_permission,
    'user_role', current_role
  );
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'function_exists', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.check_exec_sql_permissions() TO authenticated; 