/**
 * API endpoint to fetch PageSpeed metrics from Google API
 * POST /api/pagespeed/fetch-pagespeed-metrics
 *
 * Fetches performance metrics, Core Web Vitals, and stores in database
 */

const { createClient } = require('@supabase/supabase-js');
const pagespeedService = require('./pagespeed-service');

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
    const expectedSecret = process.env.CHECKMATE_SYNC_SECRET || process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid or missing Bearer token'
        });
    }

    try {
        const {
            domains = [], // Specific domains to analyze (empty = all)
            strategy = 'both', // 'mobile', 'desktop', or 'both'
            forceRefresh = false,
            limit = null // Limit number of domains to process
        } = req.method === 'POST' ? req.body : req.query;

        const targetDate = new Date().toISOString().split('T')[0];
        const syncStartTime = Date.now();

        console.log(`Starting PageSpeed metrics fetch for ${targetDate}`);
        console.log(`Strategy: ${strategy}, Force refresh: ${forceRefresh}`);

        // Create sync log
        const { data: syncLog, error: syncLogError } = await supabase
            .from('pagespeed_sync_logs')
            .insert({
                sync_type: 'daily_pagespeed',
                status: 'in_progress',
                triggered_by: req.method === 'POST' ? 'api' : 'manual',
                sync_parameters: { targetDate, strategy, domains, limit }
            })
            .select()
            .single();

        if (syncLogError) {
            console.error('Failed to create sync log:', syncLogError);
        }

        // Get domains to analyze
        let domainsQuery = supabase
            .from('ga4_properties')
            .select('domain')
            .eq('is_active', true);

        // Filter by specific domains if provided
        if (domains && domains.length > 0) {
            domainsQuery = domainsQuery.in('domain', domains);
        }

        // Apply limit if specified
        if (limit) {
            domainsQuery = domainsQuery.limit(limit);
        }

        const { data: properties, error: propertiesError } = await domainsQuery;

        if (propertiesError) {
            throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
        }

        if (!properties || properties.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No domains found to analyze'
            });
        }

        console.log(`Found ${properties.length} domains to analyze`);

        // Fetch PageSpeed metrics for each domain
        const results = [];
        const errors = [];
        let mobileCount = 0;
        let desktopCount = 0;

        for (let i = 0; i < properties.length; i++) {
            const property = properties[i];
            const domain = property.domain;

            console.log(`[${i + 1}/${properties.length}] Analyzing ${domain}...`);

            try {
                // Check if we already have fresh data for today (unless forceRefresh)
                if (!forceRefresh) {
                    const { data: existingMetrics } = await supabase
                        .from('pagespeed_metrics')
                        .select('device_type')
                        .eq('domain', domain)
                        .eq('metric_date', targetDate);

                    const hasExistingMobile = existingMetrics?.some(m => m.device_type === 'mobile');
                    const hasExistingDesktop = existingMetrics?.some(m => m.device_type === 'desktop');

                    if (strategy === 'both' && hasExistingMobile && hasExistingDesktop) {
                        console.log(`  ↳ Skipping ${domain} - already has today's data`);
                        continue;
                    }
                    if (strategy === 'mobile' && hasExistingMobile) {
                        console.log(`  ↳ Skipping ${domain} (mobile) - already has today's data`);
                        continue;
                    }
                    if (strategy === 'desktop' && hasExistingDesktop) {
                        console.log(`  ↳ Skipping ${domain} (desktop) - already has today's data`);
                        continue;
                    }
                }

                // Fetch metrics from PageSpeed API
                let metricsToStore = [];

                if (strategy === 'both') {
                    const bothResults = await pagespeedService.analyzeBothStrategies(domain);
                    metricsToStore.push(
                        { ...bothResults.mobile, metric_date: targetDate },
                        { ...bothResults.desktop, metric_date: targetDate }
                    );
                    mobileCount++;
                    desktopCount++;
                } else {
                    const result = await pagespeedService.analyzeUrl(domain, strategy);
                    metricsToStore.push({ ...result, metric_date: targetDate });
                    if (strategy === 'mobile') mobileCount++;
                    if (strategy === 'desktop') desktopCount++;
                }

                // Also fetch SEO/crawlability data (once per domain, not per device)
                let seoMetrics = null;
                try {
                    await pagespeedService.delay(pagespeedService.requestDelay);
                    seoMetrics = await pagespeedService.analyzeSEO(domain);
                    console.log(`  ↳ ✓ Fetched SEO/crawlability (${seoMetrics.is_crawlable}% crawlable)`);
                } catch (seoError) {
                    console.error(`  ↳ Failed to fetch SEO data:`, seoError.message);
                }

                // Store metrics in database
                for (const metrics of metricsToStore) {
                    const upsertData = {
                        domain: metrics.url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
                        device_type: metrics.device_type,
                        performance_score: metrics.performance_score,
                        first_contentful_paint: metrics.first_contentful_paint,
                        speed_index: metrics.speed_index,
                        largest_contentful_paint: metrics.largest_contentful_paint,
                        time_to_interactive: metrics.time_to_interactive,
                        total_blocking_time: metrics.total_blocking_time,
                        cumulative_layout_shift: metrics.cumulative_layout_shift,
                        first_input_delay: metrics.first_input_delay,
                        page_load_time: metrics.page_load_time,
                        opportunities_count: metrics.opportunities_count,
                        diagnostics_count: metrics.diagnostics_count,
                        metric_date: metrics.metric_date,
                        lighthouse_version: metrics.lighthouse_version,
                        fetched_at: new Date().toISOString()
                    };

                    // Add SEO/crawlability data if available
                    if (seoMetrics) {
                        upsertData.is_crawlable = seoMetrics.is_crawlable;
                        upsertData.crawlable_blocking_directives = seoMetrics.crawlable_blocking_directives;
                        upsertData.http_status_valid = seoMetrics.http_status_valid;
                        upsertData.robots_txt_valid = seoMetrics.robots_txt_valid;
                        upsertData.mobile_friendly = seoMetrics.mobile_friendly;
                    }

                    const { error: insertError } = await supabase
                        .from('pagespeed_metrics')
                        .upsert(upsertData, {
                            onConflict: 'domain,device_type,metric_date'
                        });

                    if (insertError) {
                        console.error(`  ↳ Failed to store ${metrics.device_type} metrics:`, insertError.message);
                        errors.push({
                            domain,
                            device: metrics.device_type,
                            error: insertError.message
                        });
                    } else {
                        console.log(`  ↳ ✓ Stored ${metrics.device_type} metrics (Score: ${metrics.performance_score})`);
                        results.push({
                            domain,
                            device: metrics.device_type,
                            score: metrics.performance_score,
                            passes_cwv: pagespeedService.passesCoreWebVitals(metrics)
                        });
                    }
                }

            } catch (error) {
                console.error(`  ↳ Error analyzing ${domain}:`, error.message);
                errors.push({
                    domain,
                    error: error.message
                });
            }
        }

        // Update sync log
        const duration = Math.floor((Date.now() - syncStartTime) / 1000);
        if (syncLog) {
            await supabase
                .from('pagespeed_sync_logs')
                .update({
                    status: errors.length > 0 && results.length === 0 ? 'failed' :
                            errors.length > 0 ? 'partial' : 'completed',
                    domains_processed: properties.length,
                    mobile_metrics_fetched: mobileCount,
                    desktop_metrics_fetched: desktopCount,
                    errors_count: errors.length,
                    error_domains: errors.length > 0 ? errors : null,
                    completed_at: new Date().toISOString(),
                    duration_seconds: duration
                })
                .eq('id', syncLog.id);
        }

        console.log(`\n✅ PageSpeed sync completed in ${duration}s`);
        console.log(`   • Domains processed: ${properties.length}`);
        console.log(`   • Mobile metrics: ${mobileCount}`);
        console.log(`   • Desktop metrics: ${desktopCount}`);
        console.log(`   • Errors: ${errors.length}`);

        res.status(200).json({
            success: true,
            summary: {
                total_domains: properties.length,
                mobile_metrics_fetched: mobileCount,
                desktop_metrics_fetched: desktopCount,
                successful: results.length,
                errors: errors.length,
                duration_seconds: duration
            },
            results,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('PageSpeed fetch error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
