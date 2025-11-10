// Test GA4 sync with a few properties
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const ga4Service = require('./api/analytics/ga4-service');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testSync() {
    console.log('Testing GA4 sync with a few properties...\n');

    // Initialize GA4 service
    try {
        ga4Service.initialize();
        console.log('✓ GA4 service initialized\n');
    } catch (err) {
        console.error('✗ Failed to initialize GA4 service:', err.message);
        process.exit(1);
    }

    // Get first 3 active properties to test
    const { data: properties, error } = await supabase
        .from('ga4_properties')
        .select('*')
        .eq('is_active', true)
        .limit(3);

    if (error || !properties || properties.length === 0) {
        console.error('Failed to fetch test properties:', error?.message || 'No properties found');
        process.exit(1);
    }

    console.log(`Testing with ${properties.length} properties:\n`);
    properties.forEach((p, i) => {
        console.log(`${i + 1}. ${p.domain} (${p.property_id})`);
    });
    console.log('\n' + '='.repeat(60) + '\n');

    // Calculate date ranges for current month
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const startDate = `${year}-${month}-01`;
    const endDate = new Date(year, now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Previous year
    const prevYear = year - 1;
    const prevStartDate = `${prevYear}-${month}-01`;
    const prevEndDate = new Date(prevYear, now.getMonth() + 1, 0).toISOString().split('T')[0];

    console.log(`Date range:`);
    console.log(`  Current: ${startDate} to ${endDate}`);
    console.log(`  Previous: ${prevStartDate} to ${prevEndDate}\n`);
    console.log('='.repeat(60) + '\n');

    let successCount = 0;
    let errorCount = 0;

    for (const property of properties) {
        try {
            console.log(`Fetching ${property.domain}...`);

            const yoyData = await ga4Service.fetchYearOverYearMetrics(
                property.property_id,
                startDate,
                endDate,
                prevStartDate,
                prevEndDate
            );

            const { current, previous, comparison } = yoyData;

            console.log(`  Current metrics:`);
            console.log(`    Key Events: ${current.keyEvents}`);
            console.log(`    New Users: ${current.newUsers}`);
            console.log(`    Active Users: ${current.activeUsers}`);
            console.log(`    Engagement Rate: ${current.engagementRate}%`);
            console.log(`    Avg Engagement Time: ${current.avgEngagementTime}s`);

            console.log(`  Trends:`);
            console.log(`    Key Events: ${comparison.keyEvents.trend} (${comparison.keyEvents.change > 0 ? '+' : ''}${comparison.keyEvents.change}%)`);
            console.log(`    New Users: ${comparison.newUsers.trend} (${comparison.newUsers.change > 0 ? '+' : ''}${comparison.newUsers.change}%)`);
            console.log(`    Active Users: ${comparison.activeUsers.trend} (${comparison.activeUsers.change > 0 ? '+' : ''}${comparison.activeUsers.change}%)`);

            // Save to database
            const metricData = {
                property_id: property.property_id,
                domain: property.domain,
                metric_month: startDate,
                start_date: startDate,
                end_date: endDate,
                key_events: current.keyEvents,
                new_users: current.newUsers,
                active_users: current.activeUsers,
                engagement_rate: current.engagementRate,
                avg_engagement_time: current.avgEngagementTime,
                previous_year_key_events: previous.keyEvents,
                previous_year_new_users: previous.newUsers,
                previous_year_active_users: previous.activeUsers,
                previous_year_engagement_rate: previous.engagementRate,
                previous_year_avg_engagement_time: previous.avgEngagementTime,
                key_events_trend: comparison.keyEvents.trend,
                new_users_trend: comparison.newUsers.trend,
                active_users_trend: comparison.activeUsers.trend,
                engagement_rate_trend: comparison.engagementRate.trend,
                avg_engagement_time_trend: comparison.avgEngagementTime.trend,
                key_events_change: comparison.keyEvents.change,
                new_users_change: comparison.newUsers.change,
                active_users_change: comparison.activeUsers.change,
                engagement_rate_change: comparison.engagementRate.change,
                avg_engagement_time_change: comparison.avgEngagementTime.change,
                fetched_at: new Date().toISOString(),
                is_stale: false
            };

            const { error: saveError } = await supabase
                .from('ga4_monthly_metrics')
                .upsert(metricData, {
                    onConflict: 'property_id,metric_month'
                });

            if (saveError) {
                console.log(`  ✗ Failed to save to database: ${saveError.message}`);
                errorCount++;
            } else {
                console.log(`  ✓ Saved to database`);
                successCount++;
            }

        } catch (err) {
            console.log(`  ✗ Error: ${err.message}`);
            errorCount++;
        }

        console.log('');
    }

    console.log('='.repeat(60));
    console.log(`Test Summary: ${successCount} succeeded, ${errorCount} failed`);
    console.log('='.repeat(60));

    if (successCount > 0) {
        console.log('\n✓ GA4 sync is working! You can now:');
        console.log('  1. Open http://localhost:3000/analytics-kpi.html');
        console.log('  2. View the test data in the dashboard');
        console.log('  3. Run full sync when ready (will take ~1-2 hours for 332 properties)');
    }
}

testSync()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Test failed:', err);
        process.exit(1);
    });
