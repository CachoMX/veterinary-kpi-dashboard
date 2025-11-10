// Quick script to run the sync locally
require('dotenv').config({ path: '.env.local' });
const syncFunction = require('./api/sync-website-projects');

// Mock request/response objects
const mockReq = {
    method: 'POST',
    headers: {},
    query: {}
};

const mockRes = {
    status: (code) => ({
        json: (data) => {
            console.log(`\n📊 Status: ${code}`);
            console.log('📋 Response:', JSON.stringify(data, null, 2));
        }
    })
};

console.log('🚀 Starting website projects sync locally...');
console.log('This will extract subitems from Monday.com and save to Supabase\n');

syncFunction(mockReq, mockRes)
    .then(() => {
        console.log('\n✅ Local sync completed!');
        console.log('Now run the SQL query again to see the subitems.');
    })
    .catch(error => {
        console.error('❌ Local sync failed:', error);
        console.error('Stack:', error.stack);
    });