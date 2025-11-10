const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        const projectName = req.query.project || 'Orchard Veterinary Hospital - Website New Build';

        console.log(`Searching for project: "${projectName}"`);

        // First, find the main project
        const { data: projects, error: projectError } = await supabase
            .from('website_projects')
            .select('*')
            .ilike('name', `%${projectName}%`);

        if (projectError) {
            throw new Error('Error fetching project: ' + projectError.message);
        }

        if (!projects || projects.length === 0) {
            // Let's see what projects we have
            const { data: allProjects, error: allError } = await supabase
                .from('website_projects')
                .select('id, name, task_type')
                .order('created_at', { ascending: false })
                .limit(20);

            return res.status(200).json({
                success: false,
                message: `Project "${projectName}" not found`,
                availableProjects: allError ? [] : allProjects,
                searchTerm: projectName
            });
        }

        const project = projects[0];
        console.log(`Found project: ${project.name} (ID: ${project.id})`);

        // Now get all subitems for this project
        const { data: subtasks, error: subtaskError } = await supabase
            .from('website_subtasks')
            .select('*')
            .eq('project_id', project.id)
            .order('created_at', { ascending: true });

        if (subtaskError) {
            throw new Error('Error fetching subtasks: ' + subtaskError.message);
        }

        // Get comments for this project and its subtasks
        const { data: comments, error: commentError } = await supabase
            .from('project_comments')
            .select('*')
            .eq('project_id', project.id)
            .order('date_posted', { ascending: true });

        const response = {
            success: true,
            project: {
                id: project.id,
                name: project.name,
                task_type: project.task_type,
                current_phase: project.current_phase,
                current_dev_status: project.current_dev_status,
                current_qc_status: project.current_qc_status,
                created_at: project.created_at,
                updated_at: project.updated_at,
                last_synced: project.last_synced
            },
            subitems: {
                count: subtasks ? subtasks.length : 0,
                data: subtasks || []
            },
            comments: {
                count: comments ? comments.length : 0,
                data: comments || []
            },
            summary: {
                hasSubitems: subtasks && subtasks.length > 0,
                hasComments: comments && comments.length > 0,
                subitemNames: subtasks ? subtasks.map(s => s.name) : [],
                lastSync: project.last_synced
            }
        };

        console.log(`Project analysis complete:
        - Project found: ${project.name}
        - Subitems: ${subtasks ? subtasks.length : 0}
        - Comments: ${comments ? comments.length : 0}`);

        res.status(200).json(response);

    } catch (error) {
        console.error('Error checking subitems:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.toString()
        });
    }
};