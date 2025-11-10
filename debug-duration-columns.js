// Debug what duration columns are available in Monday.com
require('dotenv').config({ path: '.env.local' });

async function debugDurationColumns() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Debugging duration/lookup columns in Monday.com...\n');

        // Get board columns to understand what's available
        const columnsQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    columns {
                        id
                        title
                        type
                    }
                }
            }
        `;

        const columnsResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: columnsQuery })
        });

        const columnsData = await columnsResponse.json();
        const columns = columnsData.data.boards[0].columns;

        console.log('📊 LOOKING FOR DURATION/LOOKUP COLUMNS:');
        const durationColumns = columns.filter(col =>
            col.title.toLowerCase().includes('duration') ||
            col.title.toLowerCase().includes('total') ||
            col.type === 'lookup' ||
            col.type === 'mirror'
        );

        durationColumns.forEach(col => {
            console.log(`  ${col.id}: "${col.title}" (${col.type})`);
        });

        // Now get a sample project to see what these columns contain
        const projectQuery = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 5) {
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

        const projectResponse = await fetch('https://api.monday.com/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': MONDAY_TOKEN
            },
            body: JSON.stringify({ query: projectQuery })
        });

        const projectData = await projectResponse.json();
        const projects = projectData.data.boards[0].items_page.items;

        // Find a completed project
        const completedProject = projects.find(project => {
            const phase = project.column_values.find(col => col.id === 'phase__1');
            return phase && phase.text === 'Completed';
        });

        if (completedProject) {
            console.log(`\n🎯 SAMPLE PROJECT: ${completedProject.name}`);
            console.log('📋 CHECKING DURATION/LOOKUP COLUMNS:');

            // Check the lookup columns we're currently using
            const currentDuration = completedProject.column_values.find(col => col.id === 'lookup_mktvxvt7');
            const currentQC = completedProject.column_values.find(col => col.id === 'lookup_mktvfsax');

            console.log(`\nCurrent Duration Column (lookup_mktvxvt7):`);
            console.log(`  Text: "${currentDuration?.text || 'null'}"`);
            console.log(`  Value: ${currentDuration?.value || 'null'}`);
            console.log(`  Type: ${currentDuration?.type || 'unknown'}`);

            console.log(`\nCurrent QC Column (lookup_mktvfsax):`);
            console.log(`  Text: "${currentQC?.text || 'null'}"`);
            console.log(`  Value: ${currentQC?.value || 'null'}`);
            console.log(`  Type: ${currentQC?.type || 'unknown'}`);

            // Check all lookup/mirror columns
            console.log(`\n🔍 ALL LOOKUP/MIRROR COLUMNS IN THIS PROJECT:`);
            completedProject.column_values.forEach(col => {
                const columnDef = columns.find(c => c.id === col.id);
                if (columnDef && (columnDef.type === 'lookup' || columnDef.type === 'mirror')) {
                    console.log(`  ${col.id}: "${columnDef.title}" = "${col.text || 'null'}" (${columnDef.type})`);
                }
            });

        } else {
            console.log('\n❌ No completed projects found in first 5 items');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugDurationColumns();