module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        // Fetch a sample of tasks to see date distribution
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_count
                    items_page(limit: 500) {
                        items {
                            id
                            name
                            created_at
                            column_values(ids: ["creation_log__1", "date__1", "date8__1"]) {
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
            return res.status(400).json({ error: data.errors });
        }

        const board = data.data.boards[0];
        const tasks = board.items_page.items;
        
        // Analyze date distribution
        const dateDistribution = {};
        let july2025Count = 0;
        let july21to28Count = 0;
        let oldestDate = null;
        let newestDate = null;
        
        tasks.forEach((task, index) => {
            const submissionDateCol = task.column_values.find(c => c.id === 'creation_log__1');
            const submissionDate = submissionDateCol?.text;
            
            if (submissionDate) {
                // Parse date
                let date;
                if (submissionDate.includes(' UTC')) {
                    date = new Date(submissionDate.replace(' UTC', 'Z').replace(' ', 'T'));
                } else {
                    date = new Date(submissionDate);
                }
                
                if (!isNaN(date.getTime())) {
                    const dateStr = date.toISOString().split('T')[0];
                    const monthKey = dateStr.substring(0, 7); // YYYY-MM
                    
                    dateDistribution[monthKey] = (dateDistribution[monthKey] || 0) + 1;
                    
                    // Track oldest and newest
                    if (!oldestDate || date < oldestDate) oldestDate = date;
                    if (!newestDate || date > newestDate) newestDate = date;
                    
                    // Count July 2025 tasks
                    if (dateStr.startsWith('2025-07')) {
                        july2025Count++;
                        
                        const day = parseInt(dateStr.split('-')[2]);
                        if (day >= 21 && day <= 28) {
                            july21to28Count++;
                            
                            // Log first few July 21-28 tasks
                            if (july21to28Count <= 5) {
                                console.log(`Task ${index}: ${dateStr} - ${task.name.substring(0, 50)}...`);
                            }
                        }
                    }
                }
            }
        });

        // Sort date distribution
        const sortedDistribution = Object.entries(dateDistribution)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([month, count]) => ({ month, count }));

        res.status(200).json({
            boardInfo: {
                name: board.name,
                totalItems: board.items_count,
                itemsFetched: tasks.length
            },
            dateRange: {
                oldest: oldestDate ? oldestDate.toISOString().split('T')[0] : null,
                newest: newestDate ? newestDate.toISOString().split('T')[0] : null
            },
            july2025Stats: {
                totalJuly2025: july2025Count,
                july21to28: july21to28Count,
                percentageOfFetched: ((july21to28Count / tasks.length) * 100).toFixed(2) + '%'
            },
            monthlyDistribution: sortedDistribution,
            analysis: {
                message: july21to28Count < 30 ? 
                    'The July 21-28 tasks might be beyond the fetched limit. The board appears to return newer tasks first.' :
                    'Found sufficient July 21-28 tasks in the sample.',
                recommendation: july21to28Count < 30 ?
                    'Need to implement date-based filtering in the Monday.com query itself or fetch more pages.' :
                    'Current pagination should work fine.'
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};