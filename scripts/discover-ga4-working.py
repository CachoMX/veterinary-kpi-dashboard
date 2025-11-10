#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GA4 Property Discovery - Working Version
Uses correct API methods for google-analytics-admin 0.26.0
"""

import os
import sys
import json
from typing import List, Dict

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from google.analytics.admin_v1alpha import AnalyticsAdminServiceClient
from google.analytics.admin_v1alpha.types import ListPropertiesRequest
from google.oauth2 import service_account

def discover_properties(credentials_path: str) -> List[Dict]:
    """Discover all GA4 properties"""

    # Load credentials
    credentials = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=['https://www.googleapis.com/auth/analytics.readonly']
    )

    client = AnalyticsAdminServiceClient(credentials=credentials)
    properties = []

    print("Discovering GA4 properties...\n")

    try:
        # List all accounts first
        accounts_response = client.list_accounts()

        account_count = 0
        for account in accounts_response:
            account_count += 1
            print(f"[{account_count}] Scanning account: {account.display_name}")

            try:
                # Create proper request for listing properties
                request = ListPropertiesRequest(
                    filter=f"parent:{account.name}",
                    show_deleted=False
                )

                properties_response = client.list_properties(request=request)

                prop_count = 0
                for prop in properties_response:
                    prop_count += 1

                    # Extract property ID
                    property_id = prop.name.split('/')[-1]

                    # Try to get domain from data streams
                    domain = prop.display_name.lower().replace(' ', '-').replace("'", "")

                    try:
                        streams_response = client.list_data_streams(parent=prop.name)
                        for stream in streams_response:
                            if hasattr(stream, 'web_stream_data') and stream.web_stream_data:
                                url = stream.web_stream_data.default_uri
                                domain = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0]
                                break
                    except Exception as stream_error:
                        pass  # Use display name if stream fetch fails

                    properties.append({
                        'property_id': property_id,
                        'display_name': prop.display_name,
                        'domain': domain,
                        'account': account.display_name,
                        'account_id': account.name
                    })

                    print(f"    [OK] {prop.display_name}")
                    print(f"         Domain: {domain}")
                    print(f"         Property ID: {property_id}\n")

                if prop_count == 0:
                    print(f"    (No properties in this account)\n")

            except Exception as e:
                print(f"    [Warning] Error listing properties: {str(e)[:100]}\n")
                continue

    except Exception as e:
        print(f"ERROR: {e}")
        return []

    print(f"\n{'='*60}")
    print(f"[OK] Total discovered: {len(properties)} properties across {account_count} accounts")
    print(f"{'='*60}\n")
    return properties


def generate_sql(properties: List[Dict], output_file: str):
    """Generate SQL INSERT statements"""

    lines = [
        "-- Auto-discovered GA4 Properties",
        f"-- Generated: {__import__('datetime').datetime.now().isoformat()}",
        f"-- Total: {len(properties)} properties",
        "",
        "-- Clear existing data (comment out if you want to keep existing)",
        "-- DELETE FROM ga4_properties;",
        "",
        "-- Insert discovered properties",
        ""
    ]

    for prop in properties:
        domain = prop['domain'].replace("'", "''")
        display_name = prop['display_name'].replace("'", "''")
        account = prop['account'].replace("'", "''")

        # Auto-categorize
        name_lower = display_name.lower()
        if 'vet' in name_lower or 'clinic' in name_lower or 'hospital' in name_lower or 'animal' in name_lower:
            category = 'veterinary'
        elif 'blog' in name_lower:
            category = 'blog'
        elif 'shop' in name_lower or 'store' in name_lower or 'ecommerce' in name_lower:
            category = 'ecommerce'
        elif 'pet' in name_lower or 'dog' in name_lower or 'cat' in name_lower:
            category = 'pet-services'
        else:
            category = 'website'

        sql = f"""-- {display_name} ({account})
INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('{domain}', '{prop['property_id']}', '{display_name}', '{category}', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    updated_at = NOW();
"""
        lines.append(sql)

    content = '\n'.join(lines)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] SQL saved to: {output_file}")
    print(f"    File contains {len(properties)} INSERT statements\n")
    return content


def generate_csv(properties: List[Dict], output_file: str):
    """Generate CSV file"""
    import csv

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = ['domain', 'property_id', 'display_name', 'account']
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        writer.writeheader()
        for prop in properties:
            writer.writerow({
                'domain': prop['domain'],
                'property_id': prop['property_id'],
                'display_name': prop['display_name'],
                'account': prop['account']
            })

    print(f"[OK] CSV saved to: {output_file}")
    print(f"    File contains {len(properties)} rows\n")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Discover GA4 properties')
    parser.add_argument('--credentials', required=True, help='Path to service account JSON')
    parser.add_argument('--output', choices=['sql', 'csv', 'both'], default='both')

    args = parser.parse_args()

    # Discover
    print("="*60)
    print("GA4 Property Auto-Discovery")
    print("="*60)
    print()

    properties = discover_properties(args.credentials)

    if not properties:
        print("\n[ERROR] No properties found!")
        print("\nPossible reasons:")
        print("  1. Service account needs 'Viewer' role in GA4 properties")
        print("  2. No GA4 properties in these accounts")
        print("  3. Wrong credentials file")
        sys.exit(1)

    # Generate outputs
    if args.output in ['sql', 'both']:
        generate_sql(properties, 'discovered-ga4-properties.sql')

    if args.output in ['csv', 'both']:
        generate_csv(properties, 'discovered-ga4-properties.csv')

    print("\n[OK] Discovery complete!")
    print("\nNext steps:")
    print("  1. Review discovered-ga4-properties.csv in Excel/Sheets")
    print("  2. Edit domains/categories if needed")
    print("  3. Run discovered-ga4-properties.sql in Supabase SQL Editor")
    print("  4. Verify: SELECT COUNT(*) FROM ga4_properties;")
    print("  5. Sync data: POST /api/analytics/fetch-ga4-metrics")
