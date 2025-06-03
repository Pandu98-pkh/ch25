#!/usr/bin/env python3
"""
Test script to verify session creation with correct session ID format
"""

import requests
import json
from datetime import datetime

# API endpoint
BASE_URL = "http://localhost:5000"
SESSION_URL = f"{BASE_URL}/api/counseling-sessions"

def test_session_creation():
    """Test creating a counseling session and verify the session ID format"""    # Test session data - matching frontend format with valid student ID
    session_data = {
        "studentId": "S20252048D",  # Using existing student ID
        "date": "2025-06-01T10:00:00Z",
        "duration": 45,
        "notes": "Test session to verify session ID format",
        "type": "academic",
        "outcome": "positive",
        "nextSteps": "Follow up next week",
        "counselor": {
            "id": "KSL-2025-001",
            "name": "Dr. Sarah Johnson"
        }
    }
    
    try:
        print("🧪 Testing session creation...")
        print(f"📤 Sending request to: {SESSION_URL}")
        print(f"📋 Session data: {json.dumps(session_data, indent=2)}")
        
        # Send POST request
        response = requests.post(
            SESSION_URL,
            json=session_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"\n📈 Response Status: {response.status_code}")
        print(f"📄 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 201:
            response_data = response.json()
            print(f"✅ Session created successfully!")
            print(f"📊 Response data: {json.dumps(response_data, indent=2)}")
            
            # Check session ID format
            session_id = response_data.get('session_id') or response_data.get('id')
            if session_id:
                print(f"\n🔍 Session ID: {session_id}")
                  # Check if format is CS-{date-time}-{student_id}
                if session_id.startswith('CS-') and 'S20252048D' in session_id:
                    print("✅ Session ID format is CORRECT! Format: CS-{date-time}-{student_id}")
                else:
                    print("❌ Session ID format is INCORRECT!")
                    print(f"   Expected format: CS-{{date-time}}-{{student_id}}")
                    print(f"   Actual format: {session_id}")
            else:
                print("❌ No session ID found in response")
                
        else:
            print(f"❌ Session creation failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"📄 Error response: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📄 Raw response: {response.text}")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    test_session_creation()
