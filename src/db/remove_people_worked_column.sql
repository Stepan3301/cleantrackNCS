-- SQL script to remove the peopleWorked column from work_time table
-- This is a safe operation that checks if the column exists first

DO $$ 
BEGIN
  -- Check if the column exists before attempting to drop it
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'work_time' 
    AND column_name = 'peopleWorked'
  ) THEN
    -- Drop the column if it exists
    ALTER TABLE public.work_time DROP COLUMN "peopleWorked";
    RAISE NOTICE 'Successfully removed peopleWorked column from work_time table';
  ELSE
    RAISE NOTICE 'The peopleWorked column does not exist in the work_time table';
  END IF;
END $$; 