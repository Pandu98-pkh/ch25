import requests
import json
from datetime import datetime

def test_session_creation_detailed():
    """Test session creation with detailed error reporting"""
    print("🔍 Detailed Session Creation Test")
    print("="*50)
    
    # Test data
    test_data = {
        "studentId": "S202412345",
        "date": datetime.now().isoformat(),
        "duration": 60,
        "type": "academic",
        "notes": "Test session for detailed debugging",
        "outcome": "positive",
        "nextSteps": "Follow up in 2 weeks",
        "counselor": {
            "id": "KSL-2025-001",
            "name": "Dr. Sarah Johnson"
        }
    }
    
    print("📤 Request data:")
    print(json.dumps(test_data, indent=2))
    print()
    
    try:
        # Try to create session
        response = requests.post(
            'http://localhost:5000/api/counseling-sessions',
            json=test_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📄 Response headers: {dict(response.headers)}")
        print(f"📄 Response text: {response.text}")
        
        if response.status_code == 201:
            result = response.json()
            print("✅ Session created successfully!")
            print(f"📋 Session ID: {result.get('id')}")
            print(f"📋 Student: {result.get('student', {}).get('name')}")
            print(f"📋 Counselor: {result.get('counselor', {}).get('name')}")
            
            # Verify session ID format
            session_id = result.get('id', '')
            if session_id.startswith('CS-'):
                print("✅ Session ID format is correct (starts with 'CS-')")
            else:
                print(f"❌ Session ID format is incorrect: {session_id}")
        else:
            print("❌ Session creation failed")
            try:
                error_detail = response.json()
                print(f"📄 Error detail: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"📄 Raw response: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - make sure the backend server is running on localhost:5000")
    except requests.exceptions.Timeout:
        print("❌ Request timeout")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_session_creation_detailed()
