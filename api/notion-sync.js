// CommonJS Notion sync
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const NOTION_TOKEN = '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';
    const KPI_DATABASE_ID = '210d2a8e6475802fb688000c9aca221d';
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Test Notion access
        const testRead = await fetch(`https://api.notion.com/v1/databases/${KPI_DATABASE_ID}`, {
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
                details: readResult.message,
                usedId: KPI_DATABASE_ID,
                suggestion: 'Make sure KPI Dashboard integration is connected to your Daily KPI Tracking database in Notion'
            });
        }

        // Get Monday.com data
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

        // Create Notion entry
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
                        content: `CommonJS sync: ${totalTasks} Monday.com tasks, ${completedTasks} completed. ${new Date().toLocaleString()}`
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
                error: 'Failed to create Notion entry',
                details: createResult.message
            });
        }

        // Success!
        res.status(200).json({
            success: true,
            message: 'CommonJS sync completed successfully!',
            data: {
                mondayTasks: totalTasks,
                completedTasks: completedTasks,
                notionEntryId: createResult.id
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