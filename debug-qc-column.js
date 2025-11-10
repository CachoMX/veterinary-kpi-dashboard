// Debug script to find the QC Review Score column ID in Monday.com
require('dotenv').config({ path: '.env.local' });

async function debugQCColumn() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Finding QC Review Score column in Monday.com board...\n');

        // Get board columns and sample projects
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                    items_page(limit: 100) {
                        items {
                            id
                            name
                            column_values {
                                id
                                text
                                value
                                type
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
            console.error('Monday.com API error:', data.errors);
            return;
        }

        const board = data.data.boards[0];
        const columns = board.columns;
        const items = board.items_page.items;

        // Find columns that might be QC Review Score
        console.log('🔍 SEARCHING FOR QC REVIEW SCORE COLUMN:');
        const qcColumns = columns.filter(col =>
            col.title.toLowerCase().includes('qc') &&
            (col.title.toLowerCase().includes('review') ||
             col.title.toLowerCase().includes('score'))
        );

        qcColumns.forEach(col => {
            console.log(`  📊 ${col.id}: "${col.title}" (${col.type})`);
        });

        // Also check for numeric columns that might be scores
        console.log('\n🔢 ALL NUMERIC/RATING COLUMNS:');
        const numericColumns = columns.filter(col =>
            col.type === 'rating' ||
            col.type === 'numbers' ||
            col.title.toLowerCase().includes('score') ||
            col.title.toLowerCase().includes('rating')
        );

        numericColumns.forEach(col => {
            console.log(`  📊 ${col.id}: "${col.title}" (${col.type})`);
        });

        // Find a project with QC score to test
        const projectWithQCScore = items.find(item => {
            return item.column_values.some(col => {
                const value = col.text;
                return value && !isNaN(value) && parseInt(value) >= 50 && parseInt(value) <= 100;
            });
        });

        if (projectWithQCScore) {
            console.log(`\n🎯 Found project with potential QC score: ${projectWithQCScore.name}`);

            // Check all columns with numeric values
            projectWithQCScore.column_values.forEach(col => {
                const value = col.text;
                if (value && !isNaN(value) && parseInt(value) >= 50 && parseInt(value) <= 100) {
                    const columnDef = columns.find(c => c.id === col.id);
                    console.log(`  📊 ${col.id}: "${columnDef?.title}" = ${value} (${col.type})`);
                }
            });
        }

        console.log('\n💡 RECOMMENDATION:');
        if (qcColumns.length > 0) {
            console.log(`Use column ID: ${qcColumns[0].id} for QC Review Score`);
        } else if (numericColumns.length > 0) {
            console.log(`Check these numeric columns: ${numericColumns.map(c => c.id).join(', ')}`);
        } else {
            console.log('QC Review Score column not found in standard format');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugQCColumn();