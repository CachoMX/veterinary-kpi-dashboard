# Quick Start Guide - GA4 Analytics Dashboard V2

Follow these steps to get your new dashboard up and running:

## Step 1: Create Database Tables (Required - Do This First!)

You need to create the new tables in Supabase before syncing data.

### Option A: Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy ALL the SQL from the file: `database/ga4-new-schema.sql`
6. Paste it into the SQL Editor
7. Click "Run" or press Ctrl+Enter
8. You should see "Success. No rows returned" - this is good!

### Option B: Verify Tables Were Created

Run this command to check:
```bash
node scripts/setup-new-schema.js
```

You should see:
```
✓ ga4_monthly_metrics_v2 table exists
✓ ga4_traffic_sources table exists
✓ ga4_key_events table exists
```

If you see ✗ (red X), the tables don't exist yet. Go back to Option A.

## Step 2: Start Your Server

```bash
npm start
```

Server should be running at http://localhost:3000

## Step 3: Sync Your Data

### Option A: Using the Dashboard (Easiest)

1. Open http://localhost:3000/analytics-dashboard-v2.html
2. Click the green "🔄 Sync Data" button
3. Click "Start Sync"
4. Wait (this takes 5-15 minutes for all properties and months)
5. You'll see a success message when done

### Option B: Using Command Line

In a new terminal window (keep server running):

```bash
node scripts/sync-2025-data.js
```

## Step 4: View Your Dashboard

1. Open http://localhost:3000/analytics-dashboard-v2.html
2. Select a property from the dropdown
3. Click "📊 Load Analytics"
4. Explore your data!

## Troubleshooting

### "Failed to load properties"
- Make sure your server is running (npm start)
- Check that .env.local has correct SUPABASE_URL and SUPABASE_ANON_KEY

### "No active properties found"
- Your ga4_properties table might be empty
- Make sure properties have is_active = true

### Sync fails with errors
- Check GA4_SERVICE_ACCOUNT_CREDENTIALS in .env.local
- Verify the service account has access to GA4 properties
- Check server console for detailed error messages

### Tables don't exist error
- You skipped Step 1! Go back and create the tables
- Run: node scripts/setup-new-schema.js to verify

## What Gets Synced

- **Months**: January - October 2025
- **Properties**: All active properties in your ga4_properties table
- **Data**:
  - Core metrics (users, sessions, key events, engagement)
  - Traffic sources breakdown
  - Individual key events
  - Month-to-month comparisons

## Need Help?

Check the full documentation in `GA4-ANALYTICS-V2-README.md`
