/**
 * Vercel Cron Job - Auto-sync previous month's GA4 data
 * Runs on the 1st of each month at 7 AM UTC
 *
 * Example: On December 1st, syncs November data for all active properties
 */

const { createClient } = require('@supabase/supabase-js');
const GA4ServiceEnhanced = require('./ga4-service-enhanced');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ga4Service = new GA4ServiceEnhanced();

/**
 * Get the previous month's year and month
 */
function getPreviousMonth() {
    const now = new Date();
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const month = now.getMonth() === 0 ? 12 : now.getMonth(); // getMonth() is 0-indexed

    return { year, month };
}

/**
 * Get date range for a specific month
 */
function getMonthDateRange(year, month) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const monthDate = startDate;

    return { startDate, endDate, monthDate };
}

/**
 * Get previous month's date range for comparison
 */
function getPreviousMonthDateRange(year, month) {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    return getMonthDateRange(prevYear, prevMonth);
}

/**
 * Save monthly data to database
 */
async function saveMonthlyData(property, monthDate, currentData, previousData, trends) {
    const { baseMetrics, trafficSources, keyEvents } = currentData;
    const prevMetrics = previousData?.baseMetrics || {};

    // Save main metrics
    const { error: metricsError } = await supabase
        .from('ga4_monthly_metrics_v2')
        .upsert({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,

            // Current metrics
            key_events: baseMetrics.keyEvents || 0,
            new_users: baseMetrics.newUsers || 0,
            active_users: baseMetrics.activeUsers || 0,
            total_users: baseMetrics.totalUsers || 0,
            sessions: baseMetrics.sessions || 0,
            engagement_rate: baseMetrics.engagementRate || 0,
            avg_engagement_time: baseMetrics.avgEngagementTime || 0,

            // Previous month metrics
            previous_month_key_events: prevMetrics.keyEvents || 0,
            previous_month_new_users: prevMetrics.newUsers || 0,
            previous_month_active_users: prevMetrics.activeUsers || 0,
            previous_month_total_users: prevMetrics.totalUsers || 0,
            previous_month_sessions: prevMetrics.sessions || 0,
            previous_month_engagement_rate: prevMetrics.engagementRate || 0,
            previous_month_avg_engagement_time: prevMetrics.avgEngagementTime || 0,

            // Trends
            key_events_trend: trends.keyEvents || 'neutral',
            key_events_change: trends.keyEventsChange || 0,
            total_users_trend: trends.totalUsers || 'neutral',
            total_users_change: trends.totalUsersChange || 0,
            sessions_trend: trends.sessions || 'neutral',
            sessions_change: trends.sessionsChange || 0,
            engagement_rate_trend: trends.engagementRate || 'neutral',
            engagement_rate_change: trends.engagementRateChange || 0,

            fetched_at: new Date().toISOString()
        }, {
            onConflict: 'domain,property_id,metric_month'
        });

    if (metricsError) {
        console.error('Error saving metrics:', metricsError);
        throw metricsError;
    }

    // Save traffic sources
    if (trafficSources && trafficSources.length > 0) {
        const trafficData = trafficSources.map(source => ({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,
            source_medium: source.sourceMedium,
            channel_group: source.channelGroup,
            users: source.users,
            sessions: source.sessions,
            engagement_rate: source.engagementRate,
            avg_engagement_time: source.avgEngagementTime
        }));

        const { error: trafficError } = await supabase
            .from('ga4_traffic_sources')
            .upsert(trafficData, {
                onConflict: 'domain,property_id,metric_month,source_medium'
            });

        if (trafficError) {
            console.error('Error saving traffic sources:', trafficError);
        }
    }

    // Save key events
    if (keyEvents && keyEvents.length > 0) {
        const eventsData = keyEvents.map(event => ({
            domain: property.domain,
            property_id: property.property_id,
            metric_month: monthDate,
            event_name: event.eventName,
            event_count: event.eventCount,
            users_triggering: event.usersTriggering,
            event_value: event.eventValue || 0
        }));

        const { error: eventsError } = await supabase
            .from('ga4_key_events')
            .upsert(eventsData, {
                onConflict: 'domain,property_id,metric_month,event_name'
            });

        if (eventsError) {
            console.error('Error saving key events:', eventsError);
        }
    }
}

/**
 * Get empty trends object
 */
function getEmptyTrends() {
    return {
        keyEvents: 'neutral',
        keyEventsChange: 0,
        totalUsers: 'neutral',
        totalUsersChange: 0,
        sessions: 'neutral',
        sessionsChange: 0,
        engagementRate: 'neutral',
        engagementRateChange: 0
    };
}

/**
 * Sync previous month data for all active properties
 */
async function syncPreviousMonth() {
    const startTime = Date.now();
    const { year, month } = getPreviousMonth();

    console.log(`Starting cron sync for ${year}-${String(month).padStart(2, '0')}`);

    // Get all active properties
    const { data: properties, error: propertiesError } = await supabase
        .from('ga4_properties')
        .select('domain, property_id')
        .eq('is_active', true)
        .order('domain');

    if (propertiesError) {
        throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
    }

    if (!properties || properties.length === 0) {
        return {
            success: true,
            message: 'No active properties to sync',
            synced: 0
        };
    }

    const { startDate, endDate, monthDate } = getMonthDateRange(year, month);
    const previousMonth = getPreviousMonthDateRange(year, month);

    let syncedCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each property
    for (const property of properties) {
        try {
            console.log(`Syncing ${property.domain} for ${year}-${String(month).padStart(2, '0')}...`);

            // Fetch current month data
            const currentData = await ga4Service.fetchCompleteMonthlyMetrics(
                property.property_id,
                startDate,
                endDate
            );

            // Fetch previous month data for comparison
            const previousData = await ga4Service.fetchCompleteMonthlyMetrics(
                property.property_id,
                previousMonth.startDate,
                previousMonth.endDate
            );

            // Calculate trends
            const trends = previousData
                ? ga4Service.calculateMonthComparison(currentData.baseMetrics, previousData.baseMetrics)
                : getEmptyTrends();

            // Save to database
            await saveMonthlyData(property, monthDate, currentData, previousData, trends);

            syncedCount++;
            console.log(`✓ ${property.domain} synced successfully`);

        } catch (error) {
            errorCount++;
            const errorMsg = `${property.domain}: ${error.message}`;
            errors.push(errorMsg);
            console.error(`✗ Error syncing ${property.domain}:`, error.message);
            // Continue with next property instead of failing completely
        }
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);

    return {
        success: true,
        month: `${year}-${String(month).padStart(2, '0')}`,
        totalProperties: properties.length,
        synced: syncedCount,
        errors: errorCount,
        errorDetails: errors.length > 0 ? errors : undefined,
        durationMinutes: duration,
        timestamp: new Date().toISOString()
    };
}

/**
 * Vercel serverless function handler
 */
module.exports = async (req, res) => {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const result = await syncPreviousMonth();

        console.log('Cron sync completed:', result);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Cron sync failed:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
