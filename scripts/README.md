# GA4 Property Auto-Discovery Script

This script automatically discovers all Google Analytics 4 properties your service account has access to and generates SQL or CSV files for easy database population.

## Features

- 🔍 **Auto-discovery**: Scans all GA4 accounts and properties
- 📊 **Multiple formats**: Generate SQL inserts or CSV files
- 🚀 **Direct insertion**: Optionally insert directly to Supabase
- 🏷️ **Auto-categorization**: Automatically categorizes properties (veterinary, blog, ecommerce, etc.)
- 🌐 **Domain extraction**: Attempts to extract domain from property data streams

## Installation

### 1. Install Python dependencies

```bash
cd scripts
pip install -r requirements.txt
```

Or install manually:
```bash
pip install google-analytics-admin google-auth supabase
```

### 2. Set up credentials

You have two options:

**Option A: Use credentials file**
```bash
export GA4_CREDENTIALS_PATH="/path/to/service-account.json"
```

**Option B: Use environment variable (same as your app)**
```bash
export GA4_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account",...}'
```

### 3. (Optional) Set Supabase credentials for direct insertion
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
```

## Usage

### Quick Start - Generate SQL file

```bash
python auto-discover-ga4-properties.py
```

This creates `discovered-ga4-properties.sql` with INSERT statements for all discovered properties.

### Generate CSV file

```bash
python auto-discover-ga4-properties.py --output csv
```

Creates `discovered-ga4-properties.csv` for review in Excel/Sheets.

### Generate both SQL and CSV

```bash
python auto-discover-ga4-properties.py --output both
```

### Insert directly to Supabase

```bash
# Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set
python auto-discover-ga4-properties.py --insert-to-supabase
```

### Use specific credentials file

```bash
python auto-discover-ga4-properties.py \
  --credentials /path/to/service-account.json \
  --output sql
```

### Custom output files

```bash
python auto-discover-ga4-properties.py \
  --sql-file my-properties.sql \
  --csv-file my-properties.csv \
  --output both
```

## Examples

### Example 1: Discover and review in CSV

```bash
# Generate CSV
python auto-discover-ga4-properties.py --output csv

# Open in Excel/Numbers/Google Sheets
open discovered-ga4-properties.csv

# Review, edit categories if needed
# Then generate SQL
python auto-discover-ga4-properties.py --output sql
```

### Example 2: Direct insert to Supabase

```bash
# Set environment variables
export SUPABASE_URL="https://mbeorpjddmxaksqiryac.supabase.co"
export SUPABASE_ANON_KEY="your-key"
export GA4_CREDENTIALS_PATH="service-account.json"

# Discover and insert
python auto-discover-ga4-properties.py --insert-to-supabase

# Verify in Supabase
# Then run first sync
curl -X POST https://your-app/api/analytics/fetch-ga4-metrics \
  -d '{"month":"2025-10"}'
```

### Example 3: Using environment credentials (like production)

```bash
# Use same credentials as your Vercel app
export GA4_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account",...}'

# Generate SQL
python auto-discover-ga4-properties.py --output sql

# Review and run in Supabase SQL Editor
cat discovered-ga4-properties.sql
```

## Output Format

### SQL Output

```sql
-- Auto-generated GA4 Properties
-- Generated: 2025-10-29T15:30:00
-- Total properties: 150

INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('example-vet.com', '123456789', 'Example Veterinary Clinic', 'veterinary', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();

-- ... more properties
```

### CSV Output

```csv
domain,property_id,display_name,category,currency_code,time_zone,is_active
example-vet.com,123456789,Example Veterinary Clinic,veterinary,USD,America/Los_Angeles,true
vet-blog.com,987654321,Vet Blog,blog,USD,America/Los_Angeles,true
```

## Auto-Categorization

The script automatically categorizes properties based on domain/name:

| Category | Keywords | Examples |
|----------|----------|----------|
| `veterinary` | vet, veterinary, clinic | yourvet.com, animal-clinic.com |
| `blog` | blog | vetblog.com, blog.example.com |
| `ecommerce` | shop, store, ecommerce | petshop.com, vet-store.com |
| `pet-services` | pet, animal | petcare.com, animal-services.com |
| `website` | (default) | example.com |

You can manually edit categories in the CSV before generating SQL.

## Troubleshooting

### No properties found

**Causes:**
- Service account doesn't have Analytics Viewer access
- Service account email not added to GA4 properties
- Wrong credentials

**Solution:**
1. Check service account email in credentials
2. Go to each GA4 property → Admin → Property Access Management
3. Add service account email with "Viewer" role
4. Wait 5 minutes for permissions to propagate

### Permission denied errors

**Cause:** Service account lacks Admin API access

**Solution:**
Grant "Analytics Viewer" role at Account or Property level in GA4

### Module not found errors

```bash
# Install missing packages
pip install google-analytics-admin google-auth supabase
```

### Domain extraction issues

The script tries multiple methods to extract domains:
1. From data stream URLs (most accurate)
2. From property display name
3. Fallback to sanitized display name

If domains are incorrect, you can:
- Edit the CSV file before running SQL
- Manually adjust the SQL file
- Update in Supabase after insertion

## Advanced Usage

### Filter properties programmatically

Edit the script to add filtering logic in `discover_all_properties()`:

```python
# Only include properties with specific domain pattern
if 'vet' in domain_lower or 'clinic' in domain_lower:
    properties.append(property_info)
```

### Custom categorization

Edit the `categorize_property()` function to match your needs:

```python
def categorize_property(prop: Dict) -> str:
    name_lower = prop['display_name'].lower()
    domain_lower = prop['domain'].lower()

    if 'your-keyword' in name_lower:
        return 'your-category'
    # ... more rules
```

### Batch processing

For very large numbers of properties (100+), the script handles them automatically. No special configuration needed.

## Workflow Recommendation

For hundreds of domains, use this workflow:

```bash
# 1. Discover and generate CSV
python auto-discover-ga4-properties.py --output csv

# 2. Open in spreadsheet tool
open discovered-ga4-properties.csv

# 3. Review and edit:
#    - Check domains are correct
#    - Adjust categories
#    - Mark is_active = false for any to exclude
#    - Add notes in description

# 4. Generate SQL from reviewed CSV
python auto-discover-ga4-properties.py --output sql

# 5. Review SQL file
cat discovered-ga4-properties.sql

# 6. Run in Supabase
# Copy/paste into SQL Editor or:
psql "your-connection-string" < discovered-ga4-properties.sql

# 7. Verify
psql "your-connection-string" -c "SELECT COUNT(*) FROM ga4_properties WHERE is_active = true;"

# 8. Run first sync
curl -X POST https://your-app/api/analytics/fetch-ga4-metrics \
  -d '{"month":"2025-10"}'
```

## API Reference

### GA4PropertyDiscovery class

```python
from auto_discover_ga4_properties import GA4PropertyDiscovery

# Initialize with credentials file
discovery = GA4PropertyDiscovery(credentials_path='service-account.json')

# Or with JSON string
discovery = GA4PropertyDiscovery(credentials_json='{"type":"service_account",...}')

# Discover all properties
properties = discovery.discover_all_properties()

# Returns list of dicts:
# [
#   {
#     'property_id': '123456789',
#     'display_name': 'My Website',
#     'domain': 'example.com',
#     'currency_code': 'USD',
#     'time_zone': 'America/Los_Angeles',
#     'account': 'accounts/123',
#     'create_time': '2024-01-01T00:00:00Z'
#   },
#   ...
# ]
```

### Helper functions

```python
from auto_discover_ga4_properties import generate_sql_inserts, generate_csv, insert_to_supabase

# Generate SQL
sql = generate_sql_inserts(properties, output_file='output.sql')

# Generate CSV
generate_csv(properties, output_file='output.csv')

# Insert to Supabase
insert_to_supabase(properties, supabase_url, supabase_key)
```

## Security Notes

- ✅ Script uses read-only Analytics Admin API
- ✅ Never modifies GA4 properties
- ✅ Credentials are never logged or saved
- ✅ Use service account credentials (not user OAuth)

## Support

For issues:
1. Check that service account has proper GA4 access
2. Verify credentials are valid
3. Review error messages for specific issues
4. Check [SETUP-GA4-ANALYTICS.md](../SETUP-GA4-ANALYTICS.md) for GA4 setup help

## License

Internal use for veterinary company operations.
