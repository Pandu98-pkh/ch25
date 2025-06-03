#!/usr/bin/env python3
"""
Debug Career Connection - Check Backend dan Database Status
"""

import requests
import json

API_BASE = 'http://localhost:5000/api'

def check_backend_status():
    """Check if backend is running"""
    print("=== CHECKING BACKEND STATUS ===")
    try:
        # Test the actual API endpoint instead of root
        response = requests.get(f"{API_BASE}/career-assessments")
        if response.status_code == 200:
            print("✅ Backend server is running on port 5000")
            print("✅ Career API endpoints accessible")
            return True
        else:
            print(f"❌ Backend API responded with status: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend server is NOT running - tidak dapat terhubung ke port 5000")
        return False
    except Exception as e:
        print(f"❌ Error checking backend: {e}")
        return False

def check_career_assessments():
    """Check career assessments endpoint"""
    print("\n=== CHECKING CAREER ASSESSMENTS ===")
    try:
        response = requests.get(f"{API_BASE}/career-assessments")
        if response.status_code == 200:
            data = response.json()
            total_count = data.get('totalCount', 0)
            assessments = data.get('data', [])
            
            print(f"✅ Career assessments endpoint working")
            print(f"📊 Total assessments in database: {total_count}")
            
            if assessments:
                print("\n📝 Sample assessment data:")
                sample = assessments[0]
                print(f"   ID: {sample.get('id')}")
                print(f"   Student ID: {sample.get('studentId')}")
                print(f"   Type: {sample.get('type')}")
                print(f"   Date: {sample.get('date')}")
                print(f"   Student Name: {sample.get('studentName', 'N/A')}")
            else:
                print("⚠️  No assessments found in database")
            
            return True
        else:
            print(f"❌ Career assessments endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error checking career assessments: {e}")
        return False

def check_career_resources():
    """Check career resources endpoint"""
    print("\n=== CHECKING CAREER RESOURCES ===")
    try:
        response = requests.get(f"{API_BASE}/career-resources")
        if response.status_code == 200:
            data = response.json()
            total_count = data.get('totalCount', 0)
            resources = data.get('results', [])
            
            print(f"✅ Career resources endpoint working")
            print(f"📊 Total resources in database: {total_count}")
            
            if resources:
                print("\n📚 Sample resource data:")
                sample = resources[0]
                print(f"   ID: {sample.get('id')}")
                print(f"   Title: {sample.get('title')}")
                print(f"   Type: {sample.get('type')}")
                print(f"   Tags: {sample.get('tags', [])}")
            else:
                print("⚠️  No resources found in database")
            
            return True
        else:
            print(f"❌ Career resources endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error checking career resources: {e}")
        return False

def test_create_assessment():
    """Test creating a new assessment"""
    print("\n=== TESTING CREATE ASSESSMENT ===")
    try:
        test_assessment = {
            "studentId": "1103220016",
            "type": "riasec", 
            "interests": ["Investigative", "Realistic"],
            "skills": ["problem_solving", "analytical"],
            "values": ["achievement", "independence"],
            "recommendedPaths": ["Engineering", "Computer Science"],
            "notes": "Debug test assessment",
            "results": {
                "realistic": 85,
                "investigative": 90,
                "artistic": 45,
                "social": 60,
                "enterprising": 55,
                "conventional": 70
            }
        }
        
        response = requests.post(f"{API_BASE}/career-assessments", 
                               json=test_assessment,
                               headers={'Content-Type': 'application/json'})
        
        if response.status_code == 201:
            created = response.json()
            print(f"✅ CREATE assessment successful")
            print(f"   Created ID: {created.get('id')}")
            
            # Clean up - delete the test assessment
            delete_response = requests.delete(f"{API_BASE}/career-assessments/{created.get('id')}")
            if delete_response.status_code == 200:
                print("✅ Test assessment cleaned up successfully")
            
            return True
        else:
            print(f"❌ CREATE assessment failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error testing create assessment: {e}")
        return False

def main():
    """Run all debug checks"""
    print("🔍 DEBUGGING CAREER DATABASE CONNECTION")
    print("=" * 50)
    
    backend_ok = check_backend_status()
    if not backend_ok:
        print("\n❌ BACKEND NOT RUNNING - Start backend server first!")
        print("   Run: cd backend && python app.py")
        return
    
    assessments_ok = check_career_assessments()
    resources_ok = check_career_resources()
    create_ok = test_create_assessment()
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY")
    print("=" * 50)
    print(f"Backend Server:      {'✅ OK' if backend_ok else '❌ FAILED'}")
    print(f"Career Assessments:  {'✅ OK' if assessments_ok else '❌ FAILED'}")
    print(f"Career Resources:    {'✅ OK' if resources_ok else '❌ FAILED'}")
    print(f"Create Test:         {'✅ OK' if create_ok else '❌ FAILED'}")
    
    if all([backend_ok, assessments_ok, resources_ok, create_ok]):
        print("\n🎉 ALL CHECKS PASSED - Backend database integration is working!")
        print("💡 If frontend still shows mock data, the issue is in careerService.ts error handling")
    else:
        print("\n🚨 SOME CHECKS FAILED - Fix backend/database issues first")

if __name__ == '__main__':
    main()
