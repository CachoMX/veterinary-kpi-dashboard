// Simple metrics test using basic Supabase queries
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function simpleMetricsTest() {
    try {
        console.log('📊 Simple metrics test with current data...\n');

        // 1. Count all completed projects
        const { data: allCompleted, error: allError } = await supabase
            .from('website_projects')
            .select('name, task_type, actual_completion_date, total_duration_hours, qc_review_score')
            .eq('current_phase', 'Completed')
            .order('actual_completion_date', { ascending: false });

        if (allError) {
            console.error('Error:', allError);
            return;
        }

        console.log(`🎯 TOTAL COMPLETED PROJECTS: ${allCompleted.length}`);

        // Count by task type
        const newBuilds = allCompleted.filter(p => p.task_type === 'New Build').length;
        const rebuilds = allCompleted.filter(p => p.task_type === 'Rebuild').length;

        console.log(`  - New Build: ${newBuilds}`);
        console.log(`  - Rebuild: ${rebuilds}`);

        // Check duration data
        const withDuration = allCompleted.filter(p => p.total_duration_hours && p.total_duration_hours > 0).length;
        console.log(`  - With Duration Data: ${withDuration}`);

        // Check QC data
        const withQC = allCompleted.filter(p => p.qc_review_score && p.qc_review_score > 0).length;
        console.log(`  - With QC Score Data: ${withQC}`);

        // Show completion dates by month
        console.log('\n📅 COMPLETION DATES BY MONTH:');
        const monthCounts = {};
        allCompleted.forEach(project => {
            if (project.actual_completion_date) {
                const month = project.actual_completion_date.substring(0, 7); // YYYY-MM
                monthCounts[month] = (monthCounts[month] || 0) + 1;
            }
        });

        Object.keys(monthCounts)
            .sort()
            .reverse()
            .forEach(month => {
                console.log(`  ${month}: ${monthCounts[month]} projects completed`);
            });

        // Chart readiness assessment
        console.log('\n📈 CHART READINESS:');
        if (withDuration > 0) {
            console.log(`✅ Duration Chart: Ready with ${withDuration} projects`);
        } else {
            console.log(`❌ Duration Chart: No duration data available`);
        }

        if (withQC > 0) {
            console.log(`✅ QC Score Chart: Ready with ${withQC} projects`);
        } else {
            console.log(`❌ QC Score Chart: No QC score data available`);
        }

        if (Object.keys(monthCounts).length > 1) {
            console.log(`✅ Monthly Trends: Ready with ${Object.keys(monthCounts).length} months of data`);
        } else {
            console.log(`⚠️  Monthly Trends: Limited to ${Object.keys(monthCounts).length} month(s)`);
        }

        // Sample projects for each month
        console.log('\n📋 SAMPLE PROJECTS BY MONTH:');
        Object.keys(monthCounts)
            .sort()
            .reverse()
            .slice(0, 3)
            .forEach(month => {
                const monthProjects = allCompleted.filter(p =>
                    p.actual_completion_date && p.actual_completion_date.startsWith(month)
                );
                console.log(`\n${month} (${monthProjects.length} projects):`);
                monthProjects.slice(0, 3).forEach(project => {
                    console.log(`  - ${project.name}`);
                });
                if (monthProjects.length > 3) {
                    console.log(`  ... and ${monthProjects.length - 3} more`);
                }
            });

    } catch (error) {
        console.error('❌ Simple metrics test failed:', error);
    }
}

simpleMetricsTest();