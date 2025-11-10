// API endpoint to get analytics data for a specific property
// Returns monthly trends, traffic sources, and key events breakdown
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
        const { propertyId, year = 2025 } = req.query;

        if (!propertyId) {
            return res.status(400).json({
                success: false,
                error: 'propertyId is required'
            });
        }

        console.log(`Fetching analytics for property ${propertyId}, year ${year}`);

        // Get property info
        const { data: property, error: propError } = await supabase
            .from('ga4_properties')
            .select('*')
            .eq('property_id', propertyId)
            .single();

        if (propError || !property) {
            return res.status(404).json({
                success: false,
                error: 'Property not found'
            });
        }

        // Get monthly metrics for the year
        const { data: monthlyMetrics, error: metricsError } = await supabase
            .from('ga4_monthly_metrics_v2')
            .select('*')
            .eq('property_id', propertyId)
            .gte('metric_month', `${year}-01-01`)
            .lte('metric_month', `${year}-12-31`)
            .order('metric_month', { ascending: true });

        if (metricsError) {
            throw new Error(`Failed to fetch metrics: ${metricsError.message}`);
        }

        // Get traffic sources for all months
        const { data: trafficSources, error: sourcesError } = await supabase
            .from('ga4_traffic_sources')
            .select('*')
            .eq('property_id', propertyId)
            .gte('metric_month', `${year}-01-01`)
            .lte('metric_month', `${year}-12-31`)
            .order('metric_month', { ascending: true });

        if (sourcesError) {
            console.error('Traffic sources error:', sourcesError);
        }

        // Get key events for all months
        const { data: keyEvents, error: eventsError } = await supabase
            .from('ga4_key_events')
            .select('*')
            .eq('property_id', propertyId)
            .gte('metric_month', `${year}-01-01`)
            .lte('metric_month', `${year}-12-31`)
            .order('metric_month', { ascending: true });

        if (eventsError) {
            console.error('Key events error:', eventsError);
        }

        // Format response
        const response = {
            success: true,
            data: {
                property: {
                    domain: property.domain,
                    propertyId: property.property_id,
                    isActive: property.is_active
                },
                monthlyData: formatMonthlyData(monthlyMetrics || []),
                trafficSources: groupTrafficSourcesByMonth(trafficSources || []),
                keyEvents: groupKeyEventsByMonth(keyEvents || []),
                summary: calculateYearlySummary(monthlyMetrics || []),
                year: parseInt(year)
            },
            timestamp: new Date().toISOString()
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Get property analytics error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Format monthly metrics data for charts
 */
function formatMonthlyData(metrics) {
    return metrics.map(m => ({
        month: m.metric_month,
        monthLabel: formatMonthLabel(m.metric_month),

        // Current metrics
        keyEvents: m.key_events || 0,
        newUsers: m.new_users || 0,
        activeUsers: m.active_users || 0,
        totalUsers: m.total_users || 0,
        sessions: m.sessions || 0,
        engagementRate: parseFloat(m.engagement_rate || 0),
        avgEngagementTime: parseFloat(m.avg_engagement_time || 0),

        // Previous month metrics
        previousMonth: {
            keyEvents: m.previous_month_key_events || 0,
            newUsers: m.previous_month_new_users || 0,
            activeUsers: m.previous_month_active_users || 0,
            totalUsers: m.previous_month_total_users || 0,
            sessions: m.previous_month_sessions || 0,
            engagementRate: parseFloat(m.previous_month_engagement_rate || 0),
            avgEngagementTime: parseFloat(m.previous_month_avg_engagement_time || 0)
        },

        // Trends
        trends: {
            keyEvents: m.key_events_trend || 'neutral',
            newUsers: m.new_users_trend || 'neutral',
            activeUsers: m.active_users_trend || 'neutral',
            totalUsers: m.total_users_trend || 'neutral',
            sessions: m.sessions_trend || 'neutral',
            engagementRate: m.engagement_rate_trend || 'neutral',
            avgEngagementTime: m.avg_engagement_time_trend || 'neutral'
        },

        // Changes
        changes: {
            keyEvents: parseFloat(m.key_events_change || 0),
            newUsers: parseFloat(m.new_users_change || 0),
            activeUsers: parseFloat(m.active_users_change || 0),
            totalUsers: parseFloat(m.total_users_change || 0),
            sessions: parseFloat(m.sessions_change || 0),
            engagementRate: parseFloat(m.engagement_rate_change || 0),
            avgEngagementTime: parseFloat(m.avg_engagement_time_change || 0)
        },

        fetchedAt: m.fetched_at
    }));
}

/**
 * Group traffic sources by month
 */
function groupTrafficSourcesByMonth(sources) {
    const grouped = {};

    sources.forEach(source => {
        const month = source.metric_month;
        if (!grouped[month]) {
            grouped[month] = [];
        }

        grouped[month].push({
            sourceMedium: source.source_medium,
            channelGroup: source.channel_group,
            users: source.users || 0,
            sessions: source.sessions || 0,
            newUsers: source.new_users || 0,
            engagedSessions: source.engaged_sessions || 0,
            engagementRate: parseFloat(source.engagement_rate || 0),
            avgEngagementTime: parseFloat(source.avg_engagement_time || 0)
        });
    });

    return grouped;
}

/**
 * Group key events by month
 */
function groupKeyEventsByMonth(events) {
    const grouped = {};

    events.forEach(event => {
        const month = event.metric_month;
        if (!grouped[month]) {
            grouped[month] = [];
        }

        grouped[month].push({
            eventName: event.event_name,
            eventCount: event.event_count || 0,
            usersTriggering: event.users_triggering || 0,
            eventValue: parseFloat(event.event_value || 0)
        });
    });

    return grouped;
}

/**
 * Calculate yearly summary statistics
 */
function calculateYearlySummary(metrics) {
    if (!metrics || metrics.length === 0) {
        return {
            totalMonths: 0,
            hasData: false
        };
    }

    const totals = metrics.reduce((acc, m) => ({
        keyEvents: acc.keyEvents + (m.key_events || 0),
        newUsers: acc.newUsers + (m.new_users || 0),
        activeUsers: acc.activeUsers + (m.active_users || 0),
        totalUsers: acc.totalUsers + (m.total_users || 0),
        sessions: acc.sessions + (m.sessions || 0)
    }), {
        keyEvents: 0,
        newUsers: 0,
        activeUsers: 0,
        totalUsers: 0,
        sessions: 0
    });

    const avgEngagementRate = metrics.reduce((sum, m) => sum + parseFloat(m.engagement_rate || 0), 0) / metrics.length;
    const avgEngagementTime = metrics.reduce((sum, m) => sum + parseFloat(m.avg_engagement_time || 0), 0) / metrics.length;

    // Calculate overall trends
    const upTrends = {
        keyEvents: metrics.filter(m => m.key_events_trend === 'up').length,
        newUsers: metrics.filter(m => m.new_users_trend === 'up').length,
        activeUsers: metrics.filter(m => m.active_users_trend === 'up').length,
        totalUsers: metrics.filter(m => m.total_users_trend === 'up').length,
        sessions: metrics.filter(m => m.sessions_trend === 'up').length,
        engagementRate: metrics.filter(m => m.engagement_rate_trend === 'up').length,
        avgEngagementTime: metrics.filter(m => m.avg_engagement_time_trend === 'up').length
    };

    return {
        totalMonths: metrics.length,
        hasData: true,
        totals,
        averages: {
            engagementRate: parseFloat(avgEngagementRate.toFixed(2)),
            avgEngagementTime: parseFloat(avgEngagementTime.toFixed(2))
        },
        trends: {
            upTrends,
            percentUp: {
                keyEvents: ((upTrends.keyEvents / metrics.length) * 100).toFixed(1),
                newUsers: ((upTrends.newUsers / metrics.length) * 100).toFixed(1),
                activeUsers: ((upTrends.activeUsers / metrics.length) * 100).toFixed(1),
                totalUsers: ((upTrends.totalUsers / metrics.length) * 100).toFixed(1),
                sessions: ((upTrends.sessions / metrics.length) * 100).toFixed(1),
                engagementRate: ((upTrends.engagementRate / metrics.length) * 100).toFixed(1),
                avgEngagementTime: ((upTrends.avgEngagementTime / metrics.length) * 100).toFixed(1)
            }
        },
        latestMonth: metrics[metrics.length - 1].metric_month,
        lastSynced: metrics[metrics.length - 1].fetched_at
    };
}

/**
 * Format month date to readable label
 */
function formatMonthLabel(dateString) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // Parse the date string directly (YYYY-MM-DD format)
    const [year, month] = dateString.split('-');
    const monthIndex = parseInt(month) - 1; // Convert to 0-indexed
    return `${months[monthIndex]} ${year}`;
}
