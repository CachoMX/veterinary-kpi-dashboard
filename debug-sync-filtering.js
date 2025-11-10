// Debug the sync filtering to see why we're only getting 10 instead of 53 projects
require('dotenv').config({ path: '.env.local' });

async function debugSyncFiltering() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Debugging sync filtering to find why we only get 10/53 projects...\n');

        let allProjects = [];
        let cursor = null;
        let pageCount = 0;

        // Replicate the sync logic exactly
        while (pageCount < 10) {
            pageCount++;
            console.log(`Fetching page ${pageCount}...`);

            const query = `
                query {
                    boards(ids: [${DEV_BOARD_ID}]) {
                        items_page(limit: 100${cursor ? `, cursor: "${cursor}"` : ''}) {
                            cursor
                            items {
                                id
                                name
                                state
                                created_at
                                updated_at
                                column_values {
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
                throw new Error('Monday.com API error: ' + JSON.stringify(data.errors));
            }

            const items = data.data.boards[0].items_page.items || [];
            if (items.length === 0) break;

            console.log(`  📄 Page ${pageCount}: ${items.length} items`);

            // Apply the same filtering as sync
            const completedWebsiteProjects = items.filter(item => {
                const taskType = getColumnText(item.column_values, 'task_tag__1');
                const phase = getColumnText(item.column_values, 'phase__1');

                const isNewBuild = taskType === 'New Build';
                const isCompleted = phase === 'Completed';

                // Debug each project
                if (isCompleted || taskType === 'New Build') {
                    console.log(`    ${item.name}: Phase="${phase}", TaskType="${taskType}", Match=${isNewBuild && isCompleted}`);
                }

                return isNewBuild && isCompleted;
            });

            console.log(`  ✅ Found ${completedWebsiteProjects.length} matching projects on this page`);
            allProjects = allProjects.concat(completedWebsiteProjects);
            cursor = data.data.boards[0].items_page.cursor;

            if (!cursor) {
                console.log(`  📄 No more pages (cursor is null)`);
                break;
            }
        }

        console.log(`\n📊 FINAL RESULTS:`);
        console.log(`  Total matching projects found: ${allProjects.length}`);
        console.log(`  Expected from CSV: 53`);
        console.log(`  Pages processed: ${pageCount}`);

        // Show first few projects
        console.log(`\n🎯 First 10 matching projects:`);
        allProjects.slice(0, 10).forEach((project, i) => {
            const taskType = getColumnText(project.column_values, 'task_tag__1');
            const phase = getColumnText(project.column_values, 'phase__1');
            console.log(`  ${i + 1}. ${project.name} (${taskType}, ${phase})`);
        });

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

// Helper function to get column text
function getColumnText(columnValues, columnId) {
    const column = columnValues.find(col => col.id === columnId);
    return column ? column.text || '' : '';
}

debugSyncFiltering();