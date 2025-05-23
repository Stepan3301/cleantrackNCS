-- Function to create the announcements table if it doesn't exist
CREATE OR REPLACE FUNCTION create_announcements_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'announcements'
  ) THEN
    -- Create the announcements table
    CREATE TABLE public.announcements (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      announcement_type TEXT NOT NULL CHECK (announcement_type IN ('general', 'direct')),
      recipients UUID[] DEFAULT NULL, -- Array of user IDs for direct announcements
      author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
    );

    -- Enable RLS on the table
    ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

    -- Create a policy for general announcements - visible to all authenticated users
    CREATE POLICY "Users can view general announcements" 
      ON public.announcements 
      FOR SELECT 
      USING (
        announcement_type = 'general'
      );

    -- Create a policy for direct announcements - visible to recipients
    CREATE POLICY "Recipients can view direct announcements" 
      ON public.announcements 
      FOR SELECT 
      USING (
        announcement_type = 'direct' AND
        auth.uid() = ANY(recipients)
      );

    -- Authors can view their own announcements
    CREATE POLICY "Authors can view their own announcements" 
      ON public.announcements 
      FOR SELECT 
      USING (
        author_id = auth.uid()
      );

    -- Managers and above can view all announcements
    CREATE POLICY "Managers can view all announcements" 
      ON public.announcements 
      FOR SELECT 
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role IN ('manager', 'head_manager', 'owner'))
        )
      );

    -- Only head managers and owners can create announcements
    CREATE POLICY "Only head managers and owners can create announcements" 
      ON public.announcements 
      FOR INSERT 
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role IN ('head_manager', 'owner'))
        )
      );

    -- Only authors, head managers, and owners can update announcements
    CREATE POLICY "Only authors, head managers, and owners can update announcements" 
      ON public.announcements 
      FOR UPDATE 
      USING (
        author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role IN ('head_manager', 'owner'))
        )
      );

    -- Only authors, head managers, and owners can delete announcements
    CREATE POLICY "Only authors, head managers, and owners can delete announcements" 
      ON public.announcements 
      FOR DELETE 
      USING (
        author_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND (profiles.role IN ('head_manager', 'owner'))
        )
      );

    -- Create triggers for updated_at
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON public.announcements
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();

    RAISE NOTICE 'Created announcements table';
  ELSE
    RAISE NOTICE 'announcements table already exists';
  END IF;
END;
$$;

-- Execute the function to create the table
SELECT create_announcements_table(); 