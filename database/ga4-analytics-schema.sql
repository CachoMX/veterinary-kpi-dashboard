-- Google Analytics 4 KPI Dashboard Database Schema
-- For caching GA4 metrics and tracking benchmark performance

-- GA4 properties/domains configuration table
CREATE TABLE ga4_properties (
    id SERIAL PRIMARY KEY,
    domain TEXT NOT NULL UNIQUE,
    property_id TEXT NOT NULL UNIQUE, -- GA4 Property ID
    is_active BOOLEAN DEFAULT TRUE,

    -- Optional metadata
    description TEXT,
    category TEXT, -- e.g., 'veterinary', 'blog', 'ecommerce'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GA4 monthly metrics cache table
CREATE TABLE ga4_monthly_metrics (
    id SERIAL PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES ga4_properties(property_id),
    domain TEXT NOT NULL,

    -- Date range
    metric_month DATE NOT NULL, -- First day of the month
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Core KPI metrics
    key_events INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0, -- Percentage (0.00-100.00)
    avg_engagement_time NUMERIC(10,2) DEFAULT 0, -- Seconds
    total_engagement_duration NUMERIC(15,2) DEFAULT 0,

    -- Year-over-year comparison
    previous_year_key_events INTEGER DEFAULT 0,
    previous_year_new_users INTEGER DEFAULT 0,
    previous_year_active_users INTEGER DEFAULT 0,
    previous_year_engagement_rate NUMERIC(5,2) DEFAULT 0,
    previous_year_avg_engagement_time NUMERIC(10,2) DEFAULT 0,

    -- Calculated trends
    key_events_trend TEXT CHECK (key_events_trend IN ('up', 'down', 'neutral')),
    new_users_trend TEXT CHECK (new_users_trend IN ('up', 'down', 'neutral')),
    active_users_trend TEXT CHECK (active_users_trend IN ('up', 'down', 'neutral')),
    engagement_rate_trend TEXT CHECK (engagement_rate_trend IN ('up', 'down', 'neutral')),
    avg_engagement_time_trend TEXT CHECK (avg_engagement_time_trend IN ('up', 'down', 'neutral')),

    -- Percentage changes
    key_events_change NUMERIC(10,2),
    new_users_change NUMERIC(10,2),
    active_users_change NUMERIC(10,2),
    engagement_rate_change NUMERIC(10,2),
    avg_engagement_time_change NUMERIC(10,2),

    -- Cache metadata
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one record per property per month
    UNIQUE(property_id, metric_month)
);

-- GA4 benchmark tracking table
CREATE TABLE ga4_benchmarks (
    id SERIAL PRIMARY KEY,
    month_date DATE NOT NULL, -- First day of the month being evaluated

    -- Benchmark configuration
    benchmark_threshold NUMERIC(5,2) DEFAULT 90.00, -- 90% threshold
    total_active_domains INTEGER NOT NULL,

    -- Per-metric benchmark results
    key_events_passing INTEGER DEFAULT 0,
    key_events_passing_pct NUMERIC(5,2) DEFAULT 0,
    key_events_benchmark_met BOOLEAN DEFAULT FALSE,

    new_users_passing INTEGER DEFAULT 0,
    new_users_passing_pct NUMERIC(5,2) DEFAULT 0,
    new_users_benchmark_met BOOLEAN DEFAULT FALSE,

    active_users_passing INTEGER DEFAULT 0,
    active_users_passing_pct NUMERIC(5,2) DEFAULT 0,
    active_users_benchmark_met BOOLEAN DEFAULT FALSE,

    engagement_rate_passing INTEGER DEFAULT 0,
    engagement_rate_passing_pct NUMERIC(5,2) DEFAULT 0,
    engagement_rate_benchmark_met BOOLEAN DEFAULT FALSE,

    avg_engagement_time_passing INTEGER DEFAULT 0,
    avg_engagement_time_passing_pct NUMERIC(5,2) DEFAULT 0,
    avg_engagement_time_benchmark_met BOOLEAN DEFAULT FALSE,

    -- Overall benchmark status
    all_benchmarks_met BOOLEAN DEFAULT FALSE,
    benchmarks_met_count INTEGER DEFAULT 0, -- Out of 5 metrics

    -- Detailed domain performance
    domains_data JSONB, -- Array of {domain, metrics_passed: [metric names]}

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- One benchmark record per month
    UNIQUE(month_date)
);

-- GA4 sync logs
CREATE TABLE ga4_sync_logs (
    id SERIAL PRIMARY KEY,
    sync_type TEXT NOT NULL, -- 'monthly_metrics', 'benchmark_calculation', 'full_sync'
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed')),

    -- Statistics
    properties_synced INTEGER DEFAULT 0,
    metrics_updated INTEGER DEFAULT 0,
    benchmarks_calculated INTEGER DEFAULT 0,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Metadata
    triggered_by TEXT, -- 'cron', 'manual', 'api'
    sync_parameters JSONB
);

-- Indexes for performance
CREATE INDEX idx_ga4_properties_active ON ga4_properties(is_active);
CREATE INDEX idx_ga4_properties_domain ON ga4_properties(domain);

CREATE INDEX idx_ga4_monthly_metrics_property ON ga4_monthly_metrics(property_id);
CREATE INDEX idx_ga4_monthly_metrics_domain ON ga4_monthly_metrics(domain);
CREATE INDEX idx_ga4_monthly_metrics_month ON ga4_monthly_metrics(metric_month DESC);
CREATE INDEX idx_ga4_monthly_metrics_stale ON ga4_monthly_metrics(is_stale, fetched_at);

CREATE INDEX idx_ga4_benchmarks_month ON ga4_benchmarks(month_date DESC);
CREATE INDEX idx_ga4_benchmarks_all_met ON ga4_benchmarks(all_benchmarks_met);

CREATE INDEX idx_ga4_sync_logs_status ON ga4_sync_logs(status, started_at DESC);
CREATE INDEX idx_ga4_sync_logs_type ON ga4_sync_logs(sync_type);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_ga4_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ga4_properties_updated_at
    BEFORE UPDATE ON ga4_properties
    FOR EACH ROW EXECUTE FUNCTION update_ga4_updated_at_column();

CREATE TRIGGER update_ga4_monthly_metrics_updated_at
    BEFORE UPDATE ON ga4_monthly_metrics
    FOR EACH ROW EXECUTE FUNCTION update_ga4_updated_at_column();

CREATE TRIGGER update_ga4_benchmarks_updated_at
    BEFORE UPDATE ON ga4_benchmarks
    FOR EACH ROW EXECUTE FUNCTION update_ga4_updated_at_column();

-- Sample property data (update with your actual domains and property IDs)
INSERT INTO ga4_properties (domain, property_id, description, category) VALUES
('example-vet-clinic.com', '123456789', 'Main Veterinary Clinic Website', 'veterinary'),
('vet-blog.com', '987654321', 'Veterinary Blog', 'blog'),
('pet-supplies.com', '456789123', 'Pet Supplies E-commerce', 'ecommerce')
ON CONFLICT (domain) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE ga4_properties IS 'GA4 property configurations for all tracked domains';
COMMENT ON TABLE ga4_monthly_metrics IS 'Cached monthly GA4 metrics with year-over-year comparisons';
COMMENT ON TABLE ga4_benchmarks IS 'Monthly benchmark tracking showing which domains meet 90% threshold';
COMMENT ON TABLE ga4_sync_logs IS 'Logs for GA4 data sync operations';

-- View for current month benchmark summary
CREATE OR REPLACE VIEW ga4_current_benchmark_summary AS
SELECT
    b.month_date,
    b.total_active_domains,
    b.benchmark_threshold,
    b.all_benchmarks_met,
    b.benchmarks_met_count,

    -- Metric-by-metric summary
    json_build_object(
        'key_events', json_build_object(
            'passing', b.key_events_passing,
            'percentage', b.key_events_passing_pct,
            'met', b.key_events_benchmark_met
        ),
        'new_users', json_build_object(
            'passing', b.new_users_passing,
            'percentage', b.new_users_passing_pct,
            'met', b.new_users_benchmark_met
        ),
        'active_users', json_build_object(
            'passing', b.active_users_passing,
            'percentage', b.active_users_passing_pct,
            'met', b.active_users_benchmark_met
        ),
        'engagement_rate', json_build_object(
            'passing', b.engagement_rate_passing,
            'percentage', b.engagement_rate_passing_pct,
            'met', b.engagement_rate_benchmark_met
        ),
        'avg_engagement_time', json_build_object(
            'passing', b.avg_engagement_time_passing,
            'percentage', b.avg_engagement_time_passing_pct,
            'met', b.avg_engagement_time_benchmark_met
        )
    ) as metrics_summary,

    b.created_at,
    b.updated_at
FROM ga4_benchmarks b
ORDER BY b.month_date DESC
LIMIT 1;

-- View for domain performance overview
CREATE OR REPLACE VIEW ga4_domain_performance_overview AS
SELECT
    p.domain,
    p.property_id,
    p.is_active,
    m.metric_month,

    -- Current metrics
    m.key_events,
    m.new_users,
    m.active_users,
    m.engagement_rate,
    m.avg_engagement_time,

    -- Trends
    m.key_events_trend,
    m.new_users_trend,
    m.active_users_trend,
    m.engagement_rate_trend,
    m.avg_engagement_time_trend,

    -- Changes
    m.key_events_change,
    m.new_users_change,
    m.active_users_change,
    m.engagement_rate_change,
    m.avg_engagement_time_change,

    -- Determine if metrics are steady or increasing
    CASE
        WHEN m.key_events_trend IN ('up', 'neutral') THEN true
        ELSE false
    END as key_events_meets_criteria,

    CASE
        WHEN m.new_users_trend IN ('up', 'neutral') THEN true
        ELSE false
    END as new_users_meets_criteria,

    CASE
        WHEN m.active_users_trend IN ('up', 'neutral') THEN true
        ELSE false
    END as active_users_meets_criteria,

    CASE
        WHEN m.engagement_rate_trend IN ('up', 'neutral') THEN true
        ELSE false
    END as engagement_rate_meets_criteria,

    CASE
        WHEN m.avg_engagement_time_trend IN ('up', 'neutral') THEN true
        ELSE false
    END as avg_engagement_time_meets_criteria,

    m.fetched_at,
    m.is_stale
FROM ga4_properties p
LEFT JOIN ga4_monthly_metrics m ON p.property_id = m.property_id
WHERE p.is_active = true
ORDER BY m.metric_month DESC, p.domain;
