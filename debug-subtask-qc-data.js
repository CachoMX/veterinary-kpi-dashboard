// Debug what QC data we have in subitems for a specific project
require('dotenv').config({ path: '.env.local' });

async function debugSubtaskQCData() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Debugging subtask QC data for Just 4 Pets (should have QC score 83)...\n');

        // Find "Just 4 Pets Wellness Center - Website Build" project
        let cursor = null;
        let found = false;

        while (!found) {
            const query = `
                query {
                    boards(ids: [${DEV_BOARD_ID}]) {
                        items_page(limit: 100${cursor ? `, cursor: "${cursor}"` : ''}) {
                            cursor
                            items {
                                id
                                name
                                column_values {
                                    id
                                    text
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
            const items = data.data.boards[0].items_page.items || [];

            // Look for Just 4 Pets project
            const project = items.find(item =>
                item.name.toLowerCase().includes('just 4 pets')
            );

            if (project) {
                console.log(`📌 Found project: ${project.name}`);
                console.log(`   ID: ${project.id}\n`);

                // Get subitems for this project
                const subtasksQuery = `
                    query {
                        items(ids: [${project.id}]) {
                            subitems {
                                id
                                name
                                state
                                created_at
                                updated_at
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

                const subtasksResponse = await fetch('https://api.monday.com/v2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': MONDAY_TOKEN
                    },
                    body: JSON.stringify({ query: subtasksQuery })
                });

                const subtasksData = await subtasksResponse.json();
                const subtasks = subtasksData.data.items[0]?.subitems || [];

                console.log(`🔍 Found ${subtasks.length} subitems:\n`);

                subtasks.forEach((subtask, i) => {
                    console.log(`${i + 1}. ${subtask.name}`);

                    // Look for QC-related columns or numeric values
                    const qcRelated = subtask.name.toLowerCase().includes('qc') ||
                                    subtask.name.toLowerCase().includes('review') ||
                                    subtask.name.toLowerCase().includes('score');

                    if (qcRelated) {
                        console.log(`   🎯 QC-related subitem!`);
                    }

                    // Check all column values for numeric data
                    const numericValues = [];
                    subtask.column_values.forEach(col => {
                        if (col.text && !isNaN(col.text)) {
                            const numValue = parseFloat(col.text);
                            if (numValue >= 1 && numValue <= 100) {
                                numericValues.push({ id: col.id, value: numValue, type: col.type });
                            }
                        }
                    });

                    if (numericValues.length > 0) {
                        console.log(`   📊 Numeric values (1-100):`);
                        numericValues.forEach(nv => {
                            console.log(`     Column ${nv.id}: ${nv.value} (${nv.type})`);
                        });
                    } else {
                        console.log(`   ❌ No numeric values found`);
                    }

                    console.log('');
                });

                found = true;
                break;
            }

            cursor = data.data.boards[0].items_page.cursor;
            if (!cursor) break;
        }

        if (!found) {
            console.log('❌ Just 4 Pets project not found');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugSubtaskQCData();