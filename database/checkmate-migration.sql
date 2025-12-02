-- ============================================================================
-- CHECKMATE UPTIME MONITORING INTEGRATION - DATABASE MIGRATION
-- ============================================================================
-- Version: 1.0
-- Date: 2025-12-01
-- Purpose: Add Checkmate uptime monitoring tables and extend ga4_properties
--
-- INSTRUCTIONS:
-- 1. Backup your database before running this migration
-- 2. Run in Supabase SQL Editor: https://supabase.com/dashboard
-- 3. Verify all tables created successfully
-- 4. Run test queries at the end to confirm
-- ============================================================================

-- ============================================================================
-- STEP 1: Extend ga4_properties table with Checkmate columns
-- ============================================================================

-- Add Checkmate-specific columns to existing ga4_properties table
ALTER TABLE ga4_properties
ADD COLUMN IF NOT EXISTS checkmate_monitor_id TEXT,
ADD COLUMN IF NOT EXISTS checkmate_monitor_url TEXT,
ADD COLUMN IF NOT EXISTS checkmate_monitor_type TEXT DEFAULT 'pagespeed',
ADD COLUMN IF NOT EXISTS checkmate_last_synced TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ga4_properties_checkmate_monitor
ON ga4_properties(checkmate_monitor_id);

COMMENT ON COLUMN ga4_properties.checkmate_monitor_id IS 'Checkmate monitor ID (e.g., "692e438c47e2486ff00a009d")';
COMMENT ON COLUMN ga4_properties.checkmate_monitor_url IS 'Full monitor URL from Checkmate (e.g., "https://vetcelerator.com")';
COMMENT ON COLUMN ga4_properties.checkmate_monitor_type IS 'Monitor type: pagespeed, uptime, ssl, etc.';
COMMENT ON COLUMN ga4_properties.checkmate_last_synced IS 'Last time uptime data was synced for this domain';

-- ============================================================================
-- STEP 2: Create checkmate_metrics table (daily uptime snapshots)
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkmate_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    domain TEXT NOT NULL,
    monitor_id TEXT NOT NULL,
    monitor_name TEXT,
    monitor_url TEXT,
    monitor_type TEXT DEFAULT 'pagespeed',

    -- Uptime percentages
    uptime_1_day DECIMAL(5,2) CHECK (uptime_1_day >= 0 AND uptime_1_day <= 100),
    uptime_7_day DECIMAL(5,2) CHECK (uptime_7_day >= 0 AND uptime_7_day <= 100),
    uptime_30_day DECIMAL(5,2) CHECK (uptime_30_day >= 0 AND uptime_30_day <= 100),
    uptime_90_day DECIMAL(5,2) CHECK (uptime_90_day >= 0 AND uptime_90_day <= 100),

    -- Monitor status
    monitor_status BOOLEAN DEFAULT true,
    status_message TEXT,

    -- Health score (calculated: excellent, good, warning, critical)
    health_score TEXT CHECK (health_score IN ('excellent', 'good', 'warning', 'critical')),

    -- Metadata
    metric_date DATE NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    is_stale BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(domain, metric_date),
    FOREIGN KEY (domain) REFERENCES ga4_properties(domain) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_domain ON checkmate_metrics(domain);
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_date ON checkmate_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_monitor ON checkmate_metrics(monitor_id);
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_health ON checkmate_metrics(health_score);
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_stale ON checkmate_metrics(is_stale) WHERE is_stale = true;
CREATE INDEX IF NOT EXISTS idx_checkmate_metrics_status ON checkmate_metrics(monitor_status);

-- Comments
COMMENT ON TABLE checkmate_metrics IS 'Daily snapshots of uptime metrics from Checkmate API';
COMMENT ON COLUMN checkmate_metrics.uptime_1_day IS 'Uptime percentage for last 1 day (0-100)';
COMMENT ON COLUMN checkmate_metrics.uptime_7_day IS 'Uptime percentage for last 7 days (0-100)';
COMMENT ON COLUMN checkmate_metrics.uptime_30_day IS 'Uptime percentage for last 30 days (0-100)';
COMMENT ON COLUMN checkmate_metrics.uptime_90_day IS 'Uptime percentage for last 90 days (0-100)';
COMMENT ON COLUMN checkmate_metrics.health_score IS 'Calculated health: excellent (>99.9%), good (>99.5%), warning (>98%), critical (<98%)';
COMMENT ON COLUMN checkmate_metrics.is_stale IS 'True if data is older than 48 hours';

-- ============================================================================
-- STEP 3: Create checkmate_auth_tokens table (token caching)
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkmate_auth_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    token TEXT NOT NULL,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Index for active token lookup
CREATE INDEX IF NOT EXISTS idx_checkmate_tokens_active
ON checkmate_auth_tokens(is_active, expires_at) WHERE is_active = true;

-- Partial unique index to enforce only one active token at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkmate_tokens_unique_active
ON checkmate_auth_tokens(is_active) WHERE is_active = true;

COMMENT ON TABLE checkmate_auth_tokens IS 'Cached Checkmate API authentication tokens (2-hour expiry)';
COMMENT ON COLUMN checkmate_auth_tokens.expires_at IS 'Token expiration time (set to 90 minutes after creation)';
COMMENT ON COLUMN checkmate_auth_tokens.is_active IS 'Only one token can be active at a time';

-- ============================================================================
-- STEP 4: Create checkmate_sync_logs table (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkmate_sync_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_type TEXT NOT NULL CHECK (sync_type IN ('daily_uptime', 'monitor_sync', 'manual_sync')),
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'failed', 'partial')),

    -- Sync details
    monitors_found INTEGER DEFAULT 0,
    monitors_matched INTEGER DEFAULT 0,
    monitors_failed INTEGER DEFAULT 0,
    domains_updated INTEGER DEFAULT 0,

    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,

    -- Error tracking
    error_message TEXT,
    error_details JSONB,

    -- Metadata
    triggered_by TEXT DEFAULT 'system',
    sync_parameters JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_checkmate_sync_logs_status ON checkmate_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_checkmate_sync_logs_date ON checkmate_sync_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkmate_sync_logs_type ON checkmate_sync_logs(sync_type);

COMMENT ON TABLE checkmate_sync_logs IS 'Audit log for all Checkmate sync operations';
COMMENT ON COLUMN checkmate_sync_logs.sync_type IS 'Type: daily_uptime, monitor_sync, manual_sync';
COMMENT ON COLUMN checkmate_sync_logs.status IS 'Status: in_progress, completed, failed, partial';
COMMENT ON COLUMN checkmate_sync_logs.duration_seconds IS 'Total sync duration in seconds';

-- ============================================================================
-- STEP 5: Create helper functions
-- ============================================================================

-- Function to calculate health score based on uptime
CREATE OR REPLACE FUNCTION calculate_health_score(uptime_30 DECIMAL)
RETURNS TEXT AS $$
BEGIN
    IF uptime_30 IS NULL THEN
        RETURN 'unknown';
    ELSIF uptime_30 >= 99.9 THEN
        RETURN 'excellent';
    ELSIF uptime_30 >= 99.5 THEN
        RETURN 'good';
    ELSIF uptime_30 >= 98.0 THEN
        RETURN 'warning';
    ELSE
        RETURN 'critical';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_health_score IS 'Calculate health score: excellent (≥99.9%), good (≥99.5%), warning (≥98%), critical (<98%)';

-- Function to mark stale data (older than 48 hours)
CREATE OR REPLACE FUNCTION mark_stale_checkmate_data()
RETURNS void AS $$
BEGIN
    UPDATE checkmate_metrics
    SET is_stale = true
    WHERE fetched_at < NOW() - INTERVAL '48 hours'
      AND is_stale = false;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION mark_stale_checkmate_data IS 'Mark metrics as stale if older than 48 hours';

-- Function to invalidate expired tokens
CREATE OR REPLACE FUNCTION invalidate_expired_tokens()
RETURNS void AS $$
BEGIN
    UPDATE checkmate_auth_tokens
    SET is_active = false
    WHERE expires_at < NOW()
      AND is_active = true;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION invalidate_expired_tokens IS 'Deactivate tokens that have passed their expiration time';

-- ============================================================================
-- STEP 6: Create triggers for auto-updating timestamps
-- ============================================================================

-- Trigger to update updated_at on checkmate_metrics
CREATE OR REPLACE FUNCTION update_checkmate_metrics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_checkmate_metrics_timestamp
BEFORE UPDATE ON checkmate_metrics
FOR EACH ROW
EXECUTE FUNCTION update_checkmate_metrics_timestamp();

-- Trigger to auto-calculate health score on insert/update
CREATE OR REPLACE FUNCTION auto_calculate_health_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.health_score = calculate_health_score(NEW.uptime_30_day);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_health_score
BEFORE INSERT OR UPDATE ON checkmate_metrics
FOR EACH ROW
EXECUTE FUNCTION auto_calculate_health_score();

-- ============================================================================
-- STEP 7: Create views for common queries
-- ============================================================================

-- View: Latest uptime metrics per domain
CREATE OR REPLACE VIEW v_latest_uptime AS
SELECT DISTINCT ON (domain)
    domain,
    monitor_id,
    monitor_name,
    uptime_1_day,
    uptime_7_day,
    uptime_30_day,
    uptime_90_day,
    monitor_status,
    health_score,
    metric_date,
    fetched_at,
    is_stale
FROM checkmate_metrics
ORDER BY domain, metric_date DESC, fetched_at DESC;

COMMENT ON VIEW v_latest_uptime IS 'Latest uptime metrics for each domain';

-- View: Combined GA4 + Checkmate data
CREATE OR REPLACE VIEW v_domain_health_overview AS
SELECT
    p.domain,
    p.property_id AS ga4_property_id,
    p.checkmate_monitor_id,
    p.is_active,
    u.uptime_30_day,
    u.health_score,
    u.monitor_status,
    u.metric_date AS last_uptime_check,
    u.is_stale AS uptime_data_stale,
    p.checkmate_last_synced
FROM ga4_properties p
LEFT JOIN v_latest_uptime u ON p.domain = u.domain
WHERE p.is_active = true;

COMMENT ON VIEW v_domain_health_overview IS 'Combined view of GA4 properties with latest Checkmate uptime data';

-- View: Health summary statistics
CREATE OR REPLACE VIEW v_health_summary AS
SELECT
    health_score,
    COUNT(*) AS domain_count,
    ROUND(AVG(uptime_30_day), 2) AS avg_uptime_30d,
    ROUND(MIN(uptime_30_day), 2) AS min_uptime_30d,
    ROUND(MAX(uptime_30_day), 2) AS max_uptime_30d
FROM v_latest_uptime
WHERE uptime_30_day IS NOT NULL
GROUP BY health_score
ORDER BY
    CASE health_score
        WHEN 'excellent' THEN 1
        WHEN 'good' THEN 2
        WHEN 'warning' THEN 3
        WHEN 'critical' THEN 4
        ELSE 5
    END;

COMMENT ON VIEW v_health_summary IS 'Summary statistics grouped by health score category';

-- ============================================================================
-- STEP 8: Insert sample/test data (optional, for development)
-- ============================================================================

-- Uncomment to insert sample data for testing
/*
INSERT INTO checkmate_metrics (
    domain, monitor_id, monitor_name, monitor_url,
    uptime_1_day, uptime_7_day, uptime_30_day, uptime_90_day,
    monitor_status, metric_date
) VALUES
    ('vetcelerator.com', 'test123', 'Vetcelerator', 'https://vetcelerator.com',
     100.00, 100.00, 99.95, 99.87, true, CURRENT_DATE),
    ('example-vet.com', 'test456', 'Example Vet', 'https://example-vet.com',
     99.80, 99.50, 98.90, 98.50, true, CURRENT_DATE)
ON CONFLICT (domain, metric_date) DO NOTHING;
*/

-- ============================================================================
-- STEP 9: Grant permissions (adjust based on your Supabase setup)
-- ============================================================================

-- Grant SELECT on views to anon and authenticated roles
GRANT SELECT ON v_latest_uptime TO anon, authenticated;
GRANT SELECT ON v_domain_health_overview TO anon, authenticated;
GRANT SELECT ON v_health_summary TO anon, authenticated;

-- Grant full access to service_role (used by API endpoints)
GRANT ALL ON checkmate_metrics TO service_role;
GRANT ALL ON checkmate_auth_tokens TO service_role;
GRANT ALL ON checkmate_sync_logs TO service_role;

-- ============================================================================
-- STEP 10: Verification queries
-- ============================================================================

-- Run these queries to verify migration success

-- 1. Check if tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'checkmate%'
ORDER BY table_name;

-- 2. Check if columns added to ga4_properties
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ga4_properties'
  AND column_name LIKE 'checkmate%'
ORDER BY column_name;

-- 3. Check if indexes created
SELECT indexname
FROM pg_indexes
WHERE tablename LIKE 'checkmate%'
ORDER BY tablename, indexname;

-- 4. Check if views created
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%'
ORDER BY table_name;

-- 5. Check if functions created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%checkmate%'
ORDER BY routine_name;

-- 6. Check if triggers created
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%checkmate%'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- MAINTENANCE QUERIES (save for later use)
-- ============================================================================

-- Mark stale data (run daily via cron or manually)
-- SELECT mark_stale_checkmate_data();

-- Invalidate expired tokens (run periodically)
-- SELECT invalidate_expired_tokens();

-- View sync history for last 7 days
-- SELECT
--     sync_type,
--     status,
--     monitors_found,
--     monitors_matched,
--     monitors_failed,
--     duration_seconds,
--     started_at
-- FROM checkmate_sync_logs
-- WHERE started_at > NOW() - INTERVAL '7 days'
-- ORDER BY started_at DESC;

-- View domains with critical health
-- SELECT domain, uptime_30_day, health_score, metric_date
-- FROM v_latest_uptime
-- WHERE health_score = 'critical'
-- ORDER BY uptime_30_day ASC;

-- View domains missing Checkmate monitor IDs
-- SELECT domain, property_id, is_active
-- FROM ga4_properties
-- WHERE is_active = true
--   AND (checkmate_monitor_id IS NULL OR checkmate_monitor_id = '')
-- ORDER BY domain;

-- ============================================================================
-- ROLLBACK SCRIPT (use only if you need to undo this migration)
-- ============================================================================

/*
-- WARNING: This will delete all Checkmate data!
-- Uncomment and run only if you need to completely remove Checkmate integration

DROP VIEW IF EXISTS v_health_summary;
DROP VIEW IF EXISTS v_domain_health_overview;
DROP VIEW IF EXISTS v_latest_uptime;

DROP TRIGGER IF EXISTS trigger_auto_health_score ON checkmate_metrics;
DROP TRIGGER IF EXISTS trigger_update_checkmate_metrics_timestamp ON checkmate_metrics;

DROP FUNCTION IF EXISTS auto_calculate_health_score();
DROP FUNCTION IF EXISTS update_checkmate_metrics_timestamp();
DROP FUNCTION IF EXISTS invalidate_expired_tokens();
DROP FUNCTION IF EXISTS mark_stale_checkmate_data();
DROP FUNCTION IF EXISTS calculate_health_score(DECIMAL);

DROP TABLE IF EXISTS checkmate_sync_logs;
DROP TABLE IF EXISTS checkmate_auth_tokens;
DROP TABLE IF EXISTS checkmate_metrics;

ALTER TABLE ga4_properties
DROP COLUMN IF EXISTS checkmate_monitor_id,
DROP COLUMN IF EXISTS checkmate_monitor_url,
DROP COLUMN IF EXISTS checkmate_monitor_type,
DROP COLUMN IF EXISTS checkmate_last_synced;
*/

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Migration completed successfully!
-- Next steps:
-- 1. Verify all tables/views/functions created (use verification queries above)
-- 2. Add Checkmate credentials to environment variables
-- 3. Run initial monitor sync: POST /api/checkmate/sync-monitors
-- 4. Run initial metrics fetch: POST /api/checkmate/fetch-metrics
-- 5. Verify data in checkmate_metrics table
