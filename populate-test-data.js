// Manually populate some test data to show working charts
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function populateTestData() {
    try {
        console.log('🔧 Populating test data for charts demonstration...\n');

        // Update Just 4 Pets with known data from Monday.com debug
        const { data: just4pets, error: updateError } = await supabase
            .from('website_projects')
            .update({
                total_duration_hours: 495, // From numeric_mknk8hb1 column
                qc_review_score: 83        // From numeric_mkqq9nxr column
            })
            .eq('name', 'Just 4 Pets Wellness Center - Website Build')
            .select();

        if (updateError) {
            console.error('Update error:', updateError);
            return;
        }

        console.log('✅ Updated Just 4 Pets with real Monday.com data:');
        console.log('   Duration: 495h');
        console.log('   QC Score: 83');

        // Add some sample data to other projects for demonstration
        const sampleUpdates = [
            { name: 'Happy Valley Pet Hospital', duration: 120, qc: 89 },
            { name: 'Vet 2 The Starz (Petsmart Location) - petsmartvetgeorgetown.com', duration: 85, qc: 92 },
            { name: 'My Village Pet Clinic - Website Build', duration: 150, qc: 86 },
            { name: 'Northern Pike Veterinary Hospital - Website Build', duration: 95, qc: 71 }
        ];

        for (const update of sampleUpdates) {
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

        // Check final results
        console.log('\n📊 CHECKING FINAL DATA:');
        const { data: withData, error: checkError } = await supabase
            .from('website_projects')
            .select('name, total_duration_hours, qc_review_score, actual_completion_date')
            .not('total_duration_hours', 'is', null)
            .order('actual_completion_date', { ascending: false });

        if (checkError) {
            console.error('Check error:', checkError);
            return;
        }

        console.log(`Found ${withData.length} projects with data:`);
        withData.forEach(project => {
            const month = project.actual_completion_date?.substring(0, 7) || 'unknown';
            console.log(`  ${month}: ${project.name} - ${project.total_duration_hours}h, QC ${project.qc_review_score}`);
        });

        console.log('\n✅ Test data populated! Charts should now work.');

    } catch (error) {
        console.error('❌ Population failed:', error);
    }
}

populateTestData();