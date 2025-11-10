// Import discovered GA4 properties into Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function importProperties() {
    console.log('Starting GA4 properties import...\n');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'scripts', 'discovered-ga4-properties.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Parse INSERT statements from SQL
    const insertRegex = /INSERT INTO ga4_properties \(domain, property_id, description, category, is_active\)\s*VALUES \('([^']+)', '([^']+)', '([^']*)', '([^']*)', (true|false)\)/g;

    const properties = [];
    let match;

    while ((match = insertRegex.exec(sqlContent)) !== null) {
        properties.push({
            domain: match[1],
            property_id: match[2],
            description: match[3],
            category: match[4],
            is_active: match[5] === 'true'
        });
    }

    console.log(`Found ${properties.length} properties to import\n`);

    if (properties.length === 0) {
        console.error('No properties found in SQL file!');
        return;
    }

    // Import in batches of 50
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < properties.length; i += batchSize) {
        const batch = properties.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(properties.length / batchSize);

        console.log(`Processing batch ${batchNum}/${totalBatches} (${batch.length} properties)...`);

        try {
            // Use upsert to handle duplicates
            const { data, error } = await supabase
                .from('ga4_properties')
                .upsert(batch, {
                    onConflict: 'domain',
                    ignoreDuplicates: false
                })
                .select();

            if (error) {
                console.error(`Batch ${batchNum} error:`, error.message);
                errorCount += batch.length;
            } else {
                const inserted = data ? data.length : batch.length;
                successCount += inserted;
                console.log(`  ✓ Batch ${batchNum} completed: ${inserted} properties`);
            }
        } catch (err) {
            console.error(`Batch ${batchNum} exception:`, err.message);
            errorCount += batch.length;
        }

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < properties.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Import Summary:');
    console.log('='.repeat(60));
    console.log(`Total properties in file: ${properties.length}`);
    console.log(`Successfully imported:     ${successCount}`);
    console.log(`Errors:                    ${errorCount}`);
    console.log('='.repeat(60));

    // Verify import
    console.log('\nVerifying import...');
    const { count, error: countError } = await supabase
        .from('ga4_properties')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error verifying import:', countError.message);
    } else {
        console.log(`Total properties in database: ${count}`);
    }

    // Show sample of imported properties
    console.log('\nSample of imported properties:');
    const { data: sample } = await supabase
        .from('ga4_properties')
        .select('domain, property_id, category')
        .limit(5);

    if (sample && sample.length > 0) {
        sample.forEach(prop => {
            console.log(`  - ${prop.domain} (${prop.property_id}) [${prop.category}]`);
        });
    }

    console.log('\n✓ Import completed!\n');
}

// Run import
importProperties()
    .then(() => {
        console.log('Done!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Import failed:', err);
        process.exit(1);
    });
