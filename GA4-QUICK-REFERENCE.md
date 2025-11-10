# GA4 Analytics Dashboard - Quick Reference

## Quick Start

### 1. Access Dashboard
Navigate to: `https://your-app.vercel.app/analytics-kpi.html`

### 2. View Current Month
- Dashboard loads current month automatically
- Click **Load Data** to view cached metrics

### 3. Change Month
- Select month from dropdown
- Click **Load Data**

### 4. Sync Fresh Data
- Click **🔄 Sync from GA4** button
- Wait 10-30 seconds for sync to complete
- Dashboard auto-refreshes with new data

## Dashboard Sections

### Summary Cards (Top)
- **Total Domains**: Number of tracked domains
- **Avg Key Events**: Average key events across all domains
- **Avg Active Users**: Average active users across all domains
- **Avg Engagement Rate**: Average engagement percentage

### Benchmark Performance
Shows pass/fail status for each metric:
- ✅ Green = 90%+ domains show steady/increasing trend
- ❌ Red = <90% domains show steady/increasing trend

### Charts
- **Metric Trends Overview**: Bar chart showing positive vs negative trends
- **Benchmark Pass Rate**: Doughnut chart showing which metrics meet threshold

### Domain-Level Performance
Expandable cards for each domain showing:
- Current vs. previous year metrics
- Trend indicators (↑ up, → neutral, ↓ down)
- Pass/fail status per metric
- Percentage change

## Metrics Explained

| Metric | Description | What it Measures |
|--------|-------------|------------------|
| **Key Events** | Important user actions | Conversions, signups, downloads, etc. |
| **New Users** | First-time visitors | Site reach and growth |
| **Active Users** | Engaged users | Site engagement and retention |
| **Engagement Rate** | % of engaged sessions | Quality of user interactions |
| **Avg Engagement Time** | Time spent engaged (seconds) | Depth of user engagement |

## Pass/Fail Criteria

### Individual Domain
A domain **passes** a metric if:
- Trend is **up** (↑) - increasing vs. last year, OR
- Trend is **neutral** (→) - steady vs. last year

A domain **fails** a metric if:
- Trend is **down** (↓) - decreasing vs. last year

### Benchmark (90% Threshold)
A metric **meets benchmark** if:
- ≥90% of domains show steady or increasing trend

A metric **fails benchmark** if:
- <90% of domains show steady or increasing trend

## Common Actions

### Sync New Month's Data
```
1. Wait until month is complete (after last day)
2. Select the month
3. Click "Sync from GA4"
4. Wait for completion message
5. Data is now cached for 24 hours
```

### Re-sync with Fresh Data
```
1. Select the month
2. Click "Sync from GA4"
3. Previous cached data is replaced
4. Benchmarks are recalculated
```

### Compare Multiple Months
```
1. Load Month 1 data
2. Note key metrics
3. Select Month 2
4. Click "Load Data"
5. Compare manually
```

### Export Domain Performance
```
1. Expand all domains (click "Expand All")
2. Use browser's print function
3. Save as PDF or print
```

## Troubleshooting

### No Data Available
**Solution**: Click "Sync from GA4" to fetch data for selected month

### Sync Failed
**Possible Causes**:
- Month has no data in GA4
- Service account credentials expired
- Internet connection issue

**Solution**: Check error message, verify GA4 has data for that month

### Old Data Showing
**Solution**: Click "Sync from GA4" with `forceRefresh` to update cache

### Some Domains Missing
**Causes**:
- Domain not in `ga4_properties` table
- Domain marked as inactive
- Service account lacks access to GA4 property

**Solution**: Check database configuration and GA4 permissions

## API Usage

### Get Cached Metrics
```bash
curl "https://your-app.vercel.app/api/analytics/get-analytics-kpis?month=2025-10"
```

### Sync Fresh Data
```bash
curl -X POST https://your-app.vercel.app/api/analytics/fetch-ga4-metrics \
  -H "Content-Type: application/json" \
  -d '{"month": "2025-10", "forceRefresh": true}'
```

### Get Single Domain
```bash
curl "https://your-app.vercel.app/api/analytics/get-analytics-kpis?month=2025-10&domain=example.com"
```

## Database Queries

### View Latest Metrics
```sql
SELECT domain, key_events, new_users, active_users,
       engagement_rate, avg_engagement_time
FROM ga4_monthly_metrics
ORDER BY metric_month DESC, domain;
```

### Check Benchmark Status
```sql
SELECT month_date, all_benchmarks_met, benchmarks_met_count,
       key_events_benchmark_met, new_users_benchmark_met
FROM ga4_benchmarks
ORDER BY month_date DESC;
```

### View Sync History
```sql
SELECT sync_type, status, properties_synced,
       started_at, duration_seconds
FROM ga4_sync_logs
ORDER BY started_at DESC
LIMIT 10;
```

### Find Failing Domains
```sql
SELECT domain, metric_month,
       key_events_trend, new_users_trend,
       active_users_trend, engagement_rate_trend
FROM ga4_monthly_metrics
WHERE metric_month = '2025-10-01'
  AND (key_events_trend = 'down'
       OR new_users_trend = 'down'
       OR active_users_trend = 'down')
ORDER BY domain;
```

## Best Practices

### Data Syncing
- ✅ Sync once per month after month ends
- ✅ Use cached data for daily views
- ✅ Schedule automatic sync via cron
- ❌ Don't sync multiple times per hour

### Benchmark Interpretation
- ✅ Review overall trend (all 5 metrics)
- ✅ Investigate domains that fail multiple metrics
- ✅ Consider seasonality in year-over-year comparisons
- ❌ Don't panic over single month variations

### Performance Optimization
- ✅ Use 24-hour cache
- ✅ Limit to active domains only
- ✅ Archive old metrics (>12 months)
- ❌ Don't fetch data for every page view

## Scheduled Tasks

### Automated Monthly Sync (Recommended)
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/analytics/fetch-ga4-metrics",
      "schedule": "0 7 1 * *"
    }
  ]
}
```
Runs: 1st of each month at 7 AM UTC

### Manual Sync
Call API endpoint directly or use dashboard button

## Support Resources

- **Setup Guide**: [SETUP-GA4-ANALYTICS.md](SETUP-GA4-ANALYTICS.md)
- **Main README**: [README.md](README.md)
- **Database Schema**: `database/ga4-analytics-schema.sql`
- **API Service**: `api/analytics/ga4-service.js`

## Keyboard Shortcuts

None currently - use mouse/touch to interact with dashboard.

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Data Retention

- **Metrics Cache**: 24 hours (configurable)
- **Historical Data**: Indefinite (in database)
- **Sync Logs**: Indefinite (can be pruned manually)

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
