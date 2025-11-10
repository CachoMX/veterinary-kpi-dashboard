require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function findProperties() {
    console.log('Looking for properties from Vetcelerator Clients Accounts 2025...\n');

    // Get all properties
    const { data: properties, error } = await supabase
        .from('ga4_properties')
        .select('*')
        .eq('is_active', true)
        .order('domain');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Total active properties:', properties.length);

    // Look for burienvet specifically
    const burienvet = properties.find(p => p.domain === 'burienvet.com');
    console.log('\nburienvet.com property:');
    console.log(JSON.stringify(burienvet, null, 2));

    // The properties from the account we have permissions for
    // Based on the Google Analytics screenshot, these should include:
    const knownProperties = [
        'burienvet.com',
        'oakleighanimalhospital.com',
        'millrunanimalhospital.com'
    ];

    console.log('\nChecking known properties from the account:');
    knownProperties.forEach(domain => {
        const prop = properties.find(p => p.domain === domain);
        if (prop) {
            console.log(`✓ ${domain} - Property ID: ${prop.property_id}`);
        } else {
            console.log(`✗ ${domain} - NOT FOUND`);
        }
    });

    // Check which properties have October 2025 data
    const { data: oct2025, error: octError } = await supabase
        .from('ga4_monthly_metrics')
        .select('domain, property_id')
        .eq('metric_month', '2025-10-01');

    if (!octError) {
        console.log(`\n${oct2025.length} properties have October 2025 data synced`);
        console.log('Sample domains:');
        oct2025.slice(0, 10).forEach(m => {
            console.log(`  - ${m.domain}`);
        });
    }
}

findProperties();
