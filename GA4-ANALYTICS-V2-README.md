# GA4 Analytics Dashboard V2

## Overview

This is a completely redesigned Google Analytics 4 (GA4) dashboard that provides property-level analytics with month-to-month comparisons, traffic source breakdowns, and individual key events tracking.

## Key Features

✅ **Property-Level View**: Searchable dropdown to select and analyze individual properties
✅ **Monthly Tracking**: Tracks data month-by-month (Jan-Oct 2025) with month-over-month comparisons
✅ **Traffic Sources**: Shows where traffic is coming from (Organic Search, Direct, Referral, Social, etc.)
✅ **Key Events Breakdown**: Individual conversion events with counts and user attribution
✅ **Interactive Charts**: Line charts showing trends over time for all key metrics
✅ **Comprehensive Metrics**: Users, sessions, engagement rate, engagement time, and more

## Setup Instructions

### 1. Create Database Tables

Run the SQL schema in your Supabase project:

```bash
# Option A: Check if tables exist
node scripts/setup-new-schema.js

# Option B: Create tables (if you have service role key)
node scripts/create-tables-direct.js
```

**Manual Setup (Recommended):**
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to SQL Editor
3. Copy the SQL from `database/ga4-new-schema.sql`
4. Run it in the SQL Editor

This will create:
- `ga4_monthly_metrics_v2` - Main metrics table
- `ga4_traffic_sources` - Traffic source breakdown
- `ga4_key_events` - Individual key events tracking

### 2. Sync Historical Data

Once tables are created, sync all 2025 data (Jan-Oct):

```bash
# Make sure server is running
npm start

# In another terminal, run sync script
node scripts/sync-2025-data.js
```

**Alternative**: Use the dashboard's built-in sync button
1. Open http://localhost:3000/analytics-dashboard-v2.html
2. Click "🔄 Sync Data"
3. Confirm to start syncing all months

⏰ **Note**: Syncing 10 months for multiple properties may take 5-15 minutes depending on the number of properties.

### 3. Access the Dashboard

Open your browser to:
```
http://localhost:3000/analytics-dashboard-v2.html
```

## Dashboard Usage

### Selecting a Property

1. Use the dropdown at the top to search and select a property
2. The dropdown shows how many months of data each property has
3. Click "📊 Load Analytics" to view that property's data

### Understanding the Data

**Summary Cards**
- **Total Users**: All users across the year
- **Total Sessions**: All sessions across the year
- **Key Events**: Total conversion events
- **Avg Engagement**: Average engagement rate

**Charts**
- **Users & Sessions Trend**: Shows how traffic has changed month-by-month
- **Engagement Metrics**: Engagement rate and average time on site
- **Key Events Over Time**: Bar chart of conversions by month
- **Traffic Sources**: Pie chart and breakdown of where traffic comes from

**Monthly Table**
- Detailed month-by-month performance
- Shows trends compared to previous month
- Color-coded badges indicate if metrics are up (green), down (red), or neutral (gray)

### Month-to-Month Comparison

Unlike the previous dashboard which compared year-over-year, this version compares each month to the previous month:

- **January 2025** vs **December 2024**
- **February 2025** vs **January 2025**
- **March 2025** vs **February 2025**
- And so on...

Trends are marked as:
- **↑ Up**: >5% increase from previous month
- **↓ Down**: >5% decrease from previous month
- **→ Neutral**: Within ±5% of previous month

## API Endpoints

### List All Properties
```
GET /api/analytics/list-properties
```

Returns all GA4 properties with summary info (latest month, number of months tracked, etc.)

### Get Property Analytics
```
GET /api/analytics/get-property-analytics?propertyId=123456789&year=2025
```

Returns complete analytics for a specific property including:
- Monthly metrics for the year
- Traffic sources by month
- Key events by month
- Yearly summary stats

### Sync Monthly Data
```
POST /api/analytics/sync-monthly-data
Body: {
  "year": 2025,
  "months": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}
```

Syncs GA4 data for specified months.

## Architecture

### Data Flow

```
GA4 API → Enhanced GA4 Service → Sync Endpoint → Supabase Tables → Dashboard
```

1. **GA4 Service Enhanced** (`api/analytics/ga4-service-enhanced.js`)
   - Fetches data from Google Analytics 4 API
   - Gets base metrics, traffic sources, and key events
   - Handles API authentication and error recovery

2. **Sync Endpoint** (`api/analytics/sync-monthly-data.js`)
   - Orchestrates monthly data syncing
   - Calculates month-to-month comparisons
   - Saves to three separate tables

3. **Property Analytics API** (`api/analytics/get-property-analytics.js`)
   - Retrieves and formats data for specific properties
   - Groups traffic sources and events by month
   - Calculates yearly summaries

4. **Dashboard** (`public/analytics-dashboard-v2.html`)
   - Interactive UI with searchable property selector
   - Chart.js visualizations
   - Real-time data loading

### Database Schema

**ga4_monthly_metrics_v2**
- Stores monthly aggregated metrics
- Includes current month and previous month values
- Calculates trends and percentage changes

**ga4_traffic_sources**
- Breaks down traffic by source/medium
- Includes channel grouping (Organic Search, Direct, etc.)
- Stores engagement metrics per source

**ga4_key_events**
- Individual conversion events
- Event counts and user attribution
- Event values (if configured in GA4)

## Troubleshooting

### Tables Not Created
- Make sure you ran the SQL in Supabase SQL Editor
- Check that your Supabase project has the tables listed

### No Data After Sync
- Verify GA4 credentials are configured correctly
- Check that properties have `is_active = true` in `ga4_properties` table
- Look at server logs for API errors

### Sync Takes Too Long
- This is normal for first-time syncs
- GA4 API has rate limits; the script waits between requests
- You can sync one month at a time if needed

### Charts Not Showing
- Ensure property has data for the selected year
- Check browser console for JavaScript errors
- Verify API responses in Network tab

## Next Steps

### Automated Monthly Syncing

Add a cron job to automatically sync new data each month:

```json
// In vercel.json
{
  "crons": [
    {
      "path": "/api/analytics/sync-monthly-data",
      "schedule": "0 8 2 * *",
      "description": "Sync previous month GA4 data on 2nd of each month"
    }
  ]
}
```

### Adding More Properties

1. Add property to `ga4_properties` table in Supabase
2. Ensure property ID is correct
3. Set `is_active = true`
4. Run sync for that property

### Custom Date Ranges

Modify `get-property-analytics.js` to accept custom date ranges instead of just year.

## Support

For issues or questions:
1. Check server logs for errors
2. Verify Supabase connection
3. Confirm GA4 API credentials are valid
4. Review browser console for frontend errors

---

**Version**: 2.0
**Last Updated**: November 2025
