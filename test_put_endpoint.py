#!/usr/bin/env python3

import requests
import json

def test_put_endpoint():
    """Test the PUT endpoint for mental health assessments"""
    
    # First, get the existing assessments to find a valid ID
    print("1. Getting existing assessments...")
    get_response = requests.get("http://localhost:5000/api/mental-health/assessments")
    
    if get_response.status_code != 200:
        print(f"❌ Failed to get assessments: {get_response.status_code}")
        return
    
    data = get_response.json()
    assessments = data.get('data', [])
    
    if not assessments:
        print("❌ No assessments found to update")
        return
    
    # Use the first assessment for testing
    test_assessment = assessments[0]
    assessment_id = test_assessment['id']
    print(f"✅ Found assessment to update: {assessment_id}")
    print(f"   Current score: {test_assessment['score']}")
    print(f"   Current notes: {test_assessment['notes']}")
    
    # Test updating the assessment
    print("\n2. Testing PUT endpoint...")
    update_data = {
        "score": test_assessment['score'] + 2,  # Increase score by 2
        "notes": "Updated via test script",
        "risk_level": "high"
    }
    
    put_response = requests.put(
        f"http://localhost:5000/api/mental-health/assessments/{assessment_id}",
        json=update_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"PUT Response Status: {put_response.status_code}")
    
    if put_response.status_code == 200:
        result = put_response.json()
        print("✅ PUT request successful")
        print(f"   Updated score: {result.get('score')}")
        print(f"   Updated notes: {result.get('notes')}")
        print(f"   Updated risk level: {result.get('risk_level')}")
    else:
        print(f"❌ PUT request failed")
        print(f"   Response: {put_response.text}")
    
    # Verify the update by getting the assessment again
    print("\n3. Verifying update...")
    verify_response = requests.get("http://localhost:5000/api/mental-health/assessments")
    
    if verify_response.status_code == 200:
        verify_data = verify_response.json()
        updated_assessment = next(
            (a for a in verify_data.get('data', []) if a['id'] == assessment_id), 
            None
        )
        
        if updated_assessment:
            print("✅ Update verified")
            print(f"   Final score: {updated_assessment['score']}")
            print(f"   Final notes: {updated_assessment['notes']}")
        else:
            print("❌ Could not find updated assessment")
    else:
        print("❌ Failed to verify update")

if __name__ == "__main__":
    test_put_endpoint()
