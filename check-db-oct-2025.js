require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkData() {
    console.log('Checking October 2025 data in database...\n');

    // Check metrics
    const { data: metrics, error } = await supabase
        .from('ga4_monthly_metrics')
        .select('domain, property_id, active_users, new_users, key_events, engagement_rate')
        .eq('metric_month', '2025-10-01')
        .order('active_users', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Total properties in DB for Oct 2025:', metrics.length);

    const withData = metrics.filter(m => m.active_users > 0 || m.new_users > 0);
    console.log('Properties with non-zero data:', withData.length);

    const allZeros = metrics.filter(m => m.active_users === 0 && m.new_users === 0);
    console.log('Properties with all zeros:', allZeros.length);

    console.log('\nTop 10 properties by active users:');
    metrics.slice(0, 10).forEach(m => {
        console.log(`  ${m.domain} (${m.property_id}):`);
        console.log(`    Active: ${m.active_users}, New: ${m.new_users}, Events: ${m.key_events}`);
    });

    // Check for burienvet specifically
    const burienvet = metrics.find(m => m.domain === 'burienvet.com');
    if (burienvet) {
        console.log('\nburienvet.com data:');
        console.log(JSON.stringify(burienvet, null, 2));
    } else {
        console.log('\nburienvet.com not found in October 2025 data');
    }
}

checkData();
