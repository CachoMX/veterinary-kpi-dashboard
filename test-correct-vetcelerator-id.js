require('dotenv').config({ path: '.env.local' });
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_CREDENTIALS;
const credentials = JSON.parse(credentialsJson);

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
    }
});

async function testPropertyId(propertyId, label) {
    console.log(`\nTesting ${label} (Property ID: ${propertyId})`);
    console.log('Date: September 2025\n');

    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                { startDate: '2025-09-01', endDate: '2025-09-30' }
            ],
            metrics: [
                { name: 'conversions' },
                { name: 'newUsers' },
                { name: 'activeUsers' },
                { name: 'engagementRate' }
            ]
        });

        if (!response.rows || response.rows.length === 0) {
            console.log('❌ No data found');
        } else {
            const row = response.rows[0];
            console.log('✅ Data found!');
            console.log(`Active Users: ${row.metricValues[2]?.value || 0}`);
            console.log(`New Users: ${row.metricValues[1]?.value || 0}`);
            console.log(`Conversions: ${row.metricValues[0]?.value || 0}`);
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

async function test() {
    console.log('Testing vetcelerator.com Property IDs...\n');
    console.log('='.repeat(60));

    await testPropertyId('327707209', 'Current ID in database');
    await testPropertyId('327308495', 'Correct ID (from your screenshot)');
}

test();
