#!/usr/bin/env python3
"""
Script to automatically grant Viewer access to service account for all GA4 properties
This solves the "no data" problem by giving the service account permission to read analytics data
"""

import json
import os
import sys
from google.analytics.admin_v1alpha import AnalyticsAdminServiceClient
from google.analytics.admin_v1alpha.types import (
    AccessBinding,
    GetPropertyRequest,
    CreateAccessBindingRequest
)
from google.oauth2 import service_account

# Service account email that needs access
SERVICE_ACCOUNT_EMAIL = 'gtm-tool-386203@appspot.gserviceaccount.com'

# Role to grant (predefined Viewer role)
VIEWER_ROLE = 'predefinedRoles/viewer'

def grant_access_to_all_properties(credentials_path):
    """Grant Viewer access to service account for all GA4 properties"""

    print("=" * 70)
    print("GA4 ACCESS GRANTING SCRIPT")
    print("=" * 70)
    print(f"\nService Account: {SERVICE_ACCOUNT_EMAIL}")
    print(f"Role: Viewer (Read-only access)")
    print(f"Credentials: {credentials_path}\n")

    # Load credentials
    try:
        with open(credentials_path, 'r', encoding='utf-8') as f:
            creds_info = json.load(f)
        credentials = service_account.Credentials.from_service_account_info(creds_info)
    except Exception as e:
        print(f"ERROR loading credentials: {e}")
        return

    # Initialize client
    try:
        client = AnalyticsAdminServiceClient(credentials=credentials)
        print("[OK] Connected to Google Analytics Admin API\n")
    except Exception as e:
        print(f"ERROR connecting to API: {e}")
        return

    # Get all accounts
    print("Fetching accounts...")
    try:
        accounts_response = client.list_accounts()
        accounts = list(accounts_response)
        print(f"[OK] Found {len(accounts)} accounts\n")
    except Exception as e:
        print(f"ERROR fetching accounts: {e}")
        return

    total_properties = 0
    granted_count = 0
    already_has_access_count = 0
    error_count = 0

    # Process each account
    for account_idx, account in enumerate(accounts, 1):
        account_name = account.display_name
        print(f"\n[{account_idx}/{len(accounts)}] Processing account: {account_name}")
        print("-" * 70)

        # Get properties for this account
        try:
            from google.analytics.admin_v1alpha.types import ListPropertiesRequest
            request = ListPropertiesRequest(
                filter=f"parent:{account.name}",
                show_deleted=False
            )
            properties_response = client.list_properties(request=request)
            properties = list(properties_response)

            print(f"  Found {len(properties)} properties")

            for prop in properties:
                total_properties += 1
                prop_name = prop.display_name
                property_id = prop.name.split('/')[-1]

                print(f"  [{total_properties}] {prop_name} (ID: {property_id})", end=" ... ")

                try:
                    # Check if access already exists
                    try:
                        access_bindings = client.list_access_bindings(parent=prop.name)
                        existing_bindings = list(access_bindings)

                        # Check if service account already has access
                        already_has_access = any(
                            binding.user == f"user:{SERVICE_ACCOUNT_EMAIL}"
                            for binding in existing_bindings
                        )

                        if already_has_access:
                            print("[SKIP] Already has access")
                            already_has_access_count += 1
                            continue
                    except Exception as check_error:
                        # If we can't check, try to add anyway
                        pass

                    # Create access binding
                    access_binding = AccessBinding(
                        user=f"user:{SERVICE_ACCOUNT_EMAIL}",
                        roles=[VIEWER_ROLE]
                    )

                    request = CreateAccessBindingRequest(
                        parent=prop.name,
                        access_binding=access_binding
                    )

                    result = client.create_access_binding(request=request)
                    print("[OK] Access granted!")
                    granted_count += 1

                except Exception as grant_error:
                    error_msg = str(grant_error)
                    if "ALREADY_EXISTS" in error_msg or "already exists" in error_msg.lower():
                        print("[SKIP] Already has access")
                        already_has_access_count += 1
                    elif "PERMISSION_DENIED" in error_msg:
                        print("[ERROR] Permission denied - you may not be admin")
                        error_count += 1
                    else:
                        print(f"[ERROR] {error_msg[:50]}")
                        error_count += 1

        except Exception as e:
            print(f"  ERROR processing account: {e}")
            continue

    # Summary
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total properties processed:  {total_properties}")
    print(f"Access granted:              {granted_count}")
    print(f"Already had access:          {already_has_access_count}")
    print(f"Errors:                      {error_count}")
    print("=" * 70)

    if granted_count > 0:
        print(f"\n[SUCCESS] Granted access to {granted_count} properties!")
        print("\nNext steps:")
        print("1. Wait 1-2 minutes for permissions to propagate")
        print("2. Re-run the data sync: node sync-all-2025.js")
        print("3. Check dashboard - you should now see real data!")
    elif already_has_access_count > 0:
        print(f"\n[INFO] Service account already has access to {already_has_access_count} properties")
        print("\nIf you're still seeing zeros, the properties may not have data.")
    else:
        print("\n[WARNING] No access was granted. Check errors above.")

if __name__ == "__main__":
    credentials_path = os.path.join(os.path.dirname(__file__), 'gtm-tool-386203-c8dc903f3c2d.json')

    if not os.path.exists(credentials_path):
        print(f"ERROR: Credentials file not found: {credentials_path}")
        sys.exit(1)

    grant_access_to_all_properties(credentials_path)
