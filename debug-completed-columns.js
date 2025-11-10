// Debug script to see what columns completed projects actually have
require('dotenv').config({ path: '.env.local' });

async function debugCompletedColumns() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Debugging completed project columns...\n');

        // First get board columns, then get one completed project
        const boardQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                    items_page(limit: 1) {
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
            body: JSON.stringify({ query: boardQuery })
        });

        const data = await response.json();

        if (data.errors) {
            console.error('Monday.com API error:', data.errors);
            return;
        }

        const board = data.data.boards[0];
        const columns = board.columns;
        const firstItem = board.items_page.items[0];

        // Create column lookup map
        const columnMap = {};
        columns.forEach(col => {
            columnMap[col.id] = col;
        });

        console.log(`📋 Project: ${firstItem.name}`);
        console.log(`🆔 ID: ${firstItem.id}\n`);

        console.log('📊 ALL COLUMNS WITH DATA:');
        firstItem.column_values.forEach(col => {
            if (col.text || col.value) {
                const columnDef = columnMap[col.id];
                console.log(`  ${col.id} (${col.type}): "${columnDef?.title || 'Unknown'}"`);
                console.log(`    Text: "${col.text}"`);
                console.log(`    Value: ${col.value}`);
                console.log('');
            }
        });

        // Look specifically for duration and QC columns
        console.log('🎯 SEARCHING FOR METRICS COLUMNS:');

        const durationColumns = firstItem.column_values.filter(col => {
            const columnDef = columnMap[col.id];
            return columnDef && columnDef.title && (
                columnDef.title.toLowerCase().includes('duration') ||
                columnDef.title.toLowerCase().includes('time') ||
                columnDef.title.toLowerCase().includes('hours') ||
                columnDef.title.toLowerCase().includes('total')
            );
        });

        const qcColumns = firstItem.column_values.filter(col => {
            const columnDef = columnMap[col.id];
            return columnDef && columnDef.title && (
                columnDef.title.toLowerCase().includes('qc') ||
                columnDef.title.toLowerCase().includes('quality') ||
                columnDef.title.toLowerCase().includes('score') ||
                columnDef.title.toLowerCase().includes('review')
            );
        });

        console.log('\n⏱️  DURATION-RELATED COLUMNS:');
        durationColumns.forEach(col => {
            const columnDef = columnMap[col.id];
            console.log(`  ${col.id}: "${columnDef?.title}" = "${col.text}" (${col.value})`);
        });

        console.log('\n⭐ QC/SCORE-RELATED COLUMNS:');
        qcColumns.forEach(col => {
            const columnDef = columnMap[col.id];
            console.log(`  ${col.id}: "${columnDef?.title}" = "${col.text}" (${col.value})`);
        });

        // Check the specific columns we're looking for
        console.log('\n🔍 CURRENT LOOKUP COLUMNS:');
        const durationCol = firstItem.column_values.find(col => col.id === 'lookup_mktvxvt7');
        const qcCol = firstItem.column_values.find(col => col.id === 'lookup_mktvfsax');

        if (durationCol) {
            const durationColDef = columnMap[durationCol.id];
            console.log(`  lookup_mktvxvt7: "${durationColDef?.title}" = "${durationCol.text}" (${durationCol.value})`);
        } else {
            console.log('  ❌ lookup_mktvxvt7 not found!');
        }

        if (qcCol) {
            const qcColDef = columnMap[qcCol.id];
            console.log(`  lookup_mktvfsax: "${qcColDef?.title}" = "${qcCol.text}" (${qcCol.value})`);
        } else {
            console.log('  ❌ lookup_mktvfsax not found!');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugCompletedColumns();