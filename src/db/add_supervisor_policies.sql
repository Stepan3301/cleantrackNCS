-- SQL script to add supervisor policies to work_time table
-- This allows supervisors to insert records for staff they supervise

-- Check if the table exists first
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'work_time'
  ) THEN
    -- Create a policy for supervisors to insert records for their staff
    CREATE POLICY IF NOT EXISTS "Supervisors can insert records for their staff"
    ON public.work_time
    FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = created_by AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = work_time.user_id
        AND profiles.supervisor_id = auth.uid()
      )
    );

    -- Create a policy for supervisors to update records for their staff
    CREATE POLICY IF NOT EXISTS "Supervisors can update records for their staff"
    ON public.work_time
    FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = created_by AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = work_time.user_id
        AND profiles.supervisor_id = auth.uid()
      )
    )
    WITH CHECK (
      auth.uid() = created_by AND
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = work_time.user_id
        AND profiles.supervisor_id = auth.uid()
      )
    );

    -- Create a policy for supervisors to view records for their staff
    CREATE POLICY IF NOT EXISTS "Supervisors can view records for their staff"
    ON public.work_time
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = work_time.user_id
        AND profiles.supervisor_id = auth.uid()
      )
    );

    RAISE NOTICE 'Added supervisor policies to work_time table';
  ELSE
    RAISE NOTICE 'work_time table does not exist';
  END IF;
END $$; 