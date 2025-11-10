// Monitor sync progress by checking database
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function monitorProgress() {
    console.log('Monitoring sync progress...\n');

    // Count properties with data for each month
    const months = [
        '2025-01-01', '2025-02-01', '2025-03-01', '2025-04-01', '2025-05-01',
        '2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01', '2025-10-01'
    ];

    for (const month of months) {
        const { count } = await supabase
            .from('ga4_monthly_metrics_v2')
            .select('*', { count: 'exact', head: true })
            .eq('metric_month', month);

        const monthName = new Date(month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        console.log(`${monthName}: ${count || 0} domains synced`);
    }

    console.log('\nTotal active domains: 329');
    console.log('\nRefresh this script to see updated progress.');
}

monitorProgress();
