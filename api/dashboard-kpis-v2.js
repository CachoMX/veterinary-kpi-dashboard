module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get filters from query parameters
    const { employee, startDate, endDate } = req.query;
    
    console.log('Dashboard KPI request:', { employee, startDate, endDate });

    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Step 1: First get column definitions to identify date columns
        const columnsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                }
            }
        `;

        const columnsResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: columnsQuery })
        });

        const columnsData = await columnsResponse.json();
        if (columnsData.errors) {
            throw new Error('Failed to get columns: ' + JSON.stringify(columnsData.errors));
        }

        // Find date column IDs
        const columns = columnsData.data.boards[0].columns;
        const dateColumnMap = {};
        
        columns.forEach(col => {
            if (col.type === 'date') {
                if (col.title.toLowerCase().includes('submission')) {
                    dateColumnMap.submissionDate = col.id;
                } else if (col.title.toLowerCase().includes('expected') || col.title.toLowerCase().includes('due')) {
                    dateColumnMap.expectedDueDate = col.id;
                } else if (col.title.toLowerCase().includes('completion')) {
                    dateColumnMap.completionDate = col.id;
                }
            }
        });

        console.log('Date columns found:', dateColumnMap);

        // Step 2: Fetch items with a simpler query to avoid complexity budget
        // When date filtering, use smaller batches
        const limit = (startDate || endDate) ? 100 : 200;
        
        const itemsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page(limit: ${limit}) {
                        items {
                            id
                            name
                            state
                            created_at
                            column_values {
                                id
                                text
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
            // Check if it's rate limit error
            const isRateLimit = itemsData.errors.some(e => 
                e.extensions?.code === 'COMPLEXITY_BUDGET_EXHAUSTED'
            );
            
            if (isRateLimit) {
                const retryIn = itemsData.errors[0]?.extensions?.retry_in_seconds || 60;
                return res.status(429).json({
                    success: false,
                    error: 'Rate limit reached',
                    details: `Monday.com API rate limit. Please wait ${retryIn} seconds before trying again.`,
                    retryInSeconds: retryIn
                });
            }
            
            return res.status(400).json({
                success: false,
                error: 'Monday.com API error',
                details: itemsData.errors
            });
        }

        const board = itemsData.data.boards[0];
        const allTasks = board.items_page.items || [];

        console.log(`Retrieved ${allTasks.length} tasks`);

        // Process the data with date filtering
        const processedData = await processTaskDataWithDates(
            allTasks, 
            dateColumnMap,
            employee, 
            startDate, 
            endDate
        );

        res.status(200).json({
            success: true,
            data: processedData,
            filters: {
                employee: employee || null,
                startDate: startDate || null,
                endDate: endDate || null
            },
            dateColumns: dateColumnMap,
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

// Enhanced process function with date filtering
async function processTaskDataWithDates(tasks, dateColumnMap, filterEmployee = null, startDate = null, endDate = null) {
    console.log(`Processing ${tasks.length} tasks with date filtering`);
    console.log('Date column IDs:', dateColumnMap);
    
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
        
        // Monday.com dates are usually in format "YYYY-MM-DD" or "MMM DD, YYYY"
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
                const developers = getPersonValue(task, 'person');
                const qcTeam = getPersonValue(task, 'people__1');
                
                // Get date values
                const submissionDate = dateColumnMap.submissionDate ? 
                    getColumnValue(task, dateColumnMap.submissionDate) : '';
                const expectedDueDate = dateColumnMap.expectedDueDate ? 
                    getColumnValue(task, dateColumnMap.expectedDueDate) : '';
                const completionDate = dateColumnMap.completionDate ? 
                    getColumnValue(task, dateColumnMap.completionDate) : '';
                
                // Calculate if overdue
                let isOverdue = false;
                if (expectedDueDate) {
                    const dueDate = parseDate(expectedDueDate);
                    if (dueDate) {
                        if (completionDate) {
                            // Task is completed - check if it was completed late
                            const compDate = parseDate(completionDate);
                            if (compDate) {
                                isOverdue = compDate > dueDate;
                            }
                        } else if (task.state !== 'done' && task.state !== 'complete') {
                            // Task is not completed - check if past due date
                            const today = new Date();
                            isOverdue = today > dueDate;
                        }
                    }
                }
                
                return {
                    id: task.id,
                    name: task.name,
                    state: task.state || 'unknown',
                    developers: developers,
                    qcTeam: qcTeam,
                    devStatus: getColumnValue(task, 'status'),
                    phase: getColumnValue(task, 'phase__1'),
                    priority: getColumnValue(task, 'priority__1'),
                    taskType: getColumnValue(task, 'task_tag__1'),
                    createdAt: task.created_at,
                    submissionDate: submissionDate,
                    expectedDueDate: expectedDueDate,
                    completionDate: completionDate,
                    isOverdue: isOverdue
                };
            } catch (error) {
                console.error('Error processing task:', task.id, error);
                return null;
            }
        })
        .filter(task => task !== null);

    // Apply filters
    let filteredTasks = processedTasks;
    
    // Employee filter
    if (filterEmployee) {
        filteredTasks = filteredTasks.filter(task => 
            task.developers.includes(filterEmployee)
        );
    }

    // Date range filter (by submission date)
    if (startDate || endDate) {
        filteredTasks = filteredTasks.filter(task => {
            // Use submission date if available, otherwise fall back to created_at
            const dateToCheck = task.submissionDate || task.createdAt;
            return isDateInRange(dateToCheck, startDate, endDate);
        });
    }

    console.log(`After filtering: ${filteredTasks.length} tasks`);

    // Get unique developers
    const allEmployees = new Set();
    processedTasks.forEach(task => {
        task.developers.forEach(dev => allEmployees.add(dev));
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

    // Employee stats
    const employeeStats = {};
    Array.from(allEmployees).forEach(employee => {
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
        employees: Array.from(allEmployees).sort(),
        employeeStats: employeeStats,
        chartData: {
            statusChart: {
                labels: ['Completed', 'In Progress', 'Pending', 'Overdue'],
                data: [completed.length, inProgress.length, pending.length, overdue.length]
            }
        }
    };
}