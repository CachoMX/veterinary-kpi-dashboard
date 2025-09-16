const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    // Add authentication like other sync endpoints
    const { authorization } = req.headers;
    const cronHeader = req.headers['x-vercel-cron'];
    const urlSecret = req.query.secret;

    // Check if it's a Vercel cron job or authorized request
    const isCronJob = cronHeader === '1' || cronHeader === 'true';
    const isAuthorized = isCronJob ||
                        authorization === `Bearer ${process.env.SYNC_SECRET_KEY}` ||
                        urlSecret === process.env.SYNC_SECRET_KEY ||
                        req.method === 'POST';

    if (!isAuthorized) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'This endpoint requires proper authentication'
        });
    }

    // Log sync start
    const { data: syncLog, error: logError } = await supabase
        .from('website_sync_logs')
        .insert({
            sync_type: 'completed_website_projects_sync',
            status: 'in_progress',
            triggered_by: isCronJob ? 'cron' : 'manual'
        })
        .select()
        .single();

    if (logError) {
        console.error('Failed to create sync log:', logError);
        return res.status(500).json({ error: 'Failed to start sync' });
    }

    try {
        console.log('Starting COMPLETED Website Projects sync...');

        const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
        const DEV_BOARD_ID = '7034166433';

        let stats = {
            projects_found: 0,
            projects_processed: 0,
            failed_projects: 0,
            subtasks_processed: 0
        };

        // Fetch completed website projects from Monday.com
        const completedProjects = await fetchCompletedWebsiteProjects(MONDAY_TOKEN, DEV_BOARD_ID);
        stats.projects_found = completedProjects.length;
        console.log(`📋 Found ${completedProjects.length} COMPLETED website projects to sync`);

        for (const project of completedProjects) {
            try {
                console.log(`\n🔄 Syncing COMPLETED: ${project.name}`);

                // Fetch subtasks for each completed project
                const subtasks = await fetchProjectSubtasks(MONDAY_TOKEN, project.id);
                console.log(`  ✅ Found ${subtasks.length} subtasks for ${project.name}`);

                // Process project data for database
                const processedProject = await processCompletedProject(project, subtasks);

                // Save to database with UPSERT
                await saveCompletedProjectToDatabase(processedProject, subtasks);
                console.log(`  ✅ Successfully saved COMPLETED ${project.name} to database`);

                stats.projects_processed++;
                stats.subtasks_processed += subtasks.length;

            } catch (projectError) {
                console.error(`❌ ERROR syncing COMPLETED project ${project.name}:`, projectError.message);
                stats.failed_projects = (stats.failed_projects || 0) + 1;
            }
        }

        // Update sync log
        await supabase
            .from('website_sync_logs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                ...stats
            })
            .eq('id', syncLog.id);

        console.log(`\n🏁 COMPLETED Website Projects sync finished`);
        console.log(`📊 STATS: Found ${stats.projects_found}, Processed ${stats.projects_processed}, Failed ${stats.failed_projects}`);

        res.status(200).json({
            success: true,
            message: `Synced ${stats.projects_processed}/${stats.projects_found} COMPLETED website projects`,
            stats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('COMPLETED Website Projects sync error:', error);

        // Update sync log with error
        await supabase
            .from('website_sync_logs')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: error.message
            })
            .eq('id', syncLog.id);

        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Fetch completed website projects from Monday.com
async function fetchCompletedWebsiteProjects(token, boardId) {
    let allProjects = [];
    let cursor = null;
    let pageCount = 0;

    while (pageCount < 10) { // Increased limit to get all 53 completed projects
        pageCount++;
        console.log(`Fetching completed projects page ${pageCount}...`);

        const query = `
            query {
                boards(ids: [${boardId}]) {
                    items_page(limit: 100${cursor ? `, cursor: "${cursor}"` : ''}) {
                        cursor
                        items {
                            id
                            name
                            state
                            created_at
                            updated_at
                            column_values {
                                id
                                text
                                value
                            }
                        }
                    }
                }
            }
        `;

        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        
        if (data.errors) {
            throw new Error('Monday.com API error: ' + JSON.stringify(data.errors));
        }

        const items = data.data.boards[0].items_page.items || [];
        if (items.length === 0) break;

        // Filter for COMPLETED projects - matching CSV export criteria exactly
        const completedWebsiteProjects = items.filter(item => {
            const taskType = getColumnText(item.column_values, 'task_tag__1');
            const phase = getColumnText(item.column_values, 'phase__1');

            // Match CSV export filter: Phase = "Completed" AND Task Type = "New Build"
            const isNewBuild = taskType === 'New Build';
            const isCompleted = phase === 'Completed';

            // Debug logging for first few items
            if (pageCount === 1 && allProjects.length < 5) {
                console.log(`  Debug: ${item.name} - Phase: "${phase}", Task Type: "${taskType}", Match: ${isNewBuild && isCompleted}`);
            }

            return isNewBuild && isCompleted;
        });

        allProjects = allProjects.concat(completedWebsiteProjects);
        cursor = data.data.boards[0].items_page.cursor;
        
        if (!cursor) break;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return allProjects;
}

// Fetch subtasks for a completed project
async function fetchProjectSubtasks(token, projectId) {
    const query = `
        query {
            items(ids: [${projectId}]) {
                subitems {
                    id
                    name
                    state
                    created_at
                    updated_at
                    column_values {
                        id
                        text
                        value
                    }
                }
            }
        }
    `;

    const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ query })
    });

    const data = await response.json();

    if (data.errors) {
        throw new Error('Monday.com API error fetching subtasks: ' + JSON.stringify(data.errors));
    }

    return data.data.items[0]?.subitems || [];
}

// Process completed project data for database
async function processCompletedProject(project, subtasks) {
    const rawTaskType = getColumnText(project.column_values, 'task_tag__1');

    // Normalize task_type to match database constraint
    let normalizedTaskType;
    if (rawTaskType && rawTaskType.toLowerCase().includes('rebuild')) {
        normalizedTaskType = 'Rebuild';
    } else if (rawTaskType && rawTaskType.toLowerCase().includes('new build')) {
        normalizedTaskType = 'New Build';
    } else {
        normalizedTaskType = 'New Build'; // fallback
    }

    const processedProject = {
        id: project.id,
        name: project.name,
        task_type: normalizedTaskType,
        created_at: project.created_at,
        updated_at: project.updated_at,

        // Timeline data
        expected_due_date: parseDate(getColumnText(project.column_values, 'date__1')), // Expected Due Date

        // IMPORTANT: Set actual completion date for metrics using correct column ID
        actual_completion_date: parseDate(getColumnText(project.column_values, 'date8__1')) || // Completion Date
                               parseDate(getColumnText(project.column_values, 'date__1')) || // Fallback to due date
                               new Date().toISOString().split('T')[0], // Today as last fallback

        // Status (completed projects)
        current_phase: getColumnText(project.column_values, 'phase__1'),
        current_dev_status: getColumnText(project.column_values, 'status'),
        current_qc_status: getColumnText(project.column_values, 'status_15__1'),

        // Team assignments
        developers: getPersonArray(project.column_values, 'person'),
        qc_team: getPersonArray(project.column_values, 'people__1'),
        requestors: getPersonArray(project.column_values, 'people6__1'),

        // METRICS FIELDS - Essential for the charts
        total_duration_hours: parseFloat(getColumnText(project.column_values, 'lookup_mktvxvt7')) || null,
        qc_review_score: calculateQCScoreFromSubtasks(subtasks), // Extract QC score from subitems

        // Mark as completed
        is_overdue: false,
        days_overdue: 0,

        // Sync metadata
        last_synced: new Date().toISOString(),
        sync_status: 'completed'
    };

    return processedProject;
}

// Save completed project to database with UPSERT
async function saveCompletedProjectToDatabase(project, subtasks) {
    try {
        // Use UPSERT to handle both new and existing projects
        const { error: projectError } = await supabase
            .from('website_projects')
            .upsert(project, {
                onConflict: 'id',
                ignoreDuplicates: false
            });

        if (projectError) {
            throw new Error('Failed to save completed project: ' + projectError.message);
        }

        // Save subtasks with UPSERT
        for (const subtask of subtasks) {
            const processedSubtask = {
                id: subtask.id,
                project_id: project.id,
                name: subtask.name,
                created_at: subtask.created_at,
                updated_at: subtask.updated_at,

                // Timeline
                timeline_start: parseDate(getColumnText(subtask.column_values, 'timeline_start')),
                timeline_end: parseDate(getColumnText(subtask.column_values, 'timeline_end')),
                completion_date: parseDate(getColumnText(subtask.column_values, 'completion_date')),
                expected_duration: parseFloat(getColumnText(subtask.column_values, 'expected_duration')) || null,
                actual_duration: parseFloat(getColumnText(subtask.column_values, 'actual_duration')) || null,

                // Assignment
                owner: getColumnText(subtask.column_values, 'person'),
                department: 'Completed', // Mark as completed department
                phase: getColumnText(subtask.column_values, 'phase__1'),
                status: getColumnText(subtask.column_values, 'status'),
                priority: getColumnText(subtask.column_values, 'priority__1'),

                // Completion status
                is_overdue: false,
                last_synced: new Date().toISOString()
            };

            const { error: subtaskError } = await supabase
                .from('website_subtasks')
                .upsert(processedSubtask, {
                    onConflict: 'id',
                    ignoreDuplicates: false
                });

            if (subtaskError) {
                console.error('Failed to save completed subtask:', subtaskError);
            }
        }

    } catch (error) {
        console.error('Database save error for completed project:', error);
        throw error;
    }
}

// Helper function to get column text
function getColumnText(columnValues, columnId) {
    const column = columnValues.find(col => col.id === columnId);
    return column ? column.text || '' : '';
}

// Helper function to get person array
function getPersonArray(columnValues, columnId) {
    const text = getColumnText(columnValues, columnId);
    return text ? text.split(', ').filter(Boolean) : [];
}

// Helper function to calculate QC score from subtasks
function calculateQCScoreFromSubtasks(subtasks) {
    if (!subtasks || subtasks.length === 0) return null;

    // Look for numeric values that could be QC scores (1-100)
    const potentialScores = [];

    subtasks.forEach(subtask => {
        // Check for numeric values in column values
        subtask.column_values.forEach(col => {
            const value = col.text;
            if (value && !isNaN(value)) {
                const numValue = parseFloat(value);
                // QC scores are typically between 1-100
                if (numValue >= 1 && numValue <= 100) {
                    // Store the score with context for debugging
                    potentialScores.push({
                        score: numValue,
                        subtaskName: subtask.name,
                        columnId: col.id
                    });
                }
            }
        });
    });

    // If we found potential scores, return the first one
    // (In practice, most projects should have only one QC score)
    if (potentialScores.length > 0) {
        // Log for debugging
        console.log(`  QC Scores found for project: ${potentialScores.map(ps => `${ps.score} (${ps.subtaskName})`).join(', ')}`);

        // Return the first/highest score found
        const scores = potentialScores.map(ps => ps.score);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return Math.round(avgScore * 100) / 100; // Round to 2 decimal places
    }

    return null;
}

// Helper function to parse dates safely
function parseDate(dateString) {
    if (!dateString || dateString.trim() === '') {
        return null;
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return null;
        }
        return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
    } catch (error) {
        console.error('Error parsing date:', dateString, error);
        return null;
    }
}