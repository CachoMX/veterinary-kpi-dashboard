// Test script to check if metrics data is ready
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testMetrics() {
    try {
        console.log('🔍 Testing completed projects metrics data...\n');

        // 1. Check completed projects count
        const { data: completedCount, error: countError } = await supabase
            .from('website_projects')
            .select('*', { count: 'exact', head: true })
            .eq('current_phase', 'Completed');

        if (countError) {
            console.error('Error counting completed projects:', countError);
            return;
        }

        console.log(`✅ Found ${completedCount} completed projects in database`);

        // 2. Check projects with metrics data
        const { data: projectsWithMetrics, error: metricsError } = await supabase
            .from('website_projects')
            .select('name, task_type, actual_completion_date, total_duration_hours, qc_review_score, current_phase')
            .eq('current_phase', 'Completed')
            .order('actual_completion_date', { ascending: false });

        if (metricsError) {
            console.error('Error fetching projects with metrics:', metricsError);
            return;
        }

        console.log(`\n📊 Projects with metrics data (${projectsWithMetrics.length}):`);
        projectsWithMetrics.forEach(project => {
            console.log(`  • ${project.name}`);
            console.log(`    Type: ${project.task_type}`);
            console.log(`    Completion: ${project.actual_completion_date}`);
            console.log(`    Duration: ${project.total_duration_hours}h`);
            console.log(`    QC Score: ${project.qc_review_score}`);
            console.log('');
        });

        // 3. Test AVG DURATION BY MONTH query
        console.log('📈 Testing AVG DURATION BY MONTH metric...');
        const durationQuery = `
            WITH completed_projects AS (
                SELECT
                    name,
                    task_type,
                    current_phase,
                    current_dev_status,
                    actual_completion_date,
                    total_duration_hours,
                    COALESCE(actual_completion_date::date, updated_at::date) as completion_date
                FROM website_projects
                WHERE
                    (current_phase = 'Completed' OR current_phase = 'Complete') AND
                    total_duration_hours IS NOT NULL AND
                    total_duration_hours > 0
            )
            SELECT
                TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
                COUNT(*) as completed_projects_count,
                ROUND(AVG(total_duration_hours), 2) as avg_duration_hours,
                MIN(total_duration_hours) as min_duration,
                MAX(total_duration_hours) as max_duration,
                ARRAY_AGG(name ORDER BY completion_date) as project_names
            FROM completed_projects
            GROUP BY DATE_TRUNC('month', completion_date)
            ORDER BY month DESC;
        `;

        const { data: durationResults, error: durationError } = await supabase
            .rpc('exec_sql', { query: durationQuery });

        if (durationError) {
            console.log('⚠️  Duration query failed (need to run it manually in Supabase)');
            console.log('Error:', durationError.message);
        } else {
            console.log('✅ Duration metric results:', durationResults);
        }

        // 4. Test AVG QC SCORE BY MONTH query
        console.log('\n📈 Testing AVG QC SCORE BY MONTH metric...');
        const qcQuery = `
            WITH completed_new_builds AS (
                SELECT
                    name,
                    task_type,
                    current_phase,
                    current_dev_status,
                    actual_completion_date,
                    qc_review_score,
                    COALESCE(actual_completion_date::date, updated_at::date) as completion_date
                FROM website_projects
                WHERE
                    task_type = 'New Build' AND
                    (current_phase = 'Completed' OR current_phase = 'Complete') AND
                    qc_review_score IS NOT NULL AND
                    qc_review_score > 0
            )
            SELECT
                TO_CHAR(DATE_TRUNC('month', completion_date), 'YYYY-MM') as month,
                COUNT(*) as completed_new_builds_count,
                ROUND(AVG(qc_review_score), 2) as avg_qc_score,
                MIN(qc_review_score) as min_qc_score,
                MAX(qc_review_score) as max_qc_score,
                ARRAY_AGG(name ORDER BY completion_date) as project_names
            FROM completed_new_builds
            GROUP BY DATE_TRUNC('month', completion_date)
            ORDER BY month DESC;
        `;

        const { data: qcResults, error: qcError } = await supabase
            .rpc('exec_sql', { query: qcQuery });

        if (qcError) {
            console.log('⚠️  QC Score query failed (need to run it manually in Supabase)');
            console.log('Error:', qcError.message);
        } else {
            console.log('✅ QC Score metric results:', qcResults);
        }

        // 5. Summary for charts
        const projectsWithDuration = projectsWithMetrics.filter(p => p.total_duration_hours && p.total_duration_hours > 0);
        const newBuildsWithQC = projectsWithMetrics.filter(p => p.task_type === 'New Build' && p.qc_review_score && p.qc_review_score > 0);

        console.log('\n🎯 METRICS READINESS SUMMARY:');
        console.log(`   📊 Projects with Duration Data: ${projectsWithDuration.length}`);
        console.log(`   📈 New Builds with QC Scores: ${newBuildsWithQC.length}`);
        console.log(`   📅 Date Range: ${projectsWithMetrics[projectsWithMetrics.length-1]?.actual_completion_date} to ${projectsWithMetrics[0]?.actual_completion_date}`);

        if (projectsWithDuration.length > 0) {
            console.log('\n✅ AVG DURATION BY MONTH chart will work!');
        } else {
            console.log('\n❌ AVG DURATION BY MONTH chart needs duration data');
        }

        if (newBuildsWithQC.length > 0) {
            console.log('✅ AVG QC SCORE BY MONTH chart will work!');
        } else {
            console.log('❌ AVG QC SCORE BY MONTH chart needs QC score data');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testMetrics();