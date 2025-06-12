module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const NOTION_TOKEN = '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';

    try {
        // Search for all pages/databases that the integration can access
        const searchResponse = await fetch('https://api.notion.com/v1/search', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Content-Type': 'application/json',
                'Notion-Version': '2022-06-28'
            },
            body: JSON.stringify({
                filter: {
                    property: 'object',
                    value: 'database'
                }
            })
        });

        const searchResult = await searchResponse.json();

        if (searchResult.object === 'error') {
            return res.status(400).json({
                success: false,
                error: 'Cannot search Notion',
                details: searchResult.message
            });
        }

        // List all databases the integration can access
        const databases = searchResult.results.map(db => ({
            id: db.id,
            title: db.title[0]?.plain_text || 'Untitled',
            url: db.url
        }));

        res.status(200).json({
            success: true,
            message: 'Found databases that your integration can access',
            databases: databases,
            totalFound: databases.length,
            note: 'Look for "Daily KPI Tracking" in the list above'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};