// Check if active projects have duration/QC data that completed ones lack
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkActiveProjectData() {
    try {
        console.log('🔍 Checking if ACTIVE projects have better duration/QC data...\n');

        // Check active projects data
        const { data: activeData, error: activeError } = await supabase
            .from('website_projects')
            .select(`
                name,
                task_type,
                current_phase,
                current_dev_status,
                total_duration_hours,
                qc_review_score,
                website_subtasks (
                    name,
                    actual_duration,
                    expected_duration,
                    status
                )
            `)
            .neq('current_phase', 'Completed')
            .order('name');

        if (activeError) {
            console.error('Error fetching active project data:', activeError);
            return;
        }

        console.log(`📊 Found ${activeData.length} ACTIVE projects:\n`);

        let projectsWithDuration = 0;
        let projectsWithQCData = 0;
        let projectsWithLookupDuration = 0;
        let projectsWithLookupQC = 0;

        activeData.forEach(project => {
            console.log(`🎯 ${project.name} (${project.task_type})`);
            console.log(`   Phase: ${project.current_phase} | Status: ${project.current_dev_status}`);
            console.log(`   Lookup Duration: ${project.total_duration_hours}h`);
            console.log(`   Lookup QC Score: ${project.qc_review_score}`);
            console.log(`   Subitems: ${project.website_subtasks.length}`);

            // Check lookup columns
            if (project.total_duration_hours && project.total_duration_hours > 0) {
                projectsWithLookupDuration++;
            }
            if (project.qc_review_score && project.qc_review_score > 0) {
                projectsWithLookupQC++;
            }

            // Check subitem data
            const totalDuration = project.website_subtasks.reduce((sum, subitem) => {
                return sum + (subitem.actual_duration || subitem.expected_duration || 0);
            }, 0);

            const qcSubitems = project.website_subtasks.filter(subitem =>
                subitem.name && (
                    subitem.name.toLowerCase().includes('qc') ||
                    subitem.name.toLowerCase().includes('review') ||
                    subitem.name.toLowerCase().includes('quality')
                )
            );

            if (totalDuration > 0) {
                projectsWithDuration++;
                console.log(`   ✅ Subitem Duration: ${totalDuration}h`);
            } else {
                console.log(`   ❌ Subitem Duration: 0h`);
            }

            if (qcSubitems.length > 0) {
                projectsWithQCData++;
                console.log(`   ✅ QC Subitems: ${qcSubitems.length}`);
            } else {
                console.log(`   ❌ QC Subitems: 0`);
            }
            console.log('');
        });

        console.log('📈 ACTIVE PROJECTS SUMMARY:');
        console.log(`   Total Projects: ${activeData.length}`);
        console.log(`   With Lookup Duration: ${projectsWithLookupDuration}`);
        console.log(`   With Lookup QC Score: ${projectsWithLookupQC}`);
        console.log(`   With Subitem Duration: ${projectsWithDuration}`);
        console.log(`   With QC Subitems: ${projectsWithQCData}`);

        console.log('\n🎯 RECOMMENDATION:');
        if (projectsWithLookupDuration > 0 || projectsWithDuration > 0) {
            console.log('✅ Use ACTIVE projects for duration metrics (they have data)');
        } else {
            console.log('❌ Even active projects lack duration data');
        }

        if (projectsWithLookupQC > 0 || projectsWithQCData > 0) {
            console.log('✅ Use ACTIVE projects for QC metrics (they have data)');
        } else {
            console.log('❌ Even active projects lack QC data');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

checkActiveProjectData();