require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function fixVetcelerator() {
    console.log('Fixing vetcelerator.com Property ID...\n');

    // Step 1: Delete old metrics with wrong Property ID
    console.log('Step 1: Deleting old metrics with wrong Property ID (327707209)...');
    const { error: deleteError } = await supabase
        .from('ga4_monthly_metrics')
        .delete()
        .eq('property_id', '327707209');

    if (deleteError) {
        console.error('Error deleting metrics:', deleteError);
        return;
    }
    console.log('✅ Old metrics deleted\n');

    // Step 2: Update Property ID
    console.log('Step 2: Updating Property ID to correct value (327308495)...');
    const { data: updateData, error: updateError } = await supabase
        .from('ga4_properties')
        .update({
            property_id: '327308495',
            updated_at: new Date().toISOString()
        })
        .eq('domain', 'vetcelerator.com')
        .select();

    if (updateError) {
        console.error('Error updating property:', updateError);
        return;
    }
    console.log('✅ Property ID updated\n');

    console.log('✅ vetcelerator.com fixed successfully!');
    console.log('Updated property:', updateData[0]);
    console.log('\nNow you need to re-sync to get real data with the correct Property ID.');
}

fixVetcelerator();
