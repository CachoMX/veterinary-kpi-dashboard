// Debug script to find projects with older completion dates (like Aug 21, 2024)
require('dotenv').config({ path: '.env.local' });

async function debugOldProjects() {
    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    try {
        console.log('🔍 Looking for projects with older completion dates (2024)...\n');

        // Get more projects to find ones with older dates
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 200) {
                        items {
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

        const items = data.data.boards[0].items_page.items;
        console.log(`📋 Found ${items.length} total items\n`);

        // Look for projects that might have 2024 dates
        const projectsWithOldDates = [];

        items.forEach(item => {
            const hasOldDate = item.column_values.some(col =>
                col.text && (
                    col.text.includes('2024') ||
                    col.text.includes('Aug') ||
                    col.text.includes('August')
                )
            );

            if (hasOldDate) {
                projectsWithOldDates.push(item);
            }
        });

        console.log(`🎯 Found ${projectsWithOldDates.length} projects with 2024/Aug dates:\n`);

        projectsWithOldDates.slice(0, 5).forEach(project => {
            console.log(`📌 ${project.name}`);
            console.log(`   ID: ${project.id}`);

            // Show all date-related columns
            project.column_values.forEach(col => {
                if (col.text && (
                    col.text.includes('2024') ||
                    col.text.includes('Aug') ||
                    col.text.includes('date') ||
                    col.id === 'date__1' ||
                    col.id === 'date8__1'
                )) {
                    console.log(`     ${col.id}: "${col.text}"`);
                }
            });
            console.log('');
        });

        // Look specifically for "Vet 2 The Starz"
        const vetProject = items.find(item =>
            item.name.toLowerCase().includes('vet 2 the starz') ||
            item.name.toLowerCase().includes('vetcelerator') ||
            item.name.toLowerCase().includes('georgetown')
        );

        if (vetProject) {
            console.log('🎯 Found Vet 2 The Starz project:');
            console.log(`   Name: ${vetProject.name}`);
            console.log(`   ID: ${vetProject.id}`);

            vetProject.column_values.forEach(col => {
                if (col.id === 'date__1' || col.id === 'date8__1') {
                    console.log(`     ${col.id}: "${col.text}"`);
                }
            });
        } else {
            console.log('❌ Could not find "Vet 2 The Starz" project');
        }

    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugOldProjects();