module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const NOTION_TOKEN = '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';
    const KPI_DB_ID = '210d2a8e-6475-8042-a3df-cf97f82bff75';

    try {
        // Get the database schema to see what properties exist
        const dbResponse = await fetch(`https://api.notion.com/v1/databases/${KPI_DB_ID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${NOTION_TOKEN}`,
                'Notion-Version': '2022-06-28'
            }
        });

        const dbResult = await dbResponse.json();

        if (dbResult.object === 'error') {
            return res.status(400).json({
                success: false,
                error: 'Cannot get database schema',
                details: dbResult.message
            });
        }

        // Extract property names and types
        const properties = {};
        for (const [propName, propData] of Object.entries(dbResult.properties)) {
            properties[propName] = {
                type: propData.type,
                id: propData.id
            };
        }

        res.status(200).json({
            success: true,
            message: 'Database properties found',
            databaseTitle: dbResult.title[0]?.plain_text || 'Unknown',
            properties: properties,
            note: 'These are the exact property names in your Daily KPI Tracking database'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};