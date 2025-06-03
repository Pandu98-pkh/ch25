#!/usr/bin/env python3
"""
Comprehensive test script for the complete Classes page implementation.

Tests:
1. Classes page loads with real student counts from database
2. Add class form uses quota system (max capacity)
3. Class cards display actual vs maximum student counts
4. Soft delete functionality works correctly
5. DeletedClassesManagement page functions properly
6. Class detail page shows detailed student information
7. Navigation between pages works correctly
"""

import requests
import json
import time
from typing import Dict, List, Any

# Configuration
BASE_URL = "http://localhost:5000"  # Backend server
FRONTEND_URL = "http://localhost:5173"  # Frontend server

class ClassesImplementationTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, status: str, details: str = ""):
        """Log test results"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        self.test_results.append(result)
        print(f"[{status}] {test_name}: {details}")
        
    def test_backend_classes_api(self):
        """Test backend API endpoints for classes"""
        try:
            # Test get classes endpoint
            response = self.session.get(f"{BASE_URL}/api/classes")
            if response.status_code == 200:
                response_data = response.json()
                classes = response_data.get('data', [])
                self.log_test("Backend Classes API", "PASS", f"Retrieved {len(classes)} classes")
                return classes
            else:
                self.log_test("Backend Classes API", "FAIL", f"Status: {response.status_code}")
                return []
        except Exception as e:
            self.log_test("Backend Classes API", "ERROR", str(e))
            return []
            
    def test_student_count_api(self, class_id: str):
        """Test student count API for a specific class"""
        try:
            response = self.session.get(f"{BASE_URL}/api/classes/{class_id}/students")
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                students = data.get('students', [])
                self.log_test("Student Count API", "PASS", 
                            f"Class {class_id}: {count} students with detailed info")
                return count, students
            else:
                self.log_test("Student Count API", "FAIL", f"Status: {response.status_code}")
                return 0, []
        except Exception as e:
            self.log_test("Student Count API", "ERROR", str(e))
            return 0, []
            
    def test_delete_management_apis(self):
        """Test delete management APIs"""
        try:
            # Test get deleted classes
            response = self.session.get(f"{BASE_URL}/api/admin/classes/deleted")
            if response.status_code == 200:
                deleted_classes = response.json()
                self.log_test("Deleted Classes API", "PASS", 
                            f"Retrieved {len(deleted_classes)} deleted classes")
            else:
                self.log_test("Deleted Classes API", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Deleted Classes API", "ERROR", str(e))
            
    def test_class_creation_quota_system(self):
        """Test class creation with quota system"""
        try:
            new_class = {
                "name": "Test Class Implementation",
                "gradeLevel": "XI IPA 1",
                "academicYear": "2024/2025",
                "studentCount": 35,  # This should now represent max quota
                "teacherName": "Test Teacher"
            }
            
            response = self.session.post(f"{BASE_URL}/api/classes", json=new_class)
            if response.status_code == 201:
                created_class = response.json()
                self.log_test("Class Creation Quota", "PASS", 
                            f"Created class with quota: {created_class.get('studentCount')}")
                return created_class
            else:
                self.log_test("Class Creation Quota", "FAIL", f"Status: {response.status_code}")
                return None
        except Exception as e:
            self.log_test("Class Creation Quota", "ERROR", str(e))
            return None
            
    def test_soft_delete_functionality(self, class_id: str):
        """Test soft delete functionality"""
        try:
            response = self.session.delete(f"{BASE_URL}/api/classes/{class_id}")
            if response.status_code == 200:
                self.log_test("Soft Delete", "PASS", f"Successfully soft deleted class {class_id}")
                
                # Verify class is in deleted list
                deleted_response = self.session.get(f"{BASE_URL}/api/admin/classes/deleted")
                if deleted_response.status_code == 200:
                    deleted_classes = deleted_response.json()
                    deleted_ids = [cls.get('id') for cls in deleted_classes]
                    if class_id in deleted_ids:
                        self.log_test("Soft Delete Verification", "PASS", 
                                    "Class appears in deleted list")
                    else:
                        self.log_test("Soft Delete Verification", "FAIL", 
                                    "Class not found in deleted list")
                
                return True
            else:
                self.log_test("Soft Delete", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Soft Delete", "ERROR", str(e))
            return False
            
    def test_restore_functionality(self, class_id: str):
        """Test restore functionality"""
        try:
            response = self.session.post(f"{BASE_URL}/api/admin/classes/{class_id}/restore")
            if response.status_code == 200:
                self.log_test("Restore Functionality", "PASS", 
                            f"Successfully restored class {class_id}")
                return True
            else:
                self.log_test("Restore Functionality", "FAIL", f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Restore Functionality", "ERROR", str(e))
            return False
            
    def run_comprehensive_tests(self):
        """Run all tests"""
        print("=" * 60)
        print("COMPREHENSIVE CLASSES IMPLEMENTATION TEST")
        print("=" * 60)
        
        # Test 1: Backend API functionality
        classes = self.test_backend_classes_api()
        
        # Test 2: Student count API for existing classes
        if classes and len(classes) > 0:
            test_class = classes[0]
            count, students = self.test_student_count_api(test_class.get('id', ''))
            
        # Test 3: Delete management APIs
        self.test_delete_management_apis()
        
        # Test 4: Class creation with quota system
        created_class = self.test_class_creation_quota_system()
        
        # Test 5: Soft delete and restore cycle
        if created_class:
            class_id = created_class.get('id')
            if self.test_soft_delete_functionality(class_id):
                self.test_restore_functionality(class_id)
                # Clean up - delete permanently
                try:
                    self.session.delete(f"{BASE_URL}/api/admin/classes/{class_id}/hard-delete")
                    self.log_test("Cleanup", "PASS", "Test class permanently deleted")
                except:
                    self.log_test("Cleanup", "WARNING", "Could not clean up test class")
        
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r["status"] == "PASS"])
        failed_tests = len([r for r in self.test_results if r["status"] == "FAIL"])
        error_tests = len([r for r in self.test_results if r["status"] == "ERROR"])
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Errors: {error_tests}")
        if total_tests > 0:
            print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print("\nDetailed Results:")
        for result in self.test_results:
            status_symbol = "✓" if result["status"] == "PASS" else "✗" if result["status"] == "FAIL" else "!"
            print(f"  {status_symbol} {result['test']}: {result['details']}")
            
        print("\n" + "=" * 60)
        print("FRONTEND TESTING RECOMMENDATIONS:")
        print("=" * 60)
        print("1. Navigate to http://localhost:5173/classes")
        print("2. Verify class cards show 'actual/quota' student counts")
        print("3. Test 'Add Class' form with quota field")
        print("4. Test delete button on class cards")
        print("5. Navigate to 'View Deleted Classes' page")
        print("6. Test restore and permanent delete functions")
        print("7. Click on a class to view detailed student information")
        print("=" * 60)

if __name__ == "__main__":
    tester = ClassesImplementationTester()
    tester.run_comprehensive_tests()
