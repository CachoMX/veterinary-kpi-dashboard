// Script to create new database schema in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function setupSchema() {
    console.log('Setting up new GA4 analytics schema...\n');

    try {
        // Note: We need to run SQL commands through Supabase SQL editor or use a service role key
        // For now, let's just verify connection and show the SQL that needs to be run

        console.log('✓ Connected to Supabase');
        console.log('\nPlease run the following SQL in your Supabase SQL Editor:\n');
        console.log('----------------------------------------');
        console.log(getCreateTableSQL());
        console.log('----------------------------------------');
        console.log('\nAlternatively, you can:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and run the SQL from: database/ga4-new-schema.sql');
        console.log('\n');

        // Test if tables exist
        console.log('Checking if tables exist...\n');

        const { data: metricsTest, error: metricsError } = await supabase
            .from('ga4_monthly_metrics_v2')
            .select('count')
            .limit(1);

        if (!metricsError) {
            console.log('✓ ga4_monthly_metrics_v2 table exists');
        } else {
            console.log('✗ ga4_monthly_metrics_v2 table does NOT exist - please create it');
        }

        const { data: sourcesTest, error: sourcesError } = await supabase
            .from('ga4_traffic_sources')
            .select('count')
            .limit(1);

        if (!sourcesError) {
            console.log('✓ ga4_traffic_sources table exists');
        } else {
            console.log('✗ ga4_traffic_sources table does NOT exist - please create it');
        }

        const { data: eventsTest, error: eventsError } = await supabase
            .from('ga4_key_events')
            .select('count')
            .limit(1);

        if (!eventsError) {
            console.log('✓ ga4_key_events table exists');
        } else {
            console.log('✗ ga4_key_events table does NOT exist - please create it');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

function getCreateTableSQL() {
    return `
-- GA4 Monthly Metrics V2
CREATE TABLE IF NOT EXISTS ga4_monthly_metrics_v2 (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL,
    key_events INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    avg_engagement_time DECIMAL(10,2) DEFAULT 0,
    previous_month_key_events INTEGER DEFAULT 0,
    previous_month_new_users INTEGER DEFAULT 0,
    previous_month_active_users INTEGER DEFAULT 0,
    previous_month_total_users INTEGER DEFAULT 0,
    previous_month_sessions INTEGER DEFAULT 0,
    previous_month_engagement_rate DECIMAL(5,2) DEFAULT 0,
    previous_month_avg_engagement_time DECIMAL(10,2) DEFAULT 0,
    key_events_trend TEXT,
    new_users_trend TEXT,
    active_users_trend TEXT,
    total_users_trend TEXT,
    sessions_trend TEXT,
    engagement_rate_trend TEXT,
    avg_engagement_time_trend TEXT,
    key_events_change DECIMAL(10,2) DEFAULT 0,
    new_users_change DECIMAL(10,2) DEFAULT 0,
    active_users_change DECIMAL(10,2) DEFAULT 0,
    total_users_change DECIMAL(10,2) DEFAULT 0,
    sessions_change DECIMAL(10,2) DEFAULT 0,
    engagement_rate_change DECIMAL(10,2) DEFAULT 0,
    avg_engagement_time_change DECIMAL(10,2) DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT FALSE,
    UNIQUE(domain, property_id, metric_month)
);

-- GA4 Traffic Sources
CREATE TABLE IF NOT EXISTS ga4_traffic_sources (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL,
    source_medium TEXT NOT NULL,
    channel_group TEXT,
    users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    engaged_sessions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    avg_engagement_time DECIMAL(10,2) DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, property_id, metric_month, source_medium)
);

-- GA4 Key Events
CREATE TABLE IF NOT EXISTS ga4_key_events (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL,
    event_name TEXT NOT NULL,
    event_count INTEGER DEFAULT 0,
    users_triggering INTEGER DEFAULT 0,
    event_value DECIMAL(10,2) DEFAULT 0,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(domain, property_id, metric_month, event_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_v2_domain_month ON ga4_monthly_metrics_v2(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_v2_property_month ON ga4_monthly_metrics_v2(property_id, metric_month);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_domain_month ON ga4_traffic_sources(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_property_month ON ga4_traffic_sources(property_id, metric_month);
CREATE INDEX IF NOT EXISTS idx_key_events_domain_month ON ga4_key_events(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_key_events_property_month ON ga4_key_events(property_id, metric_month);
`;
}

setupSchema();
