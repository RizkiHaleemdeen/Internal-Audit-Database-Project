#!/usr/bin/env python3
"""
Backend API Testing for Internal Audit Tree Explorer
Tests all API endpoints for the audit tree hierarchy system
"""

import requests
import json
import sys
import os
from urllib.parse import quote

# Get base URL from environment or use default
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000')
API_BASE = f"{BASE_URL}/api"

def test_api_endpoint(url, description, expected_keys=None):
    """Test a single API endpoint"""
    print(f"\n{'='*60}")
    print(f"Testing: {description}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print("✅ Valid JSON response received")
                print(f"Response keys: {list(data.keys()) if isinstance(data, dict) else 'Not a dict'}")
                
                # Check for expected keys
                if expected_keys and isinstance(data, dict):
                    missing_keys = [key for key in expected_keys if key not in data]
                    if missing_keys:
                        print(f"⚠️  Missing expected keys: {missing_keys}")
                    else:
                        print("✅ All expected keys present")
                
                # Print sample data structure
                if isinstance(data, dict):
                    for key, value in data.items():
                        if isinstance(value, list) and len(value) > 0:
                            print(f"  {key}: [{len(value)} items] - Sample: {str(value[0])[:100]}...")
                        elif isinstance(value, dict):
                            print(f"  {key}: {{{len(value)} keys}} - Keys: {list(value.keys())[:3]}...")
                        else:
                            print(f"  {key}: {str(value)[:100]}...")
                
                return True, data
                
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON response: {e}")
                print(f"Response text: {response.text[:200]}...")
                return False, None
                
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {error_data}")
                return False, error_data
            except:
                print(f"Error text: {response.text[:200]}...")
                return False, None
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False, None

def test_initial_data():
    """Test the initial data endpoint"""
    url = f"{API_BASE}?level=initial"
    success, data = test_api_endpoint(
        url, 
        "Initial Data Endpoint - GET /api?level=initial",
        expected_keys=['sectors']
    )
    
    if success and data:
        # Validate structure
        if 'sectors' in data and isinstance(data['sectors'], list):
            print(f"✅ Found {len(data['sectors'])} sectors")
            for sector in data['sectors'][:2]:  # Show first 2 sectors
                if 'name' in sector and 'families' in sector:
                    print(f"  Sector: {sector['name']} - Families: {sector['families']}")
                else:
                    print(f"⚠️  Invalid sector structure: {sector}")
        else:
            print("❌ Invalid sectors structure")
            
    return success, data

def test_categories_endpoint(sector="Non-IT", family="Compliance Audit"):
    """Test the categories endpoint with valid parameters"""
    encoded_family = quote(family)
    url = f"{API_BASE}?level=categories&sector={sector}&family={encoded_family}"
    success, data = test_api_endpoint(
        url,
        f"Categories Endpoint - GET /api?level=categories&sector={sector}&family={family}",
        expected_keys=['sector', 'family', 'categories']
    )
    
    if success and data:
        # Validate structure
        if all(key in data for key in ['sector', 'family', 'categories']):
            print(f"✅ Valid response structure")
            print(f"  Sector: {data['sector']}")
            print(f"  Family: {data['family']}")
            print(f"  Categories: {data['categories']}")
        else:
            print("❌ Missing required fields in response")
            
    return success, data

def test_categories_endpoint_invalid():
    """Test the categories endpoint with invalid parameters"""
    url = f"{API_BASE}?level=categories&sector=InvalidSector&family=InvalidFamily"
    success, data = test_api_endpoint(
        url,
        "Categories Endpoint - Invalid Parameters",
        expected_keys=['sector', 'family', 'categories']
    )
    
    if success and data:
        if 'categories' in data and len(data['categories']) == 0:
            print("✅ Correctly returns empty categories for invalid sector/family")
        else:
            print("⚠️  Unexpected response for invalid parameters")
            
    return success, data

def test_types_endpoint(sector="Non-IT", family="Compliance Audit", category="Corporate Compliance"):
    """Test the types endpoint with valid parameters"""
    encoded_family = quote(family)
    encoded_category = quote(category)
    url = f"{API_BASE}?level=types&sector={sector}&family={encoded_family}&category={encoded_category}"
    success, data = test_api_endpoint(
        url,
        f"Types Endpoint - GET /api?level=types&sector={sector}&family={family}&category={category}",
        expected_keys=['sector', 'family', 'category', 'types']
    )
    
    if success and data:
        # Validate structure
        if all(key in data for key in ['sector', 'family', 'category', 'types']):
            print(f"✅ Valid response structure")
            print(f"  Sector: {data['sector']}")
            print(f"  Family: {data['family']}")
            print(f"  Category: {data['category']}")
            
            if isinstance(data['types'], list) and len(data['types']) > 0:
                print(f"  Types: {len(data['types'])} items")
                # Check first type structure
                first_type = data['types'][0]
                required_fields = ['type', 'description', 'whenToUse', 'framework']
                missing_fields = [field for field in required_fields if field not in first_type]
                if missing_fields:
                    print(f"⚠️  Missing fields in type object: {missing_fields}")
                else:
                    print("✅ Type objects have all required fields")
                    print(f"  Sample type: {first_type['type']}")
            else:
                print("⚠️  No types found or invalid types structure")
        else:
            print("❌ Missing required fields in response")
            
    return success, data

def test_types_endpoint_invalid():
    """Test the types endpoint with invalid parameters"""
    url = f"{API_BASE}?level=types&sector=Invalid&family=Invalid&category=Invalid"
    success, data = test_api_endpoint(
        url,
        "Types Endpoint - Invalid Parameters",
        expected_keys=['sector', 'family', 'category', 'types']
    )
    
    if success and data:
        if 'types' in data and len(data['types']) == 0:
            print("✅ Correctly returns empty types for invalid parameters")
        else:
            print("⚠️  Unexpected response for invalid parameters")
            
    return success, data

def test_database_connection():
    """Test basic database connectivity by checking if any data is returned"""
    url = f"{API_BASE}"  # Default endpoint should return full hierarchy
    success, data = test_api_endpoint(
        url,
        "Database Connection Test - Default endpoint",
        expected_keys=['hierarchy']
    )
    
    if success and data:
        if 'hierarchy' in data and isinstance(data['hierarchy'], dict):
            print(f"✅ Database connection working - hierarchy has {len(data['hierarchy'])} sectors")
            # Check for data structure
            for sector_name, sector_data in list(data['hierarchy'].items())[:2]:
                print(f"  Sector '{sector_name}' has {len(sector_data)} families")
        else:
            print("❌ Invalid hierarchy structure returned")
    else:
        print("❌ Database connection test failed")
        
    return success, data

def test_error_handling():
    """Test error handling with malformed requests"""
    print(f"\n{'='*60}")
    print("Testing Error Handling")
    print(f"{'='*60}")
    
    # Test with invalid level parameter
    url = f"{API_BASE}?level=invalid"
    success, data = test_api_endpoint(
        url,
        "Error Handling - Invalid level parameter"
    )
    
    # Should still return data (falls back to full hierarchy)
    if success:
        print("✅ API handles invalid level parameter gracefully")
    
    return success

def run_all_tests():
    """Run all backend API tests"""
    print("🚀 Starting Internal Audit Tree Explorer Backend API Tests")
    print(f"Base URL: {BASE_URL}")
    print(f"API Base: {API_BASE}")
    
    test_results = {}
    
    # Test 1: Database Connection
    print("\n" + "="*80)
    print("TEST 1: DATABASE CONNECTION")
    print("="*80)
    test_results['database_connection'] = test_database_connection()
    
    # Test 2: Initial Data Endpoint
    print("\n" + "="*80)
    print("TEST 2: INITIAL DATA ENDPOINT")
    print("="*80)
    test_results['initial_data'] = test_initial_data()
    
    # Test 3: Categories Endpoint (Valid)
    print("\n" + "="*80)
    print("TEST 3: CATEGORIES ENDPOINT (VALID)")
    print("="*80)
    test_results['categories_valid'] = test_categories_endpoint()
    
    # Test 4: Categories Endpoint (Invalid)
    print("\n" + "="*80)
    print("TEST 4: CATEGORIES ENDPOINT (INVALID)")
    print("="*80)
    test_results['categories_invalid'] = test_categories_endpoint_invalid()
    
    # Test 5: Types Endpoint (Valid)
    print("\n" + "="*80)
    print("TEST 5: TYPES ENDPOINT (VALID)")
    print("="*80)
    test_results['types_valid'] = test_types_endpoint()
    
    # Test 6: Types Endpoint (Invalid)
    print("\n" + "="*80)
    print("TEST 6: TYPES ENDPOINT (INVALID)")
    print("="*80)
    test_results['types_invalid'] = test_types_endpoint_invalid()
    
    # Test 7: Error Handling
    print("\n" + "="*80)
    print("TEST 7: ERROR HANDLING")
    print("="*80)
    test_results['error_handling'] = test_error_handling()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = 0
    total = 0
    
    for test_name, (success, _) in test_results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name}: {status}")
        if success:
            passed += 1
        total += 1
    
    print(f"\nOverall Result: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend API is working correctly.")
        return True
    else:
        print("⚠️  Some tests failed. Check the details above.")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)