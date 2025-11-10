// Test the current metrics with our 22 completed projects
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testCurrentMetrics() {
    try {
        console.log('📊 Testing current metrics with 22 completed projects...\n');

        // 1. Current Status Check
        console.log('🔍 CURRENT STATUS:');
        const { data: statusData, error: statusError } = await supabase.rpc('exec_sql', {
            sql: `
                SELECT
                    'Current Status' as section,
                    COUNT(*) as total_projects,
                    COUNT(CASE WHEN current_phase = 'Completed' THEN 1 END) as completed_count,
                    COUNT(CASE WHEN current_dev_status = 'Launched' THEN 1 END) as launched_count,
                    COUNT(CASE WHEN total_duration_hours IS NOT NULL AND total_duration_hours > 0 THEN 1 END) as with_duration,
                    COUNT(CASE WHEN qc_review_score IS NOT NULL AND qc_review_score > 0 THEN 1 END) as with_qc_score
                FROM website_projects;
            `
        });

        if (statusError) {
            console.error('Status check error:', statusError);
        } else {
            console.log(statusData);
        }

        // 2. AVG DURATION FOR COMPLETED WEBSITE PROJECTS BY MONTH
        console.log('\n📈 AVG DURATION BY MONTH (with duration data):');
        const { data: durationData, error: durationError } = await supabase.rpc('exec_sql', {
            sql: `
                WITH completed_projects AS (
                    SELECT
                        name,
                        task_type,
                        current_phase,
                        current_dev_status,
                        actual_completion_date,
                        total_duration_hours,
                        qc_review_score,
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
            `
        });

        if (durationError) {
            console.error('Duration query error:', durationError);
        } else if (durationData && durationData.length > 0) {
            durationData.forEach(row => {
                console.log(`  ${row.month}: ${row.completed_projects_count} projects, Avg: ${row.avg_duration_hours}h (${row.min_duration}-${row.max_duration}h)`);
                console.log(`    Projects: ${row.project_names.slice(0, 3).join(', ')}${row.project_names.length > 3 ? '...' : ''}`);
            });
        } else {
            console.log('  ❌ No projects with duration data found');
        }

        // 3. QC REVIEW SCORE BY MONTH
        console.log('\n⭐ QC REVIEW SCORE BY MONTH (with QC data):');
        const { data: qcData, error: qcError } = await supabase.rpc('exec_sql', {
            sql: `
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
            `
        });

        if (qcError) {
            console.error('QC query error:', qcError);
        } else if (qcData && qcData.length > 0) {
            qcData.forEach(row => {
                console.log(`  ${row.month}: ${row.completed_new_builds_count} projects, Avg QC: ${row.avg_qc_score} (${row.min_qc_score}-${row.max_qc_score})`);
                console.log(`    Projects: ${row.project_names.join(', ')}`);
            });
        } else {
            console.log('  ❌ No projects with QC score data found');
        }

        // 4. Show all completed projects for reference
        console.log('\n📋 ALL COMPLETED PROJECTS:');
        const { data: allCompleted, error: allError } = await supabase
            .from('website_projects')
            .select('name, task_type, actual_completion_date, total_duration_hours, qc_review_score')
            .eq('current_phase', 'Completed')
            .order('actual_completion_date', { ascending: false });

        if (allError) {
            console.error('All completed error:', allError);
        } else {
            allCompleted.slice(0, 10).forEach(project => {
                console.log(`  ${project.name} (${project.task_type})`);
                console.log(`    Completed: ${project.actual_completion_date}, Duration: ${project.total_duration_hours}h, QC: ${project.qc_review_score}`);
            });
            if (allCompleted.length > 10) {
                console.log(`  ... and ${allCompleted.length - 10} more projects`);
            }
        }

    } catch (error) {
        console.error('❌ Metrics test failed:', error);
    }
}

testCurrentMetrics();