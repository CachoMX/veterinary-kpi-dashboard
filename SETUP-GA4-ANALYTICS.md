# Google Analytics 4 KPI Dashboard Setup Guide

This guide will walk you through setting up the GA4 KPI Dashboard to track analytics metrics across multiple domains with year-over-year comparisons and benchmark tracking.

## Table of Contents
- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Google Cloud & GA4 Setup](#step-1-google-cloud--ga4-setup)
- [Step 2: Database Setup](#step-2-database-setup)
- [Step 3: Environment Configuration](#step-3-environment-configuration)
- [Step 4: Configure Domains](#step-4-configure-domains)
- [Step 5: Initial Data Sync](#step-5-initial-data-sync)
- [Step 6: Automated Sync Setup](#step-6-automated-sync-setup)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)

## Overview

The GA4 KPI Dashboard provides:
- **Monthly Metrics Tracking**: Key Events, New Users, Active Users, Engagement Rate, Avg Engagement Time
- **Year-over-Year Comparison**: Compare current month to same month previous year
- **Benchmark Tracking**: 90% threshold for domain pass/fail status
- **Multi-Domain Support**: Track unlimited domains/properties
- **Data Caching**: 24-hour cache to minimize API calls

## Prerequisites

1. **Google Analytics 4 Properties**: One or more GA4 properties configured for your domains
2. **Google Cloud Project**: With Analytics Data API enabled
3. **Supabase Database**: Running PostgreSQL instance
4. **Vercel Account**: For serverless deployment (or any Node.js hosting)

## Step 1: Google Cloud & GA4 Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Note your Project ID

### 1.2 Enable Google Analytics Data API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Analytics Data API"
3. Click **Enable**

### 1.3 Create Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Name it (e.g., "ga4-kpi-dashboard")
4. Grant role: **Viewer** (or custom role with analytics read permissions)
5. Click **Done**

### 1.4 Generate Service Account Key

1. Click on your newly created service account
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Select **JSON** format
5. Download the JSON key file
6. **IMPORTANT**: Keep this file secure - it contains credentials

### 1.5 Grant Service Account Access to GA4 Properties

For each GA4 property you want to track:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your GA4 Property
3. Click **Admin** (gear icon)
4. Under **Property**, click **Property Access Management**
5. Click **+** (Add Users)
6. Add the service account email (e.g., `ga4-kpi-dashboard@your-project.iam.gserviceaccount.com`)
7. Select role: **Viewer**
8. Click **Add**

### 1.6 Find Your GA4 Property IDs

For each domain:

1. In Google Analytics, select the property
2. Click **Admin** > **Property Settings**
3. Note the **Property ID** (format: `123456789`)

## Step 2: Database Setup

### 2.1 Run Database Migration

Execute the SQL schema in your Supabase database:

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT].supabase.co:5432/postgres"

# Run the migration
\i database/ga4-analytics-schema.sql
```

Or use the Supabase SQL Editor:

1. Go to your Supabase project
2. Click **SQL Editor**
3. Create a new query
4. Copy and paste contents of `database/ga4-analytics-schema.sql`
5. Click **Run**

### 2.2 Verify Tables Created

Check that these tables exist:
- `ga4_properties`
- `ga4_monthly_metrics`
- `ga4_benchmarks`
- `ga4_sync_logs`

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ga4_%';
```

## Step 3: Environment Configuration

### 3.1 Prepare Service Account Credentials

Convert your downloaded JSON key file to a single-line string:

**Option A - Using Python:**
```python
import json

with open('path/to/your-service-account-key.json', 'r') as f:
    credentials = json.load(f)

# Print as single-line string (copy this value)
print(json.dumps(credentials, separators=(',', ':')))
```

**Option B - Using jq (Linux/Mac):**
```bash
jq -c . < your-service-account-key.json
```

**Option C - Manual:**
Open the JSON file and remove all newlines to create one long string.

### 3.2 Update Environment Variables

Add to your `.env.local` file (or Vercel environment variables):

```bash
# Google Analytics 4 Configuration
GA4_SERVICE_ACCOUNT_CREDENTIALS={"type":"service_account","project_id":"your-project-id",...}

# Optional: Separate secret for GA4 sync endpoints
GA4_SYNC_SECRET=your-random-secret-key-here
```

**For Vercel Deployment:**

1. Go to your Vercel project
2. Click **Settings** > **Environment Variables**
3. Add `GA4_SERVICE_ACCOUNT_CREDENTIALS` with your single-line JSON
4. Add `GA4_SYNC_SECRET` (optional)
5. Click **Save**
6. Redeploy your application

### 3.3 Security Notes

- **Never commit** the service account JSON to version control
- Use `.env.local` for local development (already in `.gitignore`)
- Use Vercel environment variables for production
- Rotate credentials periodically

## Step 4: Configure Domains

### 4.1 Add Your Domains to Database

Replace the sample data in `ga4_properties` table:

```sql
-- Clear sample data
DELETE FROM ga4_properties;

-- Add your actual domains
INSERT INTO ga4_properties (domain, property_id, description, category) VALUES
('example-vet-clinic.com', '123456789', 'Main Veterinary Clinic Website', 'veterinary'),
('another-vet.com', '987654321', 'Secondary Clinic Site', 'veterinary'),
('vet-blog.com', '456789123', 'Blog Website', 'blog')
ON CONFLICT (domain) DO NOTHING;
```

**Important**:
- Use the actual GA4 Property IDs from Step 1.6
- Ensure the service account has Viewer access to all properties

### 4.2 Verify Configuration

```sql
SELECT * FROM ga4_properties WHERE is_active = true;
```

You should see all your domains listed with correct Property IDs.

## Step 5: Initial Data Sync

### 5.1 Test the Sync Endpoint

Make a POST request to sync data:

**Using curl:**
```bash
curl -X POST https://your-app.vercel.app/api/analytics/fetch-ga4-metrics \
  -H "Content-Type: application/json" \
  -d '{"month": "2025-10", "forceRefresh": true}'
```

**Using Postman or Insomnia:**
- Method: POST
- URL: `https://your-app.vercel.app/api/analytics/fetch-ga4-metrics`
- Body (JSON):
```json
{
  "month": "2025-10",
  "forceRefresh": true
}
```

### 5.2 Check Sync Results

The response should look like:

```json
{
  "success": true,
  "data": [
    {
      "domain": "example-vet-clinic.com",
      "property_id": "123456789",
      "metric_month": "2025-10-01",
      "key_events": 1234,
      ...
    }
  ],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0,
    "month": "2025-10"
  }
}
```

### 5.3 Verify Data in Database

```sql
SELECT domain, key_events, new_users, active_users
FROM ga4_monthly_metrics
WHERE metric_month = '2025-10-01';
```

### 5.4 Check Benchmarks

```sql
SELECT * FROM ga4_benchmarks
WHERE month_date = '2025-10-01';
```

## Step 6: Automated Sync Setup

### 6.1 Add Cron Job to Vercel

Update `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync-monday-to-supabase",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/sync-website-projects",
      "schedule": "0 6 * * 1"
    },
    {
      "path": "/api/analytics/fetch-ga4-metrics",
      "schedule": "0 7 1 * *"
    }
  ]
}
```

This runs on the 1st of each month at 7 AM UTC.

### 6.2 Deploy Updated Configuration

```bash
vercel --prod
```

### 6.3 Monitor Sync Logs

Check sync execution:

```sql
SELECT
    sync_type,
    status,
    properties_synced,
    started_at,
    duration_seconds
FROM ga4_sync_logs
ORDER BY started_at DESC
LIMIT 10;
```

## Usage

### Accessing the Dashboard

Navigate to: `https://your-app.vercel.app/analytics-kpi.html`

### Dashboard Features

1. **Month Selection**: Choose any month to view metrics
2. **Load Data**: View cached metrics (fast)
3. **Sync from GA4**: Fetch fresh data from Google Analytics (slower)
4. **Benchmark View**: See which metrics meet 90% threshold
5. **Domain Details**: Expand each domain to see detailed metrics

### Understanding Metrics

- **Key Events**: Important user actions (conversions, signups, etc.)
- **New Users**: First-time visitors
- **Active Users**: Users who engaged with your site
- **Engagement Rate**: Percentage of engaged sessions (%)
- **Avg Engagement Time**: Average time users spent engaged (seconds)

### Benchmark Criteria

For each metric:
- ✅ **PASS**: Trend is steady or increasing (↑ or →) vs. last year
- ❌ **FAIL**: Trend is decreasing (↓) vs. last year

Overall benchmark:
- ✅ **Met**: ≥90% of domains show steady/increasing trends
- ⚠️ **Not Met**: <90% of domains show steady/increasing trends

## Troubleshooting

### Issue: "Failed to initialize GA4 Service"

**Causes:**
- Missing or invalid `GA4_SERVICE_ACCOUNT_CREDENTIALS`
- Malformed JSON string

**Solutions:**
1. Verify environment variable is set correctly
2. Check JSON is valid (use a JSON validator)
3. Ensure no newlines in the JSON string
4. Redeploy after updating environment variables

### Issue: "Permission denied" or "403 Forbidden"

**Causes:**
- Service account doesn't have access to GA4 property
- Wrong Property ID

**Solutions:**
1. Verify service account email has Viewer access in GA4
2. Check Property IDs match exactly
3. Wait 5-10 minutes after granting access

### Issue: "No data returned from GA4"

**Causes:**
- Property has no data for selected month
- Date range is in the future
- GA4 property is brand new

**Solutions:**
1. Select a month with known traffic
2. Verify data exists in Google Analytics UI
3. Check date format is correct (YYYY-MM)

### Issue: "Rate limit exceeded"

**Causes:**
- Too many API requests
- Multiple syncs running simultaneously

**Solutions:**
1. Use cached data (don't force refresh)
2. Wait 24 hours between manual syncs
3. Reduce number of properties

### Issue: Database Connection Failed

**Causes:**
- Invalid Supabase credentials
- Tables not created

**Solutions:**
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY`
2. Run database migration again
3. Check Supabase project is active

## API Reference

### GET `/api/analytics/get-analytics-kpis`

Retrieve cached analytics KPIs.

**Query Parameters:**
- `month` (optional): Format YYYY-MM, defaults to current month
- `domain` (optional): Filter by specific domain

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": [...],
    "benchmark": {...},
    "summary": {...}
  }
}
```

### POST `/api/analytics/fetch-ga4-metrics`

Sync fresh data from Google Analytics 4.

**Body:**
```json
{
  "month": "2025-10",
  "forceRefresh": true
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "total": 3,
    "successful": 3,
    "failed": 0
  }
}
```

## Support

For issues or questions:
1. Check this documentation
2. Review server logs in Vercel
3. Check database logs in Supabase
4. Verify GA4 setup in Google Analytics

## License

Internal use for veterinary company operations.
