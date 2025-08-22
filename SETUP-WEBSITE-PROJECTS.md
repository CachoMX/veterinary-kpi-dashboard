# Website Projects Delay Analysis - Setup Guide

This guide will help you set up the Website Projects Delay Analysis feature that tracks New Build and Rebuild projects with AI-powered comment analysis.

## 📋 Prerequisites

1. Existing veterinary KPI dashboard working
2. Supabase database access
3. Monday.com API access
4. OpenAI API account

## 🗃️ Database Setup

### Step 1: Create New Tables

Run the SQL script in Supabase SQL Editor:

```sql
-- Execute the contents of: database/website-projects-schema.sql
```

This creates the following tables:
- `website_projects` - Main projects table
- `website_subtasks` - Subtasks with timeline tracking  
- `project_comments` - Comments with AI analysis
- `department_mappings` - User to department mapping
- `website_sync_logs` - Sync operation logs

### Step 2: Update Department Mappings

Update the `department_mappings` table with your actual team members:

```sql
-- Clear default mappings and add your team
DELETE FROM department_mappings;

INSERT INTO department_mappings (user_name, department) VALUES
-- Developers
('Your Dev Name 1', 'Dev'),
('Your Dev Name 2', 'Dev'),
('CachoMX', 'Dev'),

-- QC Team  
('Nicole Tempel', 'QC'),
('Fabiola Moya', 'QC'),
('Heather Jarek', 'QC'),
('Tiffany Souvanansy', 'QC'),
('Abi Thenthirath', 'QC'),
('John Miller', 'QC'),
('Paola Fimbres', 'QC'),

-- CSM Team
('Your CSM Name 1', 'CSM'),
('Your CSM Name 2', 'CSM');
```

## 🔑 Environment Variables

Add the OpenAI API key to your environment variables:

### In Vercel Dashboard:
1. Go to your project settings
2. Navigate to Environment Variables
3. Add: `OPENAI_API_KEY` = `your_openai_api_key_here`

### For Local Development:
Create `.env.local` file:
```bash
OPENAI_API_KEY=your_openai_api_key_here
SUPABASE_URL=your_existing_supabase_url
SUPABASE_ANON_KEY=your_existing_supabase_key
SYNC_SECRET_KEY=your_existing_sync_secret
```

## 🚀 Deployment

### Step 1: Deploy Code
The new files are already created and ready:
- `/public/reports.html` - Reports page
- `/api/sync-website-projects.js` - Sync API
- `/api/website-projects-report.js` - Report data API
- `/api/website-project-details.js` - Project details API

### Step 2: Update Cron Schedule
The `vercel.json` is updated to include weekly sync:
- Daily sync (existing): 6 AM every day
- Website projects sync: 6 AM every Monday

### Step 3: Test Deployment
1. Deploy to Vercel
2. Navigate to `/reports.html`
3. Click "🔄 Sync Projects" to run initial sync
4. Verify data appears in reports

## 📊 Monday.com Column Mapping

The system expects these Monday.com columns (update IDs in code if different):

### Main Task Columns:
- `task_tag__1` - Task Type (New Build/Rebuild)
- `phase__1` - Current Phase
- `status` - Dev Status  
- `status_15__1` - QC Status
- `person` - Developers
- `people__1` - QC Team
- `people6__1` - Requestors
- `expected_due_date` - Expected Due Date

### Subtask Columns:
- `person` - Subtask Owner
- `status` - Subtask Status
- `phase__1` - Subtask Phase
- `timeline_start` - Start Date
- `timeline_end` - End Date
- `completion_date` - Completion Date
- `expected_duration` - Expected Hours
- `actual_duration` - Actual Hours
- `priority__1` - Priority

## 🤖 AI Analysis Features

The system uses OpenAI to analyze comments and extract:

### Project Level:
- Overall status summary
- Identified blockers
- Actionable recommendations
- Delay cause categorization
- Department delay attribution

### Comment Level:
- Sentiment analysis (positive, negative, urgent)
- Category classification (client_delay, internal_delay, blocker, etc.)
- Blocker extraction
- Department responsibility identification

## 📈 Reports Available

### Summary Metrics:
- Total website projects (New Build vs Rebuild)
- Overdue projects with average delay
- Blocked projects analysis
- On-track projects count

### Visualizations:
- Delay by department (bar chart)
- Project delay duration distribution (doughnut chart)

### AI Insights:
- Overall analysis summary
- Top blockers across all projects
- Compiled recommendations

### Project Details:
- Expandable project cards
- Subtask timeline tracking
- Recent comments with AI analysis
- Project timeline visualization
- Risk assessment

## 🔄 Usage Workflow

### Initial Setup:
1. Run manual sync to load existing data
2. Verify department mappings are correct
3. Check AI analysis results

### Ongoing Operations:
1. Automatic weekly sync every Monday at 6 AM
2. Manual sync available via "🔄 Sync Projects" button
3. Reports update in real-time after sync

### Monitoring:
1. Check sync logs in `website_sync_logs` table
2. Monitor AI analysis completion rates
3. Review manager reports weekly

## 🎯 Key Benefits

1. **Delay Visibility**: See exactly which projects are overdue and by how much
2. **Blocker Identification**: AI extracts specific blockers from comments
3. **Department Accountability**: Track which department is causing delays
4. **Trend Analysis**: Understand common delay patterns
5. **Actionable Insights**: AI provides specific recommendations
6. **Manager Reporting**: Automated analysis for management updates

## 🔧 Customization

### Modify AI Analysis:
Edit the OpenAI prompt in `api/sync-website-projects.js` to change analysis focus.

### Add New Metrics:
Update `api/website-projects-report.js` to include additional calculations.

### Change Sync Schedule:
Modify `vercel.json` cron schedule as needed.

### Department Mappings:
Update `department_mappings` table when team changes occur.

## 🐛 Troubleshooting

### Sync Issues:
1. Check Vercel function logs
2. Verify Monday.com API token
3. Check Supabase connection
4. Review `website_sync_logs` table

### AI Analysis Problems:
1. Verify OpenAI API key is set
2. Check API usage/billing
3. Review comment content quality
4. Monitor API rate limits

### Missing Data:
1. Verify Monday.com column IDs match code
2. Check task type filtering (New Build/Rebuild)
3. Ensure subtasks are properly linked
4. Verify comment access permissions

## 📞 Support

For issues or questions:
1. Check sync logs in database
2. Review Vercel function logs  
3. Test API endpoints manually
4. Update department mappings as team changes