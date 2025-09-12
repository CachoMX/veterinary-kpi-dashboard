const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        // Check if new columns exist in database
        console.log('🔍 Checking database schema and data...');
        
        // First, let's see what columns exist in website_projects table
        const { data: projects, error: projectsError } = await supabase
            .from('website_projects')
            .select('*')
            .limit(5);

        if (projectsError) {
            return res.status(500).json({
                success: false,
                error: 'Database query failed: ' + projectsError.message
            });
        }

        // Analyze the data
        let analysis = {
            totalProjects: 0,
            columnsFound: [],
            completedProjects: 0,
            projectsWithDuration: 0,
            projectsWithQcScore: 0,
            sampleProjects: [],
            newBuildProjects: 0,
            completedNewBuilds: 0,
            completedNewBuildsWithQC: 0
        };

        if (projects && projects.length > 0) {
            // Check what columns exist
            const sampleProject = projects[0];
            analysis.columnsFound = Object.keys(sampleProject);
            
            // Check if new columns exist
            const hasTotalDuration = 'total_duration_hours' in sampleProject;
            const hasQcScore = 'qc_review_score' in sampleProject;
            
            // Get all projects for analysis
            const { data: allProjects, error: allError } = await supabase
                .from('website_projects')
                .select('*');

            if (!allError && allProjects) {
                analysis.totalProjects = allProjects.length;
                
                allProjects.forEach(project => {
                    // Check completion
                    if (project.actual_completion_date) {
                        analysis.completedProjects++;
                    }
                    
                    // Check duration data
                    if (hasTotalDuration && project.total_duration_hours && project.total_duration_hours > 0) {
                        analysis.projectsWithDuration++;
                    }
                    
                    // Check QC score data  
                    if (hasQcScore && project.qc_review_score && project.qc_review_score > 0) {
                        analysis.projectsWithQcScore++;
                    }
                    
                    // Check New Build projects
                    if (project.task_type === 'New Build') {
                        analysis.newBuildProjects++;
                        
                        if (project.actual_completion_date) {
                            analysis.completedNewBuilds++;
                            
                            if (hasQcScore && project.qc_review_score && project.qc_review_score > 0) {
                                analysis.completedNewBuildsWithQC++;
                            }
                        }
                    }
                });
                
                // Get sample data for inspection
                analysis.sampleProjects = allProjects.slice(0, 3).map(p => ({
                    name: p.name,
                    task_type: p.task_type,
                    actual_completion_date: p.actual_completion_date,
                    total_duration_hours: hasTotalDuration ? p.total_duration_hours : 'COLUMN_MISSING',
                    qc_review_score: hasQcScore ? p.qc_review_score : 'COLUMN_MISSING'
                }));
            }
        }

        res.status(200).json({
            success: true,
            analysis: analysis,
            diagnosis: {
                hasNewColumns: analysis.columnsFound.includes('total_duration_hours') && analysis.columnsFound.includes('qc_review_score'),
                needsMigration: !analysis.columnsFound.includes('total_duration_hours') || !analysis.columnsFound.includes('qc_review_score'),
                needsSync: analysis.projectsWithDuration === 0 || analysis.projectsWithQcScore === 0,
                durationChartReady: analysis.projectsWithDuration > 0,
                qcChartReady: analysis.completedNewBuildsWithQC > 0
            },
            recommendations: generateRecommendations(analysis)
        });

    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

function generateRecommendations(analysis) {
    const recommendations = [];
    
    if (!analysis.columnsFound.includes('total_duration_hours')) {
        recommendations.push('❌ MISSING: total_duration_hours column - run database migration');
    }
    
    if (!analysis.columnsFound.includes('qc_review_score')) {
        recommendations.push('❌ MISSING: qc_review_score column - run database migration');
    }
    
    if (analysis.columnsFound.includes('total_duration_hours') && analysis.projectsWithDuration === 0) {
        recommendations.push('📊 Duration data is empty - run project sync to populate');
    }
    
    if (analysis.columnsFound.includes('qc_review_score') && analysis.projectsWithQcScore === 0) {
        recommendations.push('⭐ QC score data is empty - run project sync to populate');
    }
    
    if (analysis.completedProjects === 0) {
        recommendations.push('📅 No completed projects found - charts need completed projects');
    }
    
    if (analysis.newBuildProjects === 0) {
        recommendations.push('🏗️ No New Build projects found - QC chart needs New Build projects');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Everything looks good! Charts should be working.');
    }
    
    return recommendations;
}