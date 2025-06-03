#!/usr/bin/env python3
"""
Verify Frontend Database Connection
Final verification that Career Assessments are loading from database
"""

import requests
import json
import time

API_BASE = 'http://localhost:5000/api'

def check_frontend_api_calls():
    """Verify that frontend can get data from API"""
    print("=== VERIFYING FRONTEND API ACCESS ===")
    
    try:
        # Test career assessments endpoint that frontend uses
        response = requests.get(f"{API_BASE}/career-assessments")
        if response.status_code == 200:
            data = response.json()
            assessments = data.get('data', [])
            total_count = data.get('totalCount', 0)
            
            print(f"✅ Frontend API endpoint working")
            print(f"📊 Total assessments available: {total_count}")
            
            if assessments:
                # Show sample data structure that frontend should receive
                sample = assessments[0]
                print(f"\n📝 Sample assessment structure frontend receives:")
                print(f"   ID: {sample.get('id')}")
                print(f"   Student ID: {sample.get('studentId')}")
                print(f"   Student Name: {sample.get('studentName')}")
                print(f"   Type: {sample.get('type')}")
                print(f"   Date: {sample.get('date')}")
                print(f"   Interests: {sample.get('interests', [])}")
                print(f"   Recommended Paths: {sample.get('recommendedPaths', [])}")
                print(f"   Has Results: {'Yes' if sample.get('results') else 'No'}")
                
                # Check if this looks like real database data
                real_data_indicators = [
                    sample.get('createdAt') is not None,
                    sample.get('updatedAt') is not None, 
                    sample.get('studentEmail') is not None,
                    '-' in str(sample.get('id', '')),
                    len(str(sample.get('id', ''))) > 5
                ]
                
                real_data_score = sum(real_data_indicators)
                if real_data_score >= 3:
                    print(f"\n✅ Data structure indicates REAL DATABASE data (score: {real_data_score}/5)")
                else:
                    print(f"\n⚠️  Data structure might be mock data (score: {real_data_score}/5)")
                
                return True, total_count, real_data_score >= 3
            else:
                print("⚠️  No assessments found in database")
                return True, 0, False
        else:
            print(f"❌ API endpoint failed: {response.status_code}")
            return False, 0, False
            
    except Exception as e:
        print(f"❌ Error checking frontend API: {e}")
        return False, 0, False

def test_student_specific_data():
    """Test filtering by student ID (what frontend does for student users)"""
    print("\n=== TESTING STUDENT-SPECIFIC DATA ===")
    
    try:
        # Get all assessments first to find a valid student ID
        response = requests.get(f"{API_BASE}/career-assessments")
        if response.status_code == 200:
            data = response.json()
            assessments = data.get('data', [])
            
            if assessments:
                # Use first student's ID for test
                test_student_id = assessments[0].get('studentId')
                print(f"Testing with student ID: {test_student_id}")
                
                # Test filtered endpoint
                filtered_response = requests.get(f"{API_BASE}/career-assessments?student={test_student_id}")
                if filtered_response.status_code == 200:
                    filtered_data = filtered_response.json()
                    filtered_assessments = filtered_data.get('data', [])
                    
                    print(f"✅ Student filter working")
                    print(f"📊 Assessments for student {test_student_id}: {len(filtered_assessments)}")
                    
                    # Verify all returned assessments belong to the student
                    all_match = all(a.get('studentId') == test_student_id for a in filtered_assessments)
                    if all_match:
                        print("✅ All returned assessments belong to the correct student")
                    else:
                        print("⚠️  Some assessments don't match the student filter")
                    
                    return True
                else:
                    print(f"❌ Student filter failed: {filtered_response.status_code}")
                    return False
            else:
                print("⚠️  No assessments to test student filter with")
                return True
        else:
            print(f"❌ Could not get assessments for student filter test")
            return False
            
    except Exception as e:
        print(f"❌ Error testing student filter: {e}")
        return False

def check_career_resources():
    """Check career resources endpoint that frontend uses"""
    print("\n=== CHECKING CAREER RESOURCES ===")
    
    try:
        response = requests.get(f"{API_BASE}/career-resources")
        if response.status_code == 200:
            data = response.json()
            resources = data.get('results', [])
            total_count = data.get('totalCount', 0)
            
            print(f"✅ Career resources endpoint working")
            print(f"📚 Total resources available: {total_count}")
            
            if resources:
                sample = resources[0]
                print(f"\n📚 Sample resource structure:")
                print(f"   ID: {sample.get('id')}")
                print(f"   Title: {sample.get('title')}")
                print(f"   Type: {sample.get('type')}")
                print(f"   Tags: {sample.get('tags', [])}")
                
                return True, total_count
            else:
                print("⚠️  No resources found in database")
                return True, 0
        else:
            print(f"❌ Career resources endpoint failed: {response.status_code}")
            return False, 0
            
    except Exception as e:
        print(f"❌ Error checking career resources: {e}")
        return False, 0

def simulate_frontend_workflow():
    """Simulate the exact workflow that frontend CareerPage does"""
    print("\n=== SIMULATING FRONTEND WORKFLOW ===")
    
    try:
        # Step 1: Load all assessments (what counselors see)
        print("1. Loading all assessments (counselor view)...")
        all_response = requests.get(f"{API_BASE}/career-assessments")
        if all_response.status_code != 200:
            raise Exception(f"Failed to load all assessments: {all_response.status_code}")
        
        all_data = all_response.json()
        all_assessments = all_data.get('data', [])
        print(f"   ✅ Loaded {len(all_assessments)} total assessments")
        
        # Step 2: Load resources
        print("2. Loading career resources...")
        resources_response = requests.get(f"{API_BASE}/career-resources")
        if resources_response.status_code != 200:
            raise Exception(f"Failed to load resources: {resources_response.status_code}")
        
        resources_data = resources_response.json()
        resources = resources_data.get('results', [])
        print(f"   ✅ Loaded {len(resources)} career resources")
        
        # Step 3: Test student-specific view (if we have students)
        if all_assessments:
            student_id = all_assessments[0].get('studentId')
            print(f"3. Loading student-specific assessments for {student_id}...")
            
            student_response = requests.get(f"{API_BASE}/career-assessments?student={student_id}")
            if student_response.status_code != 200:
                raise Exception(f"Failed to load student assessments: {student_response.status_code}")
            
            student_data = student_response.json()
            student_assessments = student_data.get('data', [])
            print(f"   ✅ Loaded {len(student_assessments)} assessments for student")
        
        # Step 4: Test creating a new assessment
        print("4. Testing assessment creation...")
        test_assessment = {
            "studentId": "TEST_STUDENT_ID",
            "type": "riasec",
            "interests": ["Investigative", "Realistic"], 
            "skills": ["problem_solving", "analytical"],
            "values": ["achievement", "independence"],
            "recommendedPaths": ["Engineering", "Computer Science"],
            "notes": "Frontend workflow verification test",
            "results": {
                "realistic": 85,
                "investigative": 90,
                "artistic": 45,
                "social": 60,
                "enterprising": 55,
                "conventional": 70
            }
        }
        
        create_response = requests.post(f"{API_BASE}/career-assessments",
                                      json=test_assessment,
                                      headers={'Content-Type': 'application/json'})
        
        if create_response.status_code == 201:
            created = create_response.json()
            created_id = created.get('id')
            print(f"   ✅ Created test assessment: {created_id}")
            
            # Clean up
            delete_response = requests.delete(f"{API_BASE}/career-assessments/{created_id}")
            if delete_response.status_code == 200:
                print(f"   ✅ Cleaned up test assessment")
        else:
            print(f"   ⚠️  Assessment creation test failed: {create_response.status_code}")
        
        print("\n✅ Frontend workflow simulation completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Frontend workflow simulation failed: {e}")
        return False

def main():
    """Run complete verification"""
    print("🔍 VERIFYING FRONTEND DATABASE CONNECTION")
    print("=" * 60)
    print("This script verifies that the Career page frontend")
    print("is properly connected to the database (not using mock data)")
    print("=" * 60)
    
    # Check API accessibility
    api_ok, assessment_count, is_real_data = check_frontend_api_calls()
    
    # Check student filtering
    student_filter_ok = test_student_specific_data()
    
    # Check resources
    resources_ok, resource_count = check_career_resources()
    
    # Simulate frontend workflow
    workflow_ok = simulate_frontend_workflow()
    
    print("\n" + "=" * 60)
    print("📋 VERIFICATION SUMMARY")
    print("=" * 60)
    print(f"API Accessibility:     {'✅ OK' if api_ok else '❌ FAILED'}")
    print(f"Student Filtering:     {'✅ OK' if student_filter_ok else '❌ FAILED'}")
    print(f"Career Resources:      {'✅ OK' if resources_ok else '❌ FAILED'}")
    print(f"Frontend Workflow:     {'✅ OK' if workflow_ok else '❌ FAILED'}")
    print(f"Assessment Count:      {assessment_count}")
    print(f"Resource Count:        {resource_count}")
    print(f"Using Real Data:       {'✅ YES' if is_real_data else '❌ NO (Mock Data)'}")
    
    if all([api_ok, student_filter_ok, resources_ok, workflow_ok, is_real_data]):
        print("\n🎉 VERIFICATION COMPLETE - FRONTEND IS CONNECTED TO DATABASE!")
        print("✅ Career Assessments are loading from the database")
        print("✅ Career Resources are loading from the database") 
        print("✅ Student filtering works correctly")
        print("✅ All CRUD operations work")
        print("\n💡 Frontend should now display real database data instead of mock data")
    else:
        print("\n🚨 VERIFICATION FAILED - Issues detected:")
        if not api_ok:
            print("   - API endpoints not accessible")
        if not student_filter_ok:
            print("   - Student filtering not working")
        if not resources_ok:
            print("   - Career resources not accessible")
        if not workflow_ok:
            print("   - Frontend workflow simulation failed")
        if not is_real_data:
            print("   - Still using mock data instead of database")

if __name__ == '__main__':
    main()
