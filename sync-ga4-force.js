require('dotenv').config({ path: '.env.local' });
const http = require('http');

const month = process.argv[2] || new Date().toISOString().slice(0, 7);
const SECRET = process.env.GA4_SYNC_SECRET || process.env.SYNC_SECRET_KEY;

console.log(`Force syncing GA4 data for ${month}...`);
console.log('(Bypassing 24-hour cache)\n');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/analytics/fetch-ga4-metrics?month=${month}&forceRefresh=true`,
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
                console.log(`  Total properties: ${response.summary.totalProperties}`);
                console.log(`  Successful: ${response.summary.successful}`);
                console.log(`  Failed: ${response.summary.failed}`);
                console.log(`  Month: ${response.summary.month}`);
                console.log('\n✓ You can now view the dashboard at:');
                console.log('  http://localhost:3000/analytics-kpi.html');
            } else {
                console.error('✗ Sync failed:', response.error);
            }
        } catch (e) {
            console.error('Error parsing response:', e.message);
            console.log('Raw response:', data.substring(0, 500));
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.end();
