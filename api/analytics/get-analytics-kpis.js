// API endpoint to retrieve GA4 analytics KPIs for dashboard display
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
            month, // Format: YYYY-MM
            domain // Optional: filter by specific domain
        } = req.query;

        // Default to current month if not specified
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const [year, monthNum] = targetMonth.split('-');
        const startDate = `${year}-${monthNum}-01`;

        console.log(`Fetching analytics KPIs for ${targetMonth}${domain ? ` (domain: ${domain})` : ''}`);

        // Fetch monthly metrics
        let metricsQuery = supabase
            .from('ga4_monthly_metrics')
            .select('*')
            .eq('metric_month', startDate)
            .order('domain', { ascending: true });

        if (domain) {
            metricsQuery = metricsQuery.eq('domain', domain);
        }

        const { data: metrics, error: metricsError } = await metricsQuery;

        if (metricsError) {
            throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
        }

        // Fetch benchmark data
        const { data: benchmark, error: benchmarkError } = await supabase
            .from('ga4_benchmarks')
            .select('*')
            .eq('month_date', startDate)
            .single();

        if (benchmarkError && benchmarkError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Benchmark fetch error:', benchmarkError);
        }

        // If no metrics found, return empty state
        if (!metrics || metrics.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    metrics: [],
                    benchmark: null,
                    summary: {
                        totalDomains: 0,
                        month: targetMonth,
                        hasData: false
                    }
                },
                message: `No metrics found for ${targetMonth}. Run /api/analytics/fetch-ga4-metrics to sync data.`
            });
        }

        // Calculate summary statistics
        const summary = calculateSummary(metrics, benchmark);

        // Format response
        const response = {
            success: true,
            data: {
                metrics: metrics.map(formatMetricForDisplay),
                benchmark: benchmark ? formatBenchmarkForDisplay(benchmark) : null,
                summary,
                month: targetMonth
            },
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Get analytics KPIs error:', error);
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
function formatMetricForDisplay(metric) {
    return {
        domain: metric.domain,
        propertyId: metric.property_id,
        month: metric.metric_month,

        // Current metrics
        current: {
            keyEvents: metric.key_events || 0,
            newUsers: metric.new_users || 0,
            activeUsers: metric.active_users || 0,
            engagementRate: parseFloat(metric.engagement_rate || 0),
            avgEngagementTime: parseFloat(metric.avg_engagement_time || 0)
        },

        // Previous year metrics
        previous: {
            keyEvents: metric.previous_year_key_events || 0,
            newUsers: metric.previous_year_new_users || 0,
            activeUsers: metric.previous_year_active_users || 0,
            engagementRate: parseFloat(metric.previous_year_engagement_rate || 0),
            avgEngagementTime: parseFloat(metric.previous_year_avg_engagement_time || 0)
        },

        // Trends (up, down, neutral)
        trends: {
            keyEvents: metric.key_events_trend || 'neutral',
            newUsers: metric.new_users_trend || 'neutral',
            activeUsers: metric.active_users_trend || 'neutral',
            engagementRate: metric.engagement_rate_trend || 'neutral',
            avgEngagementTime: metric.avg_engagement_time_trend || 'neutral'
        },

        // Percentage changes
        changes: {
            keyEvents: parseFloat(metric.key_events_change || 0),
            newUsers: parseFloat(metric.new_users_change || 0),
            activeUsers: parseFloat(metric.active_users_change || 0),
            engagementRate: parseFloat(metric.engagement_rate_change || 0),
            avgEngagementTime: parseFloat(metric.avg_engagement_time_change || 0)
        },

        // Pass/fail indicators (steady or increasing = pass)
        passFail: {
            keyEvents: metric.key_events_trend === 'up' || metric.key_events_trend === 'neutral',
            newUsers: metric.new_users_trend === 'up' || metric.new_users_trend === 'neutral',
            activeUsers: metric.active_users_trend === 'up' || metric.active_users_trend === 'neutral',
            engagementRate: metric.engagement_rate_trend === 'up' || metric.engagement_rate_trend === 'neutral',
            avgEngagementTime: metric.avg_engagement_time_trend === 'up' || metric.avg_engagement_time_trend === 'neutral'
        },

        // Count of metrics passed
        metricsPassed: [
            metric.key_events_trend === 'up' || metric.key_events_trend === 'neutral',
            metric.new_users_trend === 'up' || metric.new_users_trend === 'neutral',
            metric.active_users_trend === 'up' || metric.active_users_trend === 'neutral',
            metric.engagement_rate_trend === 'up' || metric.engagement_rate_trend === 'neutral',
            metric.avg_engagement_time_trend === 'up' || metric.avg_engagement_time_trend === 'neutral'
        ].filter(Boolean).length,

        fetchedAt: metric.fetched_at,
        isStale: metric.is_stale || false
    };
}

/**
 * Format benchmark data for display
 */
function formatBenchmarkForDisplay(benchmark) {
    return {
        month: benchmark.month_date,
        threshold: parseFloat(benchmark.benchmark_threshold || 90),
        totalDomains: benchmark.total_active_domains || 0,

        // Overall status
        allBenchmarksMet: benchmark.all_benchmarks_met || false,
        benchmarksMetCount: benchmark.benchmarks_met_count || 0,

        // Per-metric benchmark results
        metrics: {
            keyEvents: {
                passing: benchmark.key_events_passing || 0,
                percentage: parseFloat(benchmark.key_events_passing_pct || 0),
                met: benchmark.key_events_benchmark_met || false
            },
            newUsers: {
                passing: benchmark.new_users_passing || 0,
                percentage: parseFloat(benchmark.new_users_passing_pct || 0),
                met: benchmark.new_users_benchmark_met || false
            },
            activeUsers: {
                passing: benchmark.active_users_passing || 0,
                percentage: parseFloat(benchmark.active_users_passing_pct || 0),
                met: benchmark.active_users_benchmark_met || false
            },
            engagementRate: {
                passing: benchmark.engagement_rate_passing || 0,
                percentage: parseFloat(benchmark.engagement_rate_passing_pct || 0),
                met: benchmark.engagement_rate_benchmark_met || false
            },
            avgEngagementTime: {
                passing: benchmark.avg_engagement_time_passing || 0,
                percentage: parseFloat(benchmark.avg_engagement_time_passing_pct || 0),
                met: benchmark.avg_engagement_time_benchmark_met || false
            }
        },

        // Domain-level details
        domainsData: benchmark.domains_data || [],

        updatedAt: benchmark.updated_at
    };
}

/**
 * Calculate summary statistics across all domains
 */
function calculateSummary(metrics, benchmark) {
    const totalDomains = metrics.length;

    // Aggregate totals
    const totals = metrics.reduce((acc, m) => ({
        keyEvents: acc.keyEvents + (m.key_events || 0),
        newUsers: acc.newUsers + (m.new_users || 0),
        activeUsers: acc.activeUsers + (m.active_users || 0),
        engagementRate: acc.engagementRate + parseFloat(m.engagement_rate || 0),
        avgEngagementTime: acc.avgEngagementTime + parseFloat(m.avg_engagement_time || 0)
    }), {
        keyEvents: 0,
        newUsers: 0,
        activeUsers: 0,
        engagementRate: 0,
        avgEngagementTime: 0
    });

    // Calculate averages
    const averages = {
        keyEvents: Math.round(totals.keyEvents / totalDomains),
        newUsers: Math.round(totals.newUsers / totalDomains),
        activeUsers: Math.round(totals.activeUsers / totalDomains),
        engagementRate: parseFloat((totals.engagementRate / totalDomains).toFixed(2)),
        avgEngagementTime: parseFloat((totals.avgEngagementTime / totalDomains).toFixed(2))
    };

    // Count domains with positive/neutral trends
    const trendsCount = {
        keyEvents: metrics.filter(m => m.key_events_trend === 'up' || m.key_events_trend === 'neutral').length,
        newUsers: metrics.filter(m => m.new_users_trend === 'up' || m.new_users_trend === 'neutral').length,
        activeUsers: metrics.filter(m => m.active_users_trend === 'up' || m.active_users_trend === 'neutral').length,
        engagementRate: metrics.filter(m => m.engagement_rate_trend === 'up' || m.engagement_rate_trend === 'neutral').length,
        avgEngagementTime: metrics.filter(m => m.avg_engagement_time_trend === 'up' || m.avg_engagement_time_trend === 'neutral').length
    };

    // Count domains passing all metrics
    const domainsPassingAll = metrics.filter(m =>
        (m.key_events_trend === 'up' || m.key_events_trend === 'neutral') &&
        (m.new_users_trend === 'up' || m.new_users_trend === 'neutral') &&
        (m.active_users_trend === 'up' || m.active_users_trend === 'neutral') &&
        (m.engagement_rate_trend === 'up' || m.engagement_rate_trend === 'neutral') &&
        (m.avg_engagement_time_trend === 'up' || m.avg_engagement_time_trend === 'neutral')
    ).length;

    return {
        totalDomains,
        totals,
        averages,
        trendsCount,
        domainsPassingAll,
        domainsPassingAllPct: parseFloat(((domainsPassingAll / totalDomains) * 100).toFixed(2)),
        hasData: true,
        benchmark: benchmark ? {
            threshold: parseFloat(benchmark.benchmark_threshold || 90),
            allMet: benchmark.all_benchmarks_met || false,
            metCount: benchmark.benchmarks_met_count || 0
        } : null
    };
}
