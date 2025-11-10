require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkVetcelerator() {
    console.log('Checking vetcelerator.com...\n');

    // Check property in database
    const { data: property, error: propError } = await supabase
        .from('ga4_properties')
        .select('*')
        .eq('domain', 'vetcelerator.com')
        .single();

    if (propError) {
        console.error('Error fetching property:', propError);
        return;
    }

    console.log('Property in database:');
    console.log(`  Domain: ${property.domain}`);
    console.log(`  Property ID: ${property.property_id}`);
    console.log(`  Active: ${property.is_active}\n`);

    // Check September 2025 metrics
    const { data: metrics, error: metricsError } = await supabase
        .from('ga4_monthly_metrics')
        .select('*')
        .eq('domain', 'vetcelerator.com')
        .eq('metric_month', '2025-09-01')
        .single();

    if (metricsError) {
        console.error('Error fetching metrics:', metricsError);
        return;
    }

    console.log('September 2025 metrics:');
    console.log(`  Active Users: ${metrics.active_users}`);
    console.log(`  New Users: ${metrics.new_users}`);
    console.log(`  Key Events: ${metrics.key_events}`);
    console.log(`  Engagement Rate: ${metrics.engagement_rate}`);
    console.log(`  Previous Year Active Users: ${metrics.previous_year_active_users}`);
    console.log(`  Previous Year New Users: ${metrics.previous_year_new_users}`);
    console.log(`  Fetched At: ${metrics.fetched_at}`);
}

checkVetcelerator();
