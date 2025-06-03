#!/usr/bin/env python3
"""
Test image upload functionality with hybrid fallback solutions
"""
import requests
import json
import os
import base64
import time

BASE_URL = "http://localhost:5000"

def test_image_upload():
    """Test image upload with both file and base64 methods"""
    print("📸 TESTING IMAGE UPLOAD FUNCTIONALITY")
    print("=" * 50)
    
    # Create a simple test image (1x1 red pixel PNG)
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAFtetUdKAAAAElFTkSuQmCC"
    
    # Test 1: Upload with base64 data
    print("\n🧪 Test 1: Base64 Image Upload")
    timestamp = str(int(time.time()))[-6:]
    
    student_data = {
        "student_id": f"IMG{timestamp}",
        "name": f"Image Test Student {timestamp}",
        "email": f"image.test.{timestamp}@school.edu",
        "grade": "XII", 
        "tingkat": "XII",
        "class": "IPA-1",
        "kelas": "IPA-1",
        "academic_status": "good",
        "photo": f"data:image/png;base64,{test_image_base64}"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student_data)
    print(f"POST Response Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        print("✅ Student with base64 image created successfully!")
        print(f"Student ID: {result.get('studentId')}")
        print(f"Photo URL: {result.get('photo', 'No photo')}")
        return result.get('studentId')
    else:
        print(f"❌ Failed to create student with base64 image")
        print(f"Response: {response.text}")
        return None

def test_image_update():
    """Test updating student image"""
    print("\n🔄 Test 2: Image Update Functionality")
    
    # Get latest student for testing
    response = requests.get(f"{BASE_URL}/api/students?page=1&limit=1")
    if response.status_code == 200:
        data = response.json().get('data', [])
        if data:
            student_id = data[0]['studentId']
            print(f"Testing image update for student: {student_id}")
              # Updated image (1x1 blue pixel PNG)
            blue_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQIHWNgYGAAAAABAAGF2r/RAAAAAElFTkSuQmCC"
            
            update_data = {
                "avatar": f"data:image/png;base64,{blue_image_base64}"
            }
            
            response = requests.put(f"{BASE_URL}/api/students/{student_id}", json=update_data)
            print(f"PUT Response Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Student image updated successfully!")
                print(f"Updated Photo URL: {result.get('photo', 'No photo')}")
                return True
            else:
                print(f"❌ Failed to update student image")
                print(f"Response: {response.text}")
                return False
    
    print("❌ No students found for image update test")
    return False

def test_fallback_mechanisms():
    """Test fallback mechanisms for image handling"""
    print("\n🛡️ Test 3: Image Fallback Mechanisms")
    
    # Test with invalid image data
    timestamp = str(int(time.time()))[-6:]
    
    student_data = {
        "student_id": f"FALLBACK{timestamp}",
        "name": f"Fallback Test Student {timestamp}",
        "email": f"fallback.test.{timestamp}@school.edu",
        "grade": "XI", 
        "tingkat": "XI",
        "class": "IPS-1",
        "kelas": "IPS-1",
        "academic_status": "good",
        "photo": "invalid_image_data"
    }
    
    response = requests.post(f"{BASE_URL}/api/students", json=student_data)
    print(f"POST Response Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        result = response.json()
        print("✅ Student created with fallback image handling!")
        print(f"Student ID: {result.get('studentId')}")
        print(f"Photo URL: {result.get('photo', 'No photo')}")
        return True
    else:
        print(f"❌ Failed to create student with invalid image")
        print(f"Response: {response.text}")
        return False

def main():
    """Main test function"""
    try:
        # Test 1: Base64 image upload
        student_id = test_image_upload()
        
        # Test 2: Image update
        test_image_update()
        
        # Test 3: Fallback mechanisms
        test_fallback_mechanisms()
        
        print("\n" + "=" * 50)
        print("📸 IMAGE UPLOAD TESTING COMPLETE!")
        print("✅ Base64 image upload: TESTED")
        print("✅ Image update functionality: TESTED")
        print("✅ Fallback mechanisms: TESTED")
        print("🌐 Frontend available at: http://localhost:5173")
        print("🖥️ Backend API available at: http://localhost:5000")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    main()
