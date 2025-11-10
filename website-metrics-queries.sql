-- Website Project Metrics - COMPLETED PROJECTS ONLY
-- These queries filter for truly completed website projects

-- First, let's define what "completed" means based on the sync logic:
-- completed = phase is 'Completed'/'Complete' OR dev_status is 'Done'/'Task Done'/'Completed' OR has actual_completion_date

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
        -- Completed based on phase
        (current_phase ILIKE '%completed%' OR current_phase ILIKE '%complete%') OR
        -- Completed based on dev status
        (current_dev_status ILIKE '%done%' OR
         current_dev_status ILIKE '%completed%' OR
         current_dev_status ILIKE '%task done%') OR
        -- Has actual completion date
        actual_completion_date IS NOT NULL
),
monthly_duration AS (
    SELECT
        DATE_TRUNC('month', completion_date) as month,
        COUNT(*) as completed_projects_count,
        AVG(total_duration_hours) as avg_duration_hours,
        MIN(total_duration_hours) as min_duration,
        MAX(total_duration_hours) as max_duration,
        -- Show individual projects for verification
        ARRAY_AGG(name ORDER BY completion_date) as project_names,
        ARRAY_AGG(total_duration_hours ORDER BY completion_date) as duration_values
    FROM completed_projects
    WHERE total_duration_hours IS NOT NULL AND total_duration_hours > 0
    GROUP BY DATE_TRUNC('month', completion_date)
)
SELECT
    month,
    completed_projects_count,
    ROUND(avg_duration_hours, 2) as avg_duration_hours,
    min_duration,
    max_duration,
    project_names,
    duration_values
FROM monthly_duration
ORDER BY month DESC;

-- 2. AVG QC REVIEW SCORE FOR NEW BUILD PROJECTS BY MONTH
WITH completed_new_builds AS (
    SELECT
        name,
        task_type,
        current_phase,
        current_dev_status,
        actual_completion_date,
        qc_review_score,
        -- Use actual_completion_date if available, otherwise use updated_at as fallback
        COALESCE(actual_completion_date::date, updated_at::date) as completion_date
    FROM website_projects
    WHERE
        -- Only New Build projects
        task_type = 'New Build' AND
        (
            -- Completed based on phase
            (current_phase ILIKE '%completed%' OR current_phase ILIKE '%complete%') OR
            -- Completed based on dev status
            (current_dev_status ILIKE '%done%' OR
             current_dev_status ILIKE '%completed%' OR
             current_dev_status ILIKE '%task done%') OR
            -- Has actual completion date
            actual_completion_date IS NOT NULL
        )
),
monthly_qc_scores AS (
    SELECT
        DATE_TRUNC('month', completion_date) as month,
        COUNT(*) as completed_new_builds_count,
        AVG(qc_review_score) as avg_qc_score,
        MIN(qc_review_score) as min_qc_score,
        MAX(qc_review_score) as max_qc_score,
        -- Show individual projects for verification
        ARRAY_AGG(name ORDER BY completion_date) as project_names,
        ARRAY_AGG(qc_review_score ORDER BY completion_date) as qc_score_values
    FROM completed_new_builds
    WHERE qc_review_score IS NOT NULL AND qc_review_score > 0
    GROUP BY DATE_TRUNC('month', completion_date)
)
SELECT
    month,
    completed_new_builds_count,
    ROUND(avg_qc_score, 2) as avg_qc_score,
    min_qc_score,
    max_qc_score,
    project_names,
    qc_score_values
FROM monthly_qc_scores
ORDER BY month DESC;

-- 3. SUMMARY - All completed projects for verification
SELECT
    'SUMMARY - All Completed Projects' as section,
    COUNT(*) as total_completed,
    COUNT(CASE WHEN total_duration_hours IS NOT NULL AND total_duration_hours > 0 THEN 1 END) as with_duration,
    COUNT(CASE WHEN qc_review_score IS NOT NULL AND qc_review_score > 0 THEN 1 END) as with_qc_score,
    COUNT(CASE WHEN task_type = 'New Build' THEN 1 END) as new_builds,
    COUNT(CASE WHEN task_type = 'Rebuild' THEN 1 END) as rebuilds
FROM website_projects
WHERE
    (current_phase ILIKE '%completed%' OR current_phase ILIKE '%complete%') OR
    (current_dev_status ILIKE '%done%' OR
     current_dev_status ILIKE '%completed%' OR
     current_dev_status ILIKE '%task done%') OR
    actual_completion_date IS NOT NULL;