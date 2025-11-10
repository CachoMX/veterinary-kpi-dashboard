// API endpoint to fetch and cache GA4 metrics
const { createClient } = require('@supabase/supabase-js');
const ga4Service = require('./ga4-service');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Optional: Protect with secret key
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.GA4_SYNC_SECRET || process.env.SYNC_SECRET_KEY;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }

    try {
        const {
            month, // Format: YYYY-MM (e.g., "2025-10")
            forceRefresh = false
        } = req.method === 'POST' ? req.body : req.query;

        // Default to current month if not specified
        const targetMonth = month || new Date().toISOString().slice(0, 7);
        const [year, monthNum] = targetMonth.split('-');

        // Calculate date ranges
        const startDate = `${year}-${monthNum}-01`;
        const endDate = new Date(parseInt(year), parseInt(monthNum), 0).toISOString().split('T')[0];

        // Calculate previous year dates for comparison
        const prevYear = parseInt(year) - 1;
        const prevStartDate = `${prevYear}-${monthNum}-01`;
        const prevEndDate = new Date(prevYear, parseInt(monthNum), 0).toISOString().split('T')[0];

        console.log(`Fetching GA4 metrics for ${targetMonth}`);
        console.log(`Current period: ${startDate} to ${endDate}`);
        console.log(`Previous period: ${prevStartDate} to ${prevEndDate}`);

        // Start sync log
        const { data: syncLog, error: syncLogError } = await supabase
            .from('ga4_sync_logs')
            .insert({
                sync_type: 'monthly_metrics',
                status: 'in_progress',
                triggered_by: req.method === 'POST' ? 'api' : 'manual',
                sync_parameters: { month: targetMonth, forceRefresh }
            })
            .select()
            .single();

        if (syncLogError) {
            console.error('Failed to create sync log:', syncLogError);
        }

        // Fetch active properties
        const { data: properties, error: propertiesError } = await supabase
            .from('ga4_properties')
            .select('*')
            .eq('is_active', true);

        if (propertiesError) {
            throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
        }

        if (!properties || properties.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active GA4 properties configured. Please add properties to ga4_properties table.'
            });
        }

        console.log(`Found ${properties.length} active properties`);

        // Check for existing cached data
        if (!forceRefresh) {
            const { data: existingMetrics } = await supabase
                .from('ga4_monthly_metrics')
                .select('*')
                .eq('metric_month', startDate)
                .gte('fetched_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

            if (existingMetrics && existingMetrics.length === properties.length) {
                console.log('Using cached metrics (less than 24 hours old)');

                // Update sync log
                if (syncLog) {
                    await supabase
                        .from('ga4_sync_logs')
                        .update({
                            status: 'completed',
                            properties_synced: properties.length,
                            metrics_updated: 0,
                            completed_at: new Date().toISOString(),
                            duration_seconds: 0
                        })
                        .eq('id', syncLog.id);
                }

                return res.status(200).json({
                    success: true,
                    data: existingMetrics,
                    cached: true,
                    message: 'Using cached data (less than 24 hours old)'
                });
            }
        }

        // Fetch fresh data from GA4
        const results = [];
        let successCount = 0;
        let errorCount = 0;

        for (const property of properties) {
            try {
                console.log(`Fetching metrics for ${property.domain} (${property.property_id})`);

                // Fetch year-over-year metrics
                const yoyData = await ga4Service.fetchYearOverYearMetrics(
                    property.property_id,
                    startDate,
                    endDate,
                    prevStartDate,
                    prevEndDate
                );

                const { current, previous, comparison } = yoyData;

                // Prepare data for database
                const metricData = {
                    property_id: property.property_id,
                    domain: property.domain,
                    metric_month: startDate,
                    start_date: startDate,
                    end_date: endDate,

                    // Current period metrics
                    key_events: current.keyEvents,
                    new_users: current.newUsers,
                    active_users: current.activeUsers,
                    engagement_rate: current.engagementRate,
                    avg_engagement_time: current.avgEngagementTime,
                    total_engagement_duration: current.totalEngagementDuration,

                    // Previous year metrics
                    previous_year_key_events: previous.keyEvents,
                    previous_year_new_users: previous.newUsers,
                    previous_year_active_users: previous.activeUsers,
                    previous_year_engagement_rate: previous.engagementRate,
                    previous_year_avg_engagement_time: previous.avgEngagementTime,

                    // Trends
                    key_events_trend: comparison.keyEvents.trend,
                    new_users_trend: comparison.newUsers.trend,
                    active_users_trend: comparison.activeUsers.trend,
                    engagement_rate_trend: comparison.engagementRate.trend,
                    avg_engagement_time_trend: comparison.avgEngagementTime.trend,

                    // Changes
                    key_events_change: comparison.keyEvents.change,
                    new_users_change: comparison.newUsers.change,
                    active_users_change: comparison.activeUsers.change,
                    engagement_rate_change: comparison.engagementRate.change,
                    avg_engagement_time_change: comparison.avgEngagementTime.change,

                    fetched_at: new Date().toISOString(),
                    is_stale: false
                };

                // Upsert to database
                const { data: savedMetric, error: saveError } = await supabase
                    .from('ga4_monthly_metrics')
                    .upsert(metricData, {
                        onConflict: 'property_id,metric_month'
                    })
                    .select()
                    .single();

                if (saveError) {
                    console.error(`Failed to save metrics for ${property.domain}:`, saveError);
                    errorCount++;
                } else {
                    console.log(`Successfully saved metrics for ${property.domain}`);
                    results.push(savedMetric);
                    successCount++;
                }

            } catch (error) {
                console.error(`Error fetching metrics for ${property.domain}:`, error.message);
                errorCount++;
                results.push({
                    domain: property.domain,
                    error: error.message
                });
            }
        }

        // Calculate benchmarks
        await calculateBenchmarks(targetMonth, startDate);

        // Update sync log
        if (syncLog) {
            const duration = Math.floor((Date.now() - new Date(syncLog.started_at).getTime()) / 1000);
            await supabase
                .from('ga4_sync_logs')
                .update({
                    status: errorCount > 0 && successCount === 0 ? 'failed' : 'completed',
                    properties_synced: successCount,
                    metrics_updated: successCount,
                    error_message: errorCount > 0 ? `${errorCount} properties failed to sync` : null,
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
                month: targetMonth
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('GA4 fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Calculate benchmark pass/fail status for the month
 */
async function calculateBenchmarks(targetMonth, startDate) {
    try {
        console.log(`Calculating benchmarks for ${targetMonth}`);

        // Fetch all metrics for this month
        const { data: metrics, error } = await supabase
            .from('ga4_monthly_metrics')
            .select('*')
            .eq('metric_month', startDate);

        if (error || !metrics || metrics.length === 0) {
            console.error('Failed to fetch metrics for benchmark calculation');
            return;
        }

        const threshold = 90; // 90% threshold
        const totalDomains = metrics.length;

        // Count how many domains meet criteria (steady or increasing) for each metric
        const passingCounts = {
            keyEvents: metrics.filter(m => m.key_events_trend === 'up' || m.key_events_trend === 'neutral').length,
            newUsers: metrics.filter(m => m.new_users_trend === 'up' || m.new_users_trend === 'neutral').length,
            activeUsers: metrics.filter(m => m.active_users_trend === 'up' || m.active_users_trend === 'neutral').length,
            engagementRate: metrics.filter(m => m.engagement_rate_trend === 'up' || m.engagement_rate_trend === 'neutral').length,
            avgEngagementTime: metrics.filter(m => m.avg_engagement_time_trend === 'up' || m.avg_engagement_time_trend === 'neutral').length
        };

        // Calculate percentages
        const percentages = {
            keyEvents: (passingCounts.keyEvents / totalDomains) * 100,
            newUsers: (passingCounts.newUsers / totalDomains) * 100,
            activeUsers: (passingCounts.activeUsers / totalDomains) * 100,
            engagementRate: (passingCounts.engagementRate / totalDomains) * 100,
            avgEngagementTime: (passingCounts.avgEngagementTime / totalDomains) * 100
        };

        // Determine benchmark met status
        const benchmarksMet = {
            keyEvents: percentages.keyEvents >= threshold,
            newUsers: percentages.newUsers >= threshold,
            activeUsers: percentages.activeUsers >= threshold,
            engagementRate: percentages.engagementRate >= threshold,
            avgEngagementTime: percentages.avgEngagementTime >= threshold
        };

        const benchmarksMetCount = Object.values(benchmarksMet).filter(Boolean).length;
        const allBenchmarksMet = benchmarksMetCount === 5;

        // Prepare domains data for storage
        const domainsData = metrics.map(m => ({
            domain: m.domain,
            metrics_passed: [
                (m.key_events_trend === 'up' || m.key_events_trend === 'neutral') && 'key_events',
                (m.new_users_trend === 'up' || m.new_users_trend === 'neutral') && 'new_users',
                (m.active_users_trend === 'up' || m.active_users_trend === 'neutral') && 'active_users',
                (m.engagement_rate_trend === 'up' || m.engagement_rate_trend === 'neutral') && 'engagement_rate',
                (m.avg_engagement_time_trend === 'up' || m.avg_engagement_time_trend === 'neutral') && 'avg_engagement_time'
            ].filter(Boolean)
        }));

        // Upsert benchmark record
        const { error: benchmarkError } = await supabase
            .from('ga4_benchmarks')
            .upsert({
                month_date: startDate,
                benchmark_threshold: threshold,
                total_active_domains: totalDomains,

                key_events_passing: passingCounts.keyEvents,
                key_events_passing_pct: percentages.keyEvents,
                key_events_benchmark_met: benchmarksMet.keyEvents,

                new_users_passing: passingCounts.newUsers,
                new_users_passing_pct: percentages.newUsers,
                new_users_benchmark_met: benchmarksMet.newUsers,

                active_users_passing: passingCounts.activeUsers,
                active_users_passing_pct: percentages.activeUsers,
                active_users_benchmark_met: benchmarksMet.activeUsers,

                engagement_rate_passing: passingCounts.engagementRate,
                engagement_rate_passing_pct: percentages.engagementRate,
                engagement_rate_benchmark_met: benchmarksMet.engagementRate,

                avg_engagement_time_passing: passingCounts.avgEngagementTime,
                avg_engagement_time_passing_pct: percentages.avgEngagementTime,
                avg_engagement_time_benchmark_met: benchmarksMet.avgEngagementTime,

                all_benchmarks_met: allBenchmarksMet,
                benchmarks_met_count: benchmarksMetCount,
                domains_data: domainsData
            }, {
                onConflict: 'month_date'
            });

        if (benchmarkError) {
            console.error('Failed to save benchmark data:', benchmarkError);
        } else {
            console.log(`Benchmarks calculated: ${benchmarksMetCount}/5 metrics met`);
        }

    } catch (error) {
        console.error('Benchmark calculation error:', error);
    }
}
