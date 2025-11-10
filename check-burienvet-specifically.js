require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkBurienvet() {
    console.log('Checking burienvet.com specifically...\n');

    // Check all months for burienvet
    const { data: metrics, error } = await supabase
        .from('ga4_monthly_metrics')
        .select('*')
        .eq('domain', 'burienvet.com')
        .order('metric_month', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${metrics.length} records for burienvet.com:\n`);

    metrics.forEach(m => {
        console.log(`Month: ${m.metric_month}`);
        console.log(`  Active Users: ${m.active_users}`);
        console.log(`  New Users: ${m.new_users}`);
        console.log(`  Key Events: ${m.key_events}`);
        console.log(`  Engagement Rate: ${m.engagement_rate}`);
        console.log(`  Fetched At: ${m.fetched_at}`);
        console.log('');
    });
}

checkBurienvet();
