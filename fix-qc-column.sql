-- Fix QC Review Score column to allow values up to 100
ALTER TABLE website_projects
ALTER COLUMN qc_review_score TYPE NUMERIC(5,2);