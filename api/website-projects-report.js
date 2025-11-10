const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
    try {
        console.log('Generating website projects report...');

        // Fetch all website projects with related data
        const { data: projects, error: projectsError } = await supabase
            .from('website_projects')
            .select(`
                *,
                website_subtasks (
                    id, name, owner, department, status, phase, 
                    is_overdue, days_overdue, completion_date,
                    expected_duration, actual_duration
                )
            `)
            .order('days_overdue', { ascending: false });

        if (projectsError) {
            throw new Error('Failed to fetch projects: ' + projectsError.message);
        }

        if (!projects || projects.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    summary: getEmptySummary(),
                    charts: getEmptyCharts(),
                    aiInsights: getEmptyInsights(),
                    projects: [],
                    lastSyncTime: null
                },
                message: 'No website projects found. Run a sync to load data.'
            });
        }

        // Calculate summary metrics
        const summary = calculateSummaryMetrics(projects);
        
        // Generate chart data
        const charts = generateChartData(projects);
        
        // Compile AI insights
        const aiInsights = compileAIInsights(projects);
        
        // Format projects for frontend
        const formattedProjects = formatProjectsForFrontend(projects);
        
        // Get last sync time
        const lastSyncTime = await getLastSyncTime();

        const reportData = {
            summary,
            charts,
            aiInsights,
            projects: formattedProjects,
            lastSyncTime
        };

        console.log(`Generated report for ${projects.length} projects`);

        res.status(200).json({
            success: true,
            data: reportData,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Website projects report error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Calculate summary metrics
function calculateSummaryMetrics(projects) {
    const total = projects.length;
    const newBuilds = projects.filter(p => p.task_type === 'New Build').length;
    const rebuilds = projects.filter(p => p.task_type === 'Rebuild').length;
    
    const overdueProjects = projects.filter(p => p.is_overdue).length;
    const blockedProjects = projects.filter(p => 
        p.ai_blockers && p.ai_blockers.length > 0
    ).length;
    const onTrackProjects = total - overdueProjects - blockedProjects;
    
    // Calculate average delays
    const overdueProjectsList = projects.filter(p => p.is_overdue && p.days_overdue > 0);
    const avgDelayDays = overdueProjectsList.length > 0 
        ? Math.round(overdueProjectsList.reduce((sum, p) => sum + p.days_overdue, 0) / overdueProjectsList.length)
        : 0;
    
    // Calculate completion rate (projects with actual_completion_date)
    const completedProjects = projects.filter(p => p.actual_completion_date).length;
    const completionRate = total > 0 ? Math.round((completedProjects / total) * 100) : 0;
    
    // Calculate average blocked days (simplified metric)
    const avgBlockedDays = blockedProjects > 0 
        ? Math.round(overdueProjectsList.reduce((sum, p) => sum + (p.days_overdue || 0), 0) / blockedProjects)
        : 0;

    return {
        totalProjects: total,
        newBuilds,
        rebuilds,
        overdueProjects,
        blockedProjects,
        onTrackProjects,
        avgDelayDays,
        avgBlockedDays,
        completionRate
    };
}

// Generate chart data
function generateChartData(projects) {
    // Department delay chart
    const departmentDelays = calculateDepartmentDelays(projects);
    
    // Delay duration distribution
    const delayDistribution = calculateDelayDistribution(projects);
    
    // NEW: Average Duration for Completed Website Projects by Month
    const avgDurationByMonth = calculateAvgDurationByMonth(projects);
    
    // NEW: Average QC Review Score by Month for New Build tasks
    const avgQcScoreByMonth = calculateAvgQcScoreByMonth(projects);
    
    return {
        departmentDelay: {
            labels: Object.keys(departmentDelays),
            values: Object.values(departmentDelays)
        },
        delayDuration: {
            labels: ['0-30 days', '31-90 days', '91-180 days', '180+ days'],
            values: delayDistribution
        },
        avgDurationByMonth: avgDurationByMonth,
        avgQcScoreByMonth: avgQcScoreByMonth
    };
}

// Calculate average delays by department
function calculateDepartmentDelays(projects) {
    const departmentStats = {
        'Dev': { totalDelay: 0, count: 0 },
        'QC': { totalDelay: 0, count: 0 },
        'CSM': { totalDelay: 0, count: 0 }
    };
    
    projects.forEach(project => {
        if (project.is_overdue && project.current_department) {
            const dept = project.current_department;
            if (departmentStats[dept]) {
                departmentStats[dept].totalDelay += project.days_overdue || 0;
                departmentStats[dept].count += 1;
            }
        }
    });
    
    const avgDelays = {};
    Object.keys(departmentStats).forEach(dept => {
        const stats = departmentStats[dept];
        avgDelays[dept] = stats.count > 0 ? Math.round(stats.totalDelay / stats.count) : 0;
    });
    
    return avgDelays;
}

// Calculate delay duration distribution
function calculateDelayDistribution(projects) {
    const distribution = [0, 0, 0, 0]; // 0-30, 31-90, 91-180, 180+
    
    projects.forEach(project => {
        if (project.is_overdue) {
            const days = project.days_overdue || 0;
            if (days <= 30) distribution[0]++;
            else if (days <= 90) distribution[1]++;
            else if (days <= 180) distribution[2]++;
            else distribution[3]++;
        }
    });
    
    return distribution;
}

// Compile AI insights from all projects
function compileAIInsights(projects) {
    const allBlockers = [];
    const allRecommendations = [];
    const projectSummaries = [];
    
    projects.forEach(project => {
        if (project.ai_summary) {
            projectSummaries.push(project.ai_summary);
        }
        
        if (project.ai_blockers && Array.isArray(project.ai_blockers)) {
            allBlockers.push(...project.ai_blockers);
        }
        
        if (project.ai_recommendations) {
            allRecommendations.push(project.ai_recommendations);
        }
    });
    
    // Find most common blockers
    const blockerCounts = {};
    allBlockers.forEach(blocker => {
        blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
    });
    
    const topBlockers = Object.entries(blockerCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([blocker]) => blocker);
    
    // Generate overall analysis
    const totalProjects = projects.length;
    const overdueCount = projects.filter(p => p.is_overdue).length;
    const avgDelay = projects.filter(p => p.is_overdue).length > 0
        ? Math.round(projects.filter(p => p.is_overdue).reduce((sum, p) => sum + (p.days_overdue || 0), 0) / overdueCount)
        : 0;
    
    const overallAnalysis = generateOverallAnalysis(totalProjects, overdueCount, avgDelay, topBlockers);
    
    // Compile recommendations
    const compiledRecommendations = compileRecommendations(allRecommendations, topBlockers);
    
    return {
        overallAnalysis,
        topBlockers,
        recommendations: compiledRecommendations
    };
}

// Generate overall analysis summary
function generateOverallAnalysis(total, overdue, avgDelay, topBlockers) {
    if (total === 0) {
        return "No website projects currently tracked. Run a sync to load project data.";
    }
    
    const overduePercentage = Math.round((overdue / total) * 100);
    
    let analysis = `Currently tracking ${total} website projects. `;
    
    if (overdue === 0) {
        analysis += "All projects are on track with no overdue items.";
    } else {
        analysis += `${overdue} projects (${overduePercentage}%) are overdue with an average delay of ${avgDelay} days. `;
        
        if (topBlockers.length > 0) {
            analysis += `Primary blockers include: ${topBlockers.slice(0, 3).join(', ')}.`;
        }
    }
    
    return analysis;
}

// Compile recommendations from AI analysis
function compileRecommendations(recommendations, topBlockers) {
    if (recommendations.length === 0) {
        return "Run AI analysis to generate specific recommendations for improving project timelines.";
    }
    
    // Simple compilation - in production, you might use AI to summarize these
    const uniqueRecommendations = [...new Set(recommendations)];
    
    let compiled = "Key recommendations based on AI analysis:\n\n";
    
    uniqueRecommendations.slice(0, 5).forEach((rec, index) => {
        compiled += `${index + 1}. ${rec}\n`;
    });
    
    if (topBlockers.length > 0) {
        compiled += `\nFocus on resolving: ${topBlockers.slice(0, 3).join(', ')}`;
    }
    
    return compiled;
}

// Format projects for frontend display
function formatProjectsForFrontend(projects) {
    return projects.map(project => ({
        id: project.id,
        name: project.name,
        taskType: project.task_type,
        expectedDueDate: project.expected_due_date ? formatDate(project.expected_due_date) : null,
        currentOwner: project.current_owner,
        currentDepartment: project.current_department || 'Unknown',
        currentPhase: project.current_phase,
        isOverdue: project.is_overdue,
        daysOverdue: project.days_overdue || 0,
        isBlocked: project.ai_blockers && project.ai_blockers.length > 0,
        aiSummary: project.ai_summary,
        aiBlockers: project.ai_blockers || [],
        subtasksCount: project.website_subtasks ? project.website_subtasks.length : 0,
        completedSubtasks: project.website_subtasks 
            ? project.website_subtasks.filter(st => st.completion_date).length 
            : 0
    }));
}

// Get last sync time
async function getLastSyncTime() {
    try {
        const { data, error } = await supabase
            .from('website_sync_logs')
            .select('completed_at')
            .eq('status', 'completed')
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error || !data) {
            return null;
        }
        
        return data.completed_at;
    } catch (error) {
        console.error('Error fetching last sync time:', error);
        return null;
    }
}

// Format date for display
function formatDate(dateString) {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (error) {
        return dateString;
    }
}

// Empty data structures for when no data is available
function getEmptySummary() {
    return {
        totalProjects: 0,
        newBuilds: 0,
        rebuilds: 0,
        overdueProjects: 0,
        blockedProjects: 0,
        onTrackProjects: 0,
        avgDelayDays: 0,
        avgBlockedDays: 0,
        completionRate: 0
    };
}

function getEmptyCharts() {
    return {
        departmentDelay: {
            labels: ['Dev', 'QC', 'CSM'],
            values: [0, 0, 0]
        },
        delayDuration: {
            labels: ['0-30 days', '31-90 days', '91-180 days', '180+ days'],
            values: [0, 0, 0, 0]
        },
        avgDurationByMonth: {
            labels: [],
            values: [],
            dataPoints: 0
        },
        avgQcScoreByMonth: {
            labels: [],
            values: [],
            dataPoints: 0,
            totalNewBuilds: 0
        }
    };
}

function getEmptyInsights() {
    return {
        overallAnalysis: "No projects analyzed yet. Run a sync to load website projects data.",
        topBlockers: [],
        recommendations: "AI analysis will be available after syncing project data and comments."
    };
}

// Calculate Average Duration for Completed Website Projects by Month
function calculateAvgDurationByMonth(projects) {
    const monthlyData = {};
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1); // 12 months ago

    // Filter completed projects with total duration data and reasonable completion dates
    const completedProjects = projects.filter(project => {
        if (!project.actual_completion_date || !project.total_duration_hours || project.total_duration_hours <= 0) {
            return false;
        }

        const completionDate = new Date(project.actual_completion_date);
        // Only include projects completed in the last 12 months and not in the future
        return completionDate >= cutoffDate && completionDate <= currentDate;
    });
    
    completedProjects.forEach(project => {
        try {
            const completionDate = new Date(project.actual_completion_date);
            const monthKey = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    totalDuration: 0,
                    count: 0,
                    monthLabel: completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                };
            }
            
            monthlyData[monthKey].totalDuration += project.total_duration_hours;
            monthlyData[monthKey].count += 1;
        } catch (error) {
            console.error('Error processing completion date for project:', project.name, error);
        }
    });
    
    // Calculate averages and sort by month
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => monthlyData[month].monthLabel);
    const values = sortedMonths.map(month => {
        const data = monthlyData[month];
        return Math.round((data.totalDuration / data.count) * 10) / 10; // Round to 1 decimal
    });
    
    return {
        labels: labels,
        values: values,
        dataPoints: sortedMonths.length
    };
}

// Calculate Average QC Review Score by Month for New Build tasks
function calculateAvgQcScoreByMonth(projects) {
    const monthlyData = {};
    const currentDate = new Date();
    const cutoffDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1); // 12 months ago

    // Filter New Build projects with QC scores and reasonable completion dates
    const newBuildProjects = projects.filter(project => {
        if (project.task_type !== 'New Build' || !project.actual_completion_date || !project.qc_review_score || project.qc_review_score <= 0) {
            return false;
        }

        const completionDate = new Date(project.actual_completion_date);
        // Only include projects completed in the last 12 months and not in the future
        return completionDate >= cutoffDate && completionDate <= currentDate;
    });
    
    newBuildProjects.forEach(project => {
        try {
            const completionDate = new Date(project.actual_completion_date);
            const monthKey = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    totalScore: 0,
                    count: 0,
                    monthLabel: completionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                };
            }
            
            monthlyData[monthKey].totalScore += project.qc_review_score;
            monthlyData[monthKey].count += 1;
        } catch (error) {
            console.error('Error processing completion date for project:', project.name, error);
        }
    });
    
    // Calculate averages and sort by month
    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(month => monthlyData[month].monthLabel);
    const values = sortedMonths.map(month => {
        const data = monthlyData[month];
        return Math.round((data.totalScore / data.count) * 10) / 10; // Round to 1 decimal
    });
    
    return {
        labels: labels,
        values: values,
        dataPoints: sortedMonths.length,
        totalNewBuilds: newBuildProjects.length
    };
}