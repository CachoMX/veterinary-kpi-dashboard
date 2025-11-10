-- Explore data to identify completed website projects
-- First, let's see what status/phase values we have

-- 1. Check all unique phases
SELECT
    current_phase,
    COUNT(*) as project_count
FROM website_projects
GROUP BY current_phase
ORDER BY project_count DESC;

-- 2. Check all unique dev statuses
SELECT
    current_dev_status,
    COUNT(*) as project_count
FROM website_projects
GROUP BY current_dev_status
ORDER BY project_count DESC;

-- 3. Check all unique QC statuses
SELECT
    current_qc_status,
    COUNT(*) as project_count
FROM website_projects
GROUP BY current_qc_status
ORDER BY project_count DESC;

-- 4. See projects with actual completion dates
SELECT
    name,
    task_type,
    current_phase,
    current_dev_status,
    current_qc_status,
    actual_completion_date,
    total_duration_hours,
    qc_review_score
FROM website_projects
WHERE actual_completion_date IS NOT NULL
ORDER BY actual_completion_date DESC;

-- 5. Look for projects that might be completed (multiple criteria)
SELECT
    name,
    task_type,
    current_phase,
    current_dev_status,
    current_qc_status,
    actual_completion_date,
    total_duration_hours,
    qc_review_score,
    created_at,
    updated_at
FROM website_projects
WHERE
    current_phase ILIKE '%complet%' OR
    current_dev_status ILIKE '%done%' OR
    current_dev_status ILIKE '%complet%' OR
    current_dev_status ILIKE '%launch%' OR
    current_qc_status ILIKE '%complet%' OR
    actual_completion_date IS NOT NULL
ORDER BY actual_completion_date DESC NULLS LAST;