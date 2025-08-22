const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        console.log('Extracting team members from monday_tasks table...');

        // Fetch all tasks to extract unique team members
        const { data: tasks, error } = await supabase
            .from('monday_tasks')
            .select('developers, qc_team, requestors')
            .not('developers', 'is', null)
            .not('qc_team', 'is', null)
            .not('requestors', 'is', null);

        if (error) {
            throw new Error('Failed to fetch tasks: ' + error.message);
        }

        // Extract unique team members
        const developers = new Set();
        const qcTeam = new Set();
        const requestors = new Set();

        tasks.forEach(task => {
            // Add developers
            if (task.developers && Array.isArray(task.developers)) {
                task.developers.forEach(dev => {
                    if (dev && dev.trim()) developers.add(dev.trim());
                });
            }

            // Add QC team members
            if (task.qc_team && Array.isArray(task.qc_team)) {
                task.qc_team.forEach(qc => {
                    if (qc && qc.trim()) qcTeam.add(qc.trim());
                });
            }

            // Add requestors
            if (task.requestors && Array.isArray(task.requestors)) {
                task.requestors.forEach(req => {
                    if (req && req.trim()) requestors.add(req.trim());
                });
            }
        });

        // Convert to sorted arrays
        const developersList = Array.from(developers).sort();
        const qcTeamList = Array.from(qcTeam).sort();
        const requestorsList = Array.from(requestors).sort();

        // Generate SQL for department mappings
        const sqlStatements = generateDepartmentMappingSQL(developersList, qcTeamList, requestorsList);

        // Check existing department mappings
        const { data: existingMappings, error: mappingError } = await supabase
            .from('department_mappings')
            .select('user_name, department, is_active');

        const existingUsers = new Set((existingMappings || []).map(m => m.user_name));

        const response = {
            summary: {
                totalDevelopers: developersList.length,
                totalQcTeam: qcTeamList.length,
                totalRequestors: requestorsList.length,
                totalUnique: new Set([...developersList, ...qcTeamList, ...requestorsList]).size
            },
            teamMembers: {
                developers: developersList,
                qcTeam: qcTeamList,
                requestors: requestorsList
            },
            sqlStatements: sqlStatements,
            existingMappings: existingMappings || [],
            newUsers: {
                developers: developersList.filter(dev => !existingUsers.has(dev)),
                qcTeam: qcTeamList.filter(qc => !existingUsers.has(qc)),
                requestors: requestorsList.filter(req => !existingUsers.has(req))
            },
            recommendations: {
                autoSync: "Consider implementing automatic department mapping based on task assignments",
                fallbackLogic: "Implement fallback logic in sync-website-projects.js to handle unknown users",
                dynamicMapping: "Use task assignment patterns to automatically determine departments"
            }
        };

        res.status(200).json({
            success: true,
            data: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Extract team members error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

function generateDepartmentMappingSQL(developers, qcTeam, requestors) {
    let sql = "-- Department Mappings based on actual Monday.com data\n";
    sql += "-- Clear existing mappings (optional)\n";
    sql += "DELETE FROM department_mappings;\n\n";
    sql += "-- Insert actual team members\n";
    sql += "INSERT INTO department_mappings (user_name, department) VALUES\n";

    const mappings = [];

    // Add developers
    developers.forEach(dev => {
        mappings.push(`('${dev.replace(/'/g, "''")}', 'Dev')`);
    });

    // Add QC team
    qcTeam.forEach(qc => {
        mappings.push(`('${qc.replace(/'/g, "''")}', 'QC')`);
    });

    // Add requestors (assuming they are CSM unless they're already in dev/qc)
    const devAndQcSet = new Set([...developers, ...qcTeam]);
    requestors.forEach(req => {
        if (!devAndQcSet.has(req)) {
            mappings.push(`('${req.replace(/'/g, "''")}', 'CSM')`);
        }
    });

    sql += mappings.join(',\n');
    sql += "\nON CONFLICT (user_name) DO UPDATE SET \n";
    sql += "  department = EXCLUDED.department,\n";
    sql += "  is_active = true,\n";
    sql += "  updated_at = NOW();";

    return sql;
}