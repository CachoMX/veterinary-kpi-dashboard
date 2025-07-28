module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Get just one item to see all columns
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    columns {
                        id
                        title
                        type
                        settings_str
                    }
                    items_page(limit: 5) {
                        items {
                            id
                            name
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
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query })
        });

        const data = await response.json();
        
        if (data.errors) {
            return res.status(400).json({
                success: false,
                error: 'Monday.com API error',
                details: data.errors
            });
        }

        const board = data.data.boards[0];
        
        // Find date columns
        const dateColumns = board.columns.filter(col => 
            col.type === 'date' || 
            col.title.toLowerCase().includes('date') ||
            col.title.toLowerCase().includes('due') ||
            col.title.toLowerCase().includes('completion') ||
            col.title.toLowerCase().includes('submission')
        );

        // Get sample date values from first few items
        const sampleDateValues = {};
        board.items_page.items.forEach(item => {
            dateColumns.forEach(dateCol => {
                const colValue = item.column_values.find(cv => cv.id === dateCol.id);
                if (colValue && colValue.text) {
                    if (!sampleDateValues[dateCol.id]) {
                        sampleDateValues[dateCol.id] = [];
                    }
                    sampleDateValues[dateCol.id].push({
                        itemName: item.name,
                        value: colValue.text,
                        rawValue: colValue.value
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            boardName: board.name,
            allColumns: board.columns.map(col => ({
                id: col.id,
                title: col.title,
                type: col.type
            })),
            dateColumns: dateColumns.map(col => ({
                id: col.id,
                title: col.title,
                type: col.type,
                sampleValues: sampleDateValues[col.id] || []
            })),
            instructions: "Look for columns with IDs like 'date', 'date__1', etc. These are your date columns.",
            sampleItems: board.items_page.items.map(item => ({
                name: item.name,
                created_at: item.created_at,
                updated_at: item.updated_at
            }))
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};