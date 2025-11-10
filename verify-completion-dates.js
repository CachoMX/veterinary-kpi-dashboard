// Verify that completion dates are now correct after the sync fix
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function verifyCompletionDates() {
    try {
        console.log('🔍 Verifying completion dates are now correct after sync fix...\n');

        const { data: projects, error } = await supabase
            .from('website_projects')
            .select('name, task_type, current_phase, actual_completion_date, expected_due_date')
            .eq('current_phase', 'Completed')
            .order('name');

        if (error) {
            console.error('Error fetching projects:', error);
            return;
        }

        console.log(`📊 Found ${projects.length} completed projects:\n`);

        projects.forEach(project => {
            console.log(`🎯 ${project.name} (${project.task_type})`);
            console.log(`   Expected Due: ${project.expected_due_date}`);
            console.log(`   Actual Completion: ${project.actual_completion_date}`);

            // Check if we still have the wrong 2025-09-16 date
            if (project.actual_completion_date === '2025-09-16') {
                console.log(`   ❌ STILL WRONG DATE! Should be from Monday.com`);
            } else if (project.actual_completion_date && project.actual_completion_date !== '2025-09-16') {
                console.log(`   ✅ Looks correct!`);
            } else {
                console.log(`   ⚠️  No completion date found`);
            }
            console.log('');
        });

        // Summary
        const wrongDates = projects.filter(p => p.actual_completion_date === '2025-09-16').length;
        const correctDates = projects.filter(p => p.actual_completion_date && p.actual_completion_date !== '2025-09-16').length;
        const noDates = projects.filter(p => !p.actual_completion_date).length;

        console.log('📈 COMPLETION DATE SUMMARY:');
        console.log(`   Total Projects: ${projects.length}`);
        console.log(`   Correct Dates: ${correctDates}`);
        console.log(`   Wrong Dates (2025-09-16): ${wrongDates}`);
        console.log(`   No Dates: ${noDates}`);

        if (wrongDates === 0 && correctDates > 0) {
            console.log('\n✅ SUCCESS: Completion dates are now fixed!');
        } else if (wrongDates > 0) {
            console.log('\n❌ ISSUE: Some projects still have wrong dates');
        } else {
            console.log('\n⚠️  WARNING: No completion dates found');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    }
}

verifyCompletionDates();