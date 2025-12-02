// API endpoint for initial monitor-to-domain matching
// POST /api/checkmate/sync-monitors
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
            autoMatch = true, // Automatically match by domain name similarity
            updateExisting = false // Update already-matched monitors
        } = req.method === 'POST' ? req.body : req.query;

        console.log('Starting Checkmate monitor sync...');
        console.log(`Auto-match: ${autoMatch}, Update existing: ${updateExisting}`);

        // Start sync log
        const syncStartTime = Date.now();
        const { data: syncLog, error: syncLogError } = await supabase
            .from('checkmate_sync_logs')
            .insert({
                sync_type: 'monitor_sync',
                status: 'in_progress',
                triggered_by: req.method === 'POST' ? 'api' : 'manual',
                sync_parameters: { autoMatch, updateExisting }
            })
            .select()
            .single();

        if (syncLogError) {
            console.error('Failed to create sync log:', syncLogError);
        }

        // Fetch all monitors from Checkmate
        console.log('Fetching monitors from Checkmate API...');
        const monitors = await checkmateService.getAllMonitors();

        if (!monitors || monitors.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No monitors found in Checkmate. Please add monitors first.'
            });
        }

        console.log(`Found ${monitors.length} monitors in Checkmate`);

        // Fetch all domains from ga4_properties
        let domainsQuery = supabase
            .from('ga4_properties')
            .select('*')
            .eq('is_active', true);

        if (!updateExisting) {
            domainsQuery = domainsQuery.is('checkmate_monitor_id', null);
        }

        const { data: properties, error: propertiesError } = await domainsQuery;

        if (propertiesError) {
            throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
        }

        if (!properties || properties.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No active domains found in ga4_properties table.'
            });
        }

        console.log(`Found ${properties.length} active domains in database`);

        // Perform matching
        const matched = [];
        const unmatched = [];
        const domainList = properties.map(p => p.domain);

        for (const monitor of monitors) {
            if (autoMatch) {
                // Try to auto-match
                const matchResult = checkmateService.matchMonitorToDomain(monitor.name, domainList);

                if (matchResult) {
                    matched.push({
                        domain: matchResult.domain,
                        checkmateName: monitor.name,
                        monitorId: monitor._id || monitor.id,
                        monitorUrl: monitor.url,
                        monitorType: monitor.type,
                        matchType: matchResult.matchType,
                        confidence: matchResult.confidence
                    });
                } else {
                    unmatched.push({
                        checkmateName: monitor.name,
                        monitorId: monitor._id || monitor.id,
                        monitorUrl: monitor.url,
                        reason: 'No matching domain found in ga4_properties'
                    });
                }
            } else {
                // Manual matching mode - just list all monitors
                unmatched.push({
                    checkmateName: monitor.name,
                    monitorId: monitor._id || monitor.id,
                    monitorUrl: monitor.url,
                    monitorType: monitor.type,
                    reason: 'Auto-match disabled - manual assignment required'
                });
            }
        }

        console.log(`Matched: ${matched.length}, Unmatched: ${unmatched.length}`);

        // Update database with matches
        let updateCount = 0;
        const updateErrors = [];

        for (const match of matched) {
            try {
                const { error: updateError } = await supabase
                    .from('ga4_properties')
                    .update({
                        checkmate_monitor_id: match.monitorId,
                        checkmate_monitor_url: match.monitorUrl,
                        checkmate_monitor_type: match.monitorType || 'pagespeed',
                        checkmate_last_synced: new Date().toISOString()
                    })
                    .eq('domain', match.domain);

                if (updateError) {
                    console.error(`Failed to update ${match.domain}:`, updateError);
                    updateErrors.push({
                        domain: match.domain,
                        error: updateError.message
                    });
                } else {
                    updateCount++;
                    console.log(`Updated ${match.domain} with monitor ${match.monitorId}`);
                }
            } catch (error) {
                console.error(`Error updating ${match.domain}:`, error);
                updateErrors.push({
                    domain: match.domain,
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
                    status: 'completed',
                    monitors_synced: monitors.length,
                    domains_matched: matched.length,
                    domains_unmatched: unmatched.length,
                    unmatched_monitors: unmatched.length > 0 ? unmatched : null,
                    completed_at: new Date().toISOString(),
                    duration_seconds: duration
                })
                .eq('id', syncLog.id);
        }

        res.status(200).json({
            success: true,
            matched,
            unmatched,
            summary: {
                totalMonitors: monitors.length,
                matched: matched.length,
                unmatched: unmatched.length,
                updated: updateCount,
                errors: updateErrors.length
            },
            updateErrors: updateErrors.length > 0 ? updateErrors : undefined,
            message: `Successfully matched ${matched.length} of ${monitors.length} monitors. ${unmatched.length} require manual assignment.`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Sync monitors error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
