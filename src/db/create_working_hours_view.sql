-- Create a view named working_hours that points to work_time
-- This allows legacy code to continue working while we transition to using work_time

DO $$ 
BEGIN
  -- Check if the work_time table exists
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'work_time'
  ) THEN
    -- Drop the view if it already exists
    DROP VIEW IF EXISTS public.working_hours;
    
    -- Create the view
    CREATE OR REPLACE VIEW public.working_hours AS
    SELECT * FROM public.work_time;
    
    -- Grant the same permissions as work_time
    GRANT SELECT ON public.working_hours TO authenticated;
    GRANT INSERT ON public.working_hours TO authenticated;
    GRANT UPDATE ON public.working_hours TO authenticated;
    
    RAISE NOTICE 'Successfully created working_hours view that points to work_time.';
  ELSE
    RAISE NOTICE 'work_time table does not exist - cannot create working_hours view.';
  END IF;
END $$; 