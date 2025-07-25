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

    const NOTION_TOKEN = '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';
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Get ALL tasks from Monday.com with proper pagination and groups
        const mondayQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page(limit: 200) {
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
                    groups {
                        id
                        title
                        items_page(limit: 100) {
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
            }
        `;

        const mondayResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: mondayQuery })
        });

        const mondayData = await mondayResponse.json();
        
        console.log('Monday.com Response Status:', mondayResponse.status);
        console.log('Monday.com Response Data:', JSON.stringify(mondayData, null, 2));
        
        if (mondayData.errors) {
            console.error('Monday.com API Errors:', mondayData.errors);
            return res.status(400).json({
                success: false,
                error: 'Monday.com API error',
                details: mondayData.errors,
                debugInfo: {
                    status: mondayResponse.status,
                    boardId: DEV_BOARD_ID,
                    query: mondayQuery
                }
            });
        }

        if (!mondayData.data || !mondayData.data.boards || mondayData.data.boards.length === 0) {
            console.error('No boards found in Monday.com response');
            return res.status(400).json({
                success: false,
                error: 'No boards found',
                details: 'Board ID may be incorrect or integration lacks permissions',
                debugInfo: {
                    boardId: DEV_BOARD_ID,
                    responseData: mondayData
                }
            });
        }

        // Combine items from main items_page AND all groups
        const board = mondayData.data.boards[0];
        const mainItems = board.items_page.items || [];
        
        // Get items from all groups
        const groupItems = [];
        if (board.groups) {
            board.groups.forEach(group => {
                if (group.items_page && group.items_page.items) {
                    group.items_page.items.forEach(item => {
                        // Add group information to each item
                        item.groupId = group.id;
                        item.groupTitle = group.title;
                        groupItems.push(item);
                    });
                }
            });
        }

        // Combine all items and remove duplicates by ID
        const itemMap = new Map();
        
        // Add main items first
        mainItems.forEach(item => {
            itemMap.set(item.id, item);
        });
        
        // Add group items (may overwrite with group info)
        groupItems.forEach(item => {
            itemMap.set(item.id, item);
        });

        const allTasks = Array.from(itemMap.values());
        console.log(`Combined ${mainItems.length} main items + ${groupItems.length} group items = ${allTasks.length} total unique tasks`);

        // Process the data using your enhanced logic
        const processedData = await processTaskData(allTasks, employee, startDate, endDate);

        res.status(200).json({
            success: true,
            data: processedData,
            filters: {
                employee: employee || null,
                startDate: startDate || null,
                endDate: endDate || null
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Process task data function (simplified to match what actually works)
async function processTaskData(tasks, filterEmployee = null, startDate = null, endDate = null) {
    console.log(`Processing ${tasks.length} tasks`);
    
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

    // Process all tasks with basic error handling
    const allTasks = tasks
        .filter(task => task && task.name && !task.name.toLowerCase().includes("task example"))
        .map(task => {
            try {
                const developers = getPersonValue(task, 'person');
                const qcTeam = getPersonValue(task, 'people__1');
                
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
                    createdAt: task.created_at
                };
            } catch (error) {
                console.error('Error processing task:', task.id, error);
                return null;
            }
        })
        .filter(task => task !== null);

    console.log(`Successfully processed ${allTasks.length} tasks`);

    // Apply employee filter (DEVELOPERS only)
    let filteredTasks = allTasks;
    if (filterEmployee) {
        filteredTasks = allTasks.filter(task => 
            // Only filter by developers, not QC team
            task.developers.includes(filterEmployee)
        );
    }

    // Get unique DEVELOPERS only (not QC team)
    const allEmployees = new Set();
    allTasks.forEach(task => {
        // Only add developers, not QC team members
        task.developers.forEach(dev => allEmployees.add(dev));
        // Remove this line: task.qcTeam.forEach(qc => allEmployees.add(qc));
    });

    // Simple status categorization with better detection
    const completed = filteredTasks.filter(t => {
        // Check multiple ways a task could be completed
        return (
            t.state === 'done' || 
            t.state === 'complete' ||
            t.phase === 'Completed' || 
            t.devStatus === 'Task Done' ||
            t.devStatus === 'Done'
        );
    });
    
    const inProgress = filteredTasks.filter(t => {
        // Check if not completed and actively being worked on
        if (completed.includes(t)) return false;
        return (
            t.state === 'working_on_it' || 
            t.state === 'in_progress' ||
            t.phase === 'In Progress' ||
            t.devStatus === 'Working on it'
        );
    });
    
    const pending = filteredTasks.filter(t => {
        // Everything else that's not completed or in progress
        return !completed.includes(t) && !inProgress.includes(t);
    });

    console.log(`Status breakdown: ${completed.length} completed, ${inProgress.length} in progress, ${pending.length} pending`);

    // Employee stats for DEVELOPERS only
    const employeeStats = {};
    Array.from(allEmployees).forEach(employee => {
        const employeeTasks = filteredTasks.filter(t => 
            // Only count tasks where they are the DEVELOPER, not QC
            t.developers.includes(employee)
        );
        
        employeeStats[employee] = {
            total: employeeTasks.length,
            completed: employeeTasks.filter(t => completed.includes(t)).length,
            inProgress: employeeTasks.filter(t => inProgress.includes(t)).length,
            pending: employeeTasks.filter(t => pending.includes(t)).length,
            overdue: 0 // Simplified for now
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
                overdue: 0
            }
        },
        employees: Array.from(allEmployees).sort(),
        employeeStats: employeeStats,
        chartData: {
            statusChart: {
                labels: ['Completed', 'In Progress', 'Pending'],
                data: [completed.length, inProgress.length, pending.length]
            }
        }
    };
}