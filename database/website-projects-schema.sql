-- Website Projects Delay Analysis Database Schema
-- For tracking New Build and Rebuild projects with subtasks and AI-analyzed comments

-- Main website projects table
CREATE TABLE website_projects (
    id TEXT PRIMARY KEY, -- Monday.com task ID
    name TEXT NOT NULL,
    task_type TEXT NOT NULL CHECK (task_type IN ('New Build', 'Rebuild')),
    
    -- Timeline data
    expected_due_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    
    -- Current status
    current_phase TEXT,
    current_dev_status TEXT,
    current_qc_status TEXT,
    current_owner TEXT,
    current_department TEXT, -- Dev, QC, CSM
    
    -- Delay analysis
    days_overdue INTEGER,
    is_overdue BOOLEAN DEFAULT FALSE,
    total_expected_duration INTEGER, -- in hours
    total_actual_duration INTEGER, -- in hours
    
    -- Team assignments
    developers TEXT[], -- array of developer names
    qc_team TEXT[], -- array of QC team names
    requestors TEXT[], -- array of requestor names
    
    -- AI Analysis results
    ai_summary TEXT, -- Overall project status summary
    ai_blockers TEXT[], -- Extracted blockers from comments
    ai_recommendations TEXT, -- AI recommendations to unblock
    ai_delay_causes JSONB, -- Categorized delay causes
    ai_department_delays JSONB, -- Which departments caused delays
    ai_last_analyzed TIMESTAMPTZ,
    
    -- Sync metadata
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    sync_status TEXT DEFAULT 'pending',
    
    created_at_db TIMESTAMPTZ DEFAULT NOW(),
    updated_at_db TIMESTAMPTZ DEFAULT NOW()
);

-- Subtasks table for detailed timeline tracking
CREATE TABLE website_subtasks (
    id TEXT PRIMARY KEY, -- Monday.com subtask ID
    project_id TEXT NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
    
    -- Basic info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Timeline
    timeline_start DATE,
    timeline_end DATE,
    completion_date DATE,
    expected_duration INTEGER, -- in hours
    actual_duration INTEGER, -- in hours
    
    -- Assignment and status
    owner TEXT,
    department TEXT, -- Dev, QC, CSM based on owner
    phase TEXT,
    status TEXT,
    priority TEXT,
    
    -- Delay analysis
    is_overdue BOOLEAN DEFAULT FALSE,
    days_overdue INTEGER,
    is_blocking BOOLEAN DEFAULT FALSE, -- Is this subtask blocking others?
    
    -- AI analysis of subtask comments
    ai_comment_summary TEXT,
    ai_identified_blockers TEXT[],
    ai_sentiment TEXT, -- positive, neutral, negative, urgent
    
    -- Metadata
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    
    created_at_db TIMESTAMPTZ DEFAULT NOW(),
    updated_at_db TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table with AI analysis
CREATE TABLE project_comments (
    id SERIAL PRIMARY KEY,
    
    -- References
    project_id TEXT NOT NULL REFERENCES website_projects(id) ON DELETE CASCADE,
    subtask_id TEXT REFERENCES website_subtasks(id) ON DELETE CASCADE, -- NULL for main task comments
    
    -- Comment data
    comment_text TEXT NOT NULL,
    author TEXT NOT NULL,
    date_posted TIMESTAMPTZ NOT NULL,
    comment_type TEXT, -- update, reply, status_change, etc.
    
    -- AI Analysis
    ai_sentiment TEXT, -- positive, neutral, negative, urgent, frustrated
    ai_category TEXT, -- client_delay, internal_delay, blocker, progress_update, question, etc.
    ai_extracted_blockers TEXT[], -- Specific blockers mentioned
    ai_delay_indication BOOLEAN DEFAULT FALSE, -- Does this comment indicate a delay?
    ai_department_mentioned TEXT, -- Which department is mentioned as responsible
    ai_confidence_score NUMERIC(3,2), -- AI confidence in analysis (0.00-1.00)
    
    -- Processing metadata
    ai_analyzed BOOLEAN DEFAULT FALSE,
    ai_analyzed_at TIMESTAMPTZ,
    ai_model_used TEXT, -- gpt-4, gpt-3.5-turbo, etc.
    
    -- Sync metadata
    last_synced TIMESTAMPTZ DEFAULT NOW(),
    
    created_at_db TIMESTAMPTZ DEFAULT NOW()
);

-- Department mapping table for user assignments
CREATE TABLE department_mappings (
    user_name TEXT PRIMARY KEY,
    department TEXT NOT NULL CHECK (department IN ('Dev', 'QC', 'CSM')),
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync logs for website projects
CREATE TABLE website_sync_logs (
    id SERIAL PRIMARY KEY,
    sync_type TEXT NOT NULL, -- 'full_sync', 'incremental_sync'
    status TEXT NOT NULL, -- 'in_progress', 'completed', 'failed'
    
    -- Sync statistics
    projects_processed INTEGER DEFAULT 0,
    subtasks_processed INTEGER DEFAULT 0,
    comments_processed INTEGER DEFAULT 0,
    ai_analyses_completed INTEGER DEFAULT 0,
    
    -- Error tracking
    error_message TEXT,
    error_details JSONB,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Metadata
    triggered_by TEXT, -- 'cron', 'manual', 'api'
    sync_parameters JSONB -- filters, date ranges, etc.
);

-- Indexes for performance
CREATE INDEX idx_website_projects_task_type ON website_projects(task_type);
CREATE INDEX idx_website_projects_overdue ON website_projects(is_overdue, days_overdue DESC);
CREATE INDEX idx_website_projects_department ON website_projects(current_department);
CREATE INDEX idx_website_projects_due_date ON website_projects(expected_due_date);

CREATE INDEX idx_website_subtasks_project ON website_subtasks(project_id);
CREATE INDEX idx_website_subtasks_owner ON website_subtasks(owner);
CREATE INDEX idx_website_subtasks_department ON website_subtasks(department);
CREATE INDEX idx_website_subtasks_overdue ON website_subtasks(is_overdue, days_overdue DESC);

CREATE INDEX idx_project_comments_project ON project_comments(project_id);
CREATE INDEX idx_project_comments_subtask ON project_comments(subtask_id);
CREATE INDEX idx_project_comments_date ON project_comments(date_posted DESC);
CREATE INDEX idx_project_comments_ai_category ON project_comments(ai_category);
CREATE INDEX idx_project_comments_ai_delay ON project_comments(ai_delay_indication);

CREATE INDEX idx_department_mappings_active ON department_mappings(is_active);
CREATE INDEX idx_website_sync_logs_status ON website_sync_logs(status, started_at DESC);

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at_db = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_website_projects_updated_at 
    BEFORE UPDATE ON website_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_subtasks_updated_at 
    BEFORE UPDATE ON website_subtasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_department_mappings_updated_at 
    BEFORE UPDATE ON department_mappings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default department mappings (you can update these as needed)
INSERT INTO department_mappings (user_name, department) VALUES
-- Developers
('CachoMX', 'Dev'),
('Developer Name 1', 'Dev'),
('Developer Name 2', 'Dev'),

-- QC Team  
('Nicole Tempel', 'QC'),
('Fabiola Moya', 'QC'),
('Heather Jarek', 'QC'),
('Tiffany Souvanansy', 'QC'),
('Abi Thenthirath', 'QC'),
('John Miller', 'QC'),
('Paola Fimbres', 'QC'),

-- CSM Team
('CSM Name 1', 'CSM'),
('CSM Name 2', 'CSM')

ON CONFLICT (user_name) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE website_projects IS 'Main table for New Build and Rebuild website projects with AI analysis';
COMMENT ON TABLE website_subtasks IS 'Subtasks for website projects with detailed timeline tracking';
COMMENT ON TABLE project_comments IS 'Comments from projects and subtasks with AI sentiment and blocker analysis';
COMMENT ON TABLE department_mappings IS 'Maps Monday.com user names to departments (Dev, QC, CSM)';
COMMENT ON TABLE website_sync_logs IS 'Logs for tracking sync operations and AI analysis runs';