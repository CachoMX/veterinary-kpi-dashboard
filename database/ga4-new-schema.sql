-- New GA4 Analytics Schema for Monthly Tracking with Traffic Sources and Key Events Breakdown
-- Drop existing tables if needed (comment out in production)
-- DROP TABLE IF EXISTS ga4_traffic_sources CASCADE;
-- DROP TABLE IF EXISTS ga4_key_events CASCADE;
-- DROP TABLE IF EXISTS ga4_monthly_metrics CASCADE;

-- Main monthly metrics table (redesigned for month-to-month comparison)
CREATE TABLE IF NOT EXISTS ga4_monthly_metrics_v2 (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL, -- First day of the month (e.g., 2025-10-01)

    -- Core metrics
    key_events INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    avg_engagement_time DECIMAL(10,2) DEFAULT 0,

    -- Previous month metrics for comparison
    previous_month_key_events INTEGER DEFAULT 0,
    previous_month_new_users INTEGER DEFAULT 0,
    previous_month_active_users INTEGER DEFAULT 0,
    previous_month_total_users INTEGER DEFAULT 0,
    previous_month_sessions INTEGER DEFAULT 0,
    previous_month_engagement_rate DECIMAL(5,2) DEFAULT 0,
    previous_month_avg_engagement_time DECIMAL(10,2) DEFAULT 0,

    -- Trends (up, down, neutral)
    key_events_trend TEXT,
    new_users_trend TEXT,
    active_users_trend TEXT,
    total_users_trend TEXT,
    sessions_trend TEXT,
    engagement_rate_trend TEXT,
    avg_engagement_time_trend TEXT,

    -- Percentage changes
    key_events_change DECIMAL(10,2) DEFAULT 0,
    new_users_change DECIMAL(10,2) DEFAULT 0,
    active_users_change DECIMAL(10,2) DEFAULT 0,
    total_users_change DECIMAL(10,2) DEFAULT 0,
    sessions_change DECIMAL(10,2) DEFAULT 0,
    engagement_rate_change DECIMAL(10,2) DEFAULT 0,
    avg_engagement_time_change DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT FALSE,

    -- Unique constraint
    UNIQUE(domain, property_id, metric_month)
);

-- Traffic sources breakdown table
CREATE TABLE IF NOT EXISTS ga4_traffic_sources (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL,

    -- Traffic source dimensions
    source_medium TEXT NOT NULL, -- e.g., "google / organic", "direct / none"
    channel_group TEXT, -- Default channel grouping: Organic Search, Direct, Referral, etc.

    -- Metrics per source
    users INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    engaged_sessions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    avg_engagement_time DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(domain, property_id, metric_month, source_medium)
);

-- Key events breakdown table
CREATE TABLE IF NOT EXISTS ga4_key_events (
    id BIGSERIAL PRIMARY KEY,
    domain TEXT NOT NULL,
    property_id TEXT NOT NULL,
    metric_month DATE NOT NULL,

    -- Event details
    event_name TEXT NOT NULL,
    event_count INTEGER DEFAULT 0,

    -- Additional event metrics
    users_triggering INTEGER DEFAULT 0,
    event_value DECIMAL(10,2) DEFAULT 0,

    -- Metadata
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint
    UNIQUE(domain, property_id, metric_month, event_name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_v2_domain_month ON ga4_monthly_metrics_v2(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_monthly_metrics_v2_property_month ON ga4_monthly_metrics_v2(property_id, metric_month);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_domain_month ON ga4_traffic_sources(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_property_month ON ga4_traffic_sources(property_id, metric_month);
CREATE INDEX IF NOT EXISTS idx_key_events_domain_month ON ga4_key_events(domain, metric_month);
CREATE INDEX IF NOT EXISTS idx_key_events_property_month ON ga4_key_events(property_id, metric_month);

-- View to get all available properties with their latest data
CREATE OR REPLACE VIEW ga4_properties_summary AS
SELECT
    p.domain,
    p.property_id,
    p.is_active,
    MAX(m.metric_month) as latest_month,
    COUNT(DISTINCT m.metric_month) as months_tracked,
    MAX(m.fetched_at) as last_synced
FROM ga4_properties p
LEFT JOIN ga4_monthly_metrics_v2 m ON p.property_id = m.property_id
GROUP BY p.domain, p.property_id, p.is_active
ORDER BY p.domain;
