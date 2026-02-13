-- Add Švietimo Centras portal support and enhance school portal system

-- Update sync-grades function to include new portal
-- This will be handled in the application code rather than SQL

-- Add new portal to the supported portals enum (handled in TypeScript)
-- The existing user_credentials table already supports any service_name

-- Create a view for portal statistics
CREATE OR REPLACE VIEW portal_sync_stats AS
SELECT 
  source,
  COUNT(*) as total_syncs,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(synced_at) as last_sync,
  AVG(COUNT(*)) OVER() as avg_syncs_per_user
FROM synced_grades
GROUP BY source
ORDER BY total_syncs DESC;

-- Create index for better performance on source filtering
CREATE INDEX IF NOT EXISTS idx_synced_grades_source ON synced_grades(source);

-- Add a table to track portal availability and status
CREATE TABLE IF NOT EXISTS portal_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portal_name TEXT NOT NULL UNIQUE,
  is_available BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT now(),
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert initial portal statuses
INSERT INTO portal_status (portal_name, is_available) VALUES
  ('tamo', true),
  ('manodienynas', true),
  ('svietimocentras', true)
ON CONFLICT (portal_name) DO NOTHING;

-- Create index for portal status
CREATE INDEX IF NOT EXISTS idx_portal_status_name ON portal_status(portal_name);

-- Enable RLS for portal status
ALTER TABLE portal_status ENABLE ROW LEVEL SECURITY;

-- Create policies for portal status
CREATE POLICY "Everyone can view portal status"
ON portal_status FOR SELECT
USING (true);

CREATE POLICY "Admins can update portal status"
ON portal_status FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to update portal status
CREATE OR REPLACE FUNCTION update_portal_status(
  portal TEXT,
  available BOOLEAN,
  response_time INTEGER DEFAULT NULL,
  error_msg TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO portal_status (portal_name, is_available, response_time_ms, error_message, last_checked)
  VALUES (portal, available, response_time, error_msg, now())
  ON CONFLICT (portal_name) 
  DO UPDATE SET 
    is_available = EXCLUDED.is_available,
    response_time_ms = EXCLUDED.response_time_ms,
    error_message = EXCLUDED.error_message,
    last_checked = now(),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a materialized view for grade analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS grade_analytics AS
SELECT 
  user_id,
  source,
  subject,
  COUNT(*) as grade_count,
  AVG(grade) as average_grade,
  MIN(grade) as min_grade,
  MAX(grade) as max_grade,
  STDDEV(grade) as grade_stddev,
  COUNT(CASE WHEN grade >= 8 THEN 1 END) as excellent_grades,
  COUNT(CASE WHEN grade >= 5 AND grade < 8 THEN 1 END) as good_grades,
  COUNT(CASE WHEN grade < 5 THEN 1 END) as poor_grades
FROM synced_grades
GROUP BY user_id, source, subject;

-- Create indexes for the materialized view
CREATE INDEX IF NOT EXISTS idx_grade_analytics_user ON grade_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_grade_analytics_source ON grade_analytics(source);

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW grade_analytics;

-- Create function to refresh grade analytics
CREATE OR REPLACE FUNCTION refresh_grade_analytics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW grade_analytics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to refresh analytics (this would be handled by Supabase cron)
-- For now, we'll create a manual trigger
CREATE OR REPLACE FUNCTION trigger_refresh_analytics()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM refresh_grade_analytics();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to refresh analytics when grades are synced
DROP TRIGGER IF EXISTS refresh_analytics_trigger ON synced_grades;
CREATE TRIGGER refresh_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON synced_grades
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_refresh_analytics();