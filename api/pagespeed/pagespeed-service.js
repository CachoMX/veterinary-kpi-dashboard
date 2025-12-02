/**
 * Google PageSpeed Insights API Service
 * Fetches performance metrics, Core Web Vitals, and Lighthouse scores
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class PageSpeedService {
    constructor() {
        this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
        this.apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || null;

        // Rate limiting: 25,000 requests/day with key, 240/day without
        this.requestDelay = this.apiKey ? 100 : 5000; // ms between requests
    }

    /**
     * Fetch PageSpeed metrics for a domain
     * @param {string} url - Full URL to analyze
     * @param {string} strategy - 'mobile' or 'desktop'
     * @returns {Promise<Object>} Formatted metrics
     */
    async analyzeUrl(url, strategy = 'mobile') {
        try {
            // Ensure URL has protocol
            if (!url.startsWith('http')) {
                url = `https://${url}`;
            }

            // Build API URL
            const params = new URLSearchParams({
                url: url,
                strategy: strategy,
                category: 'performance'
            });

            if (this.apiKey) {
                params.append('key', this.apiKey);
            }

            const apiUrl = `${this.baseUrl}?${params.toString()}`;

            console.log(`Analyzing ${url} (${strategy})...`);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PageSpeed API error (${response.status}): ${error}`);
            }

            const data = await response.json();

            // Extract and format metrics
            return this.formatMetrics(data, url, strategy);

        } catch (error) {
            console.error(`Error analyzing ${url}:`, error.message);
            throw error;
        }
    }

    /**
     * Format raw PageSpeed API response into clean metrics
     * @param {Object} data - Raw API response
     * @param {string} url - Original URL
     * @param {string} strategy - Device strategy
     * @returns {Object} Formatted metrics
     */
    formatMetrics(data, url, strategy) {
        const lighthouseResult = data.lighthouseResult;
        const audits = lighthouseResult?.audits || {};
        const categories = lighthouseResult?.categories || {};

        // Performance score (0-100)
        const performanceScore = Math.round((categories.performance?.score || 0) * 100);

        // Core metrics (in milliseconds)
        const metrics = lighthouseResult?.audits?.metrics?.details?.items?.[0] || {};

        // Core Web Vitals
        const lcp = audits['largest-contentful-paint']?.numericValue || null;
        const fid = audits['max-potential-fid']?.numericValue || null; // FID proxy
        const cls = audits['cumulative-layout-shift']?.numericValue || null;

        // Other important metrics
        const fcp = audits['first-contentful-paint']?.numericValue || null;
        const speedIndex = audits['speed-index']?.numericValue || null;
        const tti = audits['interactive']?.numericValue || null;
        const tbt = audits['total-blocking-time']?.numericValue || null;

        // Calculate page load time (use TTI as proxy, convert to seconds)
        const pageLoadTime = tti ? (tti / 1000).toFixed(2) : null;

        // Count opportunities and diagnostics
        const opportunities = Object.values(audits).filter(
            audit => audit.details?.type === 'opportunity'
        ).length;

        const diagnostics = Object.values(audits).filter(
            audit => audit.details?.type === 'table' && audit.score !== null && audit.score < 1
        ).length;

        return {
            url,
            device_type: strategy,
            performance_score: performanceScore,

            // Core Web Vitals (ms)
            largest_contentful_paint: lcp ? Math.round(lcp) : null,
            first_input_delay: fid ? Math.round(fid) : null,
            cumulative_layout_shift: cls ? parseFloat(cls.toFixed(3)) : null,

            // Other metrics (ms)
            first_contentful_paint: fcp ? Math.round(fcp) : null,
            speed_index: speedIndex ? Math.round(speedIndex) : null,
            time_to_interactive: tti ? Math.round(tti) : null,
            total_blocking_time: tbt ? Math.round(tbt) : null,

            // Page load time (seconds)
            page_load_time: pageLoadTime ? parseFloat(pageLoadTime) : null,

            // Counts
            opportunities_count: opportunities,
            diagnostics_count: diagnostics,

            // Metadata
            lighthouse_version: lighthouseResult?.lighthouseVersion || null,
            fetch_time: lighthouseResult?.fetchTime || new Date().toISOString()
        };
    }

    /**
     * Fetch SEO and crawlability data for a URL
     * @param {string} url - Full URL to analyze
     * @returns {Promise<Object>} SEO metrics including crawlability
     */
    async analyzeSEO(url) {
        try {
            // Ensure URL has protocol
            if (!url.startsWith('http')) {
                url = `https://${url}`;
            }

            // Build API URL with SEO category
            const params = new URLSearchParams({
                url: url,
                category: 'seo'
            });

            if (this.apiKey) {
                params.append('key', this.apiKey);
            }

            const apiUrl = `${this.baseUrl}?${params.toString()}`;

            console.log(`Analyzing SEO for ${url}...`);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`PageSpeed SEO API error (${response.status}): ${error}`);
            }

            const data = await response.json();

            // Extract SEO/crawlability metrics
            return this.formatSEOMetrics(data, url);

        } catch (error) {
            console.error(`Error analyzing SEO for ${url}:`, error.message);
            throw error;
        }
    }

    /**
     * Format SEO metrics from PageSpeed API
     * @param {Object} data - Raw API response
     * @param {string} url - Original URL
     * @returns {Object} Formatted SEO metrics
     */
    formatSEOMetrics(data, url) {
        const audits = data.lighthouseResult?.audits || {};

        // Crawlability audit
        const isCrawlable = audits['is-crawlable'];
        const crawlableScore = isCrawlable && isCrawlable.score !== null ? Math.round(isCrawlable.score * 100) : null;
        const crawlableBlocking = isCrawlable?.details?.items || [];

        // HTTP status code
        const httpStatusCode = audits['http-status-code'];
        const statusCodeScore = httpStatusCode && httpStatusCode.score !== null ? Math.round(httpStatusCode.score * 100) : null;

        // Robots.txt validity
        const robotsTxt = audits['robots-txt'];
        const robotsTxtValid = robotsTxt && robotsTxt.score !== null ? Math.round(robotsTxt.score * 100) : null;

        // Mobile friendly
        const viewportAudit = audits['viewport'];
        const mobileFriendly = viewportAudit && viewportAudit.score !== null ? Math.round(viewportAudit.score * 100) : null;

        return {
            url,
            is_crawlable: crawlableScore,
            crawlable_blocking_directives: crawlableBlocking.length,
            http_status_valid: statusCodeScore,
            robots_txt_valid: robotsTxtValid,
            mobile_friendly: mobileFriendly,
            fetch_time: new Date().toISOString()
        };
    }

    /**
     * Analyze both mobile and desktop for a URL
     * @param {string} url - URL to analyze
     * @returns {Promise<Object>} Object with mobile and desktop results
     */
    async analyzeBothStrategies(url) {
        const results = {};

        try {
            // Mobile first
            results.mobile = await this.analyzeUrl(url, 'mobile');

            // Wait before desktop request (rate limiting)
            await this.delay(this.requestDelay);

            // Desktop
            results.desktop = await this.analyzeUrl(url, 'desktop');

            return results;

        } catch (error) {
            console.error(`Error analyzing ${url}:`, error.message);
            throw error;
        }
    }

    /**
     * Batch analyze multiple URLs
     * @param {Array<string>} urls - Array of URLs to analyze
     * @param {string} strategy - 'mobile', 'desktop', or 'both'
     * @param {Function} progressCallback - Optional callback for progress updates
     * @returns {Promise<Array>} Array of results
     */
    async analyzeBatch(urls, strategy = 'both', progressCallback = null) {
        const results = [];
        const errors = [];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            try {
                if (strategy === 'both') {
                    const result = await this.analyzeBothStrategies(url);
                    results.push({ url, ...result });
                } else {
                    const result = await this.analyzeUrl(url, strategy);
                    results.push(result);
                }

                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: urls.length,
                        url: url,
                        success: true
                    });
                }

            } catch (error) {
                console.error(`Failed to analyze ${url}:`, error.message);
                errors.push({
                    url: url,
                    error: error.message
                });

                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: urls.length,
                        url: url,
                        success: false,
                        error: error.message
                    });
                }
            }

            // Rate limiting delay between requests
            if (i < urls.length - 1) {
                await this.delay(this.requestDelay);
            }
        }

        return { results, errors };
    }

    /**
     * Delay helper for rate limiting
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get Core Web Vitals rating
     * @param {string} metric - 'lcp', 'fid', or 'cls'
     * @param {number} value - Metric value
     * @returns {string} 'good', 'needs_improvement', or 'poor'
     */
    getCoreWebVitalsRating(metric, value) {
        if (value === null || value === undefined) return 'unknown';

        const thresholds = {
            lcp: { good: 2500, needsImprovement: 4000 },      // ms
            fid: { good: 100, needsImprovement: 300 },        // ms
            cls: { good: 0.1, needsImprovement: 0.25 }        // score
        };

        const threshold = thresholds[metric.toLowerCase()];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.needsImprovement) return 'needs_improvement';
        return 'poor';
    }

    /**
     * Check if URL passes Core Web Vitals
     * @param {Object} metrics - Metrics object with LCP, FID, CLS
     * @returns {boolean}
     */
    passesCoreWebVitals(metrics) {
        const lcpRating = this.getCoreWebVitalsRating('lcp', metrics.largest_contentful_paint);
        const fidRating = this.getCoreWebVitalsRating('fid', metrics.first_input_delay);
        const clsRating = this.getCoreWebVitalsRating('cls', metrics.cumulative_layout_shift);

        return lcpRating === 'good' && fidRating === 'good' && clsRating === 'good';
    }
}

// Export singleton instance
module.exports = new PageSpeedService();
