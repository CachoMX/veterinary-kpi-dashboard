#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Simplified GA4 Property Discovery Script - Fixed for Windows
"""

import os
import sys
import json
from typing import List, Dict

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

from google.analytics.admin import AnalyticsAdminServiceClient
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
        # List all accounts
        accounts = client.list_accounts()

        for account in accounts:
            print(f"Scanning account: {account.display_name}")

            try:
                # List properties - use correct API method
                account_properties = list(client.list_properties(
                    parent=account.name
                ))

                for prop in account_properties:
                    # Extract property ID
                    property_id = prop.name.split('/')[-1]

                    # Try to get domain from data streams
                    domain = prop.display_name.lower().replace(' ', '-')

                    try:
                        streams = list(client.list_data_streams(parent=prop.name))
                        for stream in streams:
                            if hasattr(stream, 'web_stream_data') and stream.web_stream_data:
                                url = stream.web_stream_data.default_uri
                                domain = url.replace('https://', '').replace('http://', '').split('/')[0]
                                break
                    except:
                        pass

                    properties.append({
                        'property_id': property_id,
                        'display_name': prop.display_name,
                        'domain': domain,
                        'account': account.display_name
                    })

                    print(f"  [OK] {prop.display_name} -> {domain} (ID: {property_id})")

            except Exception as e:
                print(f"  [Warning] Could not list properties for {account.display_name}: {e}")
                continue

    except Exception as e:
        print(f"ERROR: {e}")
        return []

    print(f"\n[OK] Total discovered: {len(properties)} properties\n")
    return properties


def generate_sql(properties: List[Dict], output_file: str):
    """Generate SQL INSERT statements"""

    lines = [
        "-- Auto-discovered GA4 Properties",
        f"-- Total: {len(properties)} properties",
        "",
        "-- Insert discovered properties",
        ""
    ]

    for prop in properties:
        domain = prop['domain'].replace("'", "''")
        display_name = prop['display_name'].replace("'", "''")

        # Auto-categorize
        name_lower = display_name.lower()
        if 'vet' in name_lower or 'clinic' in name_lower:
            category = 'veterinary'
        elif 'blog' in name_lower:
            category = 'blog'
        elif 'shop' in name_lower or 'store' in name_lower:
            category = 'ecommerce'
        else:
            category = 'website'

        sql = f"""INSERT INTO ga4_properties (domain, property_id, description, category, is_active)
VALUES ('{domain}', '{prop['property_id']}', '{display_name}', '{category}', true)
ON CONFLICT (domain) DO UPDATE SET
    property_id = EXCLUDED.property_id,
    description = EXCLUDED.description,
    updated_at = NOW();
"""
        lines.append(sql)

    content = '\n'.join(lines)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"[OK] SQL saved to: {output_file}")
    return content


def generate_csv(properties: List[Dict], output_file: str):
    """Generate CSV file"""
    import csv

    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['domain', 'property_id', 'display_name', 'account'])

        for prop in properties:
            writer.writerow([
                prop['domain'],
                prop['property_id'],
                prop['display_name'],
                prop['account']
            ])

    print(f"[OK] CSV saved to: {output_file}")


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Discover GA4 properties')
    parser.add_argument('--credentials', required=True, help='Path to service account JSON')
    parser.add_argument('--output', choices=['sql', 'csv', 'both'], default='both')

    args = parser.parse_args()

    # Discover
    properties = discover_properties(args.credentials)

    if not properties:
        print("\nNo properties found!")
        sys.exit(1)

    # Generate outputs
    if args.output in ['sql', 'both']:
        generate_sql(properties, 'discovered-ga4-properties.sql')

    if args.output in ['csv', 'both']:
        generate_csv(properties, 'discovered-ga4-properties.csv')

    print("\n[OK] Discovery complete!")
    print("\nNext steps:")
    print("  1. Review discovered-ga4-properties.csv")
    print("  2. Run discovered-ga4-properties.sql in Supabase")
