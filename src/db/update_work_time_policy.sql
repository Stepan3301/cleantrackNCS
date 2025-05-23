-- SQL script to update the policy for work_time table
-- This will modify the policy to allow users to update their own hours with approved status

-- Check if the policy exists before attempting to alter it
DO $$ 
BEGIN
  -- Check if the specified policy exists
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'work_time'
    AND policyname = 'Users can update their own approved hours'
  ) THEN
    -- Modify the existing policy
    ALTER POLICY "Users can update their own approved hours"
    ON "public"."work_time"
    TO public
    USING (
      ((auth.uid() = user_id) AND (status = 'approved'::text))
    )
    WITH CHECK (
      ((auth.uid() = user_id) AND (status = 'approved'::text))
    );
    
    RAISE NOTICE 'Successfully updated policy "Users can update their own approved hours"';
  ELSE
    -- Check if the policy with a different name exists
    IF EXISTS (
      SELECT 1 
      FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'work_time'
      AND policyname = 'Users can update their own pending hours'
    ) THEN
      -- Rename and update the policy
      ALTER POLICY "Users can update their own pending hours" 
      ON "public"."work_time" 
      RENAME TO "Users can update their own approved hours";
      
      -- Now update the renamed policy
      ALTER POLICY "Users can update their own approved hours"
      ON "public"."work_time"
      TO public
      USING (
        ((auth.uid() = user_id) AND (status = 'approved'::text))
      )
      WITH CHECK (
        ((auth.uid() = user_id) AND (status = 'approved'::text))
      );
      
      RAISE NOTICE 'Successfully renamed and updated policy from "Users can update their own pending hours" to "Users can update their own approved hours"';
    ELSE
      -- If neither policy exists, create a new one
      CREATE POLICY "Users can update their own approved hours"
      ON "public"."work_time"
      FOR UPDATE
      TO public
      USING (
        ((auth.uid() = user_id) AND (status = 'approved'::text))
      )
      WITH CHECK (
        ((auth.uid() = user_id) AND (status = 'approved'::text))
      );
      
      RAISE NOTICE 'Created new policy "Users can update their own approved hours"';
    END IF;
  END IF;
END $$; 