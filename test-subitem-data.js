// Test what subitem data we have for completed projects
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testSubitemData() {
    try {
        console.log('🔍 Testing subitem data for completed projects...\n');

        // 1. Check what subitem data we have
        const { data: subitemData, error: subitemError } = await supabase
            .from('website_projects')
            .select(`
                name,
                task_type,
                current_phase,
                actual_completion_date,
                website_subtasks (
                    name,
                    actual_duration,
                    expected_duration,
                    completion_date,
                    status
                )
            `)
            .eq('current_phase', 'Completed')
            .order('name');

        if (subitemError) {
            console.error('Error fetching subitem data:', subitemError);
            return;
        }

        console.log(`📊 Found ${subitemData.length} completed projects with subitems:\n`);

        subitemData.forEach(project => {
            console.log(`🎯 ${project.name} (${project.task_type})`);
            console.log(`   Completion: ${project.actual_completion_date}`);
            console.log(`   Subitems: ${project.website_subtasks.length}`);

            if (project.website_subtasks.length > 0) {
                project.website_subtasks.forEach(subitem => {
                    console.log(`     • ${subitem.name}`);
                    console.log(`       Actual Duration: ${subitem.actual_duration}h`);
                    console.log(`       Expected Duration: ${subitem.expected_duration}h`);
                    console.log(`       Status: ${subitem.status}`);
                });
            } else {
                console.log('     ❌ No subitems found');
            }
            console.log('');
        });

        // 2. Test duration calculation
        console.log('📈 DURATION METRIC TEST:');
        let projectsWithDuration = 0;
        let totalProjects = 0;

        subitemData.forEach(project => {
            totalProjects++;
            const totalDuration = project.website_subtasks.reduce((sum, subitem) => {
                return sum + (subitem.actual_duration || subitem.expected_duration || 0);
            }, 0);

            if (totalDuration > 0) {
                projectsWithDuration++;
                console.log(`  ✅ ${project.name}: ${totalDuration}h`);
            } else {
                console.log(`  ❌ ${project.name}: 0h (no duration data)`);
            }
        });

        console.log(`\n📊 Duration Summary: ${projectsWithDuration}/${totalProjects} projects have duration data`);

        // 3. Test QC score detection
        console.log('\n⭐ QC SCORE TEST:');
        let projectsWithQC = 0;

        subitemData.forEach(project => {
            const qcSubitems = project.website_subtasks.filter(subitem =>
                subitem.name && (
                    subitem.name.toLowerCase().includes('qc') ||
                    subitem.name.toLowerCase().includes('review') ||
                    subitem.name.toLowerCase().includes('quality')
                )
            );

            if (qcSubitems.length > 0) {
                projectsWithQC++;
                console.log(`  ✅ ${project.name}: Found QC subitems`);
                qcSubitems.forEach(qc => {
                    console.log(`     • ${qc.name} (Duration: ${qc.actual_duration || qc.expected_duration || 0}h)`);
                });
            } else {
                console.log(`  ❌ ${project.name}: No QC subitems found`);
            }
        });

        console.log(`\n⭐ QC Summary: ${projectsWithQC}/${totalProjects} projects have QC subitems`);

        // 4. Final assessment
        console.log('\n🎯 CHART READINESS:');
        if (projectsWithDuration > 0) {
            console.log('✅ AVG DURATION BY MONTH chart will work!');
        } else {
            console.log('❌ AVG DURATION BY MONTH chart needs duration data in subitems');
        }

        if (projectsWithQC > 0) {
            console.log('✅ AVG QC SCORE BY MONTH chart will work!');
        } else {
            console.log('❌ AVG QC SCORE BY MONTH chart needs QC score data in subitems');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testSubitemData();