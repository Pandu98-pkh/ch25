#!/usr/bin/env python3
import requests
import json

def test_delete_student():
    """Test the delete student endpoint"""
    
    # First, let's see the current student data
    print("Getting current student data...")
    response = requests.get('http://localhost:5000/api/students')
    if response.status_code == 200:
        data = response.json()
        students = data.get('data', [])
        
        # Find TST999 student
        target_student = None
        for student in students:
            if student.get('studentId') == 'TST999' or student.get('student_id') == 'TST999':
                target_student = student
                break
        
        if target_student:
            print(f"Found student: {target_student.get('name', 'No name')}")
            print(f"Student ID: {target_student.get('studentId', target_student.get('student_id'))}")
            
            # Test delete
            student_id = target_student.get('studentId', target_student.get('student_id'))
            print(f"\nTesting delete for student ID: {student_id}")
            
            delete_response = requests.delete(f'http://localhost:5000/api/students/{student_id}')
            print(f"Delete response status: {delete_response.status_code}")
            print(f"Delete response: {delete_response.text}")
            
            if delete_response.status_code == 200:
                print("✅ Delete successful!")
                
                # Verify deletion
                verify_response = requests.get('http://localhost:5000/api/students')
                if verify_response.status_code == 200:
                    verify_data = verify_response.json()
                    verify_students = verify_data.get('data', [])
                    
                    # Check if student is still in the list
                    still_exists = any(
                        s.get('studentId') == student_id or s.get('student_id') == student_id 
                        for s in verify_students
                    )
                    
                    if still_exists:
                        print("⚠️ Student still appears in active list")
                    else:
                        print("✅ Student successfully removed from active list")
            else:
                print("❌ Delete failed!")
        else:
            print("❌ TST999 student not found")
    else:
        print(f"❌ Failed to get students: {response.status_code}")

if __name__ == "__main__":
    test_delete_student()
