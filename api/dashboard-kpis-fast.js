module.exports = async (req, res) => {
    const { createClient } = require('@supabase/supabase-js');
    
    // Initialize Supabase client
    const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
    );

    // Get filters from query parameters
    const { 
        employee, 
        qc,
        requestor,
        startDate, 
        endDate,
        phase,
        devStatus,
        qcStatus,
        priority,
        taskType,
        taskSize,
        requestGroup,
        clientAccount
    } = req.query;

    try {
        // Start building the query
        let query = supabase
            .from('monday_tasks')
            .select('*');

        // Apply filters
        if (employee) {
            query = query.contains('developers', [employee]);
        }
        if (qc) {
            query = query.contains('qc_team', [qc]);
        }
        if (requestor) {
            query = query.contains('requestors', [requestor]);
        }
        
        // Special handling for phase filter - if "Completed" is selected, get all completed tasks
        if (phase) {
            if (phase === 'Completed') {
                // Get all tasks that are completed by any measure
                query = query.or('phase.eq.Completed,dev_status.in.(Task Done,Done),state.in.(done,complete),completion_date.not.is.null');
            } else {
                query = query.eq('phase', phase);
            }
        }
        
        if (devStatus) {
            query = query.eq('dev_status', devStatus);
        }
        if (qcStatus) {
            query = query.eq('qc_status', qcStatus);
        }
        if (priority) {
            query = query.eq('priority', priority);
        }
        if (taskType) {
            query = query.eq('task_type', taskType);
        }
        if (taskSize) {
            query = query.eq('task_size', taskSize);
        }
        if (requestGroup) {
            query = query.eq('request_group', requestGroup);
        }
        if (clientAccount) {
            query = query.ilike('client_account', `%${clientAccount}%`);
        }

        // For date filtering, we need to get a broader range to ensure we catch all relevant tasks
        let effectiveStartDate = startDate;
        let effectiveEndDate = endDate;
        
        if (!startDate && !endDate) {
            // Default to today
            const today = new Date().toISOString().split('T')[0];
            effectiveStartDate = today;
            effectiveEndDate = today;
        }

        // If we're filtering by date, we need to be smart about it
        // For completed tasks (phase = 'Completed'), we should look at completion_date
        // For other tasks, we look at submission_date
        if (effectiveStartDate || effectiveEndDate) {
            // If filtering for completed tasks, we need a different approach
            if (phase === 'Completed') {
                // Don't filter by date in the query - we'll handle it in processTaskData
                // because completion_date might be in a different format
            } else {
                // For non-completed tasks, filter by submission date
                if (effectiveStartDate) {
                    query = query.gte('submission_date', effectiveStartDate + 'T00:00:00Z');
                }
                if (effectiveEndDate) {
                    query = query.lte('submission_date', effectiveEndDate + 'T23:59:59Z');
                }
            }
        }
        
        // Execute query - get more tasks if needed
        const { data: tasks, error } = await query.order('created_at', { ascending: false }).limit(10000); // Increase limit significantly

        if (error) {
            throw error;
        }

        console.log(`Found ${tasks.length} tasks from Supabase before date filtering`);
        
        // Log sample of tasks to debug
        const completedSample = tasks.filter(t => 
            t.phase === 'Completed' || 
            t.completion_date
        ).slice(0, 5);
        
        console.log('Sample of completed tasks from Supabase:', completedSample.map(t => ({
            id: t.id,
            name: t.name,
            phase: t.phase,
            completion_date: t.completion_date,
            dev_status: t.dev_status
        })));

        // Process the data with smart date filtering
        const processedData = processTaskData(tasks, {
            employee,
            qc,
            requestor,
            phase,
            devStatus,
            qcStatus,
            priority,
            taskType,
            taskSize,
            requestGroup,
            clientAccount,
            startDate: effectiveStartDate,
            endDate: effectiveEndDate
        });

        res.status(200).json({
            success: true,
            data: processedData,
            filters: {
                employee: employee || null,
                qc: qc || null,
                requestor: requestor || null,
                startDate: effectiveStartDate || null,
                endDate: effectiveEndDate || null,
                phase: phase || null,
                devStatus: devStatus || null,
                qcStatus: qcStatus || null,
                priority: priority || null,
                taskType: taskType || null,
                taskSize: taskSize || null,
                requestGroup: requestGroup || null,
                clientAccount: clientAccount || null
            },
            totalTasksFetched: tasks.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

function processTaskData(tasks, filters) {
    console.log(`Processing ${tasks.length} tasks with filters:`, filters);
    
    // First, apply smart date filtering if dates are provided
    let filteredTasks = [...tasks];
    
    if (filters.startDate || filters.endDate) {
        console.log(`Applying smart date filter: ${filters.startDate} to ${filters.endDate}`);
        const beforeFilter = filteredTasks.length;
        
        // Count different types of tasks before filtering
        const beforeStats = {
            total: filteredTasks.length,
            withCompletionDate: filteredTasks.filter(t => t.completion_date).length,
            phaseCompleted: filteredTasks.filter(t => t.phase === 'Completed').length,
            devStatusDone: filteredTasks.filter(t => t.dev_status === 'Task Done' || t.dev_status === 'Done').length
        };
        console.log('Before date filter:', beforeStats);
        
        filteredTasks = filteredTasks.filter(task => {
            // Smart date filtering based on task status
            let dateToCheck;
            
            // Check if task is completed by any measure
            const isCompleted = task.state === 'done' || 
                task.state === 'complete' ||
                task.phase === 'Completed' || 
                task.dev_status === 'Task Done' ||
                task.dev_status === 'Done' ||
                (task.completion_date && task.completion_date !== '' && task.completion_date !== null);
            
            if (isCompleted) {
                // For completed tasks, try completion date first, then fall back to submission date
                if (task.completion_date && task.completion_date !== '' && task.completion_date !== null) {
                    dateToCheck = task.completion_date;
                } else {
                    // Many completed tasks don't have completion_date set, use submission_date
                    dateToCheck = task.submission_date || task.created_at;
                }
            } else {
                // For non-completed tasks, use submission date
                dateToCheck = task.submission_date || task.created_at;
            }
            
            if (!dateToCheck) {
                return false;
            }
            
            // Parse the date properly - handle different formats including quoted strings
            let taskDateStr;
            try {
                // First, clean the date string - remove quotes if string
                let cleanDate = dateToCheck;
                if (typeof cleanDate === 'string') {
                    cleanDate = cleanDate.replace(/['"]/g, '').trim();
                }
                
                // If it's a Date object, convert to string
                if (cleanDate instanceof Date) {
                    taskDateStr = cleanDate.toISOString().split('T')[0];
                } else if (typeof cleanDate === 'string') {
                    // If it's already in YYYY-MM-DD format
                    if (cleanDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        taskDateStr = cleanDate;
                    } else if (cleanDate.includes('T')) {
                        // ISO format
                        taskDateStr = cleanDate.split('T')[0];
                    } else {
                        // Try to parse as date
                        const taskDate = new Date(cleanDate);
                        if (!isNaN(taskDate.getTime())) {
                            taskDateStr = taskDate.toISOString().split('T')[0];
                        } else {
                            return false;
                        }
                    }
                } else {
                    // Handle date objects from database
                    taskDateStr = new Date(cleanDate).toISOString().split('T')[0];
                }
            } catch (e) {
                console.error('Error parsing date:', dateToCheck, e);
                return false;
            }
            
            // Check if within range
            const inRange = (!filters.startDate || taskDateStr >= filters.startDate) && 
                           (!filters.endDate || taskDateStr <= filters.endDate);
            
            return inRange;
        });
        
        // Log results after filtering
        const afterStats = {
            total: filteredTasks.length,
            withCompletionDate: filteredTasks.filter(t => t.completion_date).length,
            phaseCompleted: filteredTasks.filter(t => t.phase === 'Completed').length,
            devStatusDone: filteredTasks.filter(t => t.dev_status === 'Task Done' || t.dev_status === 'Done').length
        };
        console.log('After date filter:', afterStats);
        console.log(`Smart date filter: ${beforeFilter} tasks -> ${filteredTasks.length} tasks`);
    }
    
    // Get unique values for filters from ALL tasks (not just filtered)
    const filterOptions = {
        developers: new Set(),
        qcTeam: new Set(),
        requestors: new Set(),
        phases: new Set(),
        devStatuses: new Set(),
        qcStatuses: new Set(),
        priorities: new Set(),
        taskTypes: new Set(),
        taskSizes: new Set(),
        requestGroups: new Set(),
        clientAccounts: new Set()
    };
    
    tasks.forEach(task => {
        task.developers?.forEach(dev => filterOptions.developers.add(dev));
        task.qc_team?.forEach(qc => filterOptions.qcTeam.add(qc));
        task.requestors?.forEach(req => filterOptions.requestors.add(req));
        if (task.phase) filterOptions.phases.add(task.phase);
        if (task.dev_status) filterOptions.devStatuses.add(task.dev_status);
        if (task.qc_status) filterOptions.qcStatuses.add(task.qc_status);
        if (task.priority) filterOptions.priorities.add(task.priority);
        if (task.task_type) filterOptions.taskTypes.add(task.task_type);
        if (task.task_size) filterOptions.taskSizes.add(task.task_size);
        if (task.request_group) filterOptions.requestGroups.add(task.request_group);
        if (task.client_account) filterOptions.clientAccounts.add(task.client_account);
    });

    // Status categorization - now using filteredTasks
    const completed = filteredTasks.filter(t => 
        t.state === 'done' || 
        t.state === 'complete' ||
        t.phase === 'Completed' || 
        t.dev_status === 'Task Done' ||
        t.dev_status === 'Done' ||
        (t.completion_date && t.completion_date !== '' && t.completion_date !== null)
    );
    
    console.log(`Total completed tasks after filtering: ${completed.length}`);
    
    // Calculate overdue more accurately
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    const overdue = filteredTasks.filter(t => {
        // Skip if task is already completed
        if (completed.includes(t)) {
            // Check if it was completed late
            if (t.expected_due_date && t.completion_date) {
                try {
                    const dueDate = new Date(t.expected_due_date);
                    const completedDate = new Date(t.completion_date);
                    return completedDate > dueDate;
                } catch (e) {
                    return false;
                }
            }
            return false;
        }
        
        // For incomplete tasks, check if past due date
        if (t.expected_due_date) {
            try {
                const dueDate = new Date(t.expected_due_date);
                return dueDate < today;
            } catch (e) {
                return false;
            }
        }
        
        return false;
    });
    
    const inProgress = filteredTasks.filter(t => {
        if (completed.includes(t)) return false;
        return (
            t.state === 'working_on_it' || 
            t.state === 'in_progress' ||
            t.phase === 'In Progress' ||
            t.dev_status === 'Working on it'
        );
    });
    
    const pending = filteredTasks.filter(t => 
        !completed.includes(t) && !inProgress.includes(t) && !overdue.includes(t)
    );

    // Employee stats - based on filteredTasks
    const employeeStats = {};
    filterOptions.developers.forEach(employee => {
        const employeeTasks = filteredTasks.filter(t => 
            t.developers?.includes(employee)
        );
        
        employeeStats[employee] = {
            total: employeeTasks.length,
            completed: employeeTasks.filter(t => completed.includes(t)).length,
            inProgress: employeeTasks.filter(t => inProgress.includes(t)).length,
            pending: employeeTasks.filter(t => pending.includes(t)).length,
            overdue: employeeTasks.filter(t => overdue.includes(t)).length
        };
    });

    // QC team stats - based on filteredTasks
    const qcStats = {};
    filterOptions.qcTeam.forEach(qc => {
        const qcTasks = filteredTasks.filter(t => 
            t.qc_team?.includes(qc)
        );
        
        qcStats[qc] = {
            total: qcTasks.length,
            completed: qcTasks.filter(t => completed.includes(t)).length,
            inProgress: qcTasks.filter(t => inProgress.includes(t)).length,
            pending: qcTasks.filter(t => pending.includes(t)).length,
            overdue: qcTasks.filter(t => overdue.includes(t)).length
        };
    });

    return {
        summary: {
            totalTasks: filteredTasks.length,
            statusCounts: {
                completed: completed.length,
                inProgress: inProgress.length,
                pending: pending.length,
                needsApproval: 0,
                onHold: 0,
                overdue: overdue.length
            }
        },
        filterOptions: {
            developers: Array.from(filterOptions.developers).sort(),
            qcTeam: Array.from(filterOptions.qcTeam).sort(),
            requestors: Array.from(filterOptions.requestors).sort(),
            phases: Array.from(filterOptions.phases).sort(),
            devStatuses: Array.from(filterOptions.devStatuses).sort(),
            qcStatuses: Array.from(filterOptions.qcStatuses).sort(),
            priorities: Array.from(filterOptions.priorities).sort(),
            taskTypes: Array.from(filterOptions.taskTypes).sort(),
            taskSizes: Array.from(filterOptions.taskSizes).sort(),
            requestGroups: Array.from(filterOptions.requestGroups).sort(),
            clientAccounts: Array.from(filterOptions.clientAccounts).sort()
        },
        employeeStats: employeeStats,
        qcStats: qcStats,
        chartData: {
            statusChart: {
                labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                data: [completed.length, inProgress.length, pending.length, overdue.length]
            }
        },
        filters: filters // Include filters in the response for frontend use
    };
}