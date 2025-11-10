// Enhanced Google Analytics 4 Data API Service
// Supports traffic sources and individual key events breakdown
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

/**
 * Enhanced GA4 Service for comprehensive analytics data
 */
class GA4ServiceEnhanced {
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
            console.log('Enhanced GA4 Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize GA4 Service:', error.message);
            throw error;
        }
    }

    /**
     * Fetch comprehensive monthly metrics including all data points
     * @param {string} propertyId - GA4 Property ID
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     * @returns {Promise<Object>} Complete metrics data
     */
    async fetchCompleteMonthlyMetrics(propertyId, startDate, endDate) {
        this.initialize();

        try {
            // Fetch base metrics
            const baseMetrics = await this.fetchBaseMetrics(propertyId, startDate, endDate);

            // Fetch traffic sources
            const trafficSources = await this.fetchTrafficSources(propertyId, startDate, endDate);

            // Fetch key events breakdown
            const keyEvents = await this.fetchKeyEventsBreakdown(propertyId, startDate, endDate);

            return {
                baseMetrics,
                trafficSources,
                keyEvents,
                fetchedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error(`Error fetching complete metrics for property ${propertyId}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch base metrics (totals for the period)
     */
    async fetchBaseMetrics(propertyId, startDate, endDate) {
        const [response] = await this.client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'conversions' },              // Total key events/conversions
                { name: 'newUsers' },                  // New Users
                { name: 'activeUsers' },               // Active Users
                { name: 'totalUsers' },                // Total Users
                { name: 'sessions' },                  // Sessions
                { name: 'engagementRate' },            // Engagement Rate (%)
                { name: 'userEngagementDuration' },    // Total engagement duration
            ]
        });

        return this.processBaseMetricsResponse(response);
    }

    /**
     * Fetch traffic sources breakdown
     */
    async fetchTrafficSources(propertyId, startDate, endDate) {
        try {
            const [response] = await this.client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [
                    { name: 'sessionSource' },
                    { name: 'sessionMedium' },
                    { name: 'sessionDefaultChannelGroup' }
                ],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'sessions' },
                    { name: 'newUsers' },
                    { name: 'engagedSessions' },
                    { name: 'engagementRate' },
                    { name: 'userEngagementDuration' }
                ],
                orderBys: [
                    { metric: { metricName: 'sessions' }, desc: true }
                ],
                limit: 50 // Top 50 traffic sources
            });

            return this.processTrafficSourcesResponse(response);
        } catch (error) {
            console.error('Error fetching traffic sources:', error.message);
            return [];
        }
    }

    /**
     * Fetch individual key events breakdown
     * Gets ALL conversion events, not just predefined ones
     */
    async fetchKeyEventsBreakdown(propertyId, startDate, endDate) {
        try {
            // First, try to get all conversions using the conversions metric
            const [response] = await this.client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [
                    { name: 'eventName' }
                ],
                metrics: [
                    { name: 'conversions' },
                    { name: 'totalUsers' },
                    { name: 'eventValue' }
                ],
                orderBys: [
                    { metric: { metricName: 'conversions' }, desc: true }
                ],
                limit: 100 // Get up to 100 different conversion events
            });

            // Process using conversions metric
            if (response.rows && response.rows.length > 0) {
                return this.processKeyEventsResponseConversions(response);
            }

            return [];
        } catch (error) {
            console.error('Error fetching key events with conversions metric:', error.message);

            // Fallback: Try with eventCount for all events
            try {
                console.log('Trying fallback approach with eventCount...');
                const [altResponse] = await this.client.runReport({
                    property: `properties/${propertyId}`,
                    dateRanges: [{ startDate, endDate }],
                    dimensions: [
                        { name: 'eventName' }
                    ],
                    metrics: [
                        { name: 'eventCount' },
                        { name: 'totalUsers' }
                    ],
                    // Filter to only get events that are marked as key events
                    dimensionFilter: {
                        filter: {
                            fieldName: 'eventName',
                            stringFilter: {
                                matchType: 'CONTAINS',
                                value: '',  // This will match all events
                                caseSensitive: false
                            }
                        }
                    },
                    orderBys: [
                        { metric: { metricName: 'eventCount' }, desc: true }
                    ],
                    limit: 100
                });

                return this.processKeyEventsResponse(altResponse);
            } catch (altError) {
                console.error('Fallback key events fetch also failed:', altError.message);
                return [];
            }
        }
    }

    /**
     * Process base metrics response
     */
    processBaseMetricsResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return this.getEmptyBaseMetrics();
        }

        const row = response.rows[0];
        const totalEngagementDuration = parseFloat(this.getMetricValue(row, 6, 0));
        const activeUsers = parseInt(this.getMetricValue(row, 2, 0));

        return {
            keyEvents: parseInt(this.getMetricValue(row, 0, 0)),
            newUsers: parseInt(this.getMetricValue(row, 1, 0)),
            activeUsers: activeUsers,
            totalUsers: parseInt(this.getMetricValue(row, 3, 0)),
            sessions: parseInt(this.getMetricValue(row, 4, 0)),
            engagementRate: parseFloat(this.getMetricValue(row, 5, 0)) * 100, // Convert to percentage
            avgEngagementTime: activeUsers > 0 ? totalEngagementDuration / activeUsers : 0,
            totalEngagementDuration: totalEngagementDuration
        };
    }

    /**
     * Process traffic sources response
     */
    processTrafficSourcesResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return [];
        }

        return response.rows.map(row => {
            const source = this.getDimensionValue(row, 0, '(not set)');
            const medium = this.getDimensionValue(row, 1, '(not set)');
            const channelGroup = this.getDimensionValue(row, 2, 'Unassigned');
            const users = parseInt(this.getMetricValue(row, 0, 0));
            const sessions = parseInt(this.getMetricValue(row, 1, 0));
            const engagedSessions = parseInt(this.getMetricValue(row, 3, 0));
            const totalEngagementDuration = parseFloat(this.getMetricValue(row, 5, 0));

            return {
                sourceMedium: `${source} / ${medium}`,
                source,
                medium,
                channelGroup,
                users,
                sessions,
                newUsers: parseInt(this.getMetricValue(row, 2, 0)),
                engagedSessions,
                engagementRate: sessions > 0 ? (engagedSessions / sessions) * 100 : 0,
                avgEngagementTime: users > 0 ? totalEngagementDuration / users : 0
            };
        });
    }

    /**
     * Process key events response
     */
    processKeyEventsResponse(response) {
        if (!response.rows || response.rows.length === 0) {
            return [];
        }

        return response.rows.map(row => ({
            eventName: this.getDimensionValue(row, 0, 'unknown'),
            eventCount: parseInt(this.getMetricValue(row, 0, 0)),
            usersTriggering: parseInt(this.getMetricValue(row, 1, 0)),
            eventValue: parseFloat(this.getMetricValue(row, 2, 0))
        }));
    }

    /**
     * Process alternative key events response (using conversions metric)
     */
    processKeyEventsResponseAlt(response) {
        if (!response.rows || response.rows.length === 0) {
            return [];
        }

        return response.rows.map(row => ({
            eventName: this.getDimensionValue(row, 0, 'unknown'),
            eventCount: parseInt(this.getMetricValue(row, 0, 0)),
            usersTriggering: parseInt(this.getMetricValue(row, 1, 0)),
            eventValue: 0
        }));
    }

    /**
     * Process key events response using conversions metric
     */
    processKeyEventsResponseConversions(response) {
        if (!response.rows || response.rows.length === 0) {
            return [];
        }

        return response.rows.map(row => ({
            eventName: this.getDimensionValue(row, 0, 'unknown'),
            eventCount: parseInt(this.getMetricValue(row, 0, 0)), // conversions count
            usersTriggering: parseInt(this.getMetricValue(row, 1, 0)),
            eventValue: parseFloat(this.getMetricValue(row, 2, 0))
        }));
    }

    /**
     * Safely get dimension value from row
     */
    getDimensionValue(row, index, defaultValue = '') {
        return row.dimensionValues && row.dimensionValues[index] && row.dimensionValues[index].value
            ? row.dimensionValues[index].value
            : defaultValue;
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
     * Get empty base metrics structure
     */
    getEmptyBaseMetrics() {
        return {
            keyEvents: 0,
            newUsers: 0,
            activeUsers: 0,
            totalUsers: 0,
            sessions: 0,
            engagementRate: 0,
            avgEngagementTime: 0,
            totalEngagementDuration: 0
        };
    }

    /**
     * Calculate month-to-month comparison
     */
    calculateMonthComparison(current, previous) {
        const compare = (curr, prev) => {
            if (prev === 0) return {
                change: curr > 0 ? 100 : 0,
                trend: curr > 0 ? 'up' : 'neutral'
            };
            const changePercent = ((curr - prev) / prev) * 100;
            const threshold = 5; // 5% threshold for neutral

            return {
                change: changePercent,
                trend: changePercent > threshold ? 'up' :
                       changePercent < -threshold ? 'down' : 'neutral'
            };
        };

        return {
            keyEvents: compare(current.keyEvents, previous.keyEvents),
            newUsers: compare(current.newUsers, previous.newUsers),
            activeUsers: compare(current.activeUsers, previous.activeUsers),
            totalUsers: compare(current.totalUsers, previous.totalUsers),
            sessions: compare(current.sessions, previous.sessions),
            engagementRate: compare(current.engagementRate, previous.engagementRate),
            avgEngagementTime: compare(current.avgEngagementTime, previous.avgEngagementTime)
        };
    }
}

// Export singleton instance
module.exports = new GA4ServiceEnhanced();
