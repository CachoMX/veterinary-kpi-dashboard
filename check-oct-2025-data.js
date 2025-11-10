const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analytics/get-analytics-kpis?month=2025-10',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);

            console.log('✓ October 2025 Dashboard Data\n');
            console.log('Total domains:', json.data.summary.totalDomains);
            console.log('Domains passing all:', json.data.summary.domainsPassingAll);
            console.log('Pass rate:', json.data.summary.domainsPassingAllPct + '%');

            const withData = json.data.metrics.filter(m => m.current.activeUsers > 0);
            console.log('\n✓ Properties with real data:', withData.length);

            console.log('\nSample properties:');
            withData.slice(0, 5).forEach(m => {
                console.log(`  ${m.domain}:`);
                console.log(`    Active Users: ${m.current.activeUsers} (vs ${m.previous.activeUsers} last year)`);
                console.log(`    New Users: ${m.current.newUsers}`);
                console.log(`    Trend: ${m.trends.activeUsers}`);
            });

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
