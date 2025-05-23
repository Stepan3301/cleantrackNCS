-- SQL script to add a policy allowing managers and above to view all work_time records
-- This ensures that managers, head managers, and owners can see all work time entries

-- Check if the table exists first
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'work_time'
  ) THEN
    -- Check if the policy already exists
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'work_time'
      AND policyname = 'Managers can view all work time records'
    ) THEN
      -- Create a policy for managers to view all work time records
      CREATE POLICY "Managers can view all work time records"
      ON public.work_time
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role IN ('manager', 'head_manager', 'owner'))
        )
      );

      RAISE NOTICE 'Added policy for managers to view all work time records';
    ELSE
      RAISE NOTICE 'Policy for managers to view all work time records already exists';
    END IF;
  ELSE
    RAISE NOTICE 'work_time table does not exist';
  END IF;
END $$; 