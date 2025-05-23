-- First ensure Row Level Security is enabled
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "announcements_select_general" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_direct" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_author" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select_admin" ON public.announcements;
DROP POLICY IF EXISTS "announcements_insert" ON public.announcements;
DROP POLICY IF EXISTS "announcements_update" ON public.announcements;
DROP POLICY IF EXISTS "announcements_delete" ON public.announcements;
DROP POLICY IF EXISTS "Users can view general announcements" ON public.announcements;
DROP POLICY IF EXISTS "Recipients can view direct announcements" ON public.announcements;
DROP POLICY IF EXISTS "Authors can view their own announcements" ON public.announcements;
DROP POLICY IF EXISTS "Managers can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only head managers and owners can create announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only authors, head managers, and owners can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only authors, head managers, and owners can delete announcements" ON public.announcements;
DROP POLICY IF EXISTS "Head managers and owners can view all announcements" ON public.announcements;

-- Also drop any policies with truncated names
DROP POLICY IF EXISTS "All users can see general announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only owners and head managers can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Only the author, owners, and head managers can delete announcem" ON public.announcements;
DROP POLICY IF EXISTS "Only the author, owners, and head managers can update announcem" ON public.announcements;
DROP POLICY IF EXISTS "Owners and head managers can see all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Users can see announcements they authored" ON public.announcements;
DROP POLICY IF EXISTS "Users can see direct announcements addressed to them" ON public.announcements;

-- Head Managers and Owners can view ALL announcements (highest priority policy)
CREATE POLICY "Head managers and owners can view all announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::uuid
      AND (profiles.role IN ('head_manager', 'owner'))
    )
  );

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
    auth.uid()::text = ANY(recipients)
  );

-- Authors can view their own announcements
CREATE POLICY "Authors can view their own announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    author_id = auth.uid()::uuid
  );

-- Managers can view all general announcements
CREATE POLICY "Managers can view all announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()::uuid
      AND (profiles.role = 'manager')
    ) AND (
      announcement_type = 'general' OR 
      author_id = auth.uid()::uuid OR
      auth.uid()::text = ANY(recipients)
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
COMMENT ON TABLE public.announcements IS 'Company announcements with RLS policies (Debug: Head manager priority policy added)';

-- Simplified policy for testing - COMMENTED OUT
-- Uncomment this to allow all authenticated users to access the table (for testing)
-- DROP POLICY IF EXISTS "authenticated can access announcements" ON "public"."announcements";
-- CREATE POLICY "authenticated can access announcements" ON "public"."announcements"
--   FOR ALL USING (auth.role() = 'authenticated'); 