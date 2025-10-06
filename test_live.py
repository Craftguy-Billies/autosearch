#!/usr/bin/env python3
"""
Quick test with a more common query
"""

import requests
import json

API_URL = "https://autosearch-lxltfmhky-ensemblejbs-projects.vercel.app/api/search"

# Test with a more established topic
query = "What is artificial intelligence?"

print(f"Testing with query: '{query}'")
print("⏳ Please wait...\n")

response = requests.post(API_URL, json={"query": query}, timeout=180)

if response.status_code == 200:
    data = response.json()
    print("✅ SUCCESS!\n")
    print(f"Query: {data['query']}\n")
    print(f"Answer:\n{data['answer']}\n")
    print(f"\nSources ({len(data['sources'])}):")
    for i, source in enumerate(data['sources'], 1):
        print(f"  {i}. {source['title']}")
        print(f"     {source['url']}")
    print(f"\nProcessing Time: {data['processingTime']}")
else:
    print(f"❌ Error: {response.status_code}")
    print(response.text)
