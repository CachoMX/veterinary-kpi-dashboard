// Test actual GA4 API response to see real data
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

async function testRealData() {
    // Test with achwalnutcreek.com property
    const propertyId = '350034575';

    console.log('Testing GA4 API for property:', propertyId);
    console.log('Date range: 2025-09-01 to 2025-09-30\n');

    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate: '2025-09-01',
                    endDate: '2025-09-30',
                },
            ],
            metrics: [
                { name: 'conversions' },
                { name: 'newUsers' },
                { name: 'activeUsers' },
                { name: 'engagementRate' },
                { name: 'userEngagementDuration' },
            ],
        });

        console.log('RAW GA4 Response:');
        console.log('================');

        if (response.rows && response.rows.length > 0) {
            const row = response.rows[0];
            console.log('Conversions:', row.metricValues[0].value);
            console.log('New Users:', row.metricValues[1].value);
            console.log('Active Users:', row.metricValues[2].value);
            console.log('Engagement Rate:', row.metricValues[3].value);
            console.log('User Engagement Duration:', row.metricValues[4].value);
        } else {
            console.log('⚠️  NO DATA returned from GA4!');
            console.log('Response rows:', response.rows);
            console.log('\nThis could mean:');
            console.log('1. No traffic in September 2025');
            console.log('2. Property ID is incorrect');
            console.log('3. Service account needs permissions');
            console.log('4. Data collection not configured');
        }

        console.log('\n\nFull response object:');
        console.log(JSON.stringify(response, null, 2));

    } catch (error) {
        console.error('ERROR:', error.message);
        console.error('Details:', error);
    }
}

testRealData();
