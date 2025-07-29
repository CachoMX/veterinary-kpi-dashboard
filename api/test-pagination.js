module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        let allJuly2025Tasks = [];
        let cursor = null;
        let pageCount = 0;
        const maxPages = 30; // Fetch up to 30 pages (3000 items)
        
        console.log('Starting to fetch all July 2025 tasks...');
        
        while (pageCount < maxPages) {
            pageCount++;
            
            const query = `
                query {
                    boards(ids: [${DEV_BOARD_ID}]) {
                        items_page(limit: 100${cursor ? `, cursor: "${cursor}"` : ''}) {
                            cursor
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
                console.error('Error on page', pageCount, ':', data.errors);
                break;
            }

            const items = data.data.boards[0].items_page.items;
            const nextCursor = data.data.boards[0].items_page.cursor;
            
            // Count July 2025 tasks in this page
            let july2025InPage = 0;
            items.forEach(item => {
                const submissionDate = item.column_values[0]?.text;
                if (submissionDate && submissionDate.includes('2025-07')) {
                    july2025InPage++;
                    allJuly2025Tasks.push({
                        id: item.id,
                        name: item.name,
                        submissionDate: submissionDate,
                        day: parseInt(submissionDate.match(/2025-07-(\d{2})/)?.[1] || '0')
                    });
                }
            });
            
            console.log(`Page ${pageCount}: ${items.length} items, ${july2025InPage} July 2025 tasks`);
            
            // Check if we should continue
            if (!nextCursor || items.length === 0) {
                console.log('No more pages to fetch');
                break;
            }
            
            cursor = nextCursor;
            
            // Small delay to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Group by day
        const tasksByDay = {};
        allJuly2025Tasks.forEach(task => {
            if (task.day >= 1 && task.day <= 31) {
                tasksByDay[task.day] = (tasksByDay[task.day] || 0) + 1;
            }
        });
        
        // Filter for July 1-28
        const july1to28Tasks = allJuly2025Tasks.filter(task => task.day >= 1 && task.day <= 28);
        
        res.status(200).json({
            success: true,
            summary: {
                totalPages: pageCount,
                totalJuly2025Tasks: allJuly2025Tasks.length,
                july1to28Tasks: july1to28Tasks.length,
                july29to31Tasks: allJuly2025Tasks.length - july1to28Tasks.length
            },
            tasksByDay: tasksByDay,
            sampleTasks: allJuly2025Tasks.slice(0, 10).map(t => ({
                name: t.name.substring(0, 50) + '...',
                date: t.submissionDate
            })),
            debug: {
                lastCursor: cursor,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};