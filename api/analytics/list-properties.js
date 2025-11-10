// API endpoint to list all GA4 properties with their summary info
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
        const { activeOnly = 'true' } = req.query;
        const filterActive = activeOnly === 'true';

        // Get all properties with their latest sync info
        let query = supabase
            .from('ga4_properties')
            .select('domain, property_id, is_active')
            .order('domain', { ascending: true });

        if (filterActive) {
            query = query.eq('is_active', true);
        }

        const { data: properties, error: propsError } = await query;

        if (propsError) {
            throw new Error(`Failed to fetch properties: ${propsError.message}`);
        }

        // Get latest metrics for each property
        const propertiesWithInfo = await Promise.all(
            properties.map(async (prop) => {
                // Get latest month data
                const { data: latestMetric } = await supabase
                    .from('ga4_monthly_metrics_v2')
                    .select('metric_month, fetched_at, active_users, sessions')
                    .eq('property_id', prop.property_id)
                    .order('metric_month', { ascending: false })
                    .limit(1)
                    .single();

                // Count total months tracked
                const { count } = await supabase
                    .from('ga4_monthly_metrics_v2')
                    .select('*', { count: 'exact', head: true })
                    .eq('property_id', prop.property_id);

                return {
                    domain: prop.domain,
                    propertyId: prop.property_id,
                    isActive: prop.is_active,
                    latestMonth: latestMetric?.metric_month || null,
                    lastSynced: latestMetric?.fetched_at || null,
                    monthsTracked: count || 0,
                    hasData: !!latestMetric,
                    latestActiveUsers: latestMetric?.active_users || 0,
                    latestSessions: latestMetric?.sessions || 0
                };
            })
        );

        res.status(200).json({
            success: true,
            data: propertiesWithInfo,
            total: propertiesWithInfo.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('List properties error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
