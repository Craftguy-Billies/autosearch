#!/usr/bin/env python3
"""
Debug script to test search functionality step by step
"""

import requests
import json

API_URL = "https://323b2ed7-b05f-4f72-a1cf-100a54adc7a3-00-ijp4vpyqd8ks.pike.replit.dev/api/search"

# Test with simple query
query = "Python programming"

print(f"🔍 Testing with query: '{query}'")
print("⏳ Please wait...\n")

try:
    response = requests.post(API_URL, json={"query": query}, timeout=180)
    
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ SUCCESS!\n")
        print(f"Query: {data['query']}")
        print(f"Answer: {data['answer'][:200]}...")
        print(f"\nSources: {len(data['sources'])} found")
        for i, source in enumerate(data['sources'][:3], 1):
            print(f"  {i}. {source['title'][:50]}...")
        print(f"\nProcessing Time: {data['processingTime']}")
    else:
        print(f"❌ Error Response:")
        print(response.text)
        
except requests.exceptions.Timeout:
    print("❌ Request timed out (180 seconds)")
except Exception as e:
    print(f"❌ Error: {e}")
