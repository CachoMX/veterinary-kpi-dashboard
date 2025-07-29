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
        // Fetch first 100 items to analyze date formats
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    name
                    items_page(limit: 100) {
                        items {
                            id
                            name
                            created_at
                            column_values(ids: ["creation_log__1"]) {
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

        const items = data.data.boards[0].items_page.items;
        
        // Analyze date formats
        const dateAnalysis = {
            totalItems: items.length,
            dateFormats: {},
            july2025Items: [],
            parseResults: []
        };

        // Enhanced parseDate function that handles Monday.com formats
        function parseDate(dateStr) {
            if (!dateStr) return null;
            
            // Handle creation_log format: "2025-07-21 20:28:00 UTC"
            if (dateStr.includes(' UTC')) {
                dateStr = dateStr.replace(' UTC', 'Z').replace(' ', 'T');
                const parsed = new Date(dateStr);
                if (!isNaN(parsed.getTime())) return parsed;
            }
            
            // Handle Monday.com format: "Abi Thenthirath 21 Jul, 2025 2:28 PM"
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthPattern = monthNames.join('|');
            
            // Try to match patterns like "21 Jul, 2025" or "21 Jul 2025"
            const dateMatch = dateStr.match(new RegExp(`(\\d{1,2})\\s+(${monthPattern}),?\\s+(\\d{4})`));
            if (dateMatch) {
                const day = parseInt(dateMatch[1]);
                const monthIndex = monthNames.indexOf(dateMatch[2]);
                const year = parseInt(dateMatch[3]);
                
                if (monthIndex !== -1) {
                    const parsed = new Date(year, monthIndex, day, 12, 0, 0);
                    if (!isNaN(parsed.getTime())) return parsed;
                }
            }
            
            // Try standard date formats
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        }

        items.forEach((item, index) => {
            const submissionDateCol = item.column_values.find(c => c.id === 'creation_log__1');
            const submissionDate = submissionDateCol?.text || '';
            
            if (submissionDate) {
                // Track format
                const formatKey = submissionDate.replace(/\d+/g, 'N').replace(/\b\w+@\w+\.\w+\b/g, 'EMAIL');
                dateAnalysis.dateFormats[formatKey] = (dateAnalysis.dateFormats[formatKey] || 0) + 1;
                
                // Parse and check
                const parsed = parseDate(submissionDate);
                const parseResult = {
                    original: submissionDate,
                    parsed: parsed ? parsed.toISOString() : null,
                    isJuly2025: false
                };
                
                if (parsed) {
                    const year = parsed.getFullYear();
                    const month = parsed.getMonth();
                    const day = parsed.getDate();
                    
                    if (year === 2025 && month === 6) { // July is month 6 (0-indexed)
                        parseResult.isJuly2025 = true;
                        dateAnalysis.july2025Items.push({
                            name: item.name,
                            date: submissionDate,
                            parsedDate: parsed.toISOString().split('T')[0],
                            day: day
                        });
                    }
                }
                
                if (index < 10) { // Show first 10 parse results
                    dateAnalysis.parseResults.push(parseResult);
                }
            }
        });

        // Count July dates by day
        const julyDayCounts = {};
        dateAnalysis.july2025Items.forEach(item => {
            julyDayCounts[item.day] = (julyDayCounts[item.day] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            analysis: {
                totalItemsFetched: dateAnalysis.totalItems,
                uniqueDateFormats: Object.keys(dateAnalysis.dateFormats).length,
                mostCommonFormats: Object.entries(dateAnalysis.dateFormats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([format, count]) => ({ format, count })),
                july2025Count: dateAnalysis.july2025Items.length,
                july2025ByDay: julyDayCounts,
                sampleParseResults: dateAnalysis.parseResults,
                firstFewJuly2025: dateAnalysis.july2025Items.slice(0, 5)
            },
            debug: {
                columnId: 'creation_log__1',
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