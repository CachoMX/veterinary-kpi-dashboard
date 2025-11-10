// Check how many completed projects we actually have in the database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkProjectCount() {
    try {
        console.log('🔍 Checking completed projects count in database...\n');

        // Count all completed projects
        const { data: allCompleted, error: allError } = await supabase
            .from('website_projects')
            .select('name, task_type, current_phase, qc_review_score')
            .eq('current_phase', 'Completed')
            .order('name');

        if (allError) {
            console.error('Error fetching all completed projects:', allError);
            return;
        }

        // Count only New Build completed projects
        const { data: newBuildCompleted, error: newBuildError } = await supabase
            .from('website_projects')
            .select('name, task_type, current_phase, qc_review_score')
            .eq('current_phase', 'Completed')
            .eq('task_type', 'New Build')
            .order('name');

        if (newBuildError) {
            console.error('Error fetching New Build completed projects:', newBuildError);
            return;
        }

        console.log('📊 DATABASE PROJECT COUNTS:');
        console.log(`  All Completed Projects: ${allCompleted.length}`);
        console.log(`  Completed New Build Projects: ${newBuildCompleted.length}`);
        console.log(`  Expected from CSV: 53`);

        console.log('\n🎯 COMPLETED NEW BUILD PROJECTS:');
        newBuildCompleted.forEach((project, i) => {
            console.log(`  ${i + 1}. ${project.name} (QC Score: ${project.qc_review_score || 'null'})`);
        });

        // Count projects with QC scores
        const projectsWithQC = newBuildCompleted.filter(p => p.qc_review_score && p.qc_review_score > 0).length;
        console.log(`\n⭐ Projects with QC Review Score: ${projectsWithQC}/${newBuildCompleted.length}`);

        if (newBuildCompleted.length >= 50) {
            console.log('\n✅ SUCCESS: We have most/all of the expected 53 projects!');
        } else if (newBuildCompleted.length >= 20) {
            console.log('\n🔄 PROGRESS: We have a good number of projects, might need more sync time');
        } else {
            console.log('\n❌ ISSUE: Still missing many projects from the expected 53');
        }

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

checkProjectCount();