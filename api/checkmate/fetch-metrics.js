// API endpoint to fetch and cache Checkmate uptime metrics
// POST /api/checkmate/fetch-metrics
const { createClient } = require('@supabase/supabase-js');
const checkmateService = require('./checkmate-service');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Authentication check
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.CHECKMATE_SYNC_SECRET || process.env.SYNC_SECRET_KEY;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid or missing Bearer token'
        });
    }

    try {
        const {
            date, // Format: YYYY-MM-DD (defaults to today)
            forceRefresh = false,
            domains = [] // Optional: specific domains to sync
        } = req.method === 'POST' ? req.body : req.query;

        // Default to today if not specified
        const targetDate = date || new Date().toISOString().split('T')[0];

        console.log(`Fetching Checkmate uptime metrics for ${targetDate}`);
        console.log(`Force refresh: ${forceRefresh}`);

        // Start sync log
        const syncStartTime = Date.now();
        const { data: syncLog, error: syncLogError} = await supabase
            .from('checkmate_sync_logs')
            .insert({
                sync_type: 'daily_uptime',
                status: 'in_progress',
                triggered_by: req.method === 'POST' ? 'api' : 'manual',
                sync_parameters: { date: targetDate, forceRefresh, domains }
            })
            .select()
            .single();

        if (syncLogError) {
            console.error('Failed to create sync log:', syncLogError);
        }

        // Fetch active properties with Checkmate monitoring enabled
        let propertiesQuery = supabase
            .from('ga4_properties')
            .select('*')
            .eq('is_active', true)
            .not('checkmate_monitor_id', 'is', null);

        // Filter by specific domains if requested
        if (domains && domains.length > 0) {
            propertiesQuery = propertiesQuery.in('domain', domains);
        }

        const { data: properties, error: propertiesError } = await propertiesQuery;

        if (propertiesError) {
            throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
        }

        if (!properties || properties.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active domains with Checkmate monitoring configured. Run /api/checkmate/sync-monitors first.'
            });
        }

        console.log(`Found ${properties.length} domains with Checkmate monitoring enabled`);

        // Check for existing cached data (24-hour cache)
        if (!forceRefresh) {
            const { data: existingMetrics } = await supabase
                .from('checkmate_metrics')
                .select('*')
                .eq('metric_date', targetDate)
                .gte('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (existingMetrics && existingMetrics.length === properties.length) {
                console.log('Using cached metrics (less than 24 hours old)');

                // Update sync log
                if (syncLog) {
                    await supabase
                        .from('checkmate_sync_logs')
                        .update({
                            status: 'completed',
                            monitors_synced: properties.length,
                            metrics_updated: 0,
                            completed_at: new Date().toISOString(),
                            duration_seconds: Math.floor((Date.now() - syncStartTime) / 1000)
                        })
                        .eq('id', syncLog.id);
                }

                return res.status(200).json({
                    success: true,
                    data: existingMetrics.map(formatMetricForDisplay),
                    summary: {
                        total: properties.length,
                        successful: properties.length,
                        failed: 0,
                        cached: properties.length
                    },
                    cached: true,
                    message: 'Using cached data (less than 24 hours old)',
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Fetch fresh uptime data from Checkmate API
        console.log('Fetching fresh data from Checkmate API...');

        const results = [];
        let successCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const property of properties) {
            try {
                console.log(`Fetching uptime for ${property.domain} (Monitor ID: ${property.checkmate_monitor_id})`);

                // Fetch uptime data for this monitor
                const uptimeData = await checkmateService.getMonitorUptime(property.checkmate_monitor_id);

                // Get monitor details
                const monitors = await checkmateService.getAllMonitors();
                const monitor = monitors.find(m => m.id === property.checkmate_monitor_id);

                // Prepare data for database
                // Calculate health score based on 30-day uptime
                const uptime30 = parseFloat(uptimeData.uptime?.['30d'] || uptimeData.uptime?.['30day'] || 0);
                let healthScore = 'critical';
                if (uptime30 >= 99.9) healthScore = 'excellent';
                else if (uptime30 >= 99.5) healthScore = 'good';
                else if (uptime30 >= 98) healthScore = 'warning';

                const metricData = {
                    domain: property.domain,
                    monitor_id: property.checkmate_monitor_id,
                    monitor_name: monitor?.name || property.domain,
                    monitor_url: property.checkmate_monitor_url,
                    monitor_type: property.checkmate_monitor_type || 'pagespeed',
                    metric_date: targetDate,

                    // Uptime percentages
                    uptime_1_day: parseFloat(uptimeData.uptime?.['1d'] || uptimeData.uptime?.['1day'] || 0),
                    uptime_7_day: parseFloat(uptimeData.uptime?.['7d'] || uptimeData.uptime?.['7day'] || 0),
                    uptime_30_day: uptime30,
                    uptime_90_day: parseFloat(uptimeData.uptime?.['90d'] || uptimeData.uptime?.['90day'] || 0),

                    // Monitor status
                    monitor_status: monitor?.status || true,
                    status_message: monitor?.statusMessage || null,

                    // Health score
                    health_score: healthScore,

                    // Cache metadata
                    fetched_at: new Date().toISOString(),
                    is_stale: false
                };

                // Upsert to database
                const { data: savedMetric, error: saveError } = await supabase
                    .from('checkmate_metrics')
                    .upsert(metricData, {
                        onConflict: 'domain,metric_date'
                    })
                    .select()
                    .single();

                if (saveError) {
                    console.error(`Failed to save metrics for ${property.domain}:`, saveError);
                    errorCount++;
                    errors.push({
                        domain: property.domain,
                        error: saveError.message
                    });
                } else {
                    console.log(`Successfully saved metrics for ${property.domain}`);

                    // Update last sync time on property
                    await supabase
                        .from('ga4_properties')
                        .update({ checkmate_last_synced: new Date().toISOString() })
                        .eq('domain', property.domain);

                    results.push(formatMetricForDisplay(savedMetric));
                    successCount++;
                }

            } catch (error) {
                console.error(`Error fetching metrics for ${property.domain}:`, error.message);
                errorCount++;
                errors.push({
                    domain: property.domain,
                    error: error.message
                });
            }
        }

        // Update sync log
        if (syncLog) {
            const duration = Math.floor((Date.now() - syncStartTime) / 1000);
            await supabase
                .from('checkmate_sync_logs')
                .update({
                    status: errorCount > 0 && successCount === 0 ? 'failed' : 'completed',
                    monitors_synced: successCount,
                    metrics_updated: successCount,
                    error_message: errorCount > 0 ? `${errorCount} domains failed to sync` : null,
                    error_details: errors.length > 0 ? errors : null,
                    completed_at: new Date().toISOString(),
                    duration_seconds: duration
                })
                .eq('id', syncLog.id);
        }

        res.status(200).json({
            success: true,
            data: results,
            summary: {
                total: properties.length,
                successful: successCount,
                failed: errorCount,
                cached: 0,
                date: targetDate
            },
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Checkmate fetch metrics error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Format metric data for API response
 */
function formatMetricForDisplay(metric) {
    return {
        domain: metric.domain,
        monitorId: metric.monitor_id,
        monitorName: metric.monitor_name,
        date: metric.metric_date,
        uptime: {
            '1day': parseFloat(metric.uptime_1_day || 0),
            '7day': parseFloat(metric.uptime_7_day || 0),
            '30day': parseFloat(metric.uptime_30_day || 0),
            '90day': parseFloat(metric.uptime_90_day || 0)
        },
        status: metric.monitor_status,
        healthScore: metric.health_score,
        fetchedAt: metric.fetched_at,
        isStale: metric.is_stale || false
    };
}
