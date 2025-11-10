// Direct table creation using Supabase service role
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role key if available, otherwise use anon key (won't work for DDL)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
    console.log('Creating new GA4 analytics tables...\n');

    // Read SQL file
    const sqlFile = path.join(__dirname, '..', 'database', 'ga4-new-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('SQL to execute:');
    console.log('='.repeat(60));
    console.log(sql);
    console.log('='.repeat(60));
    console.log('\nNOTE: This script requires SUPABASE_SERVICE_ROLE_KEY to create tables.');
    console.log('Please either:');
    console.log('1. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file, OR');
    console.log('2. Run the SQL manually in Supabase SQL Editor\n');

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('⚠️  SERVICE_ROLE_KEY not found. Please run SQL manually.');
        return;
    }

    try {
        // Try to execute SQL using rpc or direct SQL execution
        // Note: This may not work with all Supabase plans
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            throw error;
        }

        console.log('✓ Tables created successfully!');
    } catch (error) {
        console.error('✗ Error creating tables:', error.message);
        console.log('\nPlease run the SQL manually in Supabase SQL Editor:');
        console.log('1. Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql');
        console.log('2. Copy the SQL from: database/ga4-new-schema.sql');
        console.log('3. Run it in the SQL Editor');
    }
}

createTables();
