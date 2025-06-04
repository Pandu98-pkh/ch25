#!/usr/bin/env python3

import requests
import json

def test_delete_endpoint():
    """Test the DELETE endpoint for mental health assessments"""
      # First, create a new assessment for testing deletion
    print("1. Creating a test assessment for deletion...")
    create_data = {
        "student_id": "1103210016",
        "assessment_type": "GAD-7", 
        "score": 5,
        "risk_level": "low",
        "assessor_id": "counselor_1",
        "notes": "Test assessment for deletion",        "responses": json.dumps({"q1": 1, "q2": 0, "q3": 1, "q4": 1, "q5": 1, "q6": 1, "q7": 0}),
        "recommendations": json.dumps(["Regular check-ins recommended"])
    }
    
    create_response = requests.post(
        "http://localhost:5000/api/mental-health/assessments",
        json=create_data,
        headers={"Content-Type": "application/json"}
    )
    
    if create_response.status_code != 201:
        print(f"❌ Failed to create test assessment: {create_response.status_code}")
        print(f"Response: {create_response.text}")
        return
    
    created_assessment = create_response.json()
    assessment_id = created_assessment['id']
    print(f"✅ Created test assessment: {assessment_id}")
    
    # Verify the assessment exists by getting it
    print("2. Verifying assessment exists...")
    get_response = requests.get(f"http://localhost:5000/api/mental-health/assessments")
    
    if get_response.status_code == 200:
        data = get_response.json()
        assessments = data.get('data', [])
        found_assessment = next((a for a in assessments if a['id'] == assessment_id), None)
        
        if found_assessment:
            print(f"✅ Assessment found: {found_assessment['studentId']} - {found_assessment['type']}")
        else:
            print("❌ Created assessment not found in list")
            return
    else:
        print(f"❌ Failed to verify assessment exists: {get_response.status_code}")
        return
    
    # Test deleting the assessment
    print("3. Testing DELETE endpoint...")
    delete_response = requests.delete(f"http://localhost:5000/api/mental-health/assessments/{assessment_id}")
    
    print(f"DELETE Response Status: {delete_response.status_code}")
    
    if delete_response.status_code == 200:
        print("✅ DELETE request successful")
        response_data = delete_response.json()
        print(f"   Message: {response_data.get('message', 'No message')}")
    else:
        print("❌ DELETE request failed")
        print(f"Response: {delete_response.text}")
        return
    
    # Verify the assessment was actually deleted
    print("4. Verifying deletion...")
    verify_response = requests.get(f"http://localhost:5000/api/mental-health/assessments")
    
    if verify_response.status_code == 200:
        data = verify_response.json()
        assessments = data.get('data', [])
        found_assessment = next((a for a in assessments if a['id'] == assessment_id), None)
        
        if not found_assessment:
            print("✅ Deletion verified - assessment no longer exists")
        else:
            print("❌ Assessment still exists after deletion")
    else:
        print(f"❌ Failed to verify deletion: {verify_response.status_code}")

if __name__ == "__main__":
    test_delete_endpoint()
