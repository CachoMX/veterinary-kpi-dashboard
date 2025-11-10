// Sync all months of 2024 up to current month
require('dotenv').config({ path: '.env.local' });
const http = require('http');

const SECRET = process.env.GA4_SYNC_SECRET || process.env.SYNC_SECRET_KEY;

if (!SECRET) {
    console.error('Error: GA4_SYNC_SECRET not found in .env.local');
    process.exit(1);
}

// Months to sync (January through October 2024)
const months = [
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05',
    '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'
];

let currentIndex = 0;
const results = [];

console.log('='.repeat(60));
console.log('Syncing ALL 2024 months (Jan - Oct)');
console.log('This will take approximately 10-15 minutes');
console.log('='.repeat(60));
console.log('');

function syncMonth(month) {
    return new Promise((resolve, reject) => {
        console.log(`[${currentIndex + 1}/${months.length}] Syncing ${month}...`);

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: `/api/analytics/fetch-ga4-metrics?month=${month}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SECRET}`
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(data);

                    if (response.success) {
                        const summary = response.summary || {};
                        console.log(`  ✓ ${month}: ${summary.successful || 0} successful, ${summary.failed || 0} failed`);
                        if (response.cached) {
                            console.log('    (cached data)');
                        }
                        results.push({
                            month,
                            success: true,
                            successful: summary.successful || 0,
                            failed: summary.failed || 0,
                            cached: response.cached || false
                        });
                        resolve();
                    } else {
                        console.log(`  ✗ ${month}: ${response.error}`);
                        results.push({
                            month,
                            success: false,
                            error: response.error
                        });
                        resolve(); // Continue even if one month fails
                    }
                } catch (err) {
                    console.log(`  ✗ ${month}: Parse error - ${err.message}`);
                    results.push({
                        month,
                        success: false,
                        error: err.message
                    });
                    resolve();
                }
            });
        });

        req.on('error', (err) => {
            console.log(`  ✗ ${month}: ${err.message}`);
            results.push({
                month,
                success: false,
                error: err.message
            });
            resolve();
        });

        req.setTimeout(120000); // 2 minute timeout per month
        req.end();
    });
}

async function syncAllMonths() {
    for (let i = 0; i < months.length; i++) {
        currentIndex = i;
        await syncMonth(months[i]);
        console.log(''); // Empty line between months
    }

    // Print summary
    console.log('='.repeat(60));
    console.log('SYNC COMPLETE - SUMMARY');
    console.log('='.repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\nTotal months synced: ${successful.length}/${months.length}`);
    console.log(`Failed: ${failed.length}`);

    if (successful.length > 0) {
        console.log('\nSuccessful syncs:');
        successful.forEach(r => {
            const cached = r.cached ? ' (cached)' : '';
            console.log(`  ✓ ${r.month}: ${r.successful} properties${cached}`);
        });
    }

    if (failed.length > 0) {
        console.log('\nFailed syncs:');
        failed.forEach(r => {
            console.log(`  ✗ ${r.month}: ${r.error}`);
        });
    }

    const totalProperties = successful.reduce((sum, r) => sum + (r.successful || 0), 0);
    console.log(`\nTotal properties synced: ${totalProperties}`);
    console.log('\n✓ You can now view the dashboard with all 2024 data!');
    console.log('  http://localhost:3000/analytics-kpi.html');
    console.log('='.repeat(60));
}

syncAllMonths()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Sync failed:', err);
        process.exit(1);
    });
