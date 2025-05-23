-- Create audit_logs table for tracking important system events
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES profiles(id),
    performed_by UUID NOT NULL REFERENCES profiles(id),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS audit_logs_event_type_idx ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS audit_logs_performed_by_idx ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs(created_at);

-- Add Row Level Security policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only owner and head_manager can view audit logs
CREATE POLICY audit_logs_select_policy ON audit_logs 
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE role IN ('owner', 'head_manager')
        )
    );

-- Only the system can insert audit logs (via service role)
CREATE POLICY audit_logs_insert_policy ON audit_logs 
    FOR INSERT 
    WITH CHECK (true);

-- No one can delete audit logs
CREATE POLICY audit_logs_delete_policy ON audit_logs 
    FOR DELETE 
    USING (false);

-- Add function to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at column
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON audit_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 