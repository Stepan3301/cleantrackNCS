-- Migration to add equality column to work_time table
-- This column will be used to track if staff and supervisor records match

-- Check if the table exists first
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'work_time'
  ) THEN
    -- Add the equality column if it doesn't exist
    DO $$ 
    BEGIN
      -- Try to add the column
      BEGIN
        ALTER TABLE public.work_time 
        ADD COLUMN equality BOOLEAN DEFAULT NULL;
        
        RAISE NOTICE 'Added equality column to work_time table';
      EXCEPTION
        -- Handle the case where the column already exists
        WHEN duplicate_column THEN
          RAISE NOTICE 'equality column already exists in work_time table';
      END;
    END $$;
    
    -- Create or update function to automatically set equality when records are compared
    CREATE OR REPLACE FUNCTION update_equality_on_record_change()
    RETURNS TRIGGER AS $$
    DECLARE
      companion_record public.work_time%ROWTYPE;
      companion_record_type TEXT;
    BEGIN
      -- Determine which type of record we need to find (self vs supervisor)
      IF NEW.record_type = 'self' THEN
        companion_record_type := 'supervisor';
      ELSE
        companion_record_type := 'self';
      END IF;
      
      -- Try to find the companion record
      SELECT * INTO companion_record
      FROM public.work_time
      WHERE user_id = NEW.user_id
      AND date = NEW.date
      AND record_type = companion_record_type
      LIMIT 1;
      
      -- If we found a companion record, update equality on both records
      IF companion_record.id IS NOT NULL THEN
        -- Set equality based on whether hours worked match
        IF NEW.hours_worked = companion_record.hours_worked THEN
          -- Hours match, set equality to true
          UPDATE public.work_time 
          SET equality = true
          WHERE id IN (NEW.id, companion_record.id);
        ELSE
          -- Hours don't match, set equality to false
          UPDATE public.work_time 
          SET equality = false
          WHERE id IN (NEW.id, companion_record.id);
        END IF;
      ELSE
        -- No companion record, set equality to NULL
        UPDATE public.work_time
        SET equality = NULL
        WHERE id = NEW.id;
      END IF;
      
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    -- Create trigger to run after insert or update
    DROP TRIGGER IF EXISTS update_equality_trigger ON public.work_time;
    CREATE TRIGGER update_equality_trigger
    AFTER INSERT OR UPDATE OF hours_worked, record_type
    ON public.work_time
    FOR EACH ROW
    EXECUTE FUNCTION update_equality_on_record_change();
    
    RAISE NOTICE 'Created equality trigger and function for work_time table';
  ELSE
    RAISE NOTICE 'work_time table does not exist';
  END IF;
END $$; 