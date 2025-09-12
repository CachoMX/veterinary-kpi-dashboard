const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
const DEV_BOARD_ID = '7034166433';

module.exports = async (req, res) => {
    try {
        console.log('🧪 Starting MINIMAL sync test...');

        // Get just 3 projects to test
        const query = `
            query {
                boards(ids: [${DEV_BOARD_ID}]) {
                    items_page(limit: 3) {
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

        const items = data.data.boards[0]?.items_page?.items || [];
        console.log(`📋 Found ${items.length} projects`);

        let processedProjects = [];

        // Process each project with minimal data extraction
        for (const project of items) {
            try {
                console.log(`Processing: ${project.name}`);

                // Simple data extraction
                const processedProject = {
                    id: project.id,
                    name: project.name,
                    task_type: 'New Build', // default for testing
                    created_at: project.created_at,
                    updated_at: project.updated_at,
                    
                    // Extract the new columns we need
                    total_duration_hours: extractColumnValue(project.column_values, 'lookup_mktvxvt7'),
                    qc_review_score: extractColumnValue(project.column_values, 'lookup_mktvfsax'),
                    
                    // Basic required fields
                    current_phase: extractColumnValue(project.column_values, 'phase__1'),
                    current_dev_status: extractColumnValue(project.column_values, 'status'),
                    current_qc_status: extractColumnValue(project.column_values, 'status_15__1'),
                    expected_due_date: extractColumnValue(project.column_values, 'date__1'),
                    
                    // Set defaults for required fields
                    days_overdue: 0,
                    is_overdue: false,
                    total_expected_duration: 0,
                    total_actual_duration: 0,
                    developers: [],
                    qc_team: [],
                    requestors: [],
                    current_owner: 'Unknown',
                    current_department: 'Dev'
                };

                processedProjects.push(processedProject);
                console.log(`✅ Processed: ${project.name}`);
                console.log(`   Duration: ${processedProject.total_duration_hours}`);
                console.log(`   QC Score: ${processedProject.qc_review_score}`);

            } catch (projectError) {
                console.error(`❌ Error processing ${project.name}:`, projectError);
            }
        }

        // Clear existing data (be careful!)
        console.log('🗑️ Clearing existing data...');
        await supabase
            .from('website_projects')
            .delete()
            .neq('id', '0'); // Delete all

        // Insert new data
        console.log(`💾 Inserting ${processedProjects.length} projects...`);
        for (const project of processedProjects) {
            const { error: insertError } = await supabase
                .from('website_projects')
                .insert(project);

            if (insertError) {
                console.error('Insert error for', project.name, ':', insertError);
            } else {
                console.log('✅ Inserted:', project.name);
            }
        }

        console.log('🎉 Minimal sync completed successfully!');

        res.status(200).json({
            success: true,
            message: `Minimal sync completed: ${processedProjects.length} projects processed`,
            projects: processedProjects.map(p => ({
                name: p.name,
                total_duration_hours: p.total_duration_hours,
                qc_review_score: p.qc_review_score
            }))
        });

    } catch (error) {
        console.error('Minimal sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.toString()
        });
    }
};

function extractColumnValue(columnValues, columnId) {
    const column = columnValues.find(col => col.id === columnId);
    if (!column) return null;
    
    const textValue = column.text;
    const rawValue = column.value;
    
    // For numeric columns, try to parse as number
    if (columnId.startsWith('lookup_') && textValue) {
        const parsed = parseFloat(textValue);
        return isNaN(parsed) ? null : parsed;
    }
    
    return textValue || rawValue || null;
}