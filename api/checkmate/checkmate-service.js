// Checkmate API Service
// Handles authentication, token caching, and API requests to Checkmate uptime monitoring

const { createClient } = require('@supabase/supabase-js');

/**
 * Checkmate Service for fetching uptime monitoring data
 * Singleton class that handles authentication and data retrieval from Checkmate API
 */
class CheckmateService {
    constructor() {
        this.baseUrl = process.env.CHECKMATE_BASE_URL || 'https://status.vetcelerator.com/api/v1';
        this.token = null;
        this.tokenExpiry = null;
        this.initialized = false;

        // Initialize Supabase client for token caching
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
        );
    }

    /**
     * Authenticate to Checkmate API and cache token
     * Checks database cache first, then API if expired
     * Token expiry: ~2 hours (120 minutes) with 5-minute buffer
     *
     * @param {boolean} forceRefresh - Force new authentication even if token is cached
     * @returns {Promise<string>} Bearer token
     */
    async authenticate(forceRefresh = false) {
        try {
            // Check memory cache first
            if (!forceRefresh && this.token && this.tokenExpiry) {
                const now = new Date();
                const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds

                if (now < new Date(this.tokenExpiry.getTime() - bufferTime)) {
                    console.log('Using cached token from memory');
                    return this.token;
                }
            }

            // Check database cache
            if (!forceRefresh) {
                const { data: cachedToken, error } = await this.supabase
                    .from('checkmate_auth_tokens')
                    .select('*')
                    .eq('is_active', true)
                    .gt('expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString())
                    .single();

                if (!error && cachedToken) {
                    console.log('Using cached token from database');
                    this.token = cachedToken.token;
                    this.tokenExpiry = new Date(cachedToken.expires_at);
                    return this.token;
                }
            }

            // No valid cached token - authenticate with API
            console.log('Fetching new token from Checkmate API');

            const email = process.env.CHECKMATE_EMAIL;
            const password = process.env.CHECKMATE_PASSWORD;

            if (!email || !password) {
                throw new Error('CHECKMATE_EMAIL and CHECKMATE_PASSWORD environment variables are required');
            }

            const response = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Checkmate authentication failed: ${response.status} ${errorText}`);
            }

            const data = await response.json();

            // Checkmate API returns: { success: true, data: { token: "..." } }
            if (!data.success || !data.data || !data.data.token) {
                console.error('Checkmate API response:', JSON.stringify(data, null, 2));
                throw new Error('No token received from Checkmate API');
            }

            // Calculate expiry (default to 90 minutes if not provided)
            const expiryMinutes = 90;
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

            // Store in memory
            this.token = data.data.token;
            this.tokenExpiry = expiresAt;

            // Store in database cache
            await this.cacheTokenInDatabase(data.data.token, expiresAt);

            console.log('Successfully authenticated with Checkmate API');
            return this.token;

        } catch (error) {
            console.error('Checkmate authentication error:', error.message);
            throw error;
        }
    }

    /**
     * Cache authentication token in database
     * Invalidates previous tokens and stores new one
     *
     * @param {string} token - Bearer token
     * @param {Date} expiresAt - Token expiration date
     */
    async cacheTokenInDatabase(token, expiresAt) {
        try {
            // Invalidate all previous tokens
            await this.supabase
                .from('checkmate_auth_tokens')
                .update({ is_active: false })
                .eq('is_active', true);

            // Insert new token
            const { error } = await this.supabase
                .from('checkmate_auth_tokens')
                .insert({
                    token,
                    expires_at: expiresAt.toISOString(),
                    is_active: true,
                    token_type: 'Bearer'
                });

            if (error) {
                console.error('Failed to cache token in database:', error);
            } else {
                console.log('Token cached in database successfully');
            }
        } catch (error) {
            console.error('Error caching token:', error);
        }
    }

    /**
     * Fetch all monitors from Checkmate API
     * GET /monitors
     *
     * @returns {Promise<Array>} Array of monitor objects
     */
    async getAllMonitors() {
        const token = await this.authenticate();

        try {
            const response = await fetch(`${this.baseUrl}/monitors`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Try re-authentication once on auth failure
                if (response.status === 401) {
                    console.log('Token expired, re-authenticating...');
                    const newToken = await this.authenticate(true);

                    const retryResponse = await fetch(`${this.baseUrl}/monitors`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!retryResponse.ok) {
                        throw new Error(`Failed to fetch monitors: ${retryResponse.status}`);
                    }

                    const retryData = await retryResponse.json();
                    return retryData.monitors || retryData;
                }

                throw new Error(`Failed to fetch monitors: ${response.status}`);
            }

            const data = await response.json();

            // Checkmate API returns: { success: true, data: [...] }
            const monitors = data.data || data.monitors || data;
            console.log(`Fetched ${Array.isArray(monitors) ? monitors.length : 0} monitors from Checkmate`);

            return monitors;

        } catch (error) {
            console.error('Error fetching monitors:', error.message);
            throw error;
        }
    }

    /**
     * Fetch uptime data for a specific monitor
     * GET /monitors/uptime?monitorId={id}
     *
     * @param {string} monitorId - Checkmate monitor ID
     * @returns {Promise<Object>} Uptime data with percentages
     */
    async getMonitorUptime(monitorId) {
        const token = await this.authenticate();

        try {
            const response = await fetch(`${this.baseUrl}/monitors/uptime?monitorId=${monitorId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Try re-authentication once on auth failure
                if (response.status === 401) {
                    console.log('Token expired, re-authenticating...');
                    const newToken = await this.authenticate(true);

                    const retryResponse = await fetch(`${this.baseUrl}/monitors/uptime?monitorId=${monitorId}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${newToken}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!retryResponse.ok) {
                        throw new Error(`Failed to fetch uptime: ${retryResponse.status}`);
                    }

                    return await retryResponse.json();
                }

                throw new Error(`Failed to fetch uptime for monitor ${monitorId}: ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            console.error(`Error fetching uptime for monitor ${monitorId}:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch monitors with their uptime data (combined operation)
     * Optimized batch fetch for all monitors
     *
     * @returns {Promise<Array>} Array of monitors with uptime data
     */
    async getMonitorsWithUptime() {
        const token = await this.authenticate();

        try {
            const response = await fetch(`${this.baseUrl}/monitors/uptime`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Handle 401 Unauthorized - token might have expired
            if (response.status === 401) {
                console.log('Token expired, re-authenticating...');
                await this.authenticate(true); // Force refresh
                return this.getMonitorsWithUptime(); // Retry
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch monitors with uptime: ${response.status}`);
            }

            const data = await response.json();

            // Checkmate API returns: { success: true, data: [{_id, name, url, 1, 7, 30, 90, status}] }
            const monitors = data.data || [];
            console.log(`Fetched ${monitors.length} monitors with uptime from Checkmate`);

            return monitors;

        } catch (error) {
            console.error('Error in getMonitorsWithUptime:', error.message);
            throw error;
        }
    }

    /**
     * Match Checkmate monitor name to domain
     * Uses fuzzy matching logic (exact, normalized, contains)
     *
     * @param {string} monitorName - Monitor name from Checkmate
     * @param {Array<string>} domains - List of domains to match against
     * @returns {Object|null} Match result with domain, matchType, and confidence
     */
    matchMonitorToDomain(monitorName, domains) {
        if (!monitorName || !domains || domains.length === 0) {
            return null;
        }

        /**
         * Normalize domain/URL string
         * Strips protocol, www, and trailing slashes
         */
        const normalize = (str) => {
            return str
                .toLowerCase()
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '')
                .trim();
        };

        const normalizedMonitor = normalize(monitorName);

        // 1. Exact match (after normalization)
        for (const domain of domains) {
            if (normalize(domain) === normalizedMonitor) {
                return {
                    domain,
                    matchType: 'exact',
                    confidence: 1.0
                };
            }
        }

        // 2. Contains match (domain contains monitor name or vice versa)
        for (const domain of domains) {
            const normalizedDomain = normalize(domain);

            if (normalizedDomain.includes(normalizedMonitor)) {
                return {
                    domain,
                    matchType: 'fuzzy',
                    confidence: 0.8
                };
            }

            if (normalizedMonitor.includes(normalizedDomain)) {
                return {
                    domain,
                    matchType: 'fuzzy',
                    confidence: 0.8
                };
            }
        }

        // 3. No match found
        return null;
    }
}

// Export singleton instance
module.exports = new CheckmateService();
