-- Calculate metrics directly from subitems instead of lookup columns
-- This avoids relying on potentially broken lookup formulas

-- 1. AVG DURATION FOR COMPLETED WEBSITE PROJECTS BY MONTH (from subitems)
WITH completed_projects AS (
    SELECT
        p.id,
        p.name,
        p.task_type,
        p.current_phase,
        COALESCE(p.actual_completion_date::date, p.updated_at::date) as completion_date,
        -- Calculate total duration from subitems
        COALESCE(SUM(st.actual_duration), SUM(st.expected_duration), 0) as total_duration_hours
    FROM website_projects p
    LEFT JOIN website_subtasks st ON p.id = st.project_id
    WHERE
        (p.current_phase = 'Completed' OR p.current_phase = 'Complete')
    GROUP BY p.id, p.name, p.task_type, p.current_phase, p.actual_completion_date, p.updated_at
    HAVING COALESCE(SUM(st.actual_duration), SUM(st.expected_duration), 0) > 0
)
SELECT
    TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
    COUNT(*) as completed_projects_count,
    ROUND(AVG(total_duration_hours), 2) as avg_duration_hours,
    MIN(total_duration_hours) as min_duration,
    MAX(total_duration_hours) as max_duration,
    ARRAY_AGG(name ORDER BY completion_date) as project_names,
    ARRAY_AGG(total_duration_hours ORDER BY completion_date) as duration_values
FROM completed_projects
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month DESC;

-- 2. AVG QC SCORE FOR NEW BUILD PROJECTS BY MONTH (from QC subitems)
WITH qc_subitem_scores AS (
    SELECT
        p.id as project_id,
        p.name,
        p.task_type,
        COALESCE(p.actual_completion_date::date, p.updated_at::date) as completion_date,
        -- Look for QC scores in subtasks that contain "QC" or "review"
        AVG(
            CASE
                WHEN st.name ILIKE '%qc%' OR st.name ILIKE '%review%' OR st.name ILIKE '%quality%'
                THEN CASE
                    -- Try to extract numeric score from different possible columns
                    WHEN st.actual_duration BETWEEN 0 AND 100 THEN st.actual_duration
                    WHEN st.expected_duration BETWEEN 0 AND 100 THEN st.expected_duration
                    ELSE NULL
                END
                ELSE NULL
            END
        ) as avg_qc_score
    FROM website_projects p
    LEFT JOIN website_subtasks st ON p.id = st.project_id
    WHERE
        p.task_type = 'New Build' AND
        (p.current_phase = 'Completed' OR p.current_phase = 'Complete')
    GROUP BY p.id, p.name, p.task_type, p.actual_completion_date, p.updated_at
    HAVING AVG(
        CASE
            WHEN st.name ILIKE '%qc%' OR st.name ILIKE '%review%' OR st.name ILIKE '%quality%'
            THEN CASE
                WHEN st.actual_duration BETWEEN 0 AND 100 THEN st.actual_duration
                WHEN st.expected_duration BETWEEN 0 AND 100 THEN st.expected_duration
                ELSE NULL
            END
            ELSE NULL
        END
    ) IS NOT NULL
)
SELECT
    TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
    COUNT(*) as completed_new_builds_count,
    ROUND(AVG(avg_qc_score), 2) as avg_qc_score,
    MIN(avg_qc_score) as min_qc_score,
    MAX(avg_qc_score) as max_qc_score,
    ARRAY_AGG(name ORDER BY completion_date) as project_names,
    ARRAY_AGG(avg_qc_score ORDER BY completion_date) as qc_score_values
FROM qc_subitem_scores
GROUP BY DATE_TRUNC('month', completion_date)
ORDER BY month DESC;

-- 3. DEBUG: Check what subitem data we actually have
SELECT
    p.name as project_name,
    p.task_type,
    p.current_phase,
    st.name as subitem_name,
    st.actual_duration,
    st.expected_duration,
    st.completion_date,
    st.status
FROM website_projects p
LEFT JOIN website_subtasks st ON p.id = st.project_id
WHERE p.current_phase = 'Completed'
ORDER BY p.name, st.name;

-- 4. SUMMARY: What data do we have?
SELECT
    'COMPLETED PROJECTS SUMMARY' as section,
    COUNT(DISTINCT p.id) as total_completed_projects,
    COUNT(DISTINCT st.id) as total_subitems,
    COUNT(CASE WHEN st.actual_duration IS NOT NULL AND st.actual_duration > 0 THEN 1 END) as subitems_with_actual_duration,
    COUNT(CASE WHEN st.expected_duration IS NOT NULL AND st.expected_duration > 0 THEN 1 END) as subitems_with_expected_duration,
    COUNT(CASE WHEN st.name ILIKE '%qc%' OR st.name ILIKE '%review%' THEN 1 END) as qc_related_subitems
FROM website_projects p
LEFT JOIN website_subtasks st ON p.id = st.project_id
WHERE p.current_phase = 'Completed';