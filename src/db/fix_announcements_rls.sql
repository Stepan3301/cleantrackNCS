-- First ensure Row Level Security is enabled
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view general announcements" ON public.announcements;
DROP POLICY IF EXISTS "Recipients can view direct announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authors can view their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Managers can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only head managers and owners can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only authors, head managers, and owners can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only authors, head managers, and owners can delete announcements" ON public.announcements;

-- Also drop any policies with truncated names
DROP POLICY IF EXISTS "All users can see general announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only owners and head managers can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only the author, owners, and head managers can delete announcem" ON public.announcements;
DROP POLICY IF EXISTS "Only the author, owners, and head managers can update announcem" ON public.announcements;
DROP POLICY IF EXISTS "Owners and head managers can see all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can see announcements they authored" ON public.announcements;
DROP POLICY IF EXISTS "Users can see direct announcements addressed to them" ON public.announcements;

-- Create a policy for general announcements - visible to all authenticated users
CREATE POLICY "Users can view general announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    announcement_type = 'general' AND auth.role() = 'authenticated'
  );

-- Create a policy for direct announcements - visible to recipients (with proper type casting)
CREATE POLICY "Recipients can view direct announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    announcement_type = 'direct' AND
    auth.uid()::text = ANY(recipients)
  );

-- Authors can view their own announcements
CREATE POLICY "Authors can view their own announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    author_id = auth.uid()::uuid
  );

-- Managers and above can view all announcements
CREATE POLICY "Managers can view all announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::uuid
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
      WHERE profiles.id = auth.uid()::uuid
      AND (profiles.role IN ('head_manager', 'owner'))
    )
  );

-- Only authors, head managers, and owners can update announcements
CREATE POLICY "Only authors, head managers, and owners can update announcements" 
  ON public.announcements 
  FOR UPDATE 
  USING (
    author_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::uuid
      AND (profiles.role IN ('head_manager', 'owner'))
    )
  );

-- Only authors, head managers, and owners can delete announcements
CREATE POLICY "Only authors, head managers, and owners can delete announcements" 
  ON public.announcements 
  FOR DELETE 
  USING (
    author_id = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::uuid
      AND (profiles.role IN ('head_manager', 'owner'))
    )
  );

-- For debugging: add a comment to explain potential issues
COMMENT ON TABLE public.announcements IS 'Company announcements with RLS policies. If problems persist, use the debug panel in the UI to check exec_sql function and policies.';

-- Simplified policy for testing - enables all authenticated users to use the table
-- Only enable this temporarily if you're having issues with the more restrictive policies above
/*
CREATE POLICY "Allow authenticated access" 
  ON public.announcements 
  FOR ALL 
  USING (auth.role() = 'authenticated');
*/ 