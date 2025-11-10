-- Website Metrics for TRULY COMPLETED Projects Only
-- These will work once projects are marked as "Completed" in Monday.com

-- 1. AVG DURATION FOR COMPLETED WEBSITE PROJECTS BY MONTH
WITH completed_projects AS (
    SELECT
        name,
        task_type,
        current_phase,
        current_dev_status,
        actual_completion_date,
        total_duration_hours,
        qc_review_score,
        -- Use actual_completion_date if available, otherwise use updated_at as fallback
        COALESCE(actual_completion_date::date, updated_at::date) as completion_date
    FROM website_projects
    WHERE
        -- Only truly completed projects
        (current_phase = 'Completed' OR current_phase = 'Complete') AND
        total_duration_hours IS NOT NULL AND
        total_duration_hours > 0
)
SELECT
    TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
    COUNT(*) as completed_projects_count,
    ROUND(AVG(total_duration_hours), 2) as avg_duration_hours,
    MIN(total_duration_hours) as min_duration,
    MAX(total_duration_hours) as max_duration,
    ARRAY_AGG(name ORDER BY completion_date) as project_names
FROM completed_projects
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month DESC;

-- 2. AVG QC REVIEW SCORE FOR COMPLETED NEW BUILD PROJECTS BY MONTH
WITH completed_new_builds AS (
    SELECT
        name,
        task_type,
        current_phase,
        current_dev_status,
        actual_completion_date,
        qc_review_score,
        COALESCE(actual_completion_date::date, updated_at::date) as completion_date
    FROM website_projects
    WHERE
        -- Only completed New Build projects with QC scores
        task_type = 'New Build' AND
        (current_phase = 'Completed' OR current_phase = 'Complete') AND
        qc_review_score IS NOT NULL AND
        qc_review_score > 0
)
SELECT
    TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
    COUNT(*) as completed_new_builds_count,
    ROUND(AVG(qc_review_score), 2) as avg_qc_score,
    MIN(qc_review_score) as min_qc_score,
    MAX(qc_review_score) as max_qc_score,
    ARRAY_AGG(name ORDER BY completion_date) as project_names
FROM completed_new_builds
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month DESC;

-- 3. CURRENT STATUS CHECK (for testing)
SELECT
    'Current Status' as section,
    COUNT(*) as total_projects,
    COUNT(CASE WHEN current_phase = 'Completed' THEN 1 END) as completed_count,
    COUNT(CASE WHEN current_dev_status = 'Launched' THEN 1 END) as launched_count,
    COUNT(CASE WHEN total_duration_hours IS NOT NULL AND total_duration_hours > 0 THEN 1 END) as with_duration,
    COUNT(CASE WHEN qc_review_score IS NOT NULL AND qc_review_score > 0 THEN 1 END) as with_qc_score
FROM website_projects;

-- 4. TEST WITH SAMPLE DATA (for testing the queries)
-- Uncomment this section to test with fake completed projects
/*
-- First, let's temporarily mark some launched projects as completed for testing
UPDATE website_projects
SET
    current_phase = 'Completed',
    actual_completion_date = CASE
        WHEN name LIKE '%Companion Care%' THEN '2024-12-15'::date
        WHEN name LIKE '%Queen City%' THEN '2024-11-20'::date
        WHEN name LIKE '%Animal Medical Center%' THEN '2024-10-10'::date
        ELSE actual_completion_date
    END,
    total_duration_hours = CASE
        WHEN name LIKE '%Companion Care%' THEN 120
        WHEN name LIKE '%Queen City%' THEN 95
        WHEN name LIKE '%Animal Medical Center%' THEN 110
        ELSE total_duration_hours
    END,
    qc_review_score = CASE
        WHEN name LIKE '%Companion Care%' THEN 85.5
        WHEN name LIKE '%Queen City%' THEN 92.0
        ELSE qc_review_score
    END
WHERE current_dev_status = 'Launched'
AND name IN (
    'Companion Care Animal Hospital - Website New Build',
    'Queen City Veterinary Clinic - Website New Build',
    'Animal Medical Center KC - Website Rebuild (Joomla --> WP)'
);
*/