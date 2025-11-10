/**
 * API endpoint to get benchmark scorecard for all properties
 * Shows which domains pass/fail the key events benchmark
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Benchmark threshold: minimum key events per month
const BENCHMARK_THRESHOLD = 5;

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { month } = req.query;

        // Get all active properties
        const { data: properties, error: propsError } = await supabase
            .from('ga4_properties')
            .select('domain, property_id')
            .eq('is_active', true)
            .order('domain', { ascending: true });

        if (propsError) {
            throw new Error(`Failed to fetch properties: ${propsError.message}`);
        }

        // Determine which month to evaluate
        let targetMonth;
        if (month) {
            targetMonth = month;
        } else {
            // Get the latest month available across all properties
            const { data: latestMetrics } = await supabase
                .from('ga4_monthly_metrics_v2')
                .select('metric_month')
                .order('metric_month', { ascending: false })
                .limit(1)
                .single();

            targetMonth = latestMetrics?.metric_month;
        }

        if (!targetMonth) {
            return res.status(200).json({
                success: true,
                data: {
                    summary: {
                        totalDomains: 0,
                        passed: 0,
                        failed: 0,
                        passPercentage: 0,
                        failPercentage: 0,
                        benchmark: BENCHMARK_THRESHOLD,
                        evaluatedMonth: null
                    },
                    passedDomains: [],
                    failedDomains: []
                }
            });
        }

        // Get metrics for all properties for the target month
        const results = await Promise.all(
            properties.map(async (prop) => {
                const { data: metric } = await supabase
                    .from('ga4_monthly_metrics_v2')
                    .select('key_events, active_users, sessions, total_users')
                    .eq('property_id', prop.property_id)
                    .eq('metric_month', targetMonth)
                    .single();

                const keyEvents = metric?.key_events || 0;
                const passed = keyEvents >= BENCHMARK_THRESHOLD;

                return {
                    domain: prop.domain,
                    propertyId: prop.property_id,
                    keyEvents: keyEvents,
                    activeUsers: metric?.active_users || 0,
                    totalUsers: metric?.total_users || 0,
                    sessions: metric?.sessions || 0,
                    benchmark: BENCHMARK_THRESHOLD,
                    passed: passed,
                    status: passed ? 'pass' : 'fail',
                    gap: passed ? 0 : BENCHMARK_THRESHOLD - keyEvents,
                    hasData: !!metric
                };
            })
        );

        // Separate passed and failed domains
        const passedDomains = results.filter(r => r.passed).sort((a, b) => b.keyEvents - a.keyEvents);
        const failedDomains = results.filter(r => !r.passed).sort((a, b) => a.keyEvents - b.keyEvents);

        const totalDomains = results.length;
        const passedCount = passedDomains.length;
        const failedCount = failedDomains.length;
        const passPercentage = totalDomains > 0 ? Math.round((passedCount / totalDomains) * 100) : 0;
        const failPercentage = 100 - passPercentage;

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalDomains,
                    passed: passedCount,
                    failed: failedCount,
                    passPercentage,
                    failPercentage,
                    benchmark: BENCHMARK_THRESHOLD,
                    evaluatedMonth: targetMonth
                },
                passedDomains,
                failedDomains,
                allDomains: results
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Benchmark scorecard error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
