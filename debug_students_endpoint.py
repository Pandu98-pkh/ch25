#!/usr/bin/env python3
import requests

API_BASE = "http://localhost:5000"

try:
    print("Testing students endpoint...")
    response = requests.get(f"{API_BASE}/api/students")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
