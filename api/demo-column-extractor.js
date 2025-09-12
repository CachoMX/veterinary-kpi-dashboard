// Demo script to extract Monday.com column IDs for QC Score and Total Duration
// This will help us find the exact column IDs we need

const fetch = require('node-fetch');

const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
const DEV_BOARD_ID = '7034166433';

module.exports = async (req, res) => {
    try {
        console.log('🔍 Starting Monday.com column extraction demo...');
        
        // Step 1: Get all main tasks that are New Build type
        const mainTasksQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 5) {
                        items {
                            id
                            name
                            column_values {
                                id
                                title
                                text
                                value
                            }
                            subitems {
                                id
                                name
                                column_values {
                                    id
                                    title
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
            body: JSON.stringify({ query: mainTasksQuery })
        });

        const data = await response.json();
        
        if (data.errors) {
            throw new Error('Monday.com API error: ' + JSON.stringify(data.errors));
        }

        const items = data.data.boards[0]?.items_page?.items || [];
        console.log(`📋 Found ${items.length} items to analyze`);

        let analysis = {
            totalDurationColumns: [],
            qcScoreColumns: [],
            newBuildTasks: [],
            qcReviewSubitems: []
        };

        // Analyze each item
        for (const item of items) {
            console.log(`\n🔍 Analyzing: ${item.name}`);
            
            // Check if this is a New Build task
            let isNewBuild = false;
            let totalDurationColumn = null;
            
            // Analyze main task columns
            item.column_values.forEach(col => {
                console.log(`  Main Column: ${col.title} (${col.id}) = ${col.text || col.value}`);
                
                // Look for task type indicators
                if (col.title && col.title.toLowerCase().includes('task') && col.text && col.text.includes('New Build')) {
                    isNewBuild = true;
                }
                
                // Look for Total Duration column
                if (col.title && col.title.toLowerCase().includes('total') && col.title.toLowerCase().includes('duration')) {
                    totalDurationColumn = {
                        id: col.id,
                        title: col.title,
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
                
                console.log(`  ✅ This is a New Build task!`);
                
                // Analyze subitems for QC Score
                if (item.subitems && item.subitems.length > 0) {
                    console.log(`  📝 Analyzing ${item.subitems.length} subitems:`);
                    
                    item.subitems.forEach(subitem => {
                        console.log(`    Subitem: ${subitem.name}`);
                        
                        // Check if this is the QC Review subitem
                        if (subitem.name && subitem.name.includes('Website QC Review')) {
                            console.log(`    🎯 Found QC Review subitem!`);
                            analysis.qcReviewSubitems.push({
                                id: subitem.id,
                                name: subitem.name,
                                parentTask: item.name,
                                columns: []
                            });
                            
                            // Look for QC Score column
                            subitem.column_values.forEach(col => {
                                console.log(`      Subitem Column: ${col.title} (${col.id}) = ${col.text || col.value}`);
                                
                                if (col.title && col.title.toLowerCase().includes('qc') && col.title.toLowerCase().includes('score')) {
                                    analysis.qcScoreColumns.push({
                                        id: col.id,
                                        title: col.title,
                                        value: col.text || col.value,
                                        subitemName: subitem.name,
                                        parentTask: item.name
                                    });
                                    console.log(`      🎯 FOUND QC SCORE COLUMN: ${col.id} = ${col.text || col.value}`);
                                }
                                
                                // Store all columns for this QC subitem
                                const lastQcSubitem = analysis.qcReviewSubitems[analysis.qcReviewSubitems.length - 1];
                                if (lastQcSubitem) {
                                    lastQcSubitem.columns.push({
                                        id: col.id,
                                        title: col.title,
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

        console.log('\n📊 ANALYSIS RESULTS:');
        console.log('===================');
        
        console.log('\n🎯 TOTAL DURATION COLUMNS FOUND:');
        analysis.totalDurationColumns.forEach((col, i) => {
            console.log(`${i + 1}. Column ID: ${col.id} | Title: "${col.title}" | Value: ${col.value} | Task: ${col.taskName}`);
        });
        
        console.log('\n🎯 QC SCORE COLUMNS FOUND:');
        analysis.qcScoreColumns.forEach((col, i) => {
            console.log(`${i + 1}. Column ID: ${col.id} | Title: "${col.title}" | Value: ${col.value} | Subitem: ${col.subitemName} | Parent: ${col.parentTask}`);
        });
        
        console.log('\n📝 NEW BUILD TASKS FOUND:');
        analysis.newBuildTasks.forEach((task, i) => {
            console.log(`${i + 1}. ${task.name} (ID: ${task.id})`);
            if (task.totalDuration) {
                console.log(`   Total Duration: ${task.totalDuration.value} (Column ID: ${task.totalDuration.id})`);
            }
        });
        
        console.log('\n🔍 QC REVIEW SUBITEMS FOUND:');
        analysis.qcReviewSubitems.forEach((subitem, i) => {
            console.log(`${i + 1}. ${subitem.name} (ID: ${subitem.id}) - Parent: ${subitem.parentTask}`);
            console.log(`   Available columns: ${subitem.columns.length}`);
            subitem.columns.forEach(col => {
                if (col.title) {
                    console.log(`     - ${col.title} (${col.id}): ${col.text || col.value}`);
                }
            });
        });

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
        console.error('Error in column extraction:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
};