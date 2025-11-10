const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or hardcode them temporarily
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubitems() {
    try {
        console.log('🔍 Searching for Orchard Veterinary Hospital project...\n');

        // First, let's see all projects to find the exact name
        const { data: allProjects, error: allError } = await supabase
            .from('website_projects')
            .select('id, name, task_type, created_at')
            .order('created_at', { ascending: false });

        if (allError) {
            console.error('❌ Error fetching projects:', allError);
            return;
        }

        console.log(`📊 Found ${allProjects.length} total projects:`);
        allProjects.forEach((project, index) => {
            console.log(`  ${index + 1}. ${project.name} (${project.task_type}) - ID: ${project.id}`);
        });

        // Find Orchard project
        const orchardProject = allProjects.find(p =>
            p.name.toLowerCase().includes('orchard') &&
            p.name.toLowerCase().includes('veterinary')
        );

        if (!orchardProject) {
            console.log('\n❌ Orchard Veterinary Hospital project not found in database');
            console.log('🔍 Try running the sync first: /api/sync-website-projects');
            return;
        }

        console.log(`\n✅ Found project: ${orchardProject.name}`);
        console.log(`   ID: ${orchardProject.id}`);
        console.log(`   Type: ${orchardProject.task_type}`);

        // Get subitems for this project
        const { data: subtasks, error: subtaskError } = await supabase
            .from('website_subtasks')
            .select('*')
            .eq('project_id', orchardProject.id)
            .order('created_at', { ascending: true });

        if (subtaskError) {
            console.error('❌ Error fetching subtasks:', subtaskError);
            return;
        }

        console.log(`\n📋 SUBITEMS FOR ${orchardProject.name}:`);
        console.log(`   Found ${subtasks.length} subitems\n`);

        if (subtasks.length === 0) {
            console.log('⚠️  No subitems found. This could mean:');
            console.log('   1. The project has no subitems in Monday.com');
            console.log('   2. The sync hasn\'t been run yet');
            console.log('   3. The subitems extraction is not working');
            console.log('\n🔧 Try running: curl -X POST "https://your-vercel-app.vercel.app/api/sync-website-projects"');
        } else {
            subtasks.forEach((subtask, index) => {
                console.log(`   ${index + 1}. ${subtask.name}`);
                console.log(`      ID: ${subtask.id}`);
                console.log(`      Owner: ${subtask.owner || 'Unassigned'}`);
                console.log(`      Department: ${subtask.department || 'Unknown'}`);
                console.log(`      Status: ${subtask.status || 'No status'}`);
                console.log(`      Phase: ${subtask.phase || 'No phase'}`);
                console.log(`      Duration: ${subtask.expected_duration || 'N/A'}h expected, ${subtask.actual_duration || 'N/A'}h actual`);
                console.log(`      Timeline: ${subtask.timeline_start || 'N/A'} to ${subtask.timeline_end || 'N/A'}`);
                console.log('');
            });
        }

        // Check comments
        const { data: comments, error: commentError } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', orchardProject.id)
            .order('date_posted', { ascending: true });

        if (!commentError && comments) {
            console.log(`💬 COMMENTS: Found ${comments.length} comments for this project`);
            if (comments.length > 0) {
                console.log('   Latest comments:');
                comments.slice(-3).forEach(comment => {
                    console.log(`   - ${comment.author}: "${comment.comment_text.substring(0, 100)}${comment.comment_text.length > 100 ? '...' : ''}"`);
                });
            }
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkSubitems();