// Debug why QC Review Score values are all null
require('dotenv').config({ path: '.env.local' });

async function debugQCScores() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Debugging QC Review Score values in Monday.com...\n');

        // Get a few known completed projects and check their QC Review Score column
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 30) {
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
            throw new Error('Monday.com API error: ' + JSON.stringify(data.errors));
        }

        const items = data.data.boards[0].items_page.items;

        // Look for projects that should have QC scores (from the CSV)
        const knownQCProjects = [
            "Just 4 Pets Wellness Center - Website Build", // CSV shows 83
            "Happy Valley Pet Hospital", // CSV shows 59
            "My Village Pet Clinic - Website Build", // CSV shows 86
            "Northern Pike Veterinary Hospital - Website Build", // CSV shows 71
            "easyvet franchise and Winter Garden"  // CSV shows 74, 87, 96
        ];

        console.log('🎯 CHECKING KNOWN PROJECTS WITH QC SCORES:\n');

        knownQCProjects.forEach(projectName => {
            const project = items.find(item =>
                item.name.toLowerCase().includes(projectName.toLowerCase().split(' - ')[0].toLowerCase())
            );

            if (project) {
                console.log(`📌 ${project.name}:`);

                // Check lookup_mktvfsax column (QC Review Score)
                const qcColumn = project.column_values.find(col => col.id === 'lookup_mktvfsax');
                if (qcColumn) {
                    console.log(`  QC Review Score (lookup_mktvfsax): "${qcColumn.text}" | Value: ${qcColumn.value} | Type: ${qcColumn.type}`);
                } else {
                    console.log(`  ❌ QC Review Score column (lookup_mktvfsax) NOT FOUND`);
                }

                // Check for any numeric columns that might contain the score
                const numericCols = project.column_values.filter(col => {
                    const value = col.text;
                    return value && !isNaN(value) && parseInt(value) >= 50 && parseInt(value) <= 100;
                });

                if (numericCols.length > 0) {
                    console.log(`  📊 Numeric columns (50-100):`);
                    numericCols.forEach(col => {
                        console.log(`    ${col.id}: "${col.text}" (${col.type})`);
                    });
                } else {
                    console.log(`  ❌ No numeric columns with values 50-100 found`);
                }
                console.log('');
            } else {
                console.log(`❌ Project "${projectName}" not found in API results\n`);
            }
        });

        // Also check what the lookup column actually contains for all projects
        console.log('📊 LOOKUP COLUMN VALUES FOR ALL PROJECTS:');
        items.forEach(item => {
            const qcColumn = item.column_values.find(col => col.id === 'lookup_mktvfsax');
            const taskType = item.column_values.find(col => col.id === 'task_tag__1');
            const phase = item.column_values.find(col => col.id === 'phase__1');

            if (taskType?.text === 'New Build' && phase?.text === 'Completed') {
                console.log(`  ${item.name}:`);
                console.log(`    QC Score: "${qcColumn?.text || 'null'}" | Value: ${qcColumn?.value || 'null'}`);
            }
        });

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugQCScores();