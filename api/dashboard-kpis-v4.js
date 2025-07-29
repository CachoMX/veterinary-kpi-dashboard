module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get all filters from query parameters
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
    
    console.log('Dashboard KPI request with filters:', req.query);

    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Column IDs based on your board structure
        const columnMap = {
            // People columns
            dev: 'person',
            qc: 'people__1',
            requestor: 'people6__1',
            csm: 'lookup_mkpca33t',
            
            // Status columns
            priority: 'priority__1',
            phase: 'phase__1',
            devStatus: 'status',
            qcStatus: 'status_15__1',
            taskSize: 'color_mks0fz3z',
            
            // Task classification
            taskAlerts: 'dropdown_mks0vb8q',
            requestGroup: 'request_type__1',
            taskType: 'task_tag__1',
            graphicDesignType: 'multi_select7__1',
            
            // Date columns - Using your exact column IDs
            submissionDate: 'creation_log__1',
            expectedDueDate: 'date__1',
            completionDate: 'date8__1',
            lastUpdated: 'last_updated__1',
            
            // Relations
            clientAccount: 'board_relation_mkngp1fk',
            supportTickets: 'board_relation9__1',
            mrr: 'lookup_mks03bdn'
        };

        // Determine if we need extensive fetching
        const needsExtensiveFetch = startDate || endDate;
        const hasOtherFilters = employee || qc || requestor || phase || devStatus || 
                              qcStatus || priority || taskType || taskSize || 
                              requestGroup || clientAccount;

        let allTasks = [];

        if (needsExtensiveFetch) {
            // When date filters are used, we need to fetch more tasks
            // because older tasks might match the date range
            console.log('Date filters detected, fetching all tasks...');
            
            let cursor = null;
            let hasMore = true;
            let pageCount = 0;
            const maxPages = 20; // Increased to get more historical data
            const pageSize = 100;
            
            while (hasMore && pageCount < maxPages) {
                pageCount++;
                console.log(`Fetching page ${pageCount}...`);
                
                const itemsQuery = `
                    query {
                        boards(ids: [${DEV_BOARD_ID}]) {
                            name
                            items_page(limit: ${pageSize}${cursor ? `, cursor: "${cursor}"` : ''}) {
                                cursor
                                items {
                                    id
                                    name
                                    state
                                    created_at
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

                const itemsResponse = await fetch('https://api.monday.com/v2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': MONDAY_TOKEN
                    },
                    body: JSON.stringify({ query: itemsQuery })
                });

                const itemsData = await itemsResponse.json();
                
                if (itemsData.errors) {
                    const isRateLimit = itemsData.errors.some(e => 
                        e.extensions?.code === 'COMPLEXITY_BUDGET_EXHAUSTED'
                    );
                    
                    if (isRateLimit) {
                        const retryIn = itemsData.errors[0]?.extensions?.retry_in_seconds || 60;
                        console.log(`Rate limit hit on page ${pageCount}`);
                        
                        if (allTasks.length > 0) {
                            console.log(`Continuing with ${allTasks.length} tasks fetched so far`);
                            break;
                        }
                        
                        return res.status(429).json({
                            success: false,
                            error: 'Rate limit reached',
                            details: `Monday.com API rate limit. Please wait ${retryIn} seconds before trying again.`,
                            retryInSeconds: retryIn
                        });
                    }
                    
                    throw new Error('Monday.com API error: ' + JSON.stringify(itemsData.errors));
                }

                const board = itemsData.data.boards[0];
                const pageItems = board.items_page.items || [];
                allTasks = allTasks.concat(pageItems);
                
                cursor = board.items_page.cursor;
                hasMore = cursor !== null && cursor !== undefined && pageItems.length === pageSize;
                
                console.log(`Page ${pageCount}: fetched ${pageItems.length} items, total: ${allTasks.length}`);
                
                // Check if we have enough tasks for the date range
                if (allTasks.length > 0 && pageCount >= 5) {
                    // Sample check: see if we're getting tasks from the target date range
                    const tasksInRange = allTasks.filter(task => {
                        const submissionDate = task.column_values?.find(c => c.id === columnMap.submissionDate)?.text;
                        if (!submissionDate) return false;
                        
                        const date = parseDate(submissionDate);
                        if (!date) return false;
                        
                        const dateStr = date.toISOString().split('T')[0];
                        return dateStr >= (startDate || '2025-07-21') && 
                               dateStr <= (endDate || '2025-07-28');
                    });
                    
                    console.log(`Found ${tasksInRange.length} tasks in date range so far`);
                    
                    // If we have a good number of tasks in range, we can stop
                    if (tasksInRange.length >= 50) {
                        console.log('Found sufficient tasks in date range, stopping pagination');
                        break;
                    }
                }
                
                // Small delay to avoid rate limits
                if (hasMore) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
            
        } else {
            // For non-date filters, fetch a reasonable amount
            console.log('No date filters, fetching first 300 tasks...');
            
            const itemsQuery = `
                query {
                    boards(ids: [${DEV_BOARD_ID}]) {
                        name
                        items_page(limit: 300) {
                            items {
                                id
                                name
                                state
                                created_at
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

            const itemsResponse = await fetch('https://api.monday.com/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': MONDAY_TOKEN
                },
                body: JSON.stringify({ query: itemsQuery })
            });

            const itemsData = await itemsResponse.json();
            
            if (itemsData.errors) {
                return res.status(400).json({
                    success: false,
                    error: 'Monday.com API error',
                    details: itemsData.errors
                });
            }

            const board = itemsData.data.boards[0];
            allTasks = board.items_page.items || [];
        }

        console.log(`Total tasks fetched: ${allTasks.length}`);

        // Process the data with all filters
        const processedData = await processTaskDataWithAllFilters(
            allTasks, 
            columnMap,
            {
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
            }
        );

        res.status(200).json({
            success: true,
            data: processedData,
            filters: req.query,
            totalTasksFetched: allTasks.length,
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

// Helper function to parse dates
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle creation_log format: "2025-07-21 20:28:00 UTC"
    if (dateStr.includes(' UTC')) {
        dateStr = dateStr.replace(' UTC', 'Z').replace(' ', 'T');
    }
    
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
}

// Enhanced process function with all filters (same as V3)
async function processTaskDataWithAllFilters(tasks, columnMap, filters) {
    console.log(`Processing ${tasks.length} tasks with filters:`, filters);
    
    // Helper functions
    function getColumnValue(task, columnId) {
        const column = task.column_values?.find(c => c.id === columnId);
        return column ? (column.text || '') : '';
    }

    function getPersonValue(task, columnId) {
        const column = task.column_values?.find(c => c.id === columnId);
        if (!column || !column.text) return [];
        return column.text.split(', ').filter(Boolean);
    }

    function parseDate(dateStr) {
        if (!dateStr) return null;
        
        // Handle creation_log format: "2025-07-21 20:28:00 UTC"
        if (dateStr.includes(' UTC')) {
            dateStr = dateStr.replace(' UTC', 'Z').replace(' ', 'T');
        }
        
        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
    }

    function isDateInRange(dateStr, startDate, endDate) {
        if (!dateStr) return false;
        const date = parseDate(dateStr);
        if (!date) return false;
        
        const dateOnly = new Date(date.toISOString().split('T')[0]);
        
        if (startDate) {
            const start = new Date(startDate);
            if (dateOnly < start) return false;
        }
        
        if (endDate) {
            const end = new Date(endDate);
            if (dateOnly > end) return false;
        }
        
        return true;
    }

    // Process all tasks
    const processedTasks = tasks
        .filter(task => task && task.name && !task.name.toLowerCase().includes("task example"))
        .map(task => {
            try {
                // Get all people
                const developers = getPersonValue(task, columnMap.dev);
                const qcTeam = getPersonValue(task, columnMap.qc);
                const requestors = getPersonValue(task, columnMap.requestor);
                
                // Get statuses
                const priority = getColumnValue(task, columnMap.priority);
                const phase = getColumnValue(task, columnMap.phase);
                const devStatus = getColumnValue(task, columnMap.devStatus);
                const qcStatus = getColumnValue(task, columnMap.qcStatus);
                const taskSize = getColumnValue(task, columnMap.taskSize);
                
                // Get classifications
                const taskType = getColumnValue(task, columnMap.taskType);
                const requestGroup = getColumnValue(task, columnMap.requestGroup);
                const taskAlerts = getColumnValue(task, columnMap.taskAlerts);
                
                // Get dates
                const submissionDate = getColumnValue(task, columnMap.submissionDate);
                const expectedDueDate = getColumnValue(task, columnMap.expectedDueDate);
                const completionDate = getColumnValue(task, columnMap.completionDate);
                
                // Get client info
                const clientAccount = getColumnValue(task, columnMap.clientAccount);
                const mrr = getColumnValue(task, columnMap.mrr);
                
                // Calculate if overdue
                let isOverdue = false;
                if (expectedDueDate) {
                    const dueDate = parseDate(expectedDueDate);
                    if (dueDate) {
                        if (completionDate) {
                            const compDate = parseDate(completionDate);
                            if (compDate) {
                                isOverdue = compDate > dueDate;
                            }
                        } else if (task.state !== 'done' && task.state !== 'complete' && phase !== 'Completed') {
                            const today = new Date();
                            isOverdue = today > dueDate;
                        }
                    }
                }
                
                return {
                    id: task.id,
                    name: task.name,
                    state: task.state || 'unknown',
                    
                    // People
                    developers,
                    qcTeam,
                    requestors,
                    
                    // Statuses
                    priority,
                    phase,
                    devStatus,
                    qcStatus,
                    taskSize,
                    
                    // Classifications
                    taskType,
                    requestGroup,
                    taskAlerts,
                    
                    // Dates
                    createdAt: task.created_at,
                    submissionDate,
                    expectedDueDate,
                    completionDate,
                    
                    // Client info
                    clientAccount,
                    mrr,
                    
                    // Calculated
                    isOverdue
                };
            } catch (error) {
                console.error('Error processing task:', task.id, error);
                return null;
            }
        })
        .filter(task => task !== null);

    // Apply all filters
    let filteredTasks = processedTasks;
    
    // People filters
    if (filters.employee) {
        filteredTasks = filteredTasks.filter(task => 
            task.developers.includes(filters.employee)
        );
    }
    
    if (filters.qc) {
        filteredTasks = filteredTasks.filter(task => 
            task.qcTeam.includes(filters.qc)
        );
    }
    
    if (filters.requestor) {
        filteredTasks = filteredTasks.filter(task => 
            task.requestors.includes(filters.requestor)
        );
    }
    
    // Status filters
    if (filters.phase) {
        filteredTasks = filteredTasks.filter(task => 
            task.phase === filters.phase
        );
    }
    
    if (filters.devStatus) {
        filteredTasks = filteredTasks.filter(task => 
            task.devStatus === filters.devStatus
        );
    }
    
    if (filters.qcStatus) {
        filteredTasks = filteredTasks.filter(task => 
            task.qcStatus === filters.qcStatus
        );
    }
    
    if (filters.priority) {
        filteredTasks = filteredTasks.filter(task => 
            task.priority === filters.priority
        );
    }
    
    if (filters.taskSize) {
        filteredTasks = filteredTasks.filter(task => 
            task.taskSize === filters.taskSize
        );
    }
    
    // Classification filters
    if (filters.taskType) {
        filteredTasks = filteredTasks.filter(task => 
            task.taskType === filters.taskType
        );
    }
    
    if (filters.requestGroup) {
        filteredTasks = filteredTasks.filter(task => 
            task.requestGroup === filters.requestGroup
        );
    }
    
    // Client filter
    if (filters.clientAccount) {
        filteredTasks = filteredTasks.filter(task => 
            task.clientAccount.includes(filters.clientAccount)
        );
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
        console.log(`Applying date filter: ${filters.startDate} to ${filters.endDate}`);
        const beforeFilter = filteredTasks.length;
        
        filteredTasks = filteredTasks.filter(task => {
            const dateToCheck = task.submissionDate || task.createdAt;
            const inRange = isDateInRange(dateToCheck, filters.startDate, filters.endDate);
            return inRange;
        });
        
        console.log(`Date filter: ${beforeFilter} tasks -> ${filteredTasks.length} tasks`);
    }

    console.log(`After all filters: ${filteredTasks.length} tasks`);

    // Get unique values for filters
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
    
    processedTasks.forEach(task => {
        task.developers.forEach(dev => filterOptions.developers.add(dev));
        task.qcTeam.forEach(qc => filterOptions.qcTeam.add(qc));
        task.requestors.forEach(req => filterOptions.requestors.add(req));
        if (task.phase) filterOptions.phases.add(task.phase);
        if (task.devStatus) filterOptions.devStatuses.add(task.devStatus);
        if (task.qcStatus) filterOptions.qcStatuses.add(task.qcStatus);
        if (task.priority) filterOptions.priorities.add(task.priority);
        if (task.taskType) filterOptions.taskTypes.add(task.taskType);
        if (task.taskSize) filterOptions.taskSizes.add(task.taskSize);
        if (task.requestGroup) filterOptions.requestGroups.add(task.requestGroup);
        if (task.clientAccount) filterOptions.clientAccounts.add(task.clientAccount);
    });

    // Status categorization
    const completed = filteredTasks.filter(t => 
        t.state === 'done' || 
        t.state === 'complete' ||
        t.phase === 'Completed' || 
        t.devStatus === 'Task Done' ||
        t.devStatus === 'Done' ||
        (t.completionDate && t.completionDate !== '')
    );
    
    const overdue = filteredTasks.filter(t => t.isOverdue);
    
    const inProgress = filteredTasks.filter(t => {
        if (completed.includes(t)) return false;
        return (
            t.state === 'working_on_it' || 
            t.state === 'in_progress' ||
            t.phase === 'In Progress' ||
            t.devStatus === 'Working on it'
        );
    });
    
    const pending = filteredTasks.filter(t => 
        !completed.includes(t) && !inProgress.includes(t) && !overdue.includes(t)
    );

    // Employee stats for developers
    const employeeStats = {};
    filterOptions.developers.forEach(employee => {
        const employeeTasks = filteredTasks.filter(t => 
            t.developers.includes(employee)
        );
        
        employeeStats[employee] = {
            total: employeeTasks.length,
            completed: employeeTasks.filter(t => completed.includes(t)).length,
            inProgress: employeeTasks.filter(t => inProgress.includes(t)).length,
            pending: employeeTasks.filter(t => pending.includes(t)).length,
            overdue: employeeTasks.filter(t => t.isOverdue).length
        };
    });

    // QC team stats
    const qcStats = {};
    filterOptions.qcTeam.forEach(qc => {
        const qcTasks = filteredTasks.filter(t => 
            t.qcTeam.includes(qc)
        );
        
        qcStats[qc] = {
            total: qcTasks.length,
            completed: qcTasks.filter(t => completed.includes(t)).length,
            inProgress: qcTasks.filter(t => inProgress.includes(t)).length,
            pending: qcTasks.filter(t => pending.includes(t)).length,
            overdue: qcTasks.filter(t => t.isOverdue).length
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
        }
    };
}