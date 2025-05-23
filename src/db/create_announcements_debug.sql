-- This script addresses all potential issues with the announcements system

-- 1. Create exec_sql function if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = 'exec_sql'
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Create the function with SECURITY DEFINER to bypass RLS
    EXECUTE $FUNC$
      CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
      RETURNS json AS $$
      BEGIN
        EXECUTE sql_query;
        RETURN json_build_object('success', true);
      EXCEPTION WHEN OTHERS THEN
        RETURN json_build_object('success', false, 'error', SQLERRM);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
      
      -- Grant execute permission to authenticated users
      GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
      
      -- Set security options
      COMMENT ON FUNCTION exec_sql IS 'Execute arbitrary SQL (admin only). Security risk - restrict via app logic.';
    $FUNC$;
    RAISE NOTICE 'Created exec_sql function';
  ELSE
    RAISE NOTICE 'exec_sql function already exists';
  END IF;
END$$;

-- 2. Create announcements table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE tablename = 'announcements' AND schemaname = 'public') THEN
    CREATE TABLE public.announcements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      announcement_type TEXT NOT NULL CHECK (announcement_type IN ('general', 'direct')),
      recipients TEXT[] NULL,
      author_id UUID NOT NULL REFERENCES public.profiles(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add comment to the table
    COMMENT ON TABLE public.announcements IS 'Company announcements for general or direct communication';
    
    -- Create updated_at trigger
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
    
    RAISE NOTICE 'Created announcements table';
  ELSE
    RAISE NOTICE 'announcements table already exists';
  END IF;
END$$;

-- 3. Fix announcements table if it exists but has issues
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'announcements' AND schemaname = 'public') THEN
    -- Check if author_id column is properly referenced to profiles
    BEGIN
      IF NOT EXISTS (
        SELECT FROM pg_constraint
        WHERE conname = 'announcements_author_id_fkey'
        AND conrelid = 'public.announcements'::regclass
      ) THEN
        -- Add the foreign key constraint if missing
        ALTER TABLE public.announcements
        ADD CONSTRAINT announcements_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES public.profiles(id);
        RAISE NOTICE 'Added missing foreign key constraint for author_id';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix author_id constraint: %', SQLERRM;
    END;
    
    -- Make sure announcement_type has proper check constraint
    BEGIN
      ALTER TABLE public.announcements
      DROP CONSTRAINT IF EXISTS announcements_announcement_type_check;
      
      ALTER TABLE public.announcements
      ADD CONSTRAINT announcements_announcement_type_check
      CHECK (announcement_type IN ('general', 'direct'));
      
      RAISE NOTICE 'Fixed announcement_type check constraint';
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix announcement_type constraint: %', SQLERRM;
    END;
  END IF;
END$$;

-- 4. Enable Row Level Security on the announcements table
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "announcements_select_general" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_direct" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_author" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_admin" ON public.announcements;
DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
DROP POLICY IF EXISTS "announcements_update" ON public.announcements;
DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;

-- 6. Create new policies with correct permissions

-- General announcements visible to all authenticated users
CREATE POLICY "announcements_select_general" ON public.announcements
FOR SELECT
USING (announcement_type = 'general' AND auth.role() = 'authenticated');

-- Direct announcements visible to recipients
CREATE POLICY "announcements_select_direct" ON public.announcements
FOR SELECT
USING (announcement_type = 'direct' AND auth.uid()::text = ANY(recipients));

-- Authors can view their own announcements
CREATE POLICY "announcements_select_author" ON public.announcements
FOR SELECT
USING (author_id = auth.uid());

-- Managers and above can view all announcements
CREATE POLICY "announcements_select_admin" ON public.announcements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'head_manager' OR role = 'owner')
  )
);

-- Only head managers and owners can create announcements
CREATE POLICY "announcements_insert" ON public.announcements
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'head_manager' OR role = 'owner')
  )
);

-- Only authors, head managers, and owners can update announcements
CREATE POLICY "announcements_update" ON public.announcements
FOR UPDATE
USING (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'head_manager' OR role = 'owner')
  )
);

-- Only authors, head managers, and owners can delete announcements
CREATE POLICY "announcements_delete" ON public.announcements
FOR DELETE
USING (
  author_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND (role = 'head_manager' OR role = 'owner')
  )
); 