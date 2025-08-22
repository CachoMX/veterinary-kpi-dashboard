# Veterinary Web Team KPI Dashboard

A comprehensive project management and team performance tracking system for a veterinary company's web development team, featuring real-time integration with Monday.com.

## Overview

This dashboard provides data-driven insights into team productivity, project progress, and resource allocation by automatically syncing task data from Monday.com and presenting it through an intuitive web interface.

## Features

### 📊 Real-time KPI Tracking
- **Summary Cards**: Total tasks, completed, in-progress, pending, needs approval, overdue
- **Team Performance**: Individual developer statistics and workload analysis
- **Status Charts**: Visual breakdown of task distribution and progress
- **Team Capacity Planning**: Calculates developer availability based on task complexity

### 🔄 Monday.com Integration
- Automated daily sync from Monday.com development board
- Tracks 35+ pages of task data with intelligent rate limiting
- Maintains sync logs for monitoring data freshness
- Manual sync capability for immediate updates

### 🎯 Advanced Filtering System
- **Team Filters**: By developer, QC team member, requestor
- **Status Filters**: Phase, development status, QC status, priority
- **Task Filters**: Type, size, request group
- **Date Ranges**: Flexible date filtering with smart completion logic
- **Exclusion Filters**: Remove specific categories from analysis
- **Collapsible Interface**: Clean, space-efficient filter management

### 📈 Smart Analytics
- **Overdue Detection**: Compares due dates vs completion dates
- **Multi-criteria Completion Logic**: Various ways to identify completed tasks
- **Date-Smart Filtering**: Uses appropriate dates based on task status
- **Capacity Estimation**: Predicts when team members will be available

## Technical Architecture

### Frontend
- **Single Page Application**: Pure HTML, CSS, JavaScript
- **Chart.js**: Interactive data visualizations
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Dynamic data refresh without page reload

### Backend
- **Vercel Serverless Functions**: API endpoints for data processing
- **Supabase**: PostgreSQL database for data storage
- **Monday.com API**: Direct integration for task data
- **Automated Cron Jobs**: Daily data synchronization

### Data Model
```
Tasks Table:
- Basic Info: ID, name, state, created/updated timestamps
- People: developers[], qc_team[], requestors[]
- Status: phase, dev_status, qc_status, priority
- Classification: task_type, task_size, request_group
- Dates: submission_date, completion_date, expected_due_date
```

## Setup & Deployment

### Environment Variables
```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SYNC_SECRET_KEY=your_sync_secret_key
MONDAY_TOKEN=your_monday_api_token
```

### Deployment
1. Deploy to Vercel for automatic serverless scaling
2. Configure cron job for daily sync at 6 AM
3. Set up Supabase database with appropriate tables
4. Configure Monday.com API access

## API Endpoints

- `GET /api/dashboard-kpis-fast` - Main dashboard data with filtering
- `POST /api/sync-monday-to-supabase` - Sync data from Monday.com
- `GET /api/dashboard-kpis` - Legacy dashboard endpoint

## Usage

### Default View
- Shows last 30 days of data by default
- Displays team performance summary
- Provides quick access to key metrics

### Filtering
- Use the collapsible Filters section to narrow down data
- Apply multiple filters simultaneously
- Use exclusion filters to remove unwanted data
- Date ranges automatically use smart completion logic

### Team Capacity
The system calculates team capacity using:
- **Small tasks**: 4 hours (0.5 days)
- **Medium tasks**: 12 hours (1.5 days)  
- **Large tasks**: 32 hours (4 days)
- **Weekly capacity**: 40 hours per developer

## Data Sync

### Automatic Sync
- Runs daily at 6 AM via Vercel cron job
- Fetches up to 3,500 tasks from Monday.com
- Updates all task information and team assignments

### Manual Sync
- Use the "🔄 Sync from Monday.com" button for immediate updates
- Useful when critical data changes need immediate reflection

## Team Metrics

### Key Performance Indicators
- **Completion Rate**: Percentage of tasks completed
- **Team Utilization**: Current workload vs capacity
- **Overdue Tasks**: Tasks past their due date
- **Individual Performance**: Per-developer statistics

### Capacity Planning
- **Availability Prediction**: When each developer will be free
- **Workload Distribution**: Balance across team members
- **Resource Allocation**: Optimal task assignment

## Contributing

This dashboard is tailored for the veterinary company's specific Monday.com board structure and workflow. Modifications should maintain compatibility with the existing data model and team processes.

## License

ISC License - Internal use for veterinary company operations.