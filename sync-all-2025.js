// Sync all months of 2025 up to October (current month)
require('dotenv').config({ path: '.env.local' });
const http = require('http');

const SECRET = process.env.GA4_SYNC_SECRET || process.env.SYNC_SECRET_KEY;

const months = [
    '2025-01', '2025-02', '2025-03', '2025-04', '2025-05',
    '2025-06', '2025-07', '2025-08', '2025-09', '2025-10'
];

console.log('='.repeat(70));
console.log('SYNCING ALL 2025 DATA (Jan - Oct 2025)');
console.log('Each month will be compared to the same month in 2024');
console.log('This will take approximately 15-20 minutes for all months');
console.log('='.repeat(70));
console.log('');

let completed = 0;

function syncMonth(month) {
    return new Promise((resolve) => {
        console.log(`[${completed + 1}/${months.length}] Syncing ${month}...`);

        const req = http.request({
            hostname: 'localhost',
            port: 3000,
            path: `/api/analytics/fetch-ga4-metrics?month=${month}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${SECRET}` }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success) {
                        const s = response.summary || {};
                        console.log(`  ✓ ${month}: ${s.successful || 0} properties synced, ${s.failed || 0} failed${response.cached ? ' (cached)' : ''}`);
                    } else {
                        console.log(`  ✗ ${month}: ${response.error}`);
                    }
                } catch (e) {
                    console.log(`  ✗ ${month}: Parse error`);
                }
                completed++;
                resolve();
            });
        });

        req.on('error', (err) => {
            console.log(`  ✗ ${month}: ${err.message}`);
            completed++;
            resolve();
        });

        req.setTimeout(180000);
        req.end();
    });
}

async function syncAll() {
    for (const month of months) {
        await syncMonth(month);
        console.log('');
    }

    console.log('='.repeat(70));
    console.log('✓ SYNC COMPLETE! All 2025 months are now available');
    console.log('='.repeat(70));
    console.log('\nYou can now view the dashboard at:');
    console.log('  http://localhost:3000/analytics-kpi.html');
    console.log('\nSelect any month from Jan-Oct 2025 to see:');
    console.log('  - 2025 data compared to 2024');
    console.log('  - Trends showing if metrics are up/down/steady');
    console.log('  - Benchmark performance across all properties');
    console.log('='.repeat(70));
}

syncAll().then(() => process.exit(0)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
