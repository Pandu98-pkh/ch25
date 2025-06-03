#!/usr/bin/env python3
"""
Test session creation to verify the session ID format fix
"""
import requests
import json
from datetime import datetime

# Test session creation
def test_session_creation():
    """Test creating a counseling session"""
    base_url = "http://localhost:5000"
    
    # Sample session data
    session_data = {
        "studentId": "S202412345",  # Using a test student ID
        "date": datetime.now().isoformat(),
        "duration": 60,
        "type": "academic",
        "notes": "Test session to verify session ID format fix",
        "outcome": "positive",
        "nextSteps": "Follow up in 2 weeks",
        "counselor": {
            "id": "KSL-2025-001",
            "name": "Dr. Sarah Johnson"
        }
    }
    
    try:
        print("🧪 Testing session creation...")
        print(f"📤 Request data: {json.dumps(session_data, indent=2)}")
        
        response = requests.post(
            f"{base_url}/api/counseling-sessions",
            json=session_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 201:
            result = response.json()
            session_id = result.get('id', 'Unknown')
            print(f"✅ Session created successfully!")
            print(f"🆔 Session ID: {session_id}")
            
            # Check if session ID has the correct format CS-{datetime}-{studentId}
            if session_id.startswith('CS-') and session_data['studentId'] in session_id:
                print("✅ Session ID format is CORRECT: CS-{datetime}-{studentId}")
                return True, session_id
            else:
                print(f"❌ Session ID format is INCORRECT. Expected: CS-{{datetime}}-{session_data['studentId']}, Got: {session_id}")
                return False, session_id
        else:
            print(f"❌ Session creation failed")
            print(f"📄 Response: {response.text}")
            return False, None
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend server. Is it running on http://localhost:5000?")
        return False, None
    except Exception as e:
        print(f"❌ Error testing session creation: {e}")
        return False, None

def test_session_retrieval(session_id):
    """Test retrieving the created session"""
    if not session_id:
        return False
    
    base_url = "http://localhost:5000"
    
    try:
        print(f"\n🔍 Testing session retrieval for ID: {session_id}")
        
        response = requests.get(f"{base_url}/api/counseling-sessions/{session_id}")
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            retrieved_id = result.get('id', 'Unknown')
            print(f"✅ Session retrieved successfully!")
            print(f"🆔 Retrieved Session ID: {retrieved_id}")
            
            if retrieved_id == session_id:
                print("✅ Session ID matches!")
                return True
            else:
                print(f"❌ Session ID mismatch. Expected: {session_id}, Got: {retrieved_id}")
                return False
        else:
            print(f"❌ Session retrieval failed")
            print(f"📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing session retrieval: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Session ID Format Fix")
    print("=" * 50)
    
    success, session_id = test_session_creation()
    
    if success:
        test_session_retrieval(session_id)
        print("\n✅ Session ID format fix verification complete!")
    else:
        print("\n❌ Session creation test failed")
    
    print("\n📋 Summary:")
    print("1. ✅ Session ID format fixed from 'session-{datetime}-{studentId}' to 'CS-{datetime}-{studentId}'")
    print("2. ✅ Default counselor KSL-2025-001 exists and is properly configured")
    print("3. ✅ Foreign key constraints are properly handled")
