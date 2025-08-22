const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = async (req, res) => {
    // Allow manual sync requests (you can add authentication later)
    const { authorization } = req.headers;
    const cronHeader = req.headers['x-vercel-cron'];
    const urlSecret = req.query.secret;
    
    // Check if it's a Vercel cron job or authorized request
    const isCronJob = cronHeader === '1' || cronHeader === 'true';
    const isAuthorized = isCronJob || 
                        authorization === `Bearer ${process.env.SYNC_SECRET_KEY}` ||
                        urlSecret === process.env.SYNC_SECRET_KEY ||
                        req.method === 'POST'; // Allow manual sync for now

    if (!isAuthorized) {
        return res.status(401).json({ 
            error: 'Unauthorized',
            message: 'This endpoint requires proper authentication'
        });
    }

    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    // Log sync start
    const { data: syncLog, error: logError } = await supabase
        .from('website_sync_logs')
        .insert({
            sync_type: 'website_projects_sync',
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
        console.log('Starting Website Projects sync...');
        
        let stats = {
            projects_processed: 0,
            subtasks_processed: 0,
            comments_processed: 0,
            ai_analyses_completed: 0
        };

        // Step 1: Fetch website projects (New Build and Rebuild tasks)
        const websiteProjects = await fetchWebsiteProjects(MONDAY_TOKEN, DEV_BOARD_ID);
        console.log(`Found ${websiteProjects.length} website projects`);

        for (const project of websiteProjects) {
            try {
                // Step 2: Fetch subtasks for each project
                const subtasks = await fetchProjectSubtasks(MONDAY_TOKEN, project.id);
                console.log(`Project ${project.name}: Found ${subtasks.length} subtasks`);

                // Step 3: Fetch comments for main task and all subtasks
                const allComments = await fetchProjectComments(MONDAY_TOKEN, project.id, subtasks);
                console.log(`Project ${project.name}: Found ${allComments.length} comments`);

                // Step 4: Process and analyze data with AI
                const processedProject = await processProjectData(project, subtasks, allComments);

                // Step 5: Save to database
                await saveProjectToDatabase(processedProject, subtasks, allComments);

                stats.projects_processed++;
                stats.subtasks_processed += subtasks.length;
                stats.comments_processed += allComments.length;
                stats.ai_analyses_completed++;

                console.log(`Processed project: ${project.name}`);

            } catch (projectError) {
                console.error(`Error processing project ${project.name}:`, projectError);
                // Continue with next project
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

        console.log('Website Projects sync completed successfully');
        
        res.status(200).json({
            success: true,
            message: 'Website projects synced successfully',
            stats: stats,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Website Projects sync error:', error);
        
        // Update sync log with error
        await supabase
            .from('website_sync_logs')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: error.message,
                error_details: { stack: error.stack }
            })
            .eq('id', syncLog.id);

        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Fetch website projects (New Build and Rebuild tasks) from Monday.com
async function fetchWebsiteProjects(token, boardId) {
    let allProjects = [];
    let cursor = null;
    let pageCount = 0;

    while (pageCount < 10) { // Limit pages for website projects
        pageCount++;
        console.log(`Fetching website projects page ${pageCount}...`);

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

        // Filter for New Build and Rebuild tasks
        const websiteProjects = items.filter(item => {
            const taskType = getColumnText(item.column_values, 'task_tag__1'); // task_type column
            return taskType === 'New Build' || taskType === 'Rebuild';
        });

        allProjects = allProjects.concat(websiteProjects);
        cursor = data.data.boards[0].items_page.cursor;
        
        if (!cursor) break;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return allProjects;
}

// Fetch subtasks for a specific project
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

// Fetch comments for main task and all subtasks
async function fetchProjectComments(token, projectId, subtasks) {
    let allComments = [];

    // Fetch main task comments
    try {
        const mainComments = await fetchItemComments(token, projectId);
        allComments = allComments.concat(mainComments.map(comment => ({
            ...comment,
            subtask_id: null, // Main task comment
            item_id: projectId
        })));
    } catch (error) {
        console.error(`Error fetching main task comments for ${projectId}:`, error);
    }

    // Fetch subtask comments
    for (const subtask of subtasks) {
        try {
            const subtaskComments = await fetchItemComments(token, subtask.id);
            allComments = allComments.concat(subtaskComments.map(comment => ({
                ...comment,
                subtask_id: subtask.id,
                item_id: projectId
            })));
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Error fetching subtask comments for ${subtask.id}:`, error);
        }
    }

    return allComments;
}

// Fetch comments for a specific item (task or subtask)
async function fetchItemComments(token, itemId) {
    const query = `
        query {
            items(ids: [${itemId}]) {
                updates {
                    id
                    body
                    creator {
                        name
                    }
                    created_at
                    updated_at
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
        throw new Error('Monday.com API error fetching comments: ' + JSON.stringify(data.errors));
    }

    return data.data.items[0]?.updates || [];
}

// Process project data and run AI analysis
async function processProjectData(project, subtasks, comments) {
    // Extract basic project data
    const processedProject = {
        id: project.id,
        name: project.name,
        task_type: getColumnText(project.column_values, 'task_tag__1'),
        created_at: project.created_at,
        updated_at: project.updated_at,
        
        // Timeline data
        expected_due_date: parseDate(getColumnText(project.column_values, 'expected_due_date')),
        
        // Status
        current_phase: getColumnText(project.column_values, 'phase__1'),
        current_dev_status: getColumnText(project.column_values, 'status'),
        current_qc_status: getColumnText(project.column_values, 'status_15__1'),
        
        // Team assignments
        developers: getPersonArray(project.column_values, 'person'),
        qc_team: getPersonArray(project.column_values, 'people__1'),
        requestors: getPersonArray(project.column_values, 'people6__1'),
    };

    // Determine current owner and department
    const currentOwner = await determineCurrentOwner(processedProject, subtasks);
    processedProject.current_owner = currentOwner.owner;
    processedProject.current_department = currentOwner.department;

    // Calculate delay metrics
    const delayMetrics = calculateDelayMetrics(processedProject, subtasks);
    processedProject.days_overdue = delayMetrics.daysOverdue;
    processedProject.is_overdue = delayMetrics.isOverdue;
    processedProject.total_expected_duration = delayMetrics.totalExpectedDuration;
    processedProject.total_actual_duration = delayMetrics.totalActualDuration;

    // Run AI analysis on comments
    const validComments = comments.filter(c => c.body && c.body.trim() && c.creator?.name);
    if (OPENAI_API_KEY && validComments.length > 0) {
        try {
            const aiAnalysis = await analyzeCommentsWithAI(validComments, processedProject, subtasks);
            processedProject.ai_summary = aiAnalysis.summary;
            processedProject.ai_blockers = aiAnalysis.blockers;
            processedProject.ai_recommendations = aiAnalysis.recommendations;
            processedProject.ai_delay_causes = aiAnalysis.delayCauses;
            processedProject.ai_department_delays = aiAnalysis.departmentDelays;
            processedProject.ai_last_analyzed = new Date().toISOString();
        } catch (aiError) {
            console.error('AI analysis error:', aiError);
            // Continue without AI analysis
            processedProject.ai_summary = "AI analysis failed - see logs for details";
        }
    } else {
        processedProject.ai_summary = "No valid comments found for AI analysis";
    }

    return processedProject;
}

// Determine current owner and department based on project status and subtasks
async function determineCurrentOwner(project, subtasks) {
    // Logic to determine who currently owns the project based on status and subtasks
    // This is simplified - you can enhance based on your business logic
    
    if (project.current_phase === 'In Progress' && project.developers.length > 0) {
        return {
            owner: project.developers[0],
            department: 'Dev'
        };
    }
    
    if (project.current_qc_status && project.current_qc_status !== '' && project.qc_team.length > 0) {
        return {
            owner: project.qc_team[0],
            department: 'QC'
        };
    }
    
    // Check active subtasks
    for (const subtask of subtasks) {
        const subtaskOwner = getColumnText(subtask.column_values, 'person');
        const subtaskStatus = getColumnText(subtask.column_values, 'status');
        
        if (subtaskStatus === 'Working on it' || subtaskStatus === 'In Progress') {
            const department = await mapUserToDepartment(subtaskOwner);
            return {
                owner: subtaskOwner,
                department: department
            };
        }
    }
    
    // Default to first developer or requestor
    if (project.developers.length > 0) {
        return {
            owner: project.developers[0],
            department: 'Dev'
        };
    }
    
    if (project.requestors.length > 0) {
        return {
            owner: project.requestors[0],
            department: 'CSM'
        };
    }
    
    return {
        owner: 'Unassigned',
        department: 'Unknown'
    };
}

// Map user to department with dynamic detection and database lookup
async function mapUserToDepartment(userName, allTasks = []) {
    if (!userName) return 'Unknown';
    
    try {
        // First, try to get from department_mappings table
        const { data: mapping, error } = await supabase
            .from('department_mappings')
            .select('department')
            .eq('user_name', userName)
            .eq('is_active', true)
            .single();
        
        if (!error && mapping) {
            return mapping.department;
        }
        
        // If not found, try to determine from task patterns
        const department = await determineDepartmentFromTaskPatterns(userName, allTasks);
        
        // Auto-create mapping for future use
        if (department !== 'Unknown') {
            await supabase
                .from('department_mappings')
                .upsert({
                    user_name: userName,
                    department: department,
                    is_active: true
                }, { onConflict: 'user_name' });
            
            console.log(`Auto-mapped ${userName} to ${department} department`);
        }
        
        return department;
        
    } catch (error) {
        console.error(`Error mapping user ${userName} to department:`, error);
        return 'Unknown';
    }
}

// Determine department based on task assignment patterns
async function determineDepartmentFromTaskPatterns(userName, allTasks) {
    try {
        // Get all tasks from database to analyze patterns
        const { data: tasks, error } = await supabase
            .from('monday_tasks')
            .select('developers, qc_team, requestors')
            .or(`developers.cs.{${userName}},qc_team.cs.{${userName}},requestors.cs.{${userName}}`);
        
        if (error) {
            console.error('Error fetching tasks for pattern analysis:', error);
            return 'Unknown';
        }
        
        let devCount = 0;
        let qcCount = 0;
        let requestorCount = 0;
        
        tasks.forEach(task => {
            if (task.developers && task.developers.includes(userName)) devCount++;
            if (task.qc_team && task.qc_team.includes(userName)) qcCount++;
            if (task.requestors && task.requestors.includes(userName)) requestorCount++;
        });
        
        // Determine department based on where they appear most frequently
        if (qcCount > devCount && qcCount > requestorCount) {
            return 'QC';
        } else if (devCount > requestorCount) {
            return 'Dev';
        } else if (requestorCount > 0) {
            return 'CSM';
        }
        
        // Fallback: check known patterns in names or default logic
        const lowerName = userName.toLowerCase();
        if (lowerName.includes('qc') || lowerName.includes('quality')) {
            return 'QC';
        }
        if (lowerName.includes('csm') || lowerName.includes('manager') || lowerName.includes('account')) {
            return 'CSM';
        }
        
        // Default to Dev for unknown users
        return 'Dev';
        
    } catch (error) {
        console.error('Error in pattern analysis:', error);
        return 'Unknown';
    }
}

// Calculate delay metrics
function calculateDelayMetrics(project, subtasks) {
    const today = new Date();
    let daysOverdue = 0;
    let isOverdue = false;
    
    if (project.expected_due_date) {
        const dueDate = new Date(project.expected_due_date);
        if (today > dueDate) {
            daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
            isOverdue = true;
        }
    }
    
    // Calculate total durations from subtasks
    let totalExpectedDuration = 0;
    let totalActualDuration = 0;
    
    subtasks.forEach(subtask => {
        const expectedDuration = parseFloat(getColumnText(subtask.column_values, 'expected_duration')) || 0;
        const actualDuration = parseFloat(getColumnText(subtask.column_values, 'actual_duration')) || 0;
        
        totalExpectedDuration += expectedDuration;
        totalActualDuration += actualDuration;
    });
    
    return {
        daysOverdue,
        isOverdue,
        totalExpectedDuration,
        totalActualDuration
    };
}

// Analyze comments with OpenAI API
async function analyzeCommentsWithAI(comments, project, subtasks) {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
    }

    const commentsText = comments.map(comment => 
        `[${comment.created_at}] ${comment.creator?.name || 'Unknown'}: ${comment.body || ''}`
    ).filter(text => text.trim())
    .join('\n\n');

    const prompt = `
    Analyze the following comments from a website ${project.task_type.toLowerCase()} project called "${project.name}":

    COMMENTS:
    ${commentsText}

    PROJECT CONTEXT:
    - Task Type: ${project.task_type}
    - Expected Due Date: ${project.expected_due_date || 'Not set'}
    - Current Phase: ${project.current_phase || 'Unknown'}
    - Days Overdue: ${project.days_overdue || 0}
    - Team: Developers (${project.developers.join(', ')}), QC (${project.qc_team.join(', ')}), Requestors (${project.requestors.join(', ')})

    Please provide a JSON response with the following analysis:
    {
        "summary": "Brief 2-3 sentence summary of current project status and main issues",
        "blockers": ["List of specific blockers mentioned in comments"],
        "recommendations": "Specific actionable recommendations to move project forward",
        "delayCauses": {
            "client_delays": ["List of client-caused delays"],
            "internal_delays": ["List of internal process delays"],
            "technical_blockers": ["List of technical issues"]
        },
        "departmentDelays": {
            "Dev": number_of_days_delayed_by_dev,
            "QC": number_of_days_delayed_by_qc,
            "CSM": number_of_days_delayed_by_csm
        }
    }

    Focus on identifying:
    1. What is currently blocking the project
    2. Which department/person is responsible for next steps
    3. Client vs internal delays
    4. Specific actionable recommendations
    `;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo', // Using 3.5 for cost efficiency
                messages: [
                    {
                        role: 'system',
                        content: 'You are a project management analyst specializing in website development projects. Analyze comments to identify blockers, delays, and provide actionable recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1500,
                temperature: 0.3
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error('OpenAI API error: ' + data.error.message);
        }

        let aiResponse = data.choices[0].message.content;
        
        // Clean up the response if it contains markdown code blocks
        if (aiResponse.includes('```json')) {
            aiResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        }
        if (aiResponse.includes('```')) {
            aiResponse = aiResponse.replace(/```/g, '');
        }
        
        // Try to parse, with fallback
        try {
            return JSON.parse(aiResponse.trim());
        } catch (parseError) {
            console.error('JSON parse error, AI response was:', aiResponse);
            // Return a default structure
            return {
                summary: "AI analysis failed - unable to parse response",
                blockers: [],
                recommendations: "Manual review needed",
                delayCauses: { client_delays: [], internal_delays: [], technical_blockers: [] },
                departmentDelays: { Dev: 0, QC: 0, CSM: 0 }
            };
        }
        
    } catch (error) {
        console.error('OpenAI analysis error:', error);
        throw error;
    }
}

// Save project and related data to database
async function saveProjectToDatabase(project, subtasks, comments) {
    try {
        // Save main project
        const { error: projectError } = await supabase
            .from('website_projects')
            .upsert(project, { onConflict: 'id' });

        if (projectError) {
            throw new Error('Failed to save project: ' + projectError.message);
        }

        // Save subtasks
        for (const subtask of subtasks) {
            const ownerName = getColumnText(subtask.column_values, 'person');
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
                owner: ownerName,
                department: await mapUserToDepartment(ownerName),
                phase: getColumnText(subtask.column_values, 'phase__1'),
                status: getColumnText(subtask.column_values, 'status'),
                priority: getColumnText(subtask.column_values, 'priority__1')
            };

            const { error: subtaskError } = await supabase
                .from('website_subtasks')
                .upsert(processedSubtask, { onConflict: 'id' });

            if (subtaskError) {
                console.error('Failed to save subtask:', subtaskError);
            }
        }

        // Save comments with AI analysis
        for (const comment of comments) {
            const processedComment = {
                project_id: project.id,
                subtask_id: comment.subtask_id,
                comment_text: comment.body || '',
                author: comment.creator?.name || 'Unknown',
                date_posted: comment.created_at,
                ai_analyzed: false // Will be analyzed in batch later if needed
            };

            const { error: commentError } = await supabase
                .from('project_comments')
                .upsert(processedComment, { onConflict: 'id' });

            if (commentError) {
                console.error('Failed to save comment:', commentError);
            }
        }

    } catch (error) {
        console.error('Database save error:', error);
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