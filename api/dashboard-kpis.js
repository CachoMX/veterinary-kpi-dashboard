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
        // Fetch all tasks from Monday.com Dev board
        const mondayQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    groups {
                        id
                        title
                        items_page {
                            items {
                                id
                                name
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

        // Combine all tasks from all groups
        const allTasks = [];
        const board = mondayData.data.boards[0];
        
        board.groups.forEach(group => {
            group.items_page.items.forEach(item => {
                // Add group info to each task
                item.groupId = group.id;
                item.groupTitle = group.title;
                allTasks.push(item);
            });
        });

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

// Process task data function (mirrors your n8n logic)
async function processTaskData(tasks, filterEmployee = null, startDate = null, endDate = null) {
    // Helper functions
    function parseDate(dateStr) {
        if (!dateStr) return null;
        if (typeof dateStr === 'object' && dateStr.date) return new Date(dateStr.date);
        return new Date(dateStr);
    }

    function getColumnValue(task, columnId) {
        const column = task.column_values?.find(c => c.id === columnId);
        return column ? column.text || '' : '';
    }

    function getPersonValue(task, columnId) {
        const column = task.column_values?.find(c => c.id === columnId);
        if (!column || !column.text) return [];
        return column.text.split(', ').filter(Boolean);
    }

    // Process all tasks
    const allTasks = tasks
        .filter(task => !task.name.toLowerCase().includes("task example"))
        .map(task => {
            const developers = getPersonValue(task, 'person');
            const qcTeam = getPersonValue(task, 'people__1');
            const completionDate = parseDate(getColumnValue(task, 'date8__1'));
            const expectedDueDate = parseDate(getColumnValue(task, 'date__1'));
            const submissionDate = parseDate(getColumnValue(task, 'creation_log__1'));
            
            return {
                id: task.id,
                name: task.name,
                groupTitle: task.groupTitle,
                phase: getColumnValue(task, 'phase__1') || task.groupTitle, // Use group title as fallback
                priority: getColumnValue(task, 'priority__1'),
                developers: developers,
                qcTeam: qcTeam,
                devStatus: getColumnValue(task, 'status'),
                qcStatus: getColumnValue(task, 'status_15__1'),
                completionDate: completionDate,
                expectedDueDate: expectedDueDate,
                submissionDate: submissionDate,
                taskType: getColumnValue(task, 'task_tag__1'),
                lastUpdated: parseDate(getColumnValue(task, 'last_updated__1'))
            };
        });

    // Apply employee filter
    let filteredTasks = allTasks;
    if (filterEmployee) {
        filteredTasks = allTasks.filter(task => 
            task.developers.includes(filterEmployee) || task.qcTeam.includes(filterEmployee)
        );
    }

    // Apply date range filter
    if (startDate || endDate) {
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        filteredTasks = filteredTasks.filter(task => {
            const taskDate = task.completionDate || task.submissionDate || task.lastUpdated;
            if (!taskDate) return false;
            
            if (start && taskDate < start) return false;
            if (end && taskDate > end) return false;
            
            return true;
        });
    }

    // Get unique employees
    const allEmployees = new Set();
    allTasks.forEach(task => {
        task.developers.forEach(dev => allEmployees.add(dev));
        task.qcTeam.forEach(qc => allEmployees.add(qc));
    });

    // Status categorization based on group titles and phases
    const completed = filteredTasks.filter(t => 
        t.phase === 'Completed' || 
        t.groupTitle === 'Completed' ||
        t.devStatus === 'Task Done'
    );
    
    const inProgress = filteredTasks.filter(t => 
        t.phase === 'In Progress' || 
        t.groupTitle === 'In Progress' ||
        t.devStatus === 'Working on it'
    );
    
    const pending = filteredTasks.filter(t => 
        t.phase === 'Pending' || 
        t.groupTitle === 'Pending' ||
        (!t.phase && !t.groupTitle)
    );
    
    const needsApproval = filteredTasks.filter(t => 
        t.phase === 'Needs Approval' || 
        t.groupTitle === 'Needs Approval'
    );
    
    const onHold = filteredTasks.filter(t => 
        t.phase === 'On Hold' || 
        t.groupTitle === 'On Hold'
    );
    
    const overdue = filteredTasks.filter(t => 
        t.expectedDueDate && 
        new Date() > t.expectedDueDate && 
        !completed.includes(t)
    );

    const statusCategories = {
        completed,
        inProgress,
        pending,
        needsApproval,
        onHold,
        overdue
    };

    // Calculate time periods
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Employee performance stats
    const employeeStats = {};
    Array.from(allEmployees).forEach(employee => {
        const employeeTasks = filteredTasks.filter(t => 
            t.developers.includes(employee) || t.qcTeam.includes(employee)
        );
        
        employeeStats[employee] = {
            total: employeeTasks.length,
            completed: employeeTasks.filter(t => completed.includes(t)).length,
            inProgress: employeeTasks.filter(t => inProgress.includes(t)).length,
            pending: employeeTasks.filter(t => pending.includes(t)).length,
            overdue: employeeTasks.filter(t => overdue.includes(t)).length
        };
    });

    return {
        summary: {
            totalTasks: filteredTasks.length,
            statusCounts: {
                completed: completed.length,
                inProgress: inProgress.length,
                pending: pending.length,
                needsApproval: needsApproval.length,
                onHold: onHold.length,
                overdue: overdue.length
            }
        },
        employees: Array.from(allEmployees).sort(),
        employeeStats: employeeStats,
        chartData: {
            statusChart: {
                labels: ['Completed', 'In Progress', 'Pending', 'Needs Approval', 'On Hold', 'Overdue'],
                data: [
                    completed.length,
                    inProgress.length,
                    pending.length,
                    needsApproval.length,
                    onHold.length,
                    overdue.length
                ]
            }
        }
    };
}