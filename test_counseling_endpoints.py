#!/usr/bin/env python3
"""
Test script for counseling sessions endpoints
Tests the full CRUD functionality for counseling sessions
"""

import requests
import json
import sys
from datetime import datetime, timedelta

# API base URL
BASE_URL = "http://localhost:5000/api"

def test_connection():
    """Test if the API server is running"""
    try:
        response = requests.get(f"{BASE_URL}/../health", timeout=5)
        if response.status_code == 200:
            print("✅ API server is running")
            return True
        else:
            print(f"❌ API server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to API server: {e}")
        return False

def test_get_sessions():
    """Test GET /api/counseling-sessions"""
    print("\n🔍 Testing GET /api/counseling-sessions")
    
    try:
        response = requests.get(f"{BASE_URL}/counseling-sessions")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully retrieved sessions")
            print(f"Total sessions: {data.get('count', 0)}")
            print(f"Sessions returned: {len(data.get('results', []))}")
            
            # Print first session if available
            if data.get('results'):
                first_session = data['results'][0]
                print(f"First session ID: {first_session.get('id')}")
                print(f"Student ID: {first_session.get('studentId')}")
                print(f"Type: {first_session.get('type')}")
            
            return data.get('results', [])
        else:
            print(f"❌ Failed: {response.text}")
            return []
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return []

def test_create_session():
    """Test POST /api/counseling-sessions"""
    print("\n📝 Testing POST /api/counseling-sessions")
    
    # Create test session data
    session_data = {
        "studentId": "S123456",  # Use existing student ID
        "date": (datetime.now() + timedelta(days=1)).isoformat(),
        "duration": 60,
        "type": "academic",
        "notes": "Test session for API testing - discussing study strategies and academic goals",
        "outcome": "positive",
        "nextSteps": "Follow up in 1 week to check progress on study plan",
        "counselor": {
            "id": "KSL-2025-001",
            "name": "Test Counselor"
        }
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/counseling-sessions",
            json=session_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 201:
            created_session = response.json()
            print("✅ Successfully created session")
            print(f"Session ID: {created_session.get('id')}")
            print(f"Student: {created_session.get('student', {}).get('name', 'Unknown')}")
            print(f"Type: {created_session.get('type')}")
            return created_session
        else:
            print(f"❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_get_session_by_id(session_id):
    """Test GET /api/counseling-sessions/{id}"""
    print(f"\n🔍 Testing GET /api/counseling-sessions/{session_id}")
    
    try:
        response = requests.get(f"{BASE_URL}/counseling-sessions/{session_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session = response.json()
            print("✅ Successfully retrieved session")
            print(f"Session ID: {session.get('id')}")
            print(f"Notes: {session.get('notes', '')[:50]}...")
            return session
        else:
            print(f"❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_update_session(session_id):
    """Test PUT /api/counseling-sessions/{id}"""
    print(f"\n✏️ Testing PUT /api/counseling-sessions/{session_id}")
    
    update_data = {
        "notes": "Updated test session - discussed additional academic strategies and time management",
        "outcome": "positive",
        "nextSteps": "Updated next steps: Follow up in 2 weeks with detailed progress report"
    }
    
    try:
        response = requests.put(
            f"{BASE_URL}/counseling-sessions/{session_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            updated_session = response.json()
            print("✅ Successfully updated session")
            print(f"Updated notes: {updated_session.get('notes', '')[:50]}...")
            print(f"Updated next steps: {updated_session.get('nextSteps', '')[:50]}...")
            return updated_session
        else:
            print(f"❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_get_analytics():
    """Test GET /api/counseling-sessions/analytics"""
    print("\n📊 Testing GET /api/counseling-sessions/analytics")
    
    try:
        response = requests.get(f"{BASE_URL}/counseling-sessions/analytics")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            analytics = response.json()
            print("✅ Successfully retrieved analytics")
            print(f"Total sessions: {analytics.get('totalSessions', 0)}")
            print(f"Sessions by type: {analytics.get('sessionsByType', {})}")
            print(f"Sessions by outcome: {analytics.get('sessionsByOutcome', {})}")
            print(f"Average duration: {analytics.get('averageDuration', 0)} minutes")
            return analytics
        else:
            print(f"❌ Failed: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_delete_session(session_id):
    """Test DELETE /api/counseling-sessions/{id}"""
    print(f"\n🗑️ Testing DELETE /api/counseling-sessions/{session_id}")
    
    try:
        response = requests.delete(f"{BASE_URL}/counseling-sessions/{session_id}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Successfully deleted session")
            print(f"Message: {result.get('message', '')}")
            return True
        else:
            print(f"❌ Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_filtered_sessions():
    """Test GET /api/counseling-sessions with filters"""
    print("\n🔍 Testing GET /api/counseling-sessions with filters")
    
    # Test with student filter
    try:
        response = requests.get(f"{BASE_URL}/counseling-sessions?student=S123456")
        print(f"Status Code (student filter): {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully filtered by student")
            print(f"Sessions for student S123456: {len(data.get('results', []))}")
        
        # Test with type filter
        response = requests.get(f"{BASE_URL}/counseling-sessions?type=academic")
        print(f"Status Code (type filter): {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Successfully filtered by type")
            print(f"Academic sessions: {len(data.get('results', []))}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """Run all tests"""
    print("🚀 Starting Counseling Sessions API Tests")
    print("=" * 50)
    
    # Test connection first
    if not test_connection():
        print("❌ Cannot proceed - API server is not accessible")
        sys.exit(1)
    
    # Test GET all sessions
    existing_sessions = test_get_sessions()
    
    # Test analytics
    test_get_analytics()
    
    # Test filtered sessions
    test_filtered_sessions()
    
    # Test CREATE
    created_session = test_create_session()
    
    if created_session:
        session_id = created_session.get('id')
        
        # Test GET by ID
        test_get_session_by_id(session_id)
        
        # Test UPDATE
        test_update_session(session_id)
        
        # Test analytics again to see changes
        print("\n📊 Testing analytics after adding session")
        test_get_analytics()
        
        # Test DELETE
        test_delete_session(session_id)
        
        # Verify deletion
        print(f"\n🔍 Verifying deletion of session {session_id}")
        response = requests.get(f"{BASE_URL}/counseling-sessions/{session_id}")
        if response.status_code == 404:
            print("✅ Session successfully deleted (404 as expected)")
        else:
            print(f"❌ Session still exists: {response.status_code}")
    
    print("\n" + "=" * 50)
    print("🏁 Testing completed!")

if __name__ == "__main__":
    main()
