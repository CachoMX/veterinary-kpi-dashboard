require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function fixPropertyId() {
    console.log('Updating vetcelerator.com Property ID...\n');

    const { data, error } = await supabase
        .from('ga4_properties')
        .update({
            property_id: '327308495',
            updated_at: new Date().toISOString()
        })
        .eq('domain', 'vetcelerator.com')
        .select();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('✅ Property ID updated successfully!');
    console.log(data);
}

fixPropertyId();
