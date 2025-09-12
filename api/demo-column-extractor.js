// Demo script to extract Monday.com column IDs for QC Score and Total Duration
// This will help us find the exact column IDs we need

const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
const DEV_BOARD_ID = '7034166433';

module.exports = async (req, res) => {
    try {
        // Step 1: Get board structure first to get column definitions
        const boardQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                    items_page(limit: 5) {
                        items {
                            id
                            name
                            column_values {
                                id
                                text
                                value
                            }
                            subitems {
                                id
                                name
                                column_values {
                                    id
                                    text
                                    value
                                }
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
            body: JSON.stringify({ query: boardQuery })
        });

        const data = await response.json();
        
        if (data.errors) {
            throw new Error('Monday.com API error: ' + JSON.stringify(data.errors));
        }

        const board = data.data.boards[0];
        const columns = board?.columns || [];
        const items = board?.items_page?.items || [];

        // Create column lookup map
        const columnMap = {};
        columns.forEach(col => {
            columnMap[col.id] = col;
        });

        let analysis = {
            totalDurationColumns: [],
            qcScoreColumns: [],
            newBuildTasks: [],
            qcReviewSubitems: [],
            availableColumns: columns
        };

        // Analyze each item
        for (const item of items) {
            // Check if this is a New Build task
            let isNewBuild = false;
            let totalDurationColumn = null;
            
            // Analyze main task columns
            item.column_values.forEach(col => {
                const columnDef = columnMap[col.id];
                if (!columnDef) return;
                
                // Look for task type indicators
                if (columnDef.title && columnDef.title.toLowerCase().includes('task') && col.text && col.text.includes('New Build')) {
                    isNewBuild = true;
                }
                
                // Look for Total Duration column
                if (columnDef.title && columnDef.title.toLowerCase().includes('total') && columnDef.title.toLowerCase().includes('duration')) {
                    totalDurationColumn = {
                        id: col.id,
                        title: columnDef.title,
                        type: columnDef.type,
                        value: col.text || col.value,
                        taskName: item.name
                    };
                    analysis.totalDurationColumns.push(totalDurationColumn);
                }
            });
            
            if (isNewBuild) {
                analysis.newBuildTasks.push({
                    id: item.id,
                    name: item.name,
                    totalDuration: totalDurationColumn
                });
                
                // Analyze subitems for QC Score
                if (item.subitems && item.subitems.length > 0) {
                    item.subitems.forEach(subitem => {
                        // Check if this is the QC Review subitem
                        if (subitem.name && subitem.name.includes('Website QC Review')) {
                            analysis.qcReviewSubitems.push({
                                id: subitem.id,
                                name: subitem.name,
                                parentTask: item.name,
                                columns: []
                            });
                            
                            // Look for QC Score column in subitems
                            subitem.column_values.forEach(col => {
                                const columnDef = columnMap[col.id];
                                if (!columnDef) return;
                                
                                if (columnDef.title && columnDef.title.toLowerCase().includes('qc') && columnDef.title.toLowerCase().includes('score')) {
                                    analysis.qcScoreColumns.push({
                                        id: col.id,
                                        title: columnDef.title,
                                        type: columnDef.type,
                                        value: col.text || col.value,
                                        subitemName: subitem.name,
                                        parentTask: item.name
                                    });
                                }
                                
                                // Store all columns for this QC subitem
                                const lastQcSubitem = analysis.qcReviewSubitems[analysis.qcReviewSubitems.length - 1];
                                if (lastQcSubitem) {
                                    lastQcSubitem.columns.push({
                                        id: col.id,
                                        title: columnDef.title,
                                        type: columnDef.type,
                                        text: col.text,
                                        value: col.value
                                    });
                                }
                            });
                        }
                    });
                }
            }
        }


        // Return structured results
        res.status(200).json({
            success: true,
            message: 'Column extraction completed',
            analysis: analysis,
            summary: {
                totalDurationColumns: analysis.totalDurationColumns.length,
                qcScoreColumns: analysis.qcScoreColumns.length,
                newBuildTasks: analysis.newBuildTasks.length,
                qcReviewSubitems: analysis.qcReviewSubitems.length
            },
            recommendedColumnIds: {
                totalDuration: analysis.totalDurationColumns.length > 0 ? analysis.totalDurationColumns[0].id : null,
                qcScore: analysis.qcScoreColumns.length > 0 ? analysis.qcScoreColumns[0].id : null
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.toString()
        });
    }
};