/**
 * API endpoint to retrieve cached PageSpeed metrics from the database
 * GET /api/pagespeed/get-pagespeed-kpis
 *
 * Retrieves PageSpeed performance metrics including:
 * - Performance scores (mobile/desktop)
 * - Core Web Vitals (LCP, FID, CLS)
 * - Page load times
 * - Aggregated statistics
 * - Chart.js formatted data
 */

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
            startDate, // Format: YYYY-MM-DD
            endDate,   // Format: YYYY-MM-DD
            domain,    // Optional: filter by specific domain
            groupBy = 'month', // 'day', 'week', 'month'
            device = 'both' // 'mobile', 'desktop', 'both'
        } = req.query;

        console.log('Fetching PageSpeed KPIs with params:', { startDate, endDate, domain, groupBy, device });

        // Determine date range
        const dateRange = calculateDateRange(startDate, endDate);
        console.log(`Date range: ${dateRange.start} to ${dateRange.end}`);

        // Build query
        let metricsQuery = supabase
            .from('pagespeed_metrics')
            .select('*')
            .gte('metric_date', dateRange.start)
            .lte('metric_date', dateRange.end)
            .order('metric_date', { ascending: true })
            .order('domain', { ascending: true });

        // Filter by domain if specified
        if (domain) {
            metricsQuery = metricsQuery.eq('domain', domain);
        }

        // Filter by device if specified
        if (device !== 'both') {
            metricsQuery = metricsQuery.eq('device_type', device);
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
                        total_records: 0,
                        avg_performance_score: 0,
                        avg_page_load_time: 0,
                        cwv_pass_rate: 0,
                        domains: [],
                        hasData: false
                    },
                    chart_data: {
                        performance_scores: { labels: [], mobile: [], desktop: [] },
                        page_load_times: { labels: [], mobile: [], desktop: [] },
                        core_web_vitals: { labels: [], lcp: [], fid: [], cls: [] }
                    },
                    filters: {
                        startDate: dateRange.start,
                        endDate: dateRange.end,
                        domain,
                        groupBy,
                        device
                    }
                },
                message: `No PageSpeed metrics found for the specified date range. Run /api/pagespeed/fetch-pagespeed-metrics to sync data.`,
                timestamp: new Date().toISOString()
            });
        }

        console.log(`Found ${metrics.length} metric records`);

        // Process metrics for dashboard
        const processedData = processMetricsForDashboard(metrics, groupBy);

        // Calculate summary statistics
        const summary = calculateSummaryStats(metrics);

        // Format data for Chart.js
        const chartData = formatChartData(processedData, device);

        // Return response
        res.status(200).json({
            success: true,
            data: {
                metrics: processedData,
                summary,
                chart_data: chartData,
                filters: {
                    startDate: dateRange.start,
                    endDate: dateRange.end,
                    domain,
                    groupBy,
                    device
                }
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Get PageSpeed KPIs error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Calculate date range for the query
 * Defaults to last 30 days if not specified
 */
function calculateDateRange(startDate, endDate) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
    };
}

/**
 * Process metrics and group by specified time period
 * Groups metrics by date/week/month and domain
 */
function processMetricsForDashboard(metrics, groupBy) {
    const grouped = {};

    metrics.forEach(metric => {
        const groupKey = getGroupKey(metric.metric_date, groupBy);
        const domain = metric.domain;
        const deviceType = metric.device_type;

        // Create nested structure: groupKey -> domain -> device
        if (!grouped[groupKey]) {
            grouped[groupKey] = {};
        }
        if (!grouped[groupKey][domain]) {
            grouped[groupKey][domain] = {};
        }

        grouped[groupKey][domain][deviceType] = {
            performance_score: metric.performance_score,
            page_load_time: parseFloat(metric.page_load_time) || 0,
            first_contentful_paint: metric.first_contentful_paint,
            speed_index: metric.speed_index,
            largest_contentful_paint: metric.largest_contentful_paint,
            time_to_interactive: metric.time_to_interactive,
            total_blocking_time: metric.total_blocking_time,
            cumulative_layout_shift: parseFloat(metric.cumulative_layout_shift) || 0,
            first_input_delay: metric.first_input_delay,
            passes_cwv: checkCoreWebVitalsPass(metric),
            fetched_at: metric.fetched_at,
            health_rating: getPerformanceRating(metric.performance_score),
            // Crawlability fields
            is_crawlable: metric.is_crawlable,
            crawlable_blocking_directives: metric.crawlable_blocking_directives,
            http_status_valid: metric.http_status_valid,
            robots_txt_valid: metric.robots_txt_valid,
            mobile_friendly: metric.mobile_friendly
        };
    });

    // Convert to array format with aggregated data
    const processed = [];
    Object.keys(grouped).sort().forEach(groupKey => {
        const domains = grouped[groupKey];

        Object.keys(domains).forEach(domain => {
            const devices = domains[domain];

            processed.push({
                period: groupKey,
                domain,
                mobile: devices.mobile || null,
                desktop: devices.desktop || null,
                avg_performance: calculateDeviceAverage(devices, 'performance_score'),
                avg_load_time: calculateDeviceAverage(devices, 'page_load_time'),
                cwv_status: getCWVStatus(devices)
            });
        });
    });

    return processed;
}

/**
 * Get grouping key based on date and groupBy parameter
 */
function getGroupKey(dateString, groupBy) {
    const date = new Date(dateString);

    switch (groupBy) {
        case 'day':
            return dateString; // Already in YYYY-MM-DD format

        case 'week':
            // Get ISO week number
            const weekNumber = getISOWeek(date);
            const year = date.getFullYear();
            return `${year}-W${String(weekNumber).padStart(2, '0')}`;

        case 'month':
        default:
            const year2 = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year2}-${month}`;
    }
}

/**
 * Get ISO week number for a date
 */
function getISOWeek(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNumber;
}

/**
 * Calculate average of a metric across mobile and desktop
 */
function calculateDeviceAverage(devices, metric) {
    const values = [];
    if (devices.mobile && devices.mobile[metric] !== null) {
        values.push(devices.mobile[metric]);
    }
    if (devices.desktop && devices.desktop[metric] !== null) {
        values.push(devices.desktop[metric]);
    }

    if (values.length === 0) return 0;
    return parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2));
}

/**
 * Determine overall CWV status across devices
 */
function getCWVStatus(devices) {
    const mobilePass = devices.mobile?.passes_cwv || false;
    const desktopPass = devices.desktop?.passes_cwv || false;

    if (mobilePass && desktopPass) return 'pass';
    if (!mobilePass && !desktopPass) return 'fail';
    return 'partial';
}

/**
 * Check if metrics pass Core Web Vitals thresholds
 * All three must be 'good' to pass
 */
function checkCoreWebVitalsPass(metric) {
    const lcpPass = metric.largest_contentful_paint <= 2500;
    const fidPass = metric.first_input_delay <= 100;
    const clsPass = parseFloat(metric.cumulative_layout_shift) <= 0.1;

    return lcpPass && fidPass && clsPass;
}

/**
 * Get performance rating based on score
 * Based on Google Lighthouse thresholds
 */
function getPerformanceRating(score) {
    if (score >= 90) return 'excellent';
    if (score >= 50) return 'good';
    return 'poor';
}

/**
 * Calculate summary statistics across all metrics
 */
function calculateSummaryStats(metrics) {
    const totalRecords = metrics.length;

    if (totalRecords === 0) {
        return {
            total_records: 0,
            avg_performance_score: 0,
            avg_page_load_time: 0,
            cwv_pass_rate: 0,
            domains: [],
            hasData: false
        };
    }

    // Calculate averages
    const totalPerformanceScore = metrics.reduce((sum, m) => sum + (m.performance_score || 0), 0);
    const totalLoadTime = metrics.reduce((sum, m) => sum + (parseFloat(m.page_load_time) || 0), 0);

    const avgPerformanceScore = parseFloat((totalPerformanceScore / totalRecords).toFixed(1));
    const avgPageLoadTime = parseFloat((totalLoadTime / totalRecords).toFixed(2));

    // Calculate CWV pass rate
    const cwvPasses = metrics.filter(m => checkCoreWebVitalsPass(m)).length;
    const cwvPassRate = parseFloat((cwvPasses / totalRecords * 100).toFixed(1));

    // Get unique domains
    const uniqueDomains = [...new Set(metrics.map(m => m.domain))];

    // Performance distribution
    const performanceDistribution = {
        excellent: metrics.filter(m => m.performance_score >= 90).length,
        good: metrics.filter(m => m.performance_score >= 50 && m.performance_score < 90).length,
        poor: metrics.filter(m => m.performance_score < 50).length
    };

    // Device breakdown
    const deviceBreakdown = {
        mobile: metrics.filter(m => m.device_type === 'mobile').length,
        desktop: metrics.filter(m => m.device_type === 'desktop').length
    };

    // Core Web Vitals breakdown
    const cwvBreakdown = {
        lcp_good: metrics.filter(m => m.largest_contentful_paint <= 2500).length,
        fid_good: metrics.filter(m => m.first_input_delay <= 100).length,
        cls_good: metrics.filter(m => parseFloat(m.cumulative_layout_shift) <= 0.1).length
    };

    // Crawlability breakdown
    const crawlabilityMetrics = metrics.filter(m => m.is_crawlable !== null && m.is_crawlable !== undefined);
    const crawlabilityBreakdown = crawlabilityMetrics.length > 0 ? {
        crawlable: crawlabilityMetrics.filter(m => m.is_crawlable === 100).length,
        not_crawlable: crawlabilityMetrics.filter(m => m.is_crawlable === 0).length,
        avg_crawlability: parseFloat((crawlabilityMetrics.reduce((sum, m) => sum + m.is_crawlable, 0) / crawlabilityMetrics.length).toFixed(1)),
        http_status_valid: crawlabilityMetrics.filter(m => m.http_status_valid === 100).length,
        robots_txt_valid: crawlabilityMetrics.filter(m => m.robots_txt_valid === 100).length,
        mobile_friendly: crawlabilityMetrics.filter(m => m.mobile_friendly === 100).length,
        total_checked: crawlabilityMetrics.length
    } : null;

    // Top performers (by performance score)
    const sortedByScore = [...metrics].sort((a, b) => b.performance_score - a.performance_score);
    const topPerformers = sortedByScore.slice(0, 5).map(m => ({
        domain: m.domain,
        device: m.device_type,
        score: m.performance_score,
        date: m.metric_date
    }));

    // Bottom performers
    const bottomPerformers = sortedByScore.slice(-5).reverse().map(m => ({
        domain: m.domain,
        device: m.device_type,
        score: m.performance_score,
        date: m.metric_date
    }));

    return {
        total_records: totalRecords,
        avg_performance_score: avgPerformanceScore,
        avg_page_load_time: avgPageLoadTime,
        cwv_pass_rate: cwvPassRate,
        domains: uniqueDomains,
        performance_distribution: performanceDistribution,
        device_breakdown: deviceBreakdown,
        cwv_breakdown: cwvBreakdown,
        crawlability_breakdown: crawlabilityBreakdown,
        top_performers: topPerformers,
        bottom_performers: bottomPerformers,
        hasData: true
    };
}

/**
 * Format data for Chart.js consumption
 * Creates time-series data for various metrics
 */
function formatChartData(processedData, deviceFilter) {
    // Group by period for time-series charts
    const periodMap = {};

    processedData.forEach(item => {
        if (!periodMap[item.period]) {
            periodMap[item.period] = {
                mobile_scores: [],
                desktop_scores: [],
                mobile_load_times: [],
                desktop_load_times: [],
                lcp_values: [],
                fid_values: [],
                cls_values: [],
                crawlability_values: [],
                http_status_values: [],
                mobile_friendly_values: []
            };
        }

        const period = periodMap[item.period];

        // Performance scores
        if (item.mobile?.performance_score !== null && item.mobile?.performance_score !== undefined) {
            period.mobile_scores.push(item.mobile.performance_score);
        }
        if (item.desktop?.performance_score !== null && item.desktop?.performance_score !== undefined) {
            period.desktop_scores.push(item.desktop.performance_score);
        }

        // Page load times
        if (item.mobile?.page_load_time) {
            period.mobile_load_times.push(item.mobile.page_load_time);
        }
        if (item.desktop?.page_load_time) {
            period.desktop_load_times.push(item.desktop.page_load_time);
        }

        // Core Web Vitals (use mobile by default, or desktop if mobile not available)
        const cwvSource = item.mobile || item.desktop;
        if (cwvSource) {
            if (cwvSource.largest_contentful_paint) {
                period.lcp_values.push(cwvSource.largest_contentful_paint);
            }
            if (cwvSource.first_input_delay) {
                period.fid_values.push(cwvSource.first_input_delay);
            }
            if (cwvSource.cumulative_layout_shift) {
                period.cls_values.push(cwvSource.cumulative_layout_shift);
            }

            // Crawlability data (same for both mobile/desktop)
            if (cwvSource.is_crawlable !== null && cwvSource.is_crawlable !== undefined) {
                period.crawlability_values.push(cwvSource.is_crawlable);
            }
            if (cwvSource.http_status_valid !== null && cwvSource.http_status_valid !== undefined) {
                period.http_status_values.push(cwvSource.http_status_valid);
            }
            if (cwvSource.mobile_friendly !== null && cwvSource.mobile_friendly !== undefined) {
                period.mobile_friendly_values.push(cwvSource.mobile_friendly);
            }
        }
    });

    // Calculate averages per period
    const labels = Object.keys(periodMap).sort();
    const chartData = {
        performance_scores: {
            labels: labels,
            mobile: [],
            desktop: []
        },
        page_load_times: {
            labels: labels,
            mobile: [],
            desktop: []
        },
        core_web_vitals: {
            labels: labels,
            lcp: [], // in milliseconds
            fid: [], // in milliseconds
            cls: []  // unitless, 0-1 scale
        },
        crawlability: {
            labels: labels,
            crawlable: [], // 0-100 percentage
            http_status: [], // 0-100 percentage
            mobile_friendly: [] // 0-100 percentage
        }
    };

    labels.forEach(period => {
        const data = periodMap[period];

        // Performance scores
        chartData.performance_scores.mobile.push(
            calculateGroupAverages(data.mobile_scores)
        );
        chartData.performance_scores.desktop.push(
            calculateGroupAverages(data.desktop_scores)
        );

        // Page load times
        chartData.page_load_times.mobile.push(
            calculateGroupAverages(data.mobile_load_times)
        );
        chartData.page_load_times.desktop.push(
            calculateGroupAverages(data.desktop_load_times)
        );

        // Core Web Vitals
        chartData.core_web_vitals.lcp.push(
            calculateGroupAverages(data.lcp_values)
        );
        chartData.core_web_vitals.fid.push(
            calculateGroupAverages(data.fid_values)
        );
        chartData.core_web_vitals.cls.push(
            calculateGroupAverages(data.cls_values)
        );

        // Crawlability
        chartData.crawlability.crawlable.push(
            calculateGroupAverages(data.crawlability_values)
        );
        chartData.crawlability.http_status.push(
            calculateGroupAverages(data.http_status_values)
        );
        chartData.crawlability.mobile_friendly.push(
            calculateGroupAverages(data.mobile_friendly_values)
        );
    });

    return chartData;
}

/**
 * Calculate average of an array of numbers
 * Returns 0 if array is empty
 */
function calculateGroupAverages(values) {
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return parseFloat((sum / values.length).toFixed(2));
}
