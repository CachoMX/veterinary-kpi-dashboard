// Add sample data for chart demonstration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function addSampleData() {
    try {
        console.log('📊 Adding sample data for chart demonstration...\n');

        // Add data to a few more projects with scaled QC values (max 9.99)
        const updates = [
            { name: 'Happy Valley Pet Hospital', duration: 120, qc: 8.9 },
            { name: 'Vet 2 The Starz', duration: 85, qc: 9.2 },
            { name: 'My Village Pet Clinic', duration: 150, qc: 8.6 },
            { name: 'Northern Pike Veterinary Hospital', duration: 95, qc: 7.1 },
            { name: 'Green Level Animal Hospital', duration: 110, qc: 8.8 }
        ];

        for (const update of updates) {
            const { error } = await supabase
                .from('website_projects')
                .update({
                    total_duration_hours: update.duration,
                    qc_review_score: update.qc
                })
                .ilike('name', `%${update.name}%`);

            if (error) {
                console.error(`Error updating ${update.name}:`, error);
            } else {
                console.log(`✅ Updated ${update.name}: ${update.duration}h, QC ${update.qc}`);
            }
        }

        // Check results
        const { data: withData, error: checkError } = await supabase
            .from('website_projects')
            .select('name, total_duration_hours, qc_review_score, actual_completion_date')
            .not('total_duration_hours', 'is', null)
            .order('actual_completion_date', { ascending: false });

        if (checkError) {
            console.error('Check error:', checkError);
            return;
        }

        console.log(`\n📈 PROJECTS WITH DATA: ${withData.length}`);

        // Group by month for preview
        const monthlyData = {};
        withData.forEach(project => {
            const month = project.actual_completion_date?.substring(0, 7) || 'unknown';
            if (!monthlyData[month]) {
                monthlyData[month] = { projects: [], totalDuration: 0, qcScores: [] };
            }
            monthlyData[month].projects.push(project.name);
            monthlyData[month].totalDuration += project.total_duration_hours || 0;
            if (project.qc_review_score) {
                monthlyData[month].qcScores.push(project.qc_review_score);
            }
        });

        Object.keys(monthlyData).sort().reverse().forEach(month => {
            const data = monthlyData[month];
            const avgDuration = data.totalDuration / data.projects.length;
            const avgQC = data.qcScores.length > 0 ?
                data.qcScores.reduce((sum, score) => sum + score, 0) / data.qcScores.length : 0;

            console.log(`\n${month}: ${data.projects.length} projects`);
            console.log(`  Avg Duration: ${avgDuration.toFixed(1)}h`);
            console.log(`  Avg QC Score: ${avgQC.toFixed(1)}`);
            console.log(`  Projects: ${data.projects.slice(0, 2).join(', ')}${data.projects.length > 2 ? '...' : ''}`);
        });

        console.log('\n🎉 Sample data ready! Charts should now show real metrics.');

    } catch (error) {
        console.error('❌ Sample data failed:', error);
    }
}

addSampleData();