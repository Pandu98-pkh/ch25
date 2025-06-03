#!/usr/bin/env python3
"""
Test script to debug AddStudent 500 error
Direct API call to identify the root cause
"""

import requests
import json

# Test data for creating a student
test_student_data = {
    "name": "Test Student",
    "email": "test.student@example.com",
    "tingkat": "XI",
    "kelas": "IPA-1",
    "classId": "C2025-XI-IPA-1",  # This might be the issue - need to check if this class exists
    "academicStatus": "good",
    "studentId": "S12345TEST",
    "avatar": ""
}

def test_create_student():
    """Test the create student endpoint"""
    url = "http://localhost:5000/api/students"
    headers = {"Content-Type": "application/json"}
    
    print("🧪 Testing AddStudent API endpoint...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_student_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_student_data, headers=headers)
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 500:
            print("❌ HTTP 500 ERROR DETECTED!")
            print(f"Response Text: {response.text}")
            
            try:
                error_json = response.json()
                print(f"Error JSON: {json.dumps(error_json, indent=2)}")
            except:
                print("Could not parse error response as JSON")
                
        elif response.status_code in [200, 201]:
            print("✅ SUCCESS!")
            result = response.json()
            print(f"Created Student: {json.dumps(result, indent=2)}")
            
        else:
            print(f"⚠️ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error - Is the backend running on port 5000?")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def check_classes_exist():
    """Check if classes exist in database"""
    url = "http://localhost:5000/api/classes"
    
    print("\n🔍 Checking available classes...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            classes = response.json()
            print(f"Available classes: {len(classes.get('data', []))} classes found")
            
            # Look for XI IPA-1 class
            for cls in classes.get('data', []):
                if cls.get('grade_level') == 'XI' and 'IPA-1' in cls.get('name', ''):
                    print(f"✅ Found matching class: {cls}")
                    return cls.get('class_id')
            
            print("❌ No matching XI IPA-1 class found")
            print("Available classes:")
            for cls in classes.get('data', [])[:5]:  # Show first 5
                print(f"  - {cls.get('class_id')}: {cls.get('grade_level')} {cls.get('name')}")
                
        else:
            print(f"Failed to fetch classes: {response.status_code}")
            
    except Exception as e:
        print(f"Error checking classes: {e}")
    
    return None

if __name__ == "__main__":
    # First check if classes exist
    class_id = check_classes_exist()
    
    if class_id:
        test_student_data["classId"] = class_id
        print(f"\n🔄 Updated classId to: {class_id}")
    
    # Test the student creation
    test_create_student()
