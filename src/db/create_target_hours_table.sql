-- Create target_hours table
CREATE TABLE IF NOT EXISTS public.target_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_hours INTEGER NOT NULL DEFAULT 200,
  period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  
  -- Unique constraint to ensure only one target per user per period
  UNIQUE(user_id, period)
);

-- Create RLS policies
ALTER TABLE public.target_hours ENABLE ROW LEVEL SECURITY;

-- Policy for viewing target hours
CREATE POLICY "Anyone can view target hours"
ON public.target_hours FOR SELECT
TO public
USING (true);

-- Policy for inserting target hours - owners, head_managers, and managers only
CREATE POLICY "Managers can create target hours"
ON public.target_hours FOR INSERT
TO public
WITH CHECK (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('owner', 'head_manager', 'manager')
  )
);

-- Policy for updating target hours - owners, head_managers, and managers only
CREATE POLICY "Managers can update target hours"
ON public.target_hours FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('owner', 'head_manager', 'manager')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('owner', 'head_manager', 'manager')
  )
);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_target_hours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_target_hours_updated_at
BEFORE UPDATE ON public.target_hours
FOR EACH ROW
EXECUTE FUNCTION update_target_hours_updated_at(); 