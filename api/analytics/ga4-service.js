// Google Analytics 4 Data API Service
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

/**
 * GA4 Service for fetching analytics data
 * Handles authentication and data retrieval from Google Analytics 4 properties
 */
class GA4Service {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    /**
     * Initialize the GA4 client with service account credentials
     */
    initialize() {
        if (this.initialized) return;

        try {
            // Check if credentials are provided via environment variable
            const credentialsJson = process.env.GA4_SERVICE_ACCOUNT_CREDENTIALS;

            if (!credentialsJson) {
                throw new Error('GA4_SERVICE_ACCOUNT_CREDENTIALS environment variable is not set');
            }

            const credentials = JSON.parse(credentialsJson);

            this.client = new BetaAnalyticsDataClient({
                credentials: {
                    client_email: credentials.client_email,
                    private_key: credentials.private_key,
                }
            });

            this.initialized = true;
            console.log('GA4 Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize GA4 Service:', error.message);
            throw error;
        }
    }

    /**
     * Fetch monthly metrics for a specific property
     * @param {string} propertyId - GA4 Property ID
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     * @returns {Promise<Object>} Metrics data
     */
    async fetchMonthlyMetrics(propertyId, startDate, endDate) {
        this.initialize();

        try {
            const [response] = await this.client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [
                    {
                        startDate: startDate,
                        endDate: endDate,
                    },
                ],
                metrics: [
                    { name: 'keyEvents' },                    // Key Events Triggered
                    { name: 'newUsers' },                     // New Users
                    { name: 'activeUsers' },                  // Active Users
                    { name: 'engagementRate' },               // Engagement Rate (%)
                    { name: 'userEngagementDuration' },       // Total engagement duration
                    { name: 'active28DayUsers' }              // 28-day active users
                ],
                dimensions: [
                    { name: 'date' }
                ]
            });

            return this.processMetricsResponse(response);
        } catch (error) {
            console.error(`Error fetching metrics for property ${propertyId}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch year-over-year comparison metrics
     * @param {string} propertyId - GA4 Property ID
     * @param {string} currentStartDate - Current period start date
     * @param {string} currentEndDate - Current period end date
     * @param {string} previousStartDate - Previous year start date
     * @param {string} previousEndDate - Previous year end date
     * @returns {Promise<Object>} Comparison data
     */
    async fetchYearOverYearMetrics(propertyId, currentStartDate, currentEndDate, previousStartDate, previousEndDate) {
        this.initialize();

        try {
            const [response] = await this.client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [
                    {
                        startDate: currentStartDate,
                        endDate: currentEndDate,
                        name: 'current_period'
                    },
                    {
                        startDate: previousStartDate,
                        endDate: previousEndDate,
                        name: 'previous_period'
                    }
                ],
                metrics: [
                    { name: 'keyEvents' },
                    { name: 'newUsers' },
                    { name: 'activeUsers' },
                    { name: 'engagementRate' },
                    { name: 'userEngagementDuration' },
                    { name: 'active28DayUsers' }
                ]
            });

            return this.processYoYResponse(response);
        } catch (error) {
            console.error(`Error fetching YoY metrics for property ${propertyId}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch metrics for multiple domains/properties
     * @param {Array<Object>} properties - Array of {propertyId, domain} objects
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @returns {Promise<Array>} Array of domain metrics
     */
    async fetchMultiDomainMetrics(properties, startDate, endDate) {
        const results = [];

        for (const { propertyId, domain } of properties) {
            try {
                const metrics = await this.fetchMonthlyMetrics(propertyId, startDate, endDate);
                results.push({
                    domain,
                    propertyId,
                    metrics,
                    success: true
                });
            } catch (error) {
                console.error(`Failed to fetch metrics for ${domain}:`, error.message);
                results.push({
                    domain,
                    propertyId,
                    error: error.message,
                    success: false
                });
            }
        }

        return results;
    }

    /**
     * Safely get metric value from row
     */
    getMetricValue(row, index, defaultValue = 0) {
        return row.metricValues && row.metricValues[index] && row.metricValues[index].value
            ? row.metricValues[index].value
            : defaultValue;
    }

    /**
     * Process GA4 API response into structured metrics
     */
    processMetricsResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return {
                keyEvents: 0,
                newUsers: 0,
                activeUsers: 0,
                engagementRate: 0,
                avgEngagementTime: 0,
                totalEngagementDuration: 0
            };
        }

        // Aggregate all rows
        let totals = {
            keyEvents: 0,
            newUsers: 0,
            activeUsers: 0,
            engagementRate: 0,
            totalEngagementDuration: 0
        };

        response.rows.forEach(row => {
            totals.keyEvents += parseInt(this.getMetricValue(row, 0, 0));
            totals.newUsers += parseInt(this.getMetricValue(row, 1, 0));
            totals.activeUsers += parseInt(this.getMetricValue(row, 2, 0));
            totals.engagementRate += parseFloat(this.getMetricValue(row, 3, 0));
            totals.totalEngagementDuration += parseFloat(this.getMetricValue(row, 4, 0));
        });

        // Calculate averages
        const rowCount = response.rows.length;
        totals.engagementRate = totals.engagementRate / rowCount;
        totals.avgEngagementTime = totals.activeUsers > 0
            ? totals.totalEngagementDuration / totals.activeUsers
            : 0;

        return totals;
    }

    /**
     * Process year-over-year comparison response
     */
    processYoYResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return {
                current: this.getEmptyMetrics(),
                previous: this.getEmptyMetrics(),
                comparison: this.getEmptyComparison()
            };
        }

        // Response contains two date ranges
        const row = response.rows[0];

        const current = {
            keyEvents: parseInt(this.getMetricValue(row, 0, 0)),
            newUsers: parseInt(this.getMetricValue(row, 1, 0)),
            activeUsers: parseInt(this.getMetricValue(row, 2, 0)),
            engagementRate: parseFloat(this.getMetricValue(row, 3, 0)),
            totalEngagementDuration: parseFloat(this.getMetricValue(row, 4, 0))
        };

        const previous = {
            keyEvents: parseInt(this.getMetricValue(row, 6, 0)),
            newUsers: parseInt(this.getMetricValue(row, 7, 0)),
            activeUsers: parseInt(this.getMetricValue(row, 8, 0)),
            engagementRate: parseFloat(this.getMetricValue(row, 9, 0)),
            totalEngagementDuration: parseFloat(this.getMetricValue(row, 10, 0))
        };

        // Calculate average engagement time
        current.avgEngagementTime = current.activeUsers > 0
            ? current.totalEngagementDuration / current.activeUsers
            : 0;
        previous.avgEngagementTime = previous.activeUsers > 0
            ? previous.totalEngagementDuration / previous.activeUsers
            : 0;

        return {
            current,
            previous,
            comparison: this.calculateComparison(current, previous)
        };
    }

    /**
     * Calculate percentage change and trend
     */
    calculateComparison(current, previous) {
        const compare = (curr, prev) => {
            if (prev === 0) return { change: curr > 0 ? 100 : 0, trend: curr > 0 ? 'up' : 'neutral' };
            const changePercent = ((curr - prev) / prev) * 100;
            return {
                change: changePercent,
                trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral'
            };
        };

        return {
            keyEvents: compare(current.keyEvents, previous.keyEvents),
            newUsers: compare(current.newUsers, previous.newUsers),
            activeUsers: compare(current.activeUsers, previous.activeUsers),
            engagementRate: compare(current.engagementRate, previous.engagementRate),
            avgEngagementTime: compare(current.avgEngagementTime, previous.avgEngagementTime)
        };
    }

    getEmptyMetrics() {
        return {
            keyEvents: 0,
            newUsers: 0,
            activeUsers: 0,
            engagementRate: 0,
            avgEngagementTime: 0,
            totalEngagementDuration: 0
        };
    }

    getEmptyComparison() {
        return {
            keyEvents: { change: 0, trend: 'neutral' },
            newUsers: { change: 0, trend: 'neutral' },
            activeUsers: { change: 0, trend: 'neutral' },
            engagementRate: { change: 0, trend: 'neutral' },
            avgEngagementTime: { change: 0, trend: 'neutral' }
        };
    }
}

// Export singleton instance
module.exports = new GA4Service();
