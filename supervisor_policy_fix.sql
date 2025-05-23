ALTER POLICY "Supervisors can insert hours for their staff"
ON "public"."work_time"
TO public
WITH CHECK (
  (record_type = 'supervisor'::text) AND 
  (created_by = auth.uid()) AND 
  (EXISTS (
    SELECT 1
    FROM profiles
    WHERE (profiles.id = auth.uid()) AND 
          ((profiles.role)::text = 'supervisor'::text) AND 
          (work_time.user_id IN (
            SELECT profiles_1.id
            FROM profiles profiles_1
            WHERE (profiles_1.supervisor_id = auth.uid())
          ))
  ))
); 