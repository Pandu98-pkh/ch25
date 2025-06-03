#!/usr/bin/env python3

import requests
import json

def check_deleted_data():
    try:
        print("🔍 Checking current deleted students data...")
        print("=" * 50)
        
        # Check deleted students
        response = requests.get('http://localhost:5000/api/admin/students/deleted')
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Deleted students endpoint: {len(data)} students")
            for i, student in enumerate(data[:5]):  # Show first 5
                student_id = student.get('studentId', 'N/A')
                name = student.get('name', 'N/A')
                email = student.get('email', 'N/A')
                user_id = student.get('userId', 'N/A')
                print(f"  {i+1}. ID: {student_id}, Name: {name}, Email: {email}, UserID: {user_id}")
        else:
            print(f"❌ Error fetching deleted students: {response.status_code}")
        
        print()
        
        # Check deleted users (students)
        response2 = requests.get('http://localhost:5000/api/admin/users/deleted')
        if response2.status_code == 200:
            data2 = response2.json()
            student_users = [u for u in data2 if u.get('role') == 'student']
            print(f"📊 Deleted student users endpoint: {len(student_users)} users")
            for i, user in enumerate(student_users[:5]):
                user_id = user.get('userId', user.get('id', 'N/A'))
                name = user.get('name', 'N/A')
                email = user.get('email', 'N/A')
                print(f"  {i+1}. UserID: {user_id}, Name: {name}, Email: {email}")
        else:
            print(f"❌ Error fetching deleted users: {response2.status_code}")
            
        # Create some test deleted data if none exists
        if len(data) == 0:
            print("\n🔧 No deleted students found. Creating test data...")
            try:
                # First get some active students to delete
                active_response = requests.get('http://localhost:5000/api/admin/students')
                if active_response.status_code == 200:
                    active_students = active_response.json()
                    print(f"Found {len(active_students)} active students")
                    
                    # Delete a few students for testing
                    if len(active_students) > 0:
                        test_student = active_students[0]
                        student_id = test_student.get('studentId')
                        print(f"Deleting student {student_id} for testing...")
                        
                        delete_response = requests.delete(f'http://localhost:5000/api/admin/students/{student_id}')
                        if delete_response.status_code == 200:
                            print("✅ Test student deleted successfully")
                        else:
                            print(f"❌ Failed to delete test student: {delete_response.status_code}")
                            
            except Exception as e:
                print(f"Error creating test data: {e}")
    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_deleted_data()
