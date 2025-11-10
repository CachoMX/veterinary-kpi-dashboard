// Debug script to find the correct completion date column ID
require('dotenv').config({ path: '.env.local' });

async function debugCompletionDate() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Finding the correct completion date column for Vet 2 The Starz...\n');

        // Get the specific project that should have Aug 21, 2024 completion date
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                    items_page(limit: 50) {
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

        // Create column lookup map
        const columnMap = {};
        columns.forEach(col => {
            columnMap[col.id] = col;
        });

        // Find any completed project to analyze date columns
        const completedProject = items.find(item => {
            const phase = item.column_values.find(col => col.id === 'phase__1');
            return phase && phase.text === 'Completed';
        });

        if (!completedProject) {
            console.log('❌ Could not find any completed project');
            console.log('Available projects:');
            items.slice(0, 5).forEach(item => {
                const phase = item.column_values.find(col => col.id === 'phase__1');
                console.log(`  - ${item.name} (Phase: ${phase?.text || 'unknown'})`);
            });
            return;
        }

        console.log(`📋 Found project: ${completedProject.name}`);
        console.log(`🆔 ID: ${completedProject.id}\n`);

        console.log('📅 ALL DATE-RELATED COLUMNS:');

        // Look for date columns that might contain completion date
        const dateColumns = completedProject.column_values.filter(col => {
            const columnDef = columnMap[col.id];
            return col.text && (
                col.type === 'date' ||
                col.text.includes('2024') ||
                col.text.includes('Aug') ||
                col.text.includes('21') ||
                (columnDef && columnDef.title && (
                    columnDef.title.toLowerCase().includes('completion') ||
                    columnDef.title.toLowerCase().includes('complete') ||
                    columnDef.title.toLowerCase().includes('due') ||
                    columnDef.title.toLowerCase().includes('date') ||
                    columnDef.title.toLowerCase().includes('finish')
                ))
            );
        });

        dateColumns.forEach(col => {
            const columnDef = columnMap[col.id];
            console.log(`  ${col.id} (${col.type}): "${columnDef?.title}" = "${col.text}"`);
            console.log(`    Raw Value: ${col.value}`);

            // Check if this looks like Aug 21, 2024
            if (col.text && (col.text.includes('2024-08-21') || col.text.includes('Aug') || col.text.includes('21'))) {
                console.log(`    🎯 THIS MIGHT BE THE COMPLETION DATE!`);
            }
            console.log('');
        });

        // Also check all columns with any text containing dates
        console.log('\n📊 ALL COLUMNS WITH DATE-LIKE TEXT:');
        completedProject.column_values.forEach(col => {
            if (col.text && (col.text.includes('2024') || col.text.includes('Aug') || col.text.includes('Feb'))) {
                const columnDef = columnMap[col.id];
                console.log(`  ${col.id}: "${columnDef?.title}" = "${col.text}"`);
            }
        });

        // Check what we're currently using
        console.log('\n🔍 CURRENT COLUMN MAPPINGS:');
        const currentCompletionCol = completedProject.column_values.find(col => col.id === 'completion_date');
        const expectedDueCol = completedProject.column_values.find(col => col.id === 'expected_due_date');

        console.log(`Current completion_date column: ${currentCompletionCol ? currentCompletionCol.text : 'NOT FOUND'}`);
        console.log(`Current expected_due_date column: ${expectedDueCol ? expectedDueCol.text : 'NOT FOUND'}`);

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugCompletionDate();