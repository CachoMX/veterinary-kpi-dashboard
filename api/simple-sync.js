// Simple sync function with better error handling
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const config = {
    notion: {
        apiKey: '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',
        kpiDatabaseId: '210d2a8e6475802fb688000c9aca221d'
    },
    monday: {
        apiKey: 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM',
        devWorkBoardId: '7034166433'
    }
};

    try {
        // Step 1: Test Notion connection first
        console.log('Testing Notion connection...');
        
        // Try to read the KPI database first
        const testRead = await fetch(`https://api.notion.com/v1/databases/${config.notion.kpiDatabaseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.notion.apiKey}`,
                'Notion-Version': '2022-06-28'
            }
        });

        const readResult = await testRead.json();
        
        if (readResult.object === 'error') {
            throw new Error(`Notion database access error: ${readResult.message}`);
        }

        console.log('✅ Can access Notion database');

        // Step 2: Get Monday.com data
        console.log('Fetching Monday.com data...');
        
        const mondayQuery = `
            query {
                boards(ids: [${config.monday.devWorkBoardId}]) {
                    name
                    items_page {
                        items {
                            id
                            name
                            state
                            created_at
                            updated_at
                        }
                    }
                }
            }
        `;

        const mondayResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': config.monday.apiKey
            },
            body: JSON.stringify({ query: mondayQuery })
        });

        const mondayData = await mondayResponse.json();

        if (mondayData.errors) {
            throw new Error('Monday.com error: ' + JSON.stringify(mondayData.errors));
        }

        const tasks = mondayData.data.boards[0].items_page.items;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => 
            task.state === 'done' || task.state === 'complete'
        ).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        console.log(`✅ Monday.com data: ${totalTasks} tasks, ${completedTasks} completed`);

        // Step 3: Create a simple KPI entry in Notion
        console.log('Creating Notion KPI entry...');
        
        const kpiEntry = {
            'Date': {
                date: { start: new Date().toISOString().split('T')[0] }
            },
            'Platform Uptime': {
                number: 99.95
            },
            'Avg Load Time': {
                number: 2.1
            },
            'Core Web Vitals Score': {
                number: 94
            },
            'Sites Monitored': {
                number: 25
            },
            'Data Source': {
                select: { name: 'Automated API' }
            },
            'Notes': {
                rich_text: [{
                    text: {
                        content: `Simple sync test: ${totalTasks} Monday.com tasks, ${completedTasks} completed (${completionRate.toFixed(1)}%). Created: ${new Date().toLocaleString()}`
                    }
                }]
            }
        };

        const createResponse = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.notion.apiKey}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: config.notion.kpiDatabaseId },
                properties: kpiEntry
            })
        });

        const createResult = await createResponse.json();

        if (createResult.object === 'error') {
            throw new Error(`Notion create error: ${createResult.message}`);
        }

        console.log('✅ Created Notion entry successfully');

        // Return success
        res.status(200).json({
            success: true,
            message: 'Simple sync completed successfully',
            data: {
                mondayTasks: totalTasks,
                completedTasks: completedTasks,
                completionRate: completionRate.toFixed(1),
                notionEntryId: createResult.id
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Simple sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
} 