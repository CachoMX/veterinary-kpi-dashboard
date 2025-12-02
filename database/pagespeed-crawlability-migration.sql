-- ============================================================
-- PageSpeed Crawlability Extension - Database Migration
-- ============================================================
-- Adds SEO and crawlability metrics to pagespeed_metrics table
-- ============================================================

-- Add crawlability columns to existing pagespeed_metrics table
ALTER TABLE pagespeed_metrics
ADD COLUMN IF NOT EXISTS is_crawlable INTEGER CHECK (is_crawlable >= 0 AND is_crawlable <= 100),
ADD COLUMN IF NOT EXISTS crawlable_blocking_directives INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS http_status_valid INTEGER CHECK (http_status_valid >= 0 AND http_status_valid <= 100),
ADD COLUMN IF NOT EXISTS robots_txt_valid INTEGER CHECK (robots_txt_valid >= 0 AND robots_txt_valid <= 100),
ADD COLUMN IF NOT EXISTS mobile_friendly INTEGER CHECK (mobile_friendly >= 0 AND mobile_friendly <= 100);

-- Add index for crawlability queries
CREATE INDEX IF NOT EXISTS idx_pagespeed_crawlable ON pagespeed_metrics(is_crawlable);

-- ============================================================
-- Crawlability Summary View
-- ============================================================
CREATE OR REPLACE VIEW vw_crawlability_summary AS
SELECT
    domain,
    metric_date,

    -- Crawlability percentage (average across device types if both exist)
    ROUND(AVG(is_crawlable)) as crawlability_percentage,

    -- Count blocking directives
    MAX(crawlable_blocking_directives) as blocking_directives_count,

    -- HTTP status validity
    ROUND(AVG(http_status_valid)) as http_status_percentage,

    -- Robots.txt validity
    ROUND(AVG(robots_txt_valid)) as robots_txt_percentage,

    -- Mobile friendly
    ROUND(AVG(mobile_friendly)) as mobile_friendly_percentage,

    -- Overall crawlability health
    CASE
        WHEN AVG(is_crawlable) = 100
         AND AVG(http_status_valid) = 100
         AND MAX(crawlable_blocking_directives) = 0
        THEN 'excellent'
        WHEN AVG(is_crawlable) >= 90 THEN 'good'
        WHEN AVG(is_crawlable) >= 50 THEN 'warning'
        ELSE 'critical'
    END as crawlability_health,

    MAX(fetched_at) as last_checked

FROM pagespeed_metrics
WHERE is_crawlable IS NOT NULL
GROUP BY domain, metric_date
ORDER BY metric_date DESC, domain;

-- ============================================================
-- Monthly Crawlability Trend View
-- ============================================================
CREATE OR REPLACE VIEW vw_crawlability_monthly AS
SELECT
    domain,
    DATE_TRUNC('month', metric_date) as month,

    -- Monthly average crawlability
    ROUND(AVG(is_crawlable)) as avg_crawlability,

    -- Count of issues
    SUM(crawlable_blocking_directives) as total_blocking_directives,

    -- Days with 100% crawlability
    COUNT(*) FILTER (WHERE is_crawlable = 100) as days_fully_crawlable,
    COUNT(*) as total_days_measured,

    -- Percentage of days with full crawlability
    ROUND(
        (COUNT(*) FILTER (WHERE is_crawlable = 100)::DECIMAL / COUNT(*)) * 100,
        2
    ) as crawlability_reliability

FROM pagespeed_metrics
WHERE is_crawlable IS NOT NULL
GROUP BY domain, DATE_TRUNC('month', metric_date)
ORDER BY month DESC, domain;

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON COLUMN pagespeed_metrics.is_crawlable IS
'Percentage score (0-100) indicating if page is crawlable. 100 = fully crawlable, 0 = blocked';

COMMENT ON COLUMN pagespeed_metrics.crawlable_blocking_directives IS
'Number of directives blocking crawlers (robots.txt, meta robots, X-Robots-Tag)';

COMMENT ON COLUMN pagespeed_metrics.http_status_valid IS
'Percentage score (0-100) indicating HTTP status validity. 100 = 200 OK, 0 = error status';

COMMENT ON COLUMN pagespeed_metrics.robots_txt_valid IS
'Percentage score (0-100) indicating robots.txt validity. 100 = valid, 0 = invalid/missing';

COMMENT ON COLUMN pagespeed_metrics.mobile_friendly IS
'Percentage score (0-100) indicating mobile-friendliness. 100 = fully mobile-friendly';

COMMENT ON VIEW vw_crawlability_summary IS
'Daily crawlability summary per domain with health assessment';

COMMENT ON VIEW vw_crawlability_monthly IS
'Monthly crawlability trends with reliability metrics';
