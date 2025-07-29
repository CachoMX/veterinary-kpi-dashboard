module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // First, get the board structure to see all columns
        const boardQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    columns {
                        id
                        title
                        type
                    }
                }
            }
        `;

        const boardResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: boardQuery })
        });

        const boardData = await boardResponse.json();
        
        if (boardData.errors) {
            return res.status(400).json({ error: boardData.errors });
        }

        const columns = boardData.data.boards[0].columns;
        
        // Find all date-related columns
        const dateColumns = columns.filter(col => 
            col.type === 'date' || 
            col.type === 'creation_log' ||
            col.type === 'last_updated' ||
            col.title.toLowerCase().includes('date') ||
            col.title.toLowerCase().includes('created') ||
            col.title.toLowerCase().includes('updated')
        );

        // Now fetch items with ALL column values to see the data
        const itemsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 20) {
                        items {
                            id
                            name
                            created_at
                            updated_at
                            column_values {
                                id
                                title
                                text
                                value
                                type
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
            return res.status(400).json({ error: itemsData.errors });
        }

        const items = itemsData.data.boards[0].items_page.items;
        
        // Analyze date values in items
        const sampleItems = items.slice(0, 5).map(item => {
            const dateValues = {};
            
            // Add built-in dates
            dateValues['created_at'] = item.created_at;
            dateValues['updated_at'] = item.updated_at;
            
            // Add column dates
            item.column_values.forEach(col => {
                if (dateColumns.some(dc => dc.id === col.id) || col.text?.includes('202')) {
                    dateValues[`${col.id} (${col.title})`] = {
                        text: col.text,
                        value: col.value,
                        type: col.type
                    };
                }
            });
            
            return {
                name: item.name.substring(0, 50) + (item.name.length > 50 ? '...' : ''),
                dates: dateValues
            };
        });

        // Check date filtering logic
        const july2025Analysis = {
            itemsChecked: items.length,
            july2025ByColumn: {}
        };

        // Check each potential date column
        dateColumns.forEach(dateCol => {
            july2025Analysis.july2025ByColumn[dateCol.id] = {
                columnTitle: dateCol.title,
                columnType: dateCol.type,
                july2025Count: 0,
                sampleValues: []
            };
            
            items.forEach(item => {
                const colValue = item.column_values.find(cv => cv.id === dateCol.id);
                if (colValue?.text) {
                    // Check if it's July 2025
                    if (colValue.text.includes('2025-07') || 
                        (colValue.text.includes('Jul') && colValue.text.includes('2025'))) {
                        july2025Analysis.july2025ByColumn[dateCol.id].july2025Count++;
                        
                        if (july2025Analysis.july2025ByColumn[dateCol.id].sampleValues.length < 3) {
                            july2025Analysis.july2025ByColumn[dateCol.id].sampleValues.push({
                                itemName: item.name.substring(0, 30) + '...',
                                value: colValue.text
                            });
                        }
                    }
                }
            });
        });

        // Get pagination info
        const paginationQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_count
                    items_page(limit: 500) {
                        cursor
                        items {
                            id
                            column_values(ids: ["creation_log__1"]) {
                                text
                            }
                        }
                    }
                }
            }
        `;

        const paginationResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: paginationQuery })
        });

        const paginationData = await paginationResponse.json();
        const board = paginationData.data?.boards?.[0];
        
        // Count July 2025 in this larger batch
        let july2025CountInBatch = 0;
        if (board?.items_page?.items) {
            board.items_page.items.forEach(item => {
                const dateText = item.column_values?.[0]?.text;
                if (dateText && dateText.includes('2025-07')) {
                    july2025CountInBatch++;
                }
            });
        }

        res.status(200).json({
            success: true,
            boardInfo: {
                totalItemsInBoard: board?.items_count || 'unknown',
                itemsFetchedInLargeBatch: board?.items_page?.items?.length || 0,
                july2025CountInLargeBatch: july2025CountInBatch,
                hasMorePages: !!board?.items_page?.cursor
            },
            dateColumns: dateColumns,
            sampleItems: sampleItems,
            july2025Analysis: july2025Analysis,
            debug: {
                columnIdUsedInMainAPI: 'creation_log__1',
                boardId: DEV_BOARD_ID,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};