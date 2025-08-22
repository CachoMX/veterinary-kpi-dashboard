const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        // Extract project ID from URL path (e.g., /api/website-project-details/123456789)
        const projectId = req.query.projectId || req.url.split('/').pop();
        
        if (!projectId) {
            return res.status(400).json({
                success: false,
                error: 'Project ID is required'
            });
        }

        console.log(`Fetching details for project: ${projectId}`);

        // Fetch project with subtasks and comments
        const { data: project, error: projectError } = await supabase
            .from('website_projects')
            .select(`
                *,
                website_subtasks (
                    id, name, owner, department, status, phase, 
                    is_overdue, days_overdue, completion_date,
                    expected_duration, actual_duration, timeline_start, timeline_end,
                    ai_comment_summary, ai_identified_blockers
                )
            `)
            .eq('id', projectId)
            .single();

        if (projectError) {
            throw new Error('Failed to fetch project: ' + projectError.message);
        }

        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }

        // Fetch recent comments for the project
        const { data: comments, error: commentsError } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', projectId)
            .order('date_posted', { ascending: false })
            .limit(20);

        if (commentsError) {
            console.error('Error fetching comments:', commentsError);
        }

        // Format the detailed response
        const detailsResponse = {
            project: formatProjectDetails(project),
            subtasks: formatSubtasks(project.website_subtasks || []),
            recentComments: formatComments(comments || []),
            aiBlockers: project.ai_blockers || [],
            timeline: generateProjectTimeline(project, project.website_subtasks || []),
            analytics: calculateProjectAnalytics(project, project.website_subtasks || [])
        };

        res.status(200).json({
            success: true,
            data: detailsResponse,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Website project details error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Format project details
function formatProjectDetails(project) {
    return {
        id: project.id,
        name: project.name,
        taskType: project.task_type,
        expectedDueDate: project.expected_due_date ? formatDate(project.expected_due_date) : null,
        actualCompletionDate: project.actual_completion_date ? formatDate(project.actual_completion_date) : null,
        currentOwner: project.current_owner,
        currentDepartment: project.current_department,
        currentPhase: project.current_phase,
        currentDevStatus: project.current_dev_status,
        currentQcStatus: project.current_qc_status,
        isOverdue: project.is_overdue,
        daysOverdue: project.days_overdue || 0,
        totalExpectedDuration: project.total_expected_duration || 0,
        totalActualDuration: project.total_actual_duration || 0,
        developers: project.developers || [],
        qcTeam: project.qc_team || [],
        requestors: project.requestors || [],
        aiSummary: project.ai_summary,
        aiRecommendations: project.ai_recommendations,
        lastSynced: project.last_synced ? formatDateTime(project.last_synced) : null
    };
}

// Format subtasks
function formatSubtasks(subtasks) {
    return subtasks.map(subtask => ({
        id: subtask.id,
        name: subtask.name,
        owner: subtask.owner || 'Unassigned',
        department: subtask.department || 'Unknown',
        status: subtask.status || 'Unknown',
        phase: subtask.phase || 'Unknown',
        isOverdue: subtask.is_overdue,
        daysOverdue: subtask.days_overdue || 0,
        completionDate: subtask.completion_date ? formatDate(subtask.completion_date) : null,
        expectedDuration: subtask.expected_duration || 0,
        actualDuration: subtask.actual_duration || 0,
        timelineStart: subtask.timeline_start ? formatDate(subtask.timeline_start) : null,
        timelineEnd: subtask.timeline_end ? formatDate(subtask.timeline_end) : null,
        progress: calculateSubtaskProgress(subtask),
        blockers: subtask.ai_identified_blockers || []
    }));
}

// Calculate subtask progress
function calculateSubtaskProgress(subtask) {
    if (subtask.completion_date) {
        return 100;
    }
    
    if (subtask.status === 'Working on it' || subtask.status === 'In Progress') {
        return 50; // Estimated progress for active tasks
    }
    
    if (subtask.status === 'Done' || subtask.status === 'Completed') {
        return 100;
    }
    
    return 0; // Not started
}

// Format comments
function formatComments(comments) {
    return comments.map(comment => ({
        id: comment.id,
        text: comment.comment_text,
        author: comment.author,
        datePosted: formatDateTime(comment.date_posted),
        subtaskId: comment.subtask_id,
        aiSentiment: comment.ai_sentiment,
        aiCategory: comment.ai_category,
        aiDelayIndication: comment.ai_delay_indication,
        aiExtractedBlockers: comment.ai_extracted_blockers || []
    }));
}

// Generate project timeline
function generateProjectTimeline(project, subtasks) {
    const timeline = [];
    
    // Add project milestones
    if (project.created_at) {
        timeline.push({
            date: formatDate(project.created_at),
            event: 'Project Created',
            type: 'milestone',
            description: `${project.task_type} project "${project.name}" was created`
        });
    }
    
    if (project.expected_due_date) {
        timeline.push({
            date: formatDate(project.expected_due_date),
            event: 'Expected Completion',
            type: project.is_overdue ? 'overdue' : 'deadline',
            description: 'Target completion date'
        });
    }
    
    if (project.actual_completion_date) {
        timeline.push({
            date: formatDate(project.actual_completion_date),
            event: 'Project Completed',
            type: 'completed',
            description: 'Project was completed'
        });
    }
    
    // Add subtask milestones
    subtasks.forEach(subtask => {
        if (subtask.timeline_start) {
            timeline.push({
                date: formatDate(subtask.timeline_start),
                event: `Started: ${subtask.name}`,
                type: 'subtask_start',
                description: `Subtask assigned to ${subtask.owner || 'Unassigned'}`
            });
        }
        
        if (subtask.completion_date) {
            timeline.push({
                date: formatDate(subtask.completion_date),
                event: `Completed: ${subtask.name}`,
                type: 'subtask_complete',
                description: `Completed by ${subtask.owner || 'Unknown'}`
            });
        }
    });
    
    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return timeline;
}

// Calculate project analytics
function calculateProjectAnalytics(project, subtasks) {
    const totalSubtasks = subtasks.length;
    const completedSubtasks = subtasks.filter(st => st.completion_date).length;
    const overdueSubtasks = subtasks.filter(st => st.is_overdue).length;
    
    const completionPercentage = totalSubtasks > 0 
        ? Math.round((completedSubtasks / totalSubtasks) * 100) 
        : 0;
    
    // Calculate duration variance
    const expectedTotal = subtasks.reduce((sum, st) => sum + (st.expected_duration || 0), 0);
    const actualTotal = subtasks.reduce((sum, st) => sum + (st.actual_duration || 0), 0);
    const durationVariance = expectedTotal > 0 
        ? Math.round(((actualTotal - expectedTotal) / expectedTotal) * 100)
        : 0;
    
    // Department involvement
    const departmentStats = {};
    subtasks.forEach(subtask => {
        const dept = subtask.department || 'Unknown';
        if (!departmentStats[dept]) {
            departmentStats[dept] = { total: 0, completed: 0, overdue: 0 };
        }
        departmentStats[dept].total++;
        if (subtask.completion_date) departmentStats[dept].completed++;
        if (subtask.is_overdue) departmentStats[dept].overdue++;
    });
    
    // Risk assessment
    let riskLevel = 'Low';
    if (project.is_overdue && project.days_overdue > 90) {
        riskLevel = 'High';
    } else if (project.is_overdue || overdueSubtasks > 0) {
        riskLevel = 'Medium';
    }
    
    return {
        totalSubtasks,
        completedSubtasks,
        overdueSubtasks,
        completionPercentage,
        expectedDuration: expectedTotal,
        actualDuration: actualTotal,
        durationVariance,
        departmentStats,
        riskLevel,
        blockerCount: (project.ai_blockers || []).length
    };
}

// Format date for display
function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        return dateString;
    }
}

// Format datetime for display
function formatDateTime(dateString) {
    try {
        return new Date(dateString).toLocaleString();
    } catch (error) {
        return dateString;
    }
}