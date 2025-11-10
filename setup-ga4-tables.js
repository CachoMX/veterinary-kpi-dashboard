// Setup GA4 database tables in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkAndSetupTables() {
    console.log('Checking GA4 database tables...\n');

    // Check if tables exist by trying to query them
    const tablesToCheck = [
        'ga4_properties',
        'ga4_monthly_metrics',
        'ga4_benchmarks',
        'ga4_sync_logs'
    ];

    const tableStatus = {};

    for (const table of tablesToCheck) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                tableStatus[table] = { exists: false, error: error.message };
                console.log(`✗ ${table}: Not found (${error.message})`);
            } else {
                tableStatus[table] = { exists: true, count };
                console.log(`✓ ${table}: Exists (${count} rows)`);
            }
        } catch (err) {
            tableStatus[table] = { exists: false, error: err.message };
            console.log(`✗ ${table}: Error checking (${err.message})`);
        }
    }

    console.log('\n' + '='.repeat(60));

    // Check if all tables exist
    const allTablesExist = tablesToCheck.every(t => tableStatus[t].exists);

    if (allTablesExist) {
        console.log('✓ All GA4 tables exist!');
        console.log('='.repeat(60));
        return true;
    }

    console.log('Some tables are missing. You need to run the SQL schema.');
    console.log('='.repeat(60));
    console.log('\nTo setup the database:');
    console.log('1. Open Supabase SQL Editor: https://app.supabase.com/project/_/sql');
    console.log('2. Copy and run the SQL from: database/ga4-analytics-schema.sql');
    console.log('\nOr run this command to see the SQL:');
    console.log('   cat database/ga4-analytics-schema.sql');
    console.log('='.repeat(60));

    return false;
}

// Run check
checkAndSetupTables()
    .then(success => {
        if (success) {
            console.log('\n✓ Database is ready for GA4 analytics!');
            process.exit(0);
        } else {
            console.log('\n⚠ Please setup the database tables first.');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
