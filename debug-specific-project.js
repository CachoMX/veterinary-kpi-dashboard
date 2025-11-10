// Debug specific completed project for duration/QC data
require('dotenv').config({ path: '.env.local' });

async function debugSpecificProject() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const JUST_4_PETS_ID = '5291012124'; // We know this ID from earlier debug

    try {
        console.log('🔍 Debugging Just 4 Pets project for duration/QC data...\n');

        // Get the specific project with all columns
        const query = `
            query {
                items(ids: [${JUST_4_PETS_ID}]) {
                    id
                    name
                    column_values {
                        id
                        text
                        value
                        type
                    }
                    subitems {
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
        const project = data.data.items[0];

        console.log(`📌 PROJECT: ${project.name}\n`);

        // Check the lookup columns
        console.log('🔍 MAIN PROJECT LOOKUP COLUMNS:');
        const durationCol = project.column_values.find(col => col.id === 'lookup_mktvxvt7');
        const qcCol = project.column_values.find(col => col.id === 'lookup_mktvfsax');

        console.log(`Total Duration (lookup_mktvxvt7):`);
        console.log(`  Text: "${durationCol?.text || 'null'}"`);
        console.log(`  Value: ${durationCol?.value || 'null'}`);

        console.log(`QC Review Score (lookup_mktvfsax):`);
        console.log(`  Text: "${qcCol?.text || 'null'}"`);
        console.log(`  Value: ${qcCol?.value || 'null'}`);

        // Check subitems for the actual data
        console.log(`\n📋 SUBITEMS (${project.subitems.length}):`);
        project.subitems.forEach((subitem, i) => {
            console.log(`\n${i + 1}. ${subitem.name}:`);

            // Look for duration/time columns
            const durationCols = subitem.column_values.filter(col =>
                col.text && !isNaN(col.text) && parseFloat(col.text) > 0
            );

            if (durationCols.length > 0) {
                console.log(`   Duration-like values:`);
                durationCols.forEach(col => {
                    console.log(`     ${col.id}: "${col.text}" (${col.type})`);
                });
            } else {
                console.log(`   ❌ No numeric duration values found`);
            }

            // Check for specific columns we saw before
            const numericCol = subitem.column_values.find(col => col.id === 'numeric_mkqq9nxr');
            if (numericCol) {
                console.log(`   🎯 QC Score Column (numeric_mkqq9nxr): "${numericCol.text}"`);
            }
        });

        // Check if there are other duration-related columns in main project
        console.log(`\n🔍 ALL NUMERIC COLUMNS IN MAIN PROJECT:`);
        project.column_values.forEach(col => {
            if (col.text && !isNaN(col.text) && parseFloat(col.text) > 0) {
                console.log(`  ${col.id}: "${col.text}" (${col.type})`);
            }
        });

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugSpecificProject();