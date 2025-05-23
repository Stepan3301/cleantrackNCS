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
      date DATE NOT NULL,
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

    -- Create a policy that allows managers to view all hours
    CREATE POLICY "Managers can view all hours" 
      ON public.working_hours 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role = 'manager' OR profiles.role = 'head_manager' OR profiles.role = 'owner')
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