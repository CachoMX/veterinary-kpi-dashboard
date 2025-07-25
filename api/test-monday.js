module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Test 1: Simple board info
        const simpleQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    id
                }
            }
        `;

        console.log('Testing Monday.com connection...');
        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: simpleQuery })
        });

        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (data.errors) {
            return res.status(400).json({
                success: false,
                error: 'Monday.com API error',
                details: data.errors,
                debugInfo: {
                    status: response.status,
                    boardId: DEV_BOARD_ID,
                    query: simpleQuery
                }
            });
        }

        // Test 2: Get items from the board (same as your working APIs)
        const itemsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page {
                        items {
                            id
                            name
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

        res.status(200).json({
            success: true,
            message: 'Monday.com connection working',
            data: {
                boardInfo: data.data.boards[0],
                itemsCount: itemsData.data?.boards[0]?.items_page?.items?.length || 0,
                sampleItems: itemsData.data?.boards[0]?.items_page?.items?.slice(0, 3) || [],
                fullItemsResponse: itemsData
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
    }
};