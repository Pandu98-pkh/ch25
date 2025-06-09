#!/usr/bin/env python3
"""
Script untuk testing API melalui ngrok
"""

import requests
import json
import time

def get_ngrok_url():
    """Get active ngrok URL"""
    try:
        response = requests.get('http://localhost:4040/api/tunnels', timeout=5)
        if response.status_code == 200:
            data = response.json()
            tunnels = data.get('tunnels', [])
            
            for tunnel in tunnels:
                if tunnel.get('config', {}).get('addr') == 'http://localhost:5000':
                    public_url = tunnel.get('public_url')
                    if public_url and public_url.startswith('https://'):
                        return public_url
        return None
    except Exception as e:
        print(f"❌ Error getting ngrok URL: {e}")
        return None

def test_api_endpoint(base_url, endpoint, method='GET', data=None):
    """Test an API endpoint"""
    url = f"{base_url}{endpoint}"
    
    try:
        print(f"🧪 Testing {method} {endpoint}...")
        
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        
        if response.status_code in [200, 201]:
            response_data = response.json()
            if isinstance(response_data, dict):
                if 'data' in response_data:
                    count = len(response_data['data']) if isinstance(response_data['data'], list) else 1
                    print(f"   ✅ Success! Found {count} records")
                else:
                    print(f"   ✅ Success! Response: {json.dumps(response_data, indent=2)[:100]}...")
            else:
                print(f"   ✅ Success! Response length: {len(response_data) if isinstance(response_data, list) else 'N/A'}")
        else:
            print(f"   ❌ Failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Error: {response.text[:100]}...")
        
        return response.status_code in [200, 201]
        
    except requests.RequestException as e:
        print(f"   ❌ Request failed: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 CounselorHub - Ngrok API Tester")
    print("=" * 60)
    
    # Get ngrok URL
    ngrok_url = get_ngrok_url()
    if not ngrok_url:
        print("❌ Ngrok URL not found!")
        print("💡 Make sure ngrok is running with: ngrok http 5000")
        return
    
    print(f"🌐 Testing API at: {ngrok_url}")
    print("=" * 60)
    
    # Test endpoints
    api_base = f"{ngrok_url}/api"
    endpoints = [
        ('/health', 'GET'),
        ('/api/students', 'GET'),
        ('/api/classes', 'GET'),
        ('/api/users', 'GET'),
        ('/api/counselors', 'GET'),
        ('/api/counseling-sessions', 'GET'),
        ('/api/mental-health/assessments', 'GET'),
    ]
    
    # Test health endpoint (direct)
    test_api_endpoint(ngrok_url, '/health')
    
    # Test API endpoints
    for endpoint, method in endpoints[1:]:  # Skip health as it's already tested
        test_api_endpoint(ngrok_url, endpoint, method)
        time.sleep(0.5)  # Small delay between requests
    
    print("\n" + "=" * 60)
    print("📋 API Testing Complete!")
    print("=" * 60)
    print("🔗 Share these URLs for remote access:")
    print(f"   • API Base: {api_base}")
    print(f"   • Students: {api_base}/students")
    print(f"   • Classes: {api_base}/classes")
    print(f"   • Health Check: {ngrok_url}/health")
    print("=" * 60)

if __name__ == "__main__":
    main()
