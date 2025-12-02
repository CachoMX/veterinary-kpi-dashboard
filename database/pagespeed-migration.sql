-- ============================================================
-- Google PageSpeed Insights Integration - Database Migration
-- ============================================================
-- Creates tables to store PageSpeed metrics including:
-- - Page Load Speed
-- - Core Web Vitals (LCP, FID, CLS)
-- - Mobile & Desktop Performance Scores
-- ============================================================

-- ============================================================
-- 1. PageSpeed Metrics Table
-- ============================================================
-- Stores daily PageSpeed metrics for each domain
CREATE TABLE IF NOT EXISTS pagespeed_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL,

    -- Device type: 'mobile' or 'desktop'
    device_type TEXT NOT NULL CHECK (device_type IN ('mobile', 'desktop')),

    -- Performance Score (0-100)
    performance_score INTEGER CHECK (performance_score >= 0 AND performance_score <= 100),

    -- Page Load Metrics (in milliseconds)
    first_contentful_paint INTEGER, -- FCP
    speed_index INTEGER,
    largest_contentful_paint INTEGER, -- LCP (Core Web Vital)
    time_to_interactive INTEGER, -- TTI
    total_blocking_time INTEGER, -- TBT
    cumulative_layout_shift DECIMAL(5,3), -- CLS (Core Web Vital, 0.0-1.0)

    -- First Input Delay (FID) - Core Web Vital (in milliseconds)
    first_input_delay INTEGER,

    -- Overall page load time (in seconds)
    page_load_time DECIMAL(6,2),

    -- Opportunities and diagnostics counts
    opportunities_count INTEGER DEFAULT 0,
    diagnostics_count INTEGER DEFAULT 0,

    -- Metadata
    metric_date DATE NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    lighthouse_version TEXT,

    -- Foreign key to ga4_properties
    CONSTRAINT fk_pagespeed_domain
        FOREIGN KEY (domain)
        REFERENCES ga4_properties(domain)
        ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Unique constraint: one entry per domain, device, and date
    UNIQUE(domain, device_type, metric_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_pagespeed_domain ON pagespeed_metrics(domain);
CREATE INDEX IF NOT EXISTS idx_pagespeed_date ON pagespeed_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_pagespeed_device ON pagespeed_metrics(device_type);
CREATE INDEX IF NOT EXISTS idx_pagespeed_score ON pagespeed_metrics(performance_score DESC);
CREATE INDEX IF NOT EXISTS idx_pagespeed_domain_date ON pagespeed_metrics(domain, metric_date DESC);

-- ============================================================
-- 2. Core Web Vitals Summary View
-- ============================================================
-- Aggregates latest Core Web Vitals for easy querying
CREATE OR REPLACE VIEW vw_core_web_vitals_latest AS
SELECT
    domain,
    device_type,
    metric_date,

    -- Core Web Vitals
    largest_contentful_paint as lcp_ms,
    CASE
        WHEN largest_contentful_paint <= 2500 THEN 'good'
        WHEN largest_contentful_paint <= 4000 THEN 'needs_improvement'
        ELSE 'poor'
    END as lcp_rating,

    first_input_delay as fid_ms,
    CASE
        WHEN first_input_delay <= 100 THEN 'good'
        WHEN first_input_delay <= 300 THEN 'needs_improvement'
        ELSE 'poor'
    END as fid_rating,

    cumulative_layout_shift as cls_score,
    CASE
        WHEN cumulative_layout_shift <= 0.1 THEN 'good'
        WHEN cumulative_layout_shift <= 0.25 THEN 'needs_improvement'
        ELSE 'poor'
    END as cls_rating,

    -- Overall CWV pass rate (all 3 must be 'good')
    CASE
        WHEN largest_contentful_paint <= 2500
         AND first_input_delay <= 100
         AND cumulative_layout_shift <= 0.1
        THEN true
        ELSE false
    END as passes_core_web_vitals,

    performance_score,
    page_load_time,
    fetched_at
FROM pagespeed_metrics
WHERE (domain, device_type, metric_date) IN (
    SELECT domain, device_type, MAX(metric_date)
    FROM pagespeed_metrics
    GROUP BY domain, device_type
);

-- ============================================================
-- 3. Performance Score Summary View
-- ============================================================
-- Shows mobile vs desktop performance comparison
CREATE OR REPLACE VIEW vw_performance_scores AS
SELECT
    domain,
    MAX(CASE WHEN device_type = 'mobile' THEN performance_score END) as mobile_score,
    MAX(CASE WHEN device_type = 'desktop' THEN performance_score END) as desktop_score,
    MAX(CASE WHEN device_type = 'mobile' THEN page_load_time END) as mobile_load_time,
    MAX(CASE WHEN device_type = 'desktop' THEN page_load_time END) as desktop_load_time,
    MAX(metric_date) as latest_date,
    MAX(fetched_at) as last_fetched
FROM pagespeed_metrics
GROUP BY domain;

-- ============================================================
-- 4. PageSpeed Sync Logs
-- ============================================================
-- Track PageSpeed API fetch operations
CREATE TABLE IF NOT EXISTS pagespeed_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('daily_pagespeed', 'manual_pagespeed', 'on_demand')),
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed', 'partial')),

    -- Metrics
    domains_processed INTEGER DEFAULT 0,
    mobile_metrics_fetched INTEGER DEFAULT 0,
    desktop_metrics_fetched INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,

    -- Error details
    error_domains JSONB,
    error_message TEXT,

    -- Metadata
    triggered_by TEXT DEFAULT 'system',
    sync_parameters JSONB,

    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagespeed_sync_date ON pagespeed_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pagespeed_sync_status ON pagespeed_sync_logs(status);

-- ============================================================
-- 5. Helper Functions
-- ============================================================

-- Function to calculate overall page health score (0-100)
CREATE OR REPLACE FUNCTION calculate_page_health_score(
    p_performance_score INTEGER,
    p_lcp INTEGER,
    p_fid INTEGER,
    p_cls DECIMAL
) RETURNS INTEGER AS $$
DECLARE
    health_score INTEGER;
    cwv_score INTEGER;
BEGIN
    -- Calculate Core Web Vitals score (0-100)
    cwv_score := 0;

    -- LCP contribution (33.3%)
    IF p_lcp <= 2500 THEN
        cwv_score := cwv_score + 33;
    ELSIF p_lcp <= 4000 THEN
        cwv_score := cwv_score + 17;
    END IF;

    -- FID contribution (33.3%)
    IF p_fid <= 100 THEN
        cwv_score := cwv_score + 33;
    ELSIF p_fid <= 300 THEN
        cwv_score := cwv_score + 17;
    END IF;

    -- CLS contribution (33.3%)
    IF p_cls <= 0.1 THEN
        cwv_score := cwv_score + 34;
    ELSIF p_cls <= 0.25 THEN
        cwv_score := cwv_score + 17;
    END IF;

    -- Weighted average: 60% performance score, 40% CWV score
    health_score := ROUND((p_performance_score * 0.6) + (cwv_score * 0.4));

    RETURN health_score;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get performance rating
CREATE OR REPLACE FUNCTION get_performance_rating(score INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN score >= 90 THEN 'excellent'
        WHEN score >= 50 THEN 'good'
        ELSE 'poor'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 6. Triggers
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pagespeed_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pagespeed_metrics_updated_at
    BEFORE UPDATE ON pagespeed_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_pagespeed_updated_at();

-- ============================================================
-- 7. Sample Queries for Testing
-- ============================================================

-- View latest performance scores for all domains
-- SELECT * FROM vw_performance_scores ORDER BY mobile_score DESC LIMIT 10;

-- View Core Web Vitals status
-- SELECT * FROM vw_core_web_vitals_latest WHERE device_type = 'mobile';

-- Check domains failing Core Web Vitals
-- SELECT domain, lcp_rating, fid_rating, cls_rating
-- FROM vw_core_web_vitals_latest
-- WHERE NOT passes_core_web_vitals;

-- Average performance scores
-- SELECT
--     AVG(mobile_score) as avg_mobile,
--     AVG(desktop_score) as avg_desktop
-- FROM vw_performance_scores;

COMMENT ON TABLE pagespeed_metrics IS 'Stores Google PageSpeed Insights metrics including Core Web Vitals, performance scores, and page load times';
COMMENT ON TABLE pagespeed_sync_logs IS 'Tracks PageSpeed API sync operations and errors';
COMMENT ON VIEW vw_core_web_vitals_latest IS 'Latest Core Web Vitals (LCP, FID, CLS) with pass/fail ratings';
COMMENT ON VIEW vw_performance_scores IS 'Mobile vs Desktop performance score comparison';
