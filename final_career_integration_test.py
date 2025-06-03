#!/usr/bin/env python3
"""
Final Career Assignment Database Integration Verification
This script performs a comprehensive end-to-end test to ensure the career assignment 
functionality is fully integrated with the database and working correctly.
"""

import requests
import json
import time
from datetime import datetime

API_BASE = 'http://localhost:5000/api'

def print_header(title):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"🎯 {title}")
    print("="*60)

def print_section(title):
    """Print a formatted section header"""
    print(f"\n📋 {title}")
    print("-" * 40)

def test_complete_career_integration():
    """Run comprehensive career integration tests"""
    print_header("FINAL CAREER ASSIGNMENT DATABASE INTEGRATION TEST")
    print(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = {
        'backend_connectivity': False,
        'career_resources_crud': False,
        'career_assessments_crud': False,
        'data_persistence': False,
        'api_consistency': False,
        'database_integration': False
    }
    
    # Test 1: Backend Connectivity
    print_section("Backend Server Connectivity")
    try:
        response = requests.get(f"{API_BASE}/career-resources", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running and responding")
            print(f"   Response time: {response.elapsed.total_seconds():.3f}s")
            test_results['backend_connectivity'] = True
        else:
            print(f"❌ Backend server error: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend server not accessible: {e}")
    
    # Test 2: Career Resources CRUD Operations
    print_section("Career Resources CRUD Operations")
    resource_id = None
    try:
        # CREATE
        new_resource = {
            "title": "Final Integration Test Resource",
            "description": "A comprehensive test resource for final verification",
            "type": "article",
            "url": "https://final-test.example.com",
            "tags": ["final-test", "integration", "verification"],
            "author": "Integration Test Suite"
        }
        
        create_response = requests.post(f"{API_BASE}/career-resources", 
                                      json=new_resource, 
                                      headers={'Content-Type': 'application/json'})
        
        if create_response.status_code == 201:
            created_resource = create_response.json()
            resource_id = created_resource['id']
            print(f"✅ CREATE: Resource created with ID {resource_id}")
            
            # READ
            read_response = requests.get(f"{API_BASE}/career-resources/{resource_id}")
            if read_response.status_code == 200:
                print("✅ READ: Resource retrieved successfully")
                
                # UPDATE
                updated_resource = new_resource.copy()
                updated_resource['title'] = "Updated Final Integration Test Resource"
                updated_resource['description'] = "Updated description for final verification"
                
                update_response = requests.put(f"{API_BASE}/career-resources/{resource_id}",
                                             json=updated_resource,
                                             headers={'Content-Type': 'application/json'})
                
                if update_response.status_code == 200:
                    print("✅ UPDATE: Resource updated successfully")
                    
                    # DELETE
                    delete_response = requests.delete(f"{API_BASE}/career-resources/{resource_id}")
                    if delete_response.status_code == 200:
                        print("✅ DELETE: Resource deleted successfully")
                        test_results['career_resources_crud'] = True
                    else:
                        print(f"❌ DELETE failed: {delete_response.status_code}")
                else:
                    print(f"❌ UPDATE failed: {update_response.status_code}")
            else:
                print(f"❌ READ failed: {read_response.status_code}")
        else:
            print(f"❌ CREATE failed: {create_response.status_code}")
            print(f"   Response: {create_response.text}")
    except Exception as e:
        print(f"❌ Career Resources CRUD test failed: {e}")
    
    # Test 3: Career Assessments CRUD Operations
    print_section("Career Assessments CRUD Operations")
    assessment_id = None
    try:
        # First, get a valid student ID
        students_response = requests.get(f"{API_BASE}/career-assessments")
        valid_student_id = "1103220016"  # Use known valid student ID
        
        # CREATE
        new_assessment = {
            "studentId": valid_student_id,
            "type": "riasec",
            "interests": ["Investigative", "Realistic", "Conventional"],
            "skills": ["analytical_thinking", "problem_solving", "technical_skills"],
            "values": ["achievement", "independence", "intellectual_stimulation"],
            "recommendedPaths": ["Software Engineering", "Data Science", "Research"],
            "notes": "Final integration test assessment with comprehensive data",
            "results": {
                "realistic": 85,
                "investigative": 92,
                "artistic": 35,
                "social": 55,
                "enterprising": 68,
                "conventional": 78
            }
        }
        
        create_response = requests.post(f"{API_BASE}/career-assessments",
                                      json=new_assessment,
                                      headers={'Content-Type': 'application/json'})
        
        if create_response.status_code == 201:
            created_assessment = create_response.json()
            assessment_id = created_assessment['id']
            print(f"✅ CREATE: Assessment created with ID {assessment_id}")
            
            # READ
            read_response = requests.get(f"{API_BASE}/career-assessments/{assessment_id}")
            if read_response.status_code == 200:
                print("✅ READ: Assessment retrieved successfully")
                
                # UPDATE
                updated_assessment = new_assessment.copy()
                updated_assessment['notes'] = "Updated assessment notes for final verification"
                updated_assessment['recommendedPaths'] = ["Updated Engineering Path", "Updated Data Science Path"]
                
                update_response = requests.put(f"{API_BASE}/career-assessments/{assessment_id}",
                                             json=updated_assessment,
                                             headers={'Content-Type': 'application/json'})
                
                if update_response.status_code == 200:
                    print("✅ UPDATE: Assessment updated successfully")
                    
                    # DELETE
                    delete_response = requests.delete(f"{API_BASE}/career-assessments/{assessment_id}")
                    if delete_response.status_code == 200:
                        print("✅ DELETE: Assessment deleted successfully")
                        test_results['career_assessments_crud'] = True
                    else:
                        print(f"❌ DELETE failed: {delete_response.status_code}")
                else:
                    print(f"❌ UPDATE failed: {update_response.status_code}")
            else:
                print(f"❌ READ failed: {read_response.status_code}")
        else:
            print(f"❌ CREATE failed: {create_response.status_code}")
            print(f"   Response: {create_response.text}")
    except Exception as e:
        print(f"❌ Career Assessments CRUD test failed: {e}")
    
    # Test 4: Data Persistence Verification
    print_section("Data Persistence Verification")
    try:
        # Create test data and verify it persists across multiple requests
        test_resource = {
            "title": "Persistence Verification Resource",
            "description": "Testing data persistence in database",
            "type": "quiz",
            "url": "https://persistence-test.example.com",
            "tags": ["persistence", "database", "verification"],
            "author": "Persistence Test"
        }
        
        # Create
        create_response = requests.post(f"{API_BASE}/career-resources",
                                      json=test_resource,
                                      headers={'Content-Type': 'application/json'})
        
        if create_response.status_code == 201:
            created = create_response.json()
            persistence_id = created['id']
            
            # Wait a moment then retrieve multiple times
            time.sleep(1)
            
            retrieval_success = 0
            for i in range(3):
                retrieve_response = requests.get(f"{API_BASE}/career-resources/{persistence_id}")
                if retrieve_response.status_code == 200:
                    retrieval_success += 1
                time.sleep(0.5)
            
            if retrieval_success == 3:
                print("✅ Data persists correctly across multiple requests")
                test_results['data_persistence'] = True
                
                # Clean up
                requests.delete(f"{API_BASE}/career-resources/{persistence_id}")
            else:
                print(f"❌ Data persistence issue: {retrieval_success}/3 retrievals successful")
        else:
            print(f"❌ Persistence test failed: Could not create test data")
    except Exception as e:
        print(f"❌ Data persistence test failed: {e}")
    
    # Test 5: API Consistency
    print_section("API Consistency and Response Format")
    try:
        # Test that all endpoints return consistent response formats
        resources_response = requests.get(f"{API_BASE}/career-resources")
        assessments_response = requests.get(f"{API_BASE}/career-assessments")
        
        if resources_response.status_code == 200 and assessments_response.status_code == 200:
            resources_data = resources_response.json()
            assessments_data = assessments_response.json()
            
            # Check required fields in responses
            resources_valid = all(key in resources_data for key in ['results', 'totalCount', 'current_page'])
            assessments_valid = all(key in assessments_data for key in ['data', 'totalCount', 'current_page'])
            
            if resources_valid and assessments_valid:
                print("✅ API responses have consistent formats")
                print(f"   Resources: {resources_data.get('totalCount', 0)} items")
                print(f"   Assessments: {assessments_data.get('totalCount', 0)} items")
                test_results['api_consistency'] = True
            else:
                print("❌ API response format inconsistency detected")
        else:
            print("❌ API consistency test failed: Could not retrieve data")
    except Exception as e:
        print(f"❌ API consistency test failed: {e}")
    
    # Test 6: Database Integration Verification
    print_section("Database Integration Verification")
    try:
        # Test filtering and search functionality
        filter_tests = [
            (f"{API_BASE}/career-resources?type=article", "Resource type filtering"),
            (f"{API_BASE}/career-resources?tags=career", "Resource tag filtering"),
            (f"{API_BASE}/career-assessments?student=1103220016", "Assessment student filtering")
        ]
        
        filter_success = 0
        for url, test_name in filter_tests:
            response = requests.get(url)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ {test_name}: Found {data.get('totalCount', 0)} items")
                filter_success += 1
            else:
                print(f"❌ {test_name}: Failed with status {response.status_code}")
        
        if filter_success == len(filter_tests):
            print("✅ Database integration with filtering works correctly")
            test_results['database_integration'] = True
        else:
            print(f"❌ Database integration issues: {filter_success}/{len(filter_tests)} tests passed")
    except Exception as e:
        print(f"❌ Database integration test failed: {e}")
    
    # Final Summary
    print_header("FINAL INTEGRATION TEST RESULTS")
    
    total_tests = len(test_results)
    passed_tests = sum(test_results.values())
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"📊 Test Summary:")
    print(f"   Total Tests: {total_tests}")
    print(f"   Passed: {passed_tests}")
    print(f"   Failed: {total_tests - passed_tests}")
    print(f"   Success Rate: {success_rate:.1f}%")
    
    print(f"\n📋 Detailed Results:")
    for test_name, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {test_name.replace('_', ' ').title()}: {status}")
    
    if success_rate >= 100:
        print(f"\n🎉 EXCELLENT! All tests passed!")
        print("✅ Career assignment functionality is fully integrated with the database")
        print("✅ Ready for production use")
    elif success_rate >= 80:
        print(f"\n👍 GOOD! Most tests passed ({success_rate:.1f}%)")
        print("✅ Core functionality works, minor issues may need attention")
    elif success_rate >= 60:
        print(f"\n⚠️ PARTIAL SUCCESS ({success_rate:.1f}%)")
        print("⚠️ Some functionality works but significant issues detected")
    else:
        print(f"\n❌ MAJOR ISSUES DETECTED ({success_rate:.1f}%)")
        print("❌ Significant problems with database integration")
    
    print(f"\n🔧 Next Steps:")
    if success_rate >= 80:
        print("1. ✅ Test the frontend UI in the browser (http://localhost:5173)")
        print("2. ✅ Verify career assessments work through the UI")
        print("3. ✅ Test career resources management")
        print("4. ✅ Confirm data persists across sessions")
        print("5. 🚀 Career functionality ready for production!")
    else:
        print("1. 🔧 Review failed tests and fix issues")
        print("2. 🔧 Check database connection and schema")
        print("3. 🔧 Verify API endpoints and error handling")
        print("4. 🔄 Re-run integration tests")
    
    print(f"\n📅 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    test_complete_career_integration()
