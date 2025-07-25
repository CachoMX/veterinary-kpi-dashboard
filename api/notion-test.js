export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Fresh config with no dashes - using the exact IDs you provided
    const NOTION_TOKEN = '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';
    const KPI_DATABASE_ID = '210d2a8e6475802fb688000c9aca221d'; // NO DASHES
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Log the exact ID being used
        console.log('Using database ID:', KPI_DATABASE_ID);
        console.log('ID length:', KPI_DATABASE_ID.length);
        console.log('Contains dashes:', KPI_DATABASE_ID.includes('-'));

        // Step 1: Test Notion database access
        const notionUrl = `https://api.notion.com/v1/databases/${KPI_DATABASE_ID}`;
        console.log('Calling URL:', notionUrl);
        
        const testRead = await fetch(notionUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28'
            }
        });

        const readResult = await testRead.json();
        
        if (readResult.object === 'error') {
            return res.status(400).json({
                success: false,
                error: 'Database access failed',
                details: readResult,
                usedId: KPI_DATABASE_ID,
                message: 'Make sure the KPI Dashboard integration is connected to your Daily KPI Tracking database'
            });
        }

        // Step 2: Get Monday.com data
        const mondayQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page {
                        items {
                            id
                            name
                            state
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
        const tasks = mondayData.data.boards[0].items_page.items;
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => 
            task.state === 'done' || task.state === 'complete'
        ).length;

        // Step 3: Create Notion entry
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
                        content: `FRESH TEST: ${totalTasks} Monday.com tasks, ${completedTasks} completed. Time: ${new Date().toLocaleString()}`
                    }
                }]
            }
        };

        const createResponse = await fetch('https://api.notion.com/v1/pages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                parent: { database_id: KPI_DATABASE_ID },
                properties: kpiEntry
            })
        });

        const createResult = await createResponse.json();

        if (createResult.object === 'error') {
            return res.status(400).json({
                success: false,
                error: 'Failed to create entry',
                details: createResult,
                usedId: KPI_DATABASE_ID
            });
        }

        // Success!
        res.status(200).json({
            success: true,
            message: 'FRESH sync completed successfully!',
            data: {
                mondayTasks: totalTasks,
                completedTasks: completedTasks,
                notionEntryId: createResult.id,
                usedDatabaseId: KPI_DATABASE_ID
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            usedId: KPI_DATABASE_ID,
            timestamp: new Date().toISOString()
        });
    }
}