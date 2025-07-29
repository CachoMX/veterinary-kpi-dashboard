module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Test different approaches to filter by date
        console.log('Testing Monday.com date filtering approaches...');
        
        // Approach 1: Try filtering by created_at
        const approach1Query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page(
                        limit: 50
                        query_params: {
                            rules: [
                                {
                                    column_id: "creation_log__1"
                                    compare_value: ["2025-07-01", "2025-07-28"]
                                    operator: between
                                }
                            ]
                        }
                    ) {
                        items {
                            id
                            name
                            column_values(ids: ["creation_log__1"]) {
                                id
                                text
                            }
                        }
                    }
                }
            }
        `;

        console.log('Testing Approach 1: Filter by creation_log column...');
        const response1 = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: approach1Query })
        });

        const data1 = await response1.json();
        
        let results = {
            approach1: {
                success: !data1.errors,
                itemCount: data1.data?.boards?.[0]?.items_page?.items?.length || 0,
                error: data1.errors?.[0]?.message || null
            }
        };

        // Approach 2: Try using items_by_column_values
        const approach2Query = `
            query {
                items_by_column_values(
                    board_id: ${DEV_BOARD_ID}
                    column_id: "creation_log__1"
                    column_value: "2025-07"
                    limit: 50
                ) {
                    id
                    name
                    column_values(ids: ["creation_log__1"]) {
                        id
                        text
                    }
                }
            }
        `;

        console.log('Testing Approach 2: items_by_column_values...');
        const response2 = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: approach2Query })
        });

        const data2 = await response2.json();
        
        results.approach2 = {
            success: !data2.errors,
            itemCount: data2.data?.items_by_column_values?.length || 0,
            error: data2.errors?.[0]?.message || null
        };

        // Approach 3: Get available views
        const viewsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    views {
                        id
                        name
                        type
                    }
                }
            }
        `;

        console.log('Getting available views...');
        const response3 = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: viewsQuery })
        });

        const data3 = await response3.json();
        
        results.views = data3.data?.boards?.[0]?.views || [];

        res.status(200).json({
            message: 'Date filtering test results',
            results: results,
            recommendation: results.approach1.success ? 
                'Use query_params with rules for date filtering' : 
                'Create a filtered view in Monday.com and query that view'
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};