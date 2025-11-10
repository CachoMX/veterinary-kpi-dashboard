/**
 * Combined Daily Cron Job
 * Runs Monday.com sync daily at 6 AM UTC
 * Runs Website Projects sync weekly on Mondays at 6 AM UTC
 */

const syncMondayToSupabase = require('./sync-monday-to-supabase');
const syncWebsiteProjects = require('./sync-website-projects');

module.exports = async (req, res) => {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const results = {
        mondaySync: null,
        websiteProjectsSync: null,
        timestamp: new Date().toISOString()
    };

    try {
        // Always run Monday.com sync (daily)
        console.log('Starting Monday.com sync...');
        const mondayResult = await syncMondayToSupabase(req, res);
        results.mondaySync = { success: true, message: 'Completed' };
        console.log('Monday.com sync completed');

        // Run Website Projects sync only on Mondays (day of week = 1)
        const today = new Date();
        const dayOfWeek = today.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.

        if (dayOfWeek === 1) {
            console.log('Today is Monday - running Website Projects sync...');
            const projectsResult = await syncWebsiteProjects(req, res);
            results.websiteProjectsSync = { success: true, message: 'Completed' };
            console.log('Website Projects sync completed');
        } else {
            results.websiteProjectsSync = { skipped: true, reason: 'Not Monday' };
            console.log('Skipping Website Projects sync (not Monday)');
        }

        return res.status(200).json({
            success: true,
            ...results
        });

    } catch (error) {
        console.error('Cron error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            ...results
        });
    }
};
