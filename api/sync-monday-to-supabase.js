const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'YOUR_SUPABASE_URL', // Get from Supabase dashboard > Settings > API
  'YOUR_SUPABASE_ANON_KEY' // Get from same location
);

module.exports = async (req, res) => {
    // Protect endpoint with a secret key
    const { authorization } = req.headers;
    if (authorization !== `Bearer ${process.env.SYNC_SECRET_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const MONDAY_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUxOTA2NDk1OCwiYWFpIjoxMSwidWlkIjozNzIyNDA3OCwiaWFkIjoiMjAyNS0wNS0yOFQxODoyNDo0My4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NzEwNzc1MywicmduIjoidXNlMSJ9.RzznXXwJHT-O8LDwRReVfYPdw9pBHhpPDpYHSapsgoM';
    const DEV_BOARD_ID = '7034166433';

    // Log sync start
    const { data: syncLog, error: logError } = await supabase
        .from('sync_logs')
        .insert({
            sync_type: 'full_sync',
            status: 'in_progress'
        })
        .select()
        .single();

    if (logError) {
        console.error('Failed to create sync log:', logError);
        return res.status(500).json({ error: 'Failed to start sync' });
    }

    try {
        console.log('Starting Monday.com to Supabase sync...');
        
        let allTasks = [];
        let cursor = null;
        let pageCount = 0;
        
        // Fetch all tasks from Monday.com
        while (pageCount < 35) {
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
            
            allTasks = allTasks.concat(items);
            cursor = data.data.boards[0].items_page.cursor;
            
            if (!cursor) break;
            
            // Small delay to respect rate limits
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        console.log(`Fetched ${allTasks.length} tasks from Monday.com`);

        // Transform tasks for Supabase
        const transformedTasks = allTasks.map(task => {
            const columnValues = {};
            task.column_values.forEach(col => {
                columnValues[col.id] = {
                    text: col.text,
                    value: col.value
                };
            });

            // Parse specific columns
            const getColumnText = (columnId) => columnValues[columnId]?.text || '';
            const getPersonArray = (columnId) => {
                const text = getColumnText(columnId);
                return text ? text.split(', ').filter(Boolean) : [];
            };

            return {
                id: task.id,
                board_id: DEV_BOARD_ID,
                name: task.name,
                state: task.state,
                created_at: task.created_at,
                updated_at: task.updated_at,
                
                // People
                developers: getPersonArray('person'),
                qc_team: getPersonArray('people__1'),
                requestors: getPersonArray('people6__1'),
                
                // Status
                phase: getColumnText('phase__1'),
                dev_status: getColumnText('status'),
                qc_status: getColumnText('status_15__1'),
                priority: getColumnText('priority__1'),
                task_size: getColumnText('color_mks0fz3z'),
                
                // Classification
                task_type: getColumnText('task_tag__1'),
                request_group: getColumnText('request_type__1'),
                client_account: getColumnText('board_relation_mkngp1fk'),
                
                // Dates
                submission_date: parseDate(getColumnText('creation_log__1')),
                expected_due_date: getColumnText('date__1') || null,
                completion_date: getColumnText('date8__1') || null,
                
                // Store all column values
                column_values: columnValues,
                last_synced_at: new Date().toISOString()
            };
        });

        // Batch insert to Supabase (in chunks of 500)
        const chunkSize = 500;
        let totalInserted = 0;
        
        for (let i = 0; i < transformedTasks.length; i += chunkSize) {
            const chunk = transformedTasks.slice(i, i + chunkSize);
            
            const { error: insertError } = await supabase
                .from('monday_tasks')
                .upsert(chunk, { onConflict: 'id' });
            
            if (insertError) {
                throw new Error(`Failed to insert batch: ${insertError.message}`);
            }
            
            totalInserted += chunk.length;
            console.log(`Inserted ${totalInserted}/${transformedTasks.length} tasks`);
        }

        // Update sync log
        await supabase
            .from('sync_logs')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                tasks_synced: transformedTasks.length
            })
            .eq('id', syncLog.id);

        res.status(200).json({
            success: true,
            message: `Successfully synced ${transformedTasks.length} tasks to Supabase`,
            syncLogId: syncLog.id
        });

    } catch (error) {
        console.error('Sync error:', error);
        
        // Update sync log with error
        await supabase
            .from('sync_logs')
            .update({
                status: 'failed',
                completed_at: new Date().toISOString(),
                error_message: error.message
            })
            .eq('id', syncLog.id);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Helper function to parse dates
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle creation_log format: "2025-07-21 20:28:00 UTC"
    if (dateStr.includes(' UTC')) {
        return dateStr.replace(' UTC', '').replace(' ', 'T') + 'Z';
    }
    
    return null;
}