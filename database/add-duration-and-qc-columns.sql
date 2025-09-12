-- Add QC Score and Total Duration columns to existing website projects schema
-- Run this SQL in your Supabase database

-- Add Total Duration column to website_projects table
ALTER TABLE website_projects 
ADD COLUMN total_duration_hours INTEGER;

-- Add QC Score column to website_projects table (since it's a mirror column on main task)
ALTER TABLE website_projects 
ADD COLUMN qc_review_score NUMERIC(3,2); -- Allows scores like 85.50

-- Add comments for new columns
COMMENT ON COLUMN website_projects.total_duration_hours IS 'Total duration in hours from Monday.com mirror column (sum of actual duration from subitems)';
COMMENT ON COLUMN website_projects.qc_review_score IS 'QC Review Score from Monday.com mirror column (from Website QC Review subitem)';

-- Create index for performance on new columns (for monthly aggregations)
CREATE INDEX idx_website_projects_total_duration ON website_projects(total_duration_hours) WHERE total_duration_hours IS NOT NULL;
CREATE INDEX idx_website_projects_qc_score ON website_projects(qc_review_score) WHERE qc_review_score IS NOT NULL;
CREATE INDEX idx_website_projects_completion_month ON website_projects(DATE_TRUNC('month', actual_completion_date)) WHERE actual_completion_date IS NOT NULL;

-- Update the existing sync status for re-sync
UPDATE website_projects SET sync_status = 'needs_update' WHERE sync_status = 'completed';