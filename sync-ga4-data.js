// Sync GA4 data for current or specified month
require('dotenv').config({ path: '.env.local' });
const http = require('http');

const SECRET = process.env.GA4_SYNC_SECRET || process.env.SYNC_SECRET_KEY;
const month = process.argv[2] || new Date().toISOString().slice(0, 7); // Default to current month

console.log(`Syncing GA4 data for ${month}...\n`);

if (!SECRET) {
    console.error('Error: GA4_SYNC_SECRET not found in .env.local');
    process.exit(1);
}

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
                console.log('✓ Sync completed successfully!\n');
                console.log('Summary:');
                console.log(`  Total properties: ${response.summary?.total || 0}`);
                console.log(`  Successful: ${response.summary?.successful || 0}`);
                console.log(`  Failed: ${response.summary?.failed || 0}`);
                console.log(`  Month: ${response.summary?.month || month}`);

                if (response.cached) {
                    console.log('\n  (Used cached data - less than 24 hours old)');
                }

                console.log('\n✓ You can now view the dashboard at:');
                console.log('  http://localhost:3000/analytics-kpi.html');
            } else {
                console.error('✗ Sync failed:', response.error);
                process.exit(1);
            }
        } catch (err) {
            console.error('✗ Error parsing response:', err.message);
            console.error('Response:', data);
            process.exit(1);
        }
    });
});

req.on('error', (err) => {
    console.error('✗ Request failed:', err.message);
    process.exit(1);
});

req.end();

console.log('Fetching data from Google Analytics 4...');
console.log('(This may take several minutes for many properties)\n');
