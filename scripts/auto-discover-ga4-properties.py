#!/usr/bin/env python3
"""
Auto-discover and populate GA4 properties from Google Analytics Admin API

This script:
1. Connects to Google Analytics Admin API
2. Discovers all GA4 properties you have access to
3. Extracts property ID, domain, and metadata
4. Generates SQL INSERT statements
5. Optionally inserts directly into Supabase

Usage:
    python auto-discover-ga4-properties.py --output sql
    python auto-discover-ga4-properties.py --output csv
    python auto-discover-ga4-properties.py --insert-to-supabase
"""

import os
import sys
import json
import argparse
import csv
from datetime import datetime
from typing import List, Dict, Optional

try:
    from google.analytics.admin import AnalyticsAdminServiceClient
    from google.oauth2 import service_account
except ImportError:
    print("ERROR: Missing required packages. Install with:")
    print("  pip install google-analytics-admin google-auth")
    sys.exit(1)

# Optional: Supabase for direct insertion
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("INFO: Supabase package not installed. Direct insertion disabled.")
    print("  Install with: pip install supabase")


class GA4PropertyDiscovery:
    """Discover all GA4 properties accessible by service account"""

    def __init__(self, credentials_path: Optional[str] = None, credentials_json: Optional[str] = None):
        """Initialize with service account credentials

        Args:
            credentials_path: Path to service account JSON file
            credentials_json: JSON string of service account credentials
        """
        if credentials_path:
            self.credentials = service_account.Credentials.from_service_account_file(
                credentials_path,
                scopes=['https://www.googleapis.com/auth/analytics.readonly']
            )
        elif credentials_json:
            creds_dict = json.loads(credentials_json)
            self.credentials = service_account.Credentials.from_service_account_info(
                creds_dict,
                scopes=['https://www.googleapis.com/auth/analytics.readonly']
            )
        else:
            raise ValueError("Must provide either credentials_path or credentials_json")

        self.client = AnalyticsAdminServiceClient(credentials=self.credentials)

    def discover_all_properties(self) -> List[Dict]:
        """Discover all GA4 properties accessible to the service account

        Returns:
            List of property dictionaries with id, name, domain, etc.
        """
        properties = []

        try:
            # List all accounts
            accounts = self.client.list_accounts()

            for account in accounts:
                print(f"Scanning account: {account.display_name} ({account.name})")

                # List properties for this account
                try:
                    account_properties = self.client.list_properties(
                        filter=f"parent:{account.name}"
                    )

                    for prop in account_properties:
                        # Only include GA4 properties (not Universal Analytics)
                        if prop.property_type.name == 'PROPERTY_TYPE_ORDINARY':
                            property_info = self._extract_property_info(prop)
                            properties.append(property_info)
                            print(f"  ✓ Found GA4 property: {property_info['display_name']} ({property_info['property_id']})")

                except Exception as e:
                    print(f"  ⚠ Warning: Could not list properties for {account.display_name}: {e}")
                    continue

        except Exception as e:
            print(f"ERROR: Failed to list accounts: {e}")
            raise

        print(f"\n✓ Total GA4 properties discovered: {len(properties)}")
        return properties

    def _extract_property_info(self, prop) -> Dict:
        """Extract relevant information from a property object"""
        # Extract property ID from resource name (format: properties/123456789)
        property_id = prop.name.split('/')[-1]

        # Try to extract domain from property display name or website URL
        domain = self._extract_domain(prop)

        return {
            'property_id': property_id,
            'display_name': prop.display_name,
            'domain': domain,
            'currency_code': prop.currency_code if hasattr(prop, 'currency_code') else 'USD',
            'time_zone': prop.time_zone if hasattr(prop, 'time_zone') else 'America/Los_Angeles',
            'account': prop.parent,
            'create_time': prop.create_time.isoformat() if hasattr(prop, 'create_time') else None,
        }

    def _extract_domain(self, prop) -> str:
        """Try to extract domain from property"""
        # Method 1: Try to get website URL from data streams
        try:
            streams = self.client.list_data_streams(parent=prop.name)
            for stream in streams:
                if hasattr(stream, 'web_stream_data'):
                    url = stream.web_stream_data.default_uri
                    # Extract domain from URL
                    domain = url.replace('https://', '').replace('http://', '').split('/')[0]
                    return domain
        except:
            pass

        # Method 2: Use display name (often contains domain)
        display_name = prop.display_name.lower()

        # Remove common prefixes/suffixes
        domain = display_name.replace(' ', '-')

        # If it looks like a domain, use it
        if '.' in domain and not domain.startswith('ga4'):
            return domain

        # Method 3: Fallback to sanitized display name
        return domain.replace(' ', '-').lower()


def generate_sql_inserts(properties: List[Dict], output_file: str = None) -> str:
    """Generate SQL INSERT statements for discovered properties

    Args:
        properties: List of property dictionaries
        output_file: Optional file path to save SQL

    Returns:
        SQL INSERT statements as string
    """
    sql_lines = [
        "-- Auto-generated GA4 Properties",
        f"-- Generated: {datetime.now().isoformat()}",
        f"-- Total properties: {len(properties)}",
        "",
        "-- Clear existing data (optional - comment out if you want to keep existing)",
        "-- DELETE FROM ga4_properties;",
        "",
        "-- Insert discovered properties",
    ]

    for prop in properties:
        # Escape single quotes in strings
        display_name = prop['display_name'].replace("'", "''")
        domain = prop['domain'].replace("'", "''")

        # Categorize based on domain or name
        category = categorize_property(prop)

        sql = f"""INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('{domain}', '{prop['property_id']}', '{display_name}', '{category}', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();"""

        sql_lines.append(sql)
        sql_lines.append("")

    sql_content = '\n'.join(sql_lines)

    if output_file:
        with open(output_file, 'w') as f:
            f.write(sql_content)
        print(f"✓ SQL saved to: {output_file}")

    return sql_content


def generate_csv(properties: List[Dict], output_file: str = None) -> str:
    """Generate CSV file of discovered properties

    Args:
        properties: List of property dictionaries
        output_file: Optional file path to save CSV

    Returns:
        CSV content as string
    """
    if not properties:
        return ""

    # Define CSV columns
    fieldnames = ['domain', 'property_id', 'display_name', 'category', 'currency_code', 'time_zone', 'is_active']

    if output_file:
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()

            for prop in properties:
                writer.writerow({
                    'domain': prop['domain'],
                    'property_id': prop['property_id'],
                    'display_name': prop['display_name'],
                    'category': categorize_property(prop),
                    'currency_code': prop.get('currency_code', 'USD'),
                    'time_zone': prop.get('time_zone', 'America/Los_Angeles'),
                    'is_active': 'true'
                })

        print(f"✓ CSV saved to: {output_file}")

    return output_file


def categorize_property(prop: Dict) -> str:
    """Auto-categorize property based on domain or name"""
    name_lower = prop['display_name'].lower()
    domain_lower = prop['domain'].lower()

    if 'blog' in name_lower or 'blog' in domain_lower:
        return 'blog'
    elif 'shop' in name_lower or 'store' in domain_lower or 'ecommerce' in name_lower:
        return 'ecommerce'
    elif 'vet' in name_lower or 'veterinary' in domain_lower or 'clinic' in name_lower:
        return 'veterinary'
    elif 'pet' in name_lower or 'animal' in domain_lower:
        return 'pet-services'
    else:
        return 'website'


def insert_to_supabase(properties: List[Dict], supabase_url: str, supabase_key: str):
    """Insert properties directly into Supabase database

    Args:
        properties: List of property dictionaries
        supabase_url: Supabase project URL
        supabase_key: Supabase anon key
    """
    if not SUPABASE_AVAILABLE:
        print("ERROR: Supabase package not installed. Install with: pip install supabase")
        return

    try:
        supabase: Client = create_client(supabase_url, supabase_key)

        inserted = 0
        updated = 0
        errors = 0

        for prop in properties:
            try:
                data = {
                    'domain': prop['domain'],
                    'property_id': prop['property_id'],
                    'description': prop['display_name'],
                    'category': categorize_property(prop),
                    'is_active': True
                }

                # Upsert (insert or update)
                result = supabase.table('ga4_properties').upsert(data, on_conflict='domain').execute()

                if result.data:
                    # Check if it was an insert or update by looking at created_at vs updated_at
                    inserted += 1
                    print(f"  ✓ Inserted: {prop['domain']}")
                else:
                    updated += 1
                    print(f"  ✓ Updated: {prop['domain']}")

            except Exception as e:
                errors += 1
                print(f"  ✗ Error inserting {prop['domain']}: {e}")

        print(f"\n✓ Supabase insertion complete:")
        print(f"  - Inserted/Updated: {inserted + updated}")
        print(f"  - Errors: {errors}")

    except Exception as e:
        print(f"ERROR: Failed to connect to Supabase: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Auto-discover GA4 properties and populate database',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Generate SQL file
  python auto-discover-ga4-properties.py --output sql --sql-file properties.sql

  # Generate CSV file
  python auto-discover-ga4-properties.py --output csv --csv-file properties.csv

  # Insert directly to Supabase
  python auto-discover-ga4-properties.py --insert-to-supabase

  # Use specific credentials file
  python auto-discover-ga4-properties.py --credentials /path/to/service-account.json --output sql

Environment Variables:
  GA4_SERVICE_ACCOUNT_CREDENTIALS  - Service account JSON (as string)
  GA4_CREDENTIALS_PATH             - Path to service account JSON file
  SUPABASE_URL                     - Supabase project URL
  SUPABASE_ANON_KEY                - Supabase anon key
        """
    )

    parser.add_argument(
        '--credentials',
        help='Path to service account JSON file (or use GA4_CREDENTIALS_PATH env var)'
    )
    parser.add_argument(
        '--output',
        choices=['sql', 'csv', 'both'],
        default='sql',
        help='Output format (default: sql)'
    )
    parser.add_argument(
        '--sql-file',
        default='discovered-ga4-properties.sql',
        help='Output SQL file path (default: discovered-ga4-properties.sql)'
    )
    parser.add_argument(
        '--csv-file',
        default='discovered-ga4-properties.csv',
        help='Output CSV file path (default: discovered-ga4-properties.csv)'
    )
    parser.add_argument(
        '--insert-to-supabase',
        action='store_true',
        help='Insert directly into Supabase database'
    )
    parser.add_argument(
        '--supabase-url',
        help='Supabase URL (or use SUPABASE_URL env var)'
    )
    parser.add_argument(
        '--supabase-key',
        help='Supabase anon key (or use SUPABASE_ANON_KEY env var)'
    )

    args = parser.parse_args()

    # Get credentials
    creds_path = args.credentials or os.getenv('GA4_CREDENTIALS_PATH')
    creds_json = os.getenv('GA4_SERVICE_ACCOUNT_CREDENTIALS')

    if not creds_path and not creds_json:
        print("ERROR: Must provide credentials via --credentials flag or environment variables")
        print("  Set GA4_CREDENTIALS_PATH or GA4_SERVICE_ACCOUNT_CREDENTIALS")
        sys.exit(1)

    try:
        # Initialize discovery
        print("Initializing GA4 property discovery...")
        if creds_path:
            print(f"Using credentials file: {creds_path}")
            discovery = GA4PropertyDiscovery(credentials_path=creds_path)
        else:
            print("Using credentials from environment variable")
            discovery = GA4PropertyDiscovery(credentials_json=creds_json)

        # Discover properties
        print("\nDiscovering GA4 properties...\n")
        properties = discovery.discover_all_properties()

        if not properties:
            print("\n⚠ No GA4 properties found. Check that:")
            print("  1. Service account has Analytics Viewer access")
            print("  2. Service account email is added to GA4 properties")
            print("  3. You're using the correct credentials")
            sys.exit(1)

        # Generate outputs
        print("\nGenerating outputs...\n")

        if args.output in ['sql', 'both']:
            generate_sql_inserts(properties, args.sql_file)

        if args.output in ['csv', 'both']:
            generate_csv(properties, args.csv_file)

        # Insert to Supabase if requested
        if args.insert_to_supabase:
            supabase_url = args.supabase_url or os.getenv('SUPABASE_URL')
            supabase_key = args.supabase_key or os.getenv('SUPABASE_ANON_KEY')

            if not supabase_url or not supabase_key:
                print("\nERROR: Supabase credentials not provided")
                print("  Set --supabase-url and --supabase-key")
                print("  OR set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
                sys.exit(1)

            print("\nInserting to Supabase...\n")
            insert_to_supabase(properties, supabase_url, supabase_key)

        print("\n✓ Discovery complete!")
        print(f"\nNext steps:")
        if args.output in ['sql', 'both']:
            print(f"  1. Review {args.sql_file}")
            print(f"  2. Run in Supabase SQL Editor or psql")
        if args.insert_to_supabase:
            print(f"  1. Verify data in Supabase dashboard")
            print(f"  2. Run first GA4 sync")

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
