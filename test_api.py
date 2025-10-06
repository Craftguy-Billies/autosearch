#!/usr/bin/env python3
"""
Test script for AI Web Search API
Tests the API with the question: "When is the release date of Sora 2?"
"""

import requests
import json
import time
import sys

# Configuration
API_URL = "https://323b2ed7-b05f-4f72-a1cf-100a54adc7a3-00-ijp4vpyqd8ks.pike.replit.dev/api/search"
TEST_QUERY = "When is the release date of Sora 2?"

def print_separator():
    print("\n" + "="*80 + "\n")

def test_health_check():
    """Test the health endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get("https://323b2ed7-b05f-4f72-a1cf-100a54adc7a3-00-ijp4vpyqd8ks.pike.replit.dev/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check passed:", response.json())
            return True
        else:
            print("❌ Health check failed:", response.status_code)
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_search(query):
    """Test the search endpoint with a query"""
    print(f"Testing search with query: '{query}'")
    print("⏳ Please wait, this may take 15-30 seconds...")
    
    start_time = time.time()
    
    try:
        response = requests.post(
            API_URL,
            json={"query": query},
            timeout=180  # 3 minutes timeout
        )
        
        elapsed_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            print_separator()
            print("✅ SEARCH SUCCESSFUL")
            print_separator()
            
            print(f"📝 Query: {data.get('query', 'N/A')}")
            print(f"\n💡 Answer:\n{data.get('answer', 'N/A')}")
            
            sources = data.get('sources', [])
            if sources:
                print(f"\n📚 Sources ({len(sources)}):")
                for i, source in enumerate(sources, 1):
                    print(f"  {i}. {source.get('title', 'N/A')}")
                    print(f"     {source.get('url', 'N/A')}")
            
            print(f"\n⏱️  Processing Time: {data.get('processingTime', 'N/A')}")
            print(f"⏱️  Total Time: {elapsed_time:.2f}s")
            
            print_separator()
            
            return True
        else:
            print(f"❌ Search failed with status code: {response.status_code}")
            print(f"Error: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The server might be processing a complex query.")
        return False
    except Exception as e:
        print(f"❌ Search error: {e}")
        return False

def test_invalid_query():
    """Test with invalid input"""
    print("Testing with invalid query (empty string)...")
    try:
        response = requests.post(
            API_URL,
            json={"query": ""},
            timeout=10
        )
        
        if response.status_code == 400:
            print("✅ Correctly rejected empty query:", response.json())
            return True
        else:
            print(f"❌ Expected 400 status code, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error testing invalid query: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("="*80)
    print("🧪 AI WEB SEARCH API - AUTOMATED TEST SUITE")
    print("="*80)
    
    results = []
    
    # Test 1: Health Check
    print_separator()
    print("TEST 1: Health Check")
    print_separator()
    results.append(("Health Check", test_health_check()))
    
    time.sleep(1)
    
    # Test 2: Invalid Query
    print_separator()
    print("TEST 2: Invalid Query Handling")
    print_separator()
    results.append(("Invalid Query", test_invalid_query()))
    
    time.sleep(1)
    
    # Test 3: Main Search
    print_separator()
    print("TEST 3: Main Search Query")
    print_separator()
    results.append(("Main Search", test_search(TEST_QUERY)))
    
    # Summary
    print_separator()
    print("📊 TEST SUMMARY")
    print_separator()
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print_separator()
    
    return passed == total

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
