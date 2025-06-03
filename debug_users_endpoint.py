#!/usr/bin/env python3

import requests
import json

def check_users_endpoint():
    try:
        print("🔍 Checking users endpoint...")
        response = requests.get('http://localhost:5000/api/admin/users/deleted')
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Total deleted users: {len(data)}")
            
            students = [u for u in data if u.get('role') == 'student']
            print(f"📊 Deleted student users: {len(students)}")
            
            for s in students:
                user_id = s.get('userId', s.get('id'))
                name = s.get('name')
                role = s.get('role')
                email = s.get('email')
                print(f"  {user_id}: {name} ({role}) - {email}")
                
            if len(students) == 0:
                print("🔍 No student users found. Showing all deleted users:")
                for u in data:
                    user_id = u.get('userId', u.get('id'))
                    name = u.get('name')
                    role = u.get('role')
                    print(f"  {user_id}: {name} ({role})")
        else:
            print(f"❌ Error: {response.status_code}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_users_endpoint()
