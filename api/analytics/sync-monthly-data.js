// API endpoint to sync GA4 monthly data with enhanced features
// Supports traffic sources and key events breakdown
const { createClient } = require('@supabase/supabase-js');
const ga4Service = require('./ga4-service-enhanced');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

/**
 * Calculate date ranges for a given month
 */
function getMonthDateRange(year, month) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        monthDate: `${year}-${String(month).padStart(2, '0')}-01`
    };
}

/**
 * Get previous month's date range
 */
function getPreviousMonthDateRange(year, month) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    return getMonthDateRange(prevYear, prevMonth);
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const {
            year = 2025,
            month, // Single month (1-12) or null for all
            months = [], // Array of months to sync
            propertyId, // Optional: sync specific property only
            forceRefresh = false
        } = req.body;

        console.log('Sync request:', { year, month, months, propertyId, forceRefresh });

        // Determine which months to sync
        let monthsToSync = [];
        if (month) {
            monthsToSync = [month];
        } else if (months && months.length > 0) {
            monthsToSync = months;
        } else {
            // Default: sync Jan to Oct 2025
            monthsToSync = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }

        // Get active properties
        let propertiesQuery = supabase
            .from('ga4_properties')
            .select('domain, property_id, is_active')
            .eq('is_active', true)
            .order('domain', { ascending: true });

        if (propertyId) {
            propertiesQuery = propertiesQuery.eq('property_id', propertyId);
        }

        const { data: properties, error: propsError } = await propertiesQuery;

        if (propsError) {
            throw new Error(`Failed to fetch properties: ${propsError.message}`);
        }

        if (!properties || properties.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No active properties found'
            });
        }

        console.log(`Syncing ${monthsToSync.length} months for ${properties.length} properties...`);

        const results = {
            success: true,
            syncedMonths: [],
            errors: []
        };

        // Sync each month
        for (const monthNum of monthsToSync) {
            try {
                const monthResult = await syncMonthForAllProperties(
                    properties,
                    year,
                    monthNum,
                    forceRefresh
                );
                results.syncedMonths.push(monthResult);
            } catch (error) {
                console.error(`Error syncing month ${year}-${monthNum}:`, error);
                results.errors.push({
                    month: `${year}-${String(monthNum).padStart(2, '0')}`,
                    error: error.message
                });
            }
        }

        res.status(200).json(results);

    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Sync a single month for all properties
 */
async function syncMonthForAllProperties(properties, year, month, forceRefresh) {
    const { startDate, endDate, monthDate } = getMonthDateRange(year, month);
    const previousMonth = getPreviousMonthDateRange(year, month);

    console.log(`Syncing ${monthDate}: ${startDate} to ${endDate}`);

    const monthResults = {
        month: monthDate,
        propertiesSynced: 0,
        propertiesFailed: 0,
        errors: []
    };

    for (const property of properties) {
        try {
            // Fetch current month data
            const currentData = await ga4Service.fetchCompleteMonthlyMetrics(
                property.property_id,
                startDate,
                endDate
            );

            // Fetch previous month data for comparison
            let previousData = null;
            try {
                previousData = await ga4Service.fetchCompleteMonthlyMetrics(
                    property.property_id,
                    previousMonth.startDate,
                    previousMonth.endDate
                );
            } catch (prevError) {
                console.log(`Could not fetch previous month data for ${property.domain}:`, prevError.message);
            }

            // Calculate trends
            const trends = previousData
                ? ga4Service.calculateMonthComparison(currentData.baseMetrics, previousData.baseMetrics)
                : getEmptyTrends();

            // Save to database
            await saveMonthlyData(
                property,
                monthDate,
                currentData,
                previousData,
                trends
            );

            monthResults.propertiesSynced++;
            console.log(`✓ Synced ${property.domain} for ${monthDate}`);

        } catch (error) {
            console.error(`✗ Failed to sync ${property.domain}:`, error.message);
            monthResults.propertiesFailed++;
            monthResults.errors.push({
                domain: property.domain,
                error: error.message
            });
        }
    }

    return monthResults;
}

/**
 * Save monthly data to database
 */
async function saveMonthlyData(property, monthDate, currentData, previousData, trends) {
    const { baseMetrics, trafficSources, keyEvents } = currentData;
    const prevMetrics = previousData?.baseMetrics || {};

    // 1. Save main monthly metrics
    const { error: metricsError } = await supabase
        .from('ga4_monthly_metrics_v2')
        .upsert({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,

            // Current metrics
            key_events: baseMetrics.keyEvents,
            new_users: baseMetrics.newUsers,
            active_users: baseMetrics.activeUsers,
            total_users: baseMetrics.totalUsers,
            sessions: baseMetrics.sessions,
            engagement_rate: baseMetrics.engagementRate,
            avg_engagement_time: baseMetrics.avgEngagementTime,

            // Previous month metrics
            previous_month_key_events: prevMetrics.keyEvents || 0,
            previous_month_new_users: prevMetrics.newUsers || 0,
            previous_month_active_users: prevMetrics.activeUsers || 0,
            previous_month_total_users: prevMetrics.totalUsers || 0,
            previous_month_sessions: prevMetrics.sessions || 0,
            previous_month_engagement_rate: prevMetrics.engagementRate || 0,
            previous_month_avg_engagement_time: prevMetrics.avgEngagementTime || 0,

            // Trends
            key_events_trend: trends.keyEvents.trend,
            new_users_trend: trends.newUsers.trend,
            active_users_trend: trends.activeUsers.trend,
            total_users_trend: trends.totalUsers.trend,
            sessions_trend: trends.sessions.trend,
            engagement_rate_trend: trends.engagementRate.trend,
            avg_engagement_time_trend: trends.avgEngagementTime.trend,

            // Changes
            key_events_change: trends.keyEvents.change,
            new_users_change: trends.newUsers.change,
            active_users_change: trends.activeUsers.change,
            total_users_change: trends.totalUsers.change,
            sessions_change: trends.sessions.change,
            engagement_rate_change: trends.engagementRate.change,
            avg_engagement_time_change: trends.avgEngagementTime.change,

            fetched_at: new Date().toISOString(),
            is_stale: false
        }, {
            onConflict: 'domain,property_id,metric_month'
        });

    if (metricsError) {
        throw new Error(`Failed to save metrics: ${metricsError.message}`);
    }

    // 2. Save traffic sources
    if (trafficSources && trafficSources.length > 0) {
        // Delete existing traffic sources for this month
        await supabase
            .from('ga4_traffic_sources')
            .delete()
            .eq('property_id', property.property_id)
            .eq('metric_month', monthDate);

        // Insert new traffic sources
        const trafficSourcesData = trafficSources.map(source => ({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,
            source_medium: source.sourceMedium,
            channel_group: source.channelGroup,
            users: source.users,
            sessions: source.sessions,
            new_users: source.newUsers,
            engaged_sessions: source.engagedSessions,
            engagement_rate: source.engagementRate,
            avg_engagement_time: source.avgEngagementTime,
            fetched_at: new Date().toISOString()
        }));

        const { error: sourcesError } = await supabase
            .from('ga4_traffic_sources')
            .insert(trafficSourcesData);

        if (sourcesError) {
            console.error(`Warning: Failed to save traffic sources: ${sourcesError.message}`);
        }
    }

    // 3. Save key events breakdown
    if (keyEvents && keyEvents.length > 0) {
        // Delete existing key events for this month
        await supabase
            .from('ga4_key_events')
            .delete()
            .eq('property_id', property.property_id)
            .eq('metric_month', monthDate);

        // Insert new key events
        const keyEventsData = keyEvents.map(event => ({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,
            event_name: event.eventName,
            event_count: event.eventCount,
            users_triggering: event.usersTriggering,
            event_value: event.eventValue,
            fetched_at: new Date().toISOString()
        }));

        const { error: eventsError } = await supabase
            .from('ga4_key_events')
            .insert(keyEventsData);

        if (eventsError) {
            console.error(`Warning: Failed to save key events: ${eventsError.message}`);
        }
    }
}

/**
 * Get empty trends structure
 */
function getEmptyTrends() {
    return {
        keyEvents: { change: 0, trend: 'neutral' },
        newUsers: { change: 0, trend: 'neutral' },
        activeUsers: { change: 0, trend: 'neutral' },
        totalUsers: { change: 0, trend: 'neutral' },
        sessions: { change: 0, trend: 'neutral' },
        engagementRate: { change: 0, trend: 'neutral' },
        avgEngagementTime: { change: 0, trend: 'neutral' }
    };
}
