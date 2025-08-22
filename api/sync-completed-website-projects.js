const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        console.log('Fetching completed website projects...');

        const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
        const DEV_BOARD_ID = '7034166433';

        // Fetch completed website projects from Monday.com
        const completedProjects = await fetchCompletedWebsiteProjects(MONDAY_TOKEN, DEV_BOARD_ID);
        console.log(`Found ${completedProjects.length} completed website projects`);

        // Process and format the completed projects
        const formattedProjects = completedProjects.map(project => formatCompletedProject(project));

        res.status(200).json({
            success: true,
            data: {
                completedProjects: formattedProjects,
                count: formattedProjects.length
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Completed projects fetch error:', error);
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

    while (pageCount < 5) { // Limit pages for completed projects
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

        // Filter for COMPLETED New Build and Rebuild tasks
        const completedWebsiteProjects = items.filter(item => {
            const taskType = getColumnText(item.column_values, 'task_tag__1');
            const phase = getColumnText(item.column_values, 'phase__1');
            const devStatus = getColumnText(item.column_values, 'status');
            
            // Only include New Build or Rebuild tasks
            const isWebsiteProject = taskType === 'New Build' || taskType === 'Rebuild';
            
            // Only include completed projects
            const isCompleted = phase === 'Completed' || 
                               phase === 'Complete' ||
                               devStatus === 'Done' || 
                               devStatus === 'Task Done' ||
                               devStatus === 'Completed' ||
                               item.state === 'done' ||
                               item.state === 'complete';
            
            return isWebsiteProject && isCompleted;
        });

        allProjects = allProjects.concat(completedWebsiteProjects);
        cursor = data.data.boards[0].items_page.cursor;
        
        if (!cursor) break;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return allProjects;
}

// Format completed project for frontend
function formatCompletedProject(project) {
    return {
        id: project.id,
        name: project.name,
        taskType: getColumnText(project.column_values, 'task_tag__1'),
        currentPhase: getColumnText(project.column_values, 'phase__1'),
        currentDevStatus: getColumnText(project.column_values, 'status'),
        currentQcStatus: getColumnText(project.column_values, 'status_15__1'),
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        completionDate: getColumnText(project.column_values, 'completion_date') || project.updated_at,
        developers: getPersonArray(project.column_values, 'person'),
        qcTeam: getPersonArray(project.column_values, 'people__1'),
        requestors: getPersonArray(project.column_values, 'people6__1'),
        isCompleted: true
    };
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