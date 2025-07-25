module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Test: Get ALL items with pagination
        const fullQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    id
                    items_page(limit: 100) {
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
                        items_page(limit: 50) {
                            items {
                                id
                                name
                            }
                        }
                    }
                }
            }
        `;

        console.log('Testing Monday.com with FULL query and pagination...');
        const response = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: fullQuery })
        });

        const data = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', JSON.stringify(data, null, 2));

        if (data.errors) {
            return res.status(400).json({
                success: false,
                error: 'Monday.com API error',
                details: data.errors
            });
        }

        const board = data.data.boards[0];
        const mainItems = board.items_page.items || [];
        
        // Count items in each group
        const groupSummary = {};
        let totalGroupItems = 0;
        board.groups.forEach(group => {
            const count = group.items_page.items.length;
            groupSummary[group.title] = count;
            totalGroupItems += count;
        });

        res.status(200).json({
            success: true,
            message: 'Monday.com FULL data analysis',
            data: {
                boardInfo: {
                    name: board.name,
                    id: board.id
                },
                mainItemsCount: mainItems.length,
                totalGroupItems: totalGroupItems,
                groupBreakdown: groupSummary,
                pagination: {
                    cursor: board.items_page.cursor,
                    hasMore: !!board.items_page.cursor
                },
                sampleMainItems: mainItems.slice(0, 3).map(item => ({
                    id: item.id,
                    name: item.name,
                    created_at: item.created_at
                })),
                allGroups: board.groups.map(g => ({
                    id: g.id,
                    title: g.title,
                    itemCount: g.items_page.items.length
                }))
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