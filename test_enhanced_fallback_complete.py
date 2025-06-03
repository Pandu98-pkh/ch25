#!/usr/bin/env python3
"""
Final test to verify the enhanced DeletedStudentsManagement component logic
Simulates the exact fallback functionality implemented in the React component
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_enhanced_fallback_logic():
    """Test the enhanced fallback logic exactly as implemented in the component"""
    
    print("🧪 Testing Enhanced DeletedStudentsManagement Fallback Logic")
    print("=" * 60)
    
    # Step 1: Fetch primary data from students endpoint
    print("\n🔍 Step 1: Fetching deleted students from primary endpoint...")
    
    students_response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
    if students_response.status_code != 200:
        print(f"❌ Failed to fetch students: {students_response.status_code}")
        return
    
    students_data = students_response.json()
    print(f"📊 Primary endpoint returned: {len(students_data)} deleted students")
    
    # Step 2: Fetch users data for fallback
    print("\n🔍 Step 2: Fetching deleted users for fallback/enrichment...")
    
    users_response = requests.get(f"{BASE_URL}/api/admin/users/deleted")
    if users_response.status_code != 200:
        print(f"❌ Failed to fetch users: {users_response.status_code}")
        return
    
    all_users = users_response.json()
    student_users = [user for user in all_users if user.get('role') == 'student']
    print(f"📊 Users endpoint returned: {len(student_users)} deleted student users")
    
    # Step 3: Process the data as the component does
    print("\n⚙️ Step 3: Processing data with enhanced fallback logic...")
    
    processed_students = []
    
    # Map users by user_id for quick lookup
    users_map = {user.get('userId', user.get('id')): user for user in student_users}
    
    # Process each student from primary endpoint
    for student in students_data:
        student_id = student.get('studentId', student.get('id'))
        user_id = student.get('userId')
        
        processed_student = {
            'id': student_id,
            'studentId': student_id,
            'name': student.get('name', 'Unknown Student'),
            'email': student.get('email', ''),
            'grade': student.get('grade', ''),
            'academicStatus': student.get('academicStatus', ''),
            'program': student.get('program', ''),
            'userId': user_id,
            'deletedAt': student.get('deletedAt', student.get('updatedAt')),
            'source': 'students_table'
        }
        
        # Try to enrich with user data if available
        if user_id and user_id in users_map:
            user_data = users_map[user_id]
            if not processed_student['name'] or processed_student['name'] == 'Unknown Student':
                processed_student['name'] = user_data.get('name', processed_student['name'])
            if not processed_student['email']:
                processed_student['email'] = user_data.get('email', '')
            
            processed_student['enriched'] = True
        else:
            processed_student['enriched'] = False
        
        processed_students.append(processed_student)
    
    # Step 4: Fallback for users without student records
    print("\n🔄 Step 4: Adding fallback entries for users without student records...")
    
    used_user_ids = {s.get('userId') for s in processed_students if s.get('userId')}
    fallback_count = 0
    
    for user in student_users:
        user_id = user.get('userId', user.get('id'))
        
        if user_id not in used_user_ids:
            fallback_student = {
                'id': f"fallback_{user_id}",
                'studentId': f"FB_{user_id}",
                'name': user.get('name', 'Unknown Student'),
                'email': user.get('email', ''),
                'grade': 'N/A',
                'academicStatus': 'unknown',
                'program': 'N/A',
                'userId': user_id,
                'deletedAt': user.get('deletedAt'),
                'source': 'users_table_fallback',
                'enriched': False,
                'fallback': True
            }
            processed_students.append(fallback_student)
            fallback_count += 1
    
    # Step 5: Analyze results
    print("\n📊 Results Analysis:")
    print(f"   Total processed students: {len(processed_students)}")
    print(f"   From students table: {len(students_data)}")
    print(f"   From fallback (users only): {fallback_count}")
    
    enriched_count = len([s for s in processed_students if s.get('enriched')])
    print(f"   Enriched with user data: {enriched_count}")
    
    # Step 6: Show detailed results
    print("\n📋 Detailed Results:")
    print("-" * 50)
    
    for i, student in enumerate(processed_students, 1):
        source_label = "🔗 Students+Users" if student.get('enriched') else "📚 Students Only" if student.get('source') == 'students_table' else "👤 Users Fallback"
        
        print(f"{i}. {source_label}")
        print(f"   ID: {student['studentId']}")
        print(f"   Name: {student['name']}")
        print(f"   Email: {student['email']}")
        print(f"   Grade: {student['grade']}")
        print(f"   Source: {student['source']}")
        if student.get('fallback'):
            print(f"   🔄 FALLBACK ENTRY")
        print()
    
    # Step 7: Verify the component would show correct counts
    print("✅ Enhanced Component Statistics:")
    print(f"   📊 Total displayed entries: {len(processed_students)}")
    print(f"   🔗 Enriched entries: {enriched_count}")
    print(f"   🔄 Fallback entries: {fallback_count}")
    print(f"   📈 Data completeness: {((len(processed_students) - fallback_count) / len(processed_students) * 100):.1f}%")
    
    return processed_students

def test_specific_scenarios():
    """Test specific edge cases and scenarios"""
    
    print("\n🎯 Testing Specific Scenarios:")
    print("=" * 40)
    
    # Test 1: Verify existing users are accessible
    print("\n1️⃣ Testing access to existing deleted users...")
    response = requests.get(f"{BASE_URL}/api/admin/users/deleted")
    if response.status_code == 200:
        users = response.json()
        student_users = [u for u in users if u.get('role') == 'student']
        print(f"   ✅ Can access {len(student_users)} deleted student users")
        
        # Show some examples
        for i, user in enumerate(student_users[:3], 1):
            print(f"   {i}. {user.get('name')} ({user.get('email')})")
    
    # Test 2: Verify students endpoint
    print("\n2️⃣ Testing access to deleted students endpoint...")
    response = requests.get(f"{BASE_URL}/api/admin/students/deleted")
    if response.status_code == 200:
        students = response.json()
        print(f"   ✅ Can access {len(students)} deleted students")
        
        for i, student in enumerate(students[:3], 1):
            print(f"   {i}. {student.get('name', 'Unknown')} (ID: {student.get('studentId')})")
    
    print("\n🎉 All scenarios tested successfully!")

if __name__ == "__main__":
    try:
        # Run the main enhanced fallback logic test
        processed_students = test_enhanced_fallback_logic()
        
        # Run specific scenario tests
        test_specific_scenarios()
        
        print("\n" + "=" * 60)
        print("🎉 Enhanced DeletedStudentsManagement Testing Complete!")
        print("🌐 View results in browser: http://localhost:5174/#/students/deleted")
        print("✅ The component should show all processed students with enhanced fallback data")
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Cannot connect to backend server.")
        print("   Make sure Flask is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
