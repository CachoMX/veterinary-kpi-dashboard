// API endpoint to retrieve cached Checkmate uptime metrics
// GET /api/checkmate/get-uptime-kpis
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const {
            date, // Format: YYYY-MM-DD (defaults to latest)
            domain, // Optional: filter by specific domain
            timeRange = '30' // 1, 7, 30, 90 (which uptime metric to highlight)
        } = req.query;

        console.log(`Fetching uptime KPIs${date ? ` for ${date}` : ' (latest)'}${domain ? ` (domain: ${domain})` : ''}`);

        // Determine target date
        let targetDate = date;

        if (!targetDate) {
            // Get the latest metric_date from the table
            const { data: latestMetric } = await supabase
                .from('checkmate_metrics')
                .select('metric_date')
                .order('metric_date', { ascending: false })
                .limit(1)
                .single();

            if (latestMetric) {
                targetDate = latestMetric.metric_date;
            } else {
                targetDate = new Date().toISOString().split('T')[0];
            }
        }

        console.log(`Target date: ${targetDate}`);

        // Fetch metrics for the target date
        let metricsQuery = supabase
            .from('checkmate_metrics')
            .select('*')
            .eq('metric_date', targetDate)
            .order('domain', { ascending: true });

        if (domain) {
            metricsQuery = metricsQuery.eq('domain', domain);
        }

        const { data: metrics, error: metricsError } = await metricsQuery;

        if (metricsError) {
            throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
        }

        // If no metrics found, return empty state
        if (!metrics || metrics.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    metrics: [],
                    summary: {
                        totalDomains: 0,
                        date: targetDate,
                        hasData: false
                    }
                },
                message: `No uptime metrics found for ${targetDate}. Run /api/checkmate/fetch-metrics to sync data.`,
                timestamp: new Date().toISOString()
            });
        }

        // Calculate summary statistics
        const summary = calculateSummary(metrics, parseInt(timeRange));

        // Format metrics for display
        const formattedMetrics = metrics.map(metric => formatMetricForDisplay(metric, parseInt(timeRange)));

        // Return response
        res.status(200).json({
            success: true,
            data: {
                metrics: formattedMetrics,
                summary,
                date: targetDate,
                timeRange: parseInt(timeRange)
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get uptime KPIs error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Format metric data for dashboard display
 */
function formatMetricForDisplay(metric, timeRange) {
    const uptime = {
        '1day': parseFloat(metric.uptime_1_day || 0),
        '7day': parseFloat(metric.uptime_7_day || 0),
        '30day': parseFloat(metric.uptime_30_day || 0),
        '90day': parseFloat(metric.uptime_90_day || 0)
    };

    // Determine primary uptime value based on timeRange
    let primaryUptime;
    switch (timeRange) {
        case 1:
            primaryUptime = uptime['1day'];
            break;
        case 7:
            primaryUptime = uptime['7day'];
            break;
        case 90:
            primaryUptime = uptime['90day'];
            break;
        case 30:
        default:
            primaryUptime = uptime['30day'];
    }

    return {
        domain: metric.domain,
        monitorId: metric.checkmate_monitor_id,
        monitorName: metric.checkmate_monitor_name,
        date: metric.metric_date,
        uptime,
        primaryUptime,
        status: metric.monitor_status || 'unknown',
        responseTime: metric.avg_response_time_ms,
        healthScore: calculateHealthScore(primaryUptime),
        lastCheck: metric.last_check_time,
        fetchedAt: metric.fetched_at,
        isStale: metric.is_stale || false
    };
}

/**
 * Calculate health score based on uptime percentage
 * excellent: >= 99.9%
 * good: >= 99.5%
 * warning: >= 98.0%
 * critical: < 98.0%
 */
function calculateHealthScore(uptime) {
    if (uptime >= 99.9) return 'excellent';
    if (uptime >= 99.5) return 'good';
    if (uptime >= 98.0) return 'warning';
    return 'critical';
}

/**
 * Calculate summary statistics across all domains
 */
function calculateSummary(metrics, timeRange) {
    const totalDomains = metrics.length;

    // Get the appropriate uptime field based on timeRange
    let uptimeField;
    switch (timeRange) {
        case 1:
            uptimeField = 'uptime_1_day';
            break;
        case 7:
            uptimeField = 'uptime_7_day';
            break;
        case 90:
            uptimeField = 'uptime_90_day';
            break;
        case 30:
        default:
            uptimeField = 'uptime_30_day';
    }

    // Calculate average uptime
    const totalUptime = metrics.reduce((sum, m) => sum + parseFloat(m[uptimeField] || 0), 0);
    const averageUptime = totalDomains > 0 ? parseFloat((totalUptime / totalDomains).toFixed(2)) : 0;

    // Count domains by health status
    const healthCounts = {
        excellent: 0,
        good: 0,
        warning: 0,
        critical: 0
    };

    metrics.forEach(m => {
        const uptime = parseFloat(m[uptimeField] || 0);
        const health = calculateHealthScore(uptime);
        healthCounts[health]++;
    });

    // Count domains by status
    const statusCounts = {
        up: metrics.filter(m => m.monitor_status === 'up').length,
        down: metrics.filter(m => m.monitor_status === 'down').length,
        paused: metrics.filter(m => m.monitor_status === 'paused').length,
        unknown: metrics.filter(m => !m.monitor_status || m.monitor_status === 'unknown').length
    };

    // Calculate uptime thresholds
    const domainsAbove99 = metrics.filter(m => parseFloat(m[uptimeField] || 0) >= 99.0).length;
    const domainsBelow99 = totalDomains - domainsAbove99;
    const criticalDomains = healthCounts.critical;

    // Find top and bottom performers
    const sortedByUptime = [...metrics].sort((a, b) => {
        return parseFloat(b[uptimeField] || 0) - parseFloat(a[uptimeField] || 0);
    });

    const topPerformers = sortedByUptime.slice(0, 5).map(m => ({
        domain: m.domain,
        uptime: parseFloat(m[uptimeField] || 0)
    }));

    const bottomPerformers = sortedByUptime.slice(-5).reverse().map(m => ({
        domain: m.domain,
        uptime: parseFloat(m[uptimeField] || 0)
    }));

    return {
        totalDomains,
        averageUptime,
        healthCounts,
        statusCounts,
        domainsAbove99,
        domainsBelow99,
        criticalDomains,
        topPerformers,
        bottomPerformers,
        hasData: true,
        timeRange,
        uptimeField
    };
}
