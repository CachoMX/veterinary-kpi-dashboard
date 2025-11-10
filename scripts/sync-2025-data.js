// Script to sync all 2025 data (Jan-Oct)
require('dotenv').config({ path: '.env.local' });

async function sync2025Data() {
    console.log('Starting sync for 2025 data (Jan - Oct)...\n');

    try {
        const response = await fetch('http://localhost:3000/api/analytics/sync-monthly-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                year: 2025,
                months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                forceRefresh: true
            })
        });

        const result = await response.json();

        if (result.success) {
            console.log('✓ Sync completed successfully!\n');
            console.log(`Synced ${result.syncedMonths.length} months:\n`);

            result.syncedMonths.forEach(month => {
                console.log(`  ${month.month}:`);
                console.log(`    ✓ ${month.propertiesSynced} properties synced`);
                if (month.propertiesFailed > 0) {
                    console.log(`    ✗ ${month.propertiesFailed} properties failed`);
                    month.errors.forEach(err => {
                        console.log(`      - ${err.domain}: ${err.error}`);
                    });
                }
            });

            if (result.errors.length > 0) {
                console.log('\nMonth-level errors:');
                result.errors.forEach(err => {
                    console.log(`  ✗ ${err.month}: ${err.error}`);
                });
            }
        } else {
            console.error('✗ Sync failed:', result.error);
        }
    } catch (error) {
        console.error('✗ Error during sync:', error.message);
        console.error('\nMake sure:');
        console.error('1. Server is running (npm start)');
        console.error('2. Database tables are created');
        console.error('3. GA4 credentials are configured');
    }
}

console.log('='.repeat(60));
console.log('GA4 Analytics - 2025 Data Sync');
console.log('='.repeat(60));
console.log('');
console.log('This will sync data for:');
console.log('  • Year: 2025');
console.log('  • Months: January - October (10 months)');
console.log('  • All active properties');
console.log('');
console.log('This may take several minutes...');
console.log('');

sync2025Data();
