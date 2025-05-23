-- Direct SQL script for the Supabase SQL Editor
-- This updates the work_time table policy to allow users to update their own hours with approved status

-- Option 1: If the policy is named "Users can update their own approved hours"
ALTER POLICY "Users can update their own approved hours"
ON "public"."work_time"
TO public
USING (
  ((auth.uid() = user_id) AND (status = 'approved'::text))
)
WITH CHECK (
  ((auth.uid() = user_id) AND (status = 'approved'::text))
);

-- Option 2: If the policy is named "Users can update their own pending hours"
-- Uncomment these lines if Option 1 fails with "policy does not exist" error
/*
ALTER POLICY "Users can update their own pending hours" 
ON "public"."work_time" 
RENAME TO "Users can update their own approved hours";

ALTER POLICY "Users can update their own approved hours"
ON "public"."work_time"
TO public
USING (
  ((auth.uid() = user_id) AND (status = 'approved'::text))
)
WITH CHECK (
  ((auth.uid() = user_id) AND (status = 'approved'::text))
);
*/

-- Option 3: If neither policy exists, create a new one
-- Uncomment these lines if both Option 1 and Option 2 fail
/*
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
*/ 