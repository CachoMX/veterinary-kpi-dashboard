-- Query to check subitems for Orchard Veterinary Hospital project

-- First, find the project
SELECT
    id,
    name,
    task_type,
    current_phase,
    last_synced,
    created_at
FROM website_projects
WHERE name ILIKE '%orchard%veterinary%hospital%'
   OR name ILIKE '%orchard%'
ORDER BY created_at DESC;

-- Then get its subitems (replace PROJECT_ID with the actual ID from above)
-- SELECT
--     st.id,
--     st.name,
--     st.owner,
--     st.department,
--     st.status,
--     st.phase,
--     st.expected_duration,
--     st.actual_duration,
--     st.timeline_start,
--     st.timeline_end,
--     st.created_at
-- FROM website_subtasks st
-- JOIN website_projects p ON st.project_id = p.id
-- WHERE p.name ILIKE '%orchard%veterinary%hospital%'
-- ORDER BY st.created_at;

-- Or if you want to see ALL projects and their subitem counts:
SELECT
    p.name as project_name,
    p.task_type,
    p.current_phase,
    COUNT(st.id) as subitem_count,
    p.last_synced
FROM website_projects p
LEFT JOIN website_subtasks st ON p.id = st.project_id
GROUP BY p.id, p.name, p.task_type, p.current_phase, p.last_synced
ORDER BY p.created_at DESC
LIMIT 20;