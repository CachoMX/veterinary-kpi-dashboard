// Check if Just 4 Pets now has duration and QC data
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkJust4PetsData() {
    try {
        console.log('🔍 Checking Just 4 Pets data after sync fix...\n');

        const { data: projects, error } = await supabase
            .from('website_projects')
            .select('name, total_duration_hours, qc_review_score, last_synced')
            .ilike('name', '%just 4 pets%')
            .order('last_synced', { ascending: false });

        if (error) {
            console.error('Error:', error);
            return;
        }

        if (projects.length === 0) {
            console.log('❌ No Just 4 Pets projects found');
            return;
        }

        projects.forEach(project => {
            console.log(`📌 ${project.name}`);
            console.log(`   Duration: ${project.total_duration_hours}h`);
            console.log(`   QC Score: ${project.qc_review_score}`);
            console.log(`   Last Synced: ${project.last_synced}`);
            console.log('');
        });

        // Check any projects with duration or QC data
        const { data: withData, error: dataError } = await supabase
            .from('website_projects')
            .select('name, total_duration_hours, qc_review_score, last_synced')
            .or('total_duration_hours.not.is.null,qc_review_score.not.is.null')
            .order('last_synced', { ascending: false });

        if (dataError) {
            console.error('Data error:', dataError);
            return;
        }

        console.log(`📊 PROJECTS WITH DURATION/QC DATA: ${withData.length}`);
        withData.forEach(project => {
            console.log(`  ${project.name}: ${project.total_duration_hours}h, QC: ${project.qc_review_score}`);
        });

    } catch (error) {
        console.error('❌ Check failed:', error);
    }
}

checkJust4PetsData();