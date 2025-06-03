#!/usr/bin/env python3
"""
Script untuk mengambil data dari tabel career_assessments
Menggunakan koneksi database MySQL langsung dan juga API endpoint
"""

import mysql.connector
from mysql.connector import Error
import requests
import json
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'database': 'counselorhub',
    'user': 'admin',
    'password': 'admin'
}

API_BASE = 'http://localhost:5000/api'

def get_data_from_database():
    """Ambil data langsung dari database MySQL"""
    print("=== MENGAMBIL DATA DARI DATABASE MYSQL ===")
    
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            # Get semua data dari career_assessments dengan join ke tabel students dan users
            query = """
                SELECT 
                    ca.id,
                    ca.assessment_id,
                    ca.student_id,
                    ca.date,
                    ca.assessment_type,
                    ca.interests,
                    ca.skills,
                    ca.values_data,
                    ca.recommended_paths,
                    ca.notes,
                    ca.results,
                    ca.is_active,
                    ca.created_at,
                    ca.updated_at,
                    u.name as student_name,
                    u.email as student_email
                FROM career_assessments ca
                LEFT JOIN students s ON ca.student_id = s.student_id
                LEFT JOIN users u ON s.user_id = u.user_id
                ORDER BY ca.date DESC
            """
            
            cursor.execute(query)
            assessments = cursor.fetchall()
            
            print(f"📊 Total data ditemukan: {len(assessments)}")
            print(f"⏰ Diambil pada: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            if assessments:
                print("\n=== DETAIL DATA CAREER ASSESSMENTS ===")
                for i, assessment in enumerate(assessments, 1):
                    print(f"\n{i}. Assessment ID: {assessment['assessment_id']}")
                    print(f"   Student ID: {assessment['student_id']}")
                    print(f"   Student Name: {assessment['student_name'] or 'N/A'}")
                    print(f"   Student Email: {assessment['student_email'] or 'N/A'}")
                    print(f"   Date: {assessment['date']}")
                    print(f"   Type: {assessment['assessment_type']}")
                    print(f"   Interests: {assessment['interests']}")
                    print(f"   Skills: {assessment['skills']}")
                    print(f"   Values: {assessment['values_data']}")
                    print(f"   Recommended Paths: {assessment['recommended_paths']}")
                    print(f"   Notes: {assessment['notes'][:100]}..." if assessment['notes'] and len(assessment['notes']) > 100 else f"   Notes: {assessment['notes']}")
                    print(f"   Active: {'Yes' if assessment['is_active'] else 'No'}")
                    print(f"   Created: {assessment['created_at']}")
                    print(f"   Updated: {assessment['updated_at']}")
                    
                    # Parse results JSON jika ada
                    if assessment['results']:
                        try:
                            results = json.loads(assessment['results'])
                            print(f"   Results: {json.dumps(results, indent=8)}")
                        except:
                            print(f"   Results: {assessment['results']}")
                    
                    print("-" * 60)
                
                # Summary statistik
                print(f"\n=== STATISTIK DATA ===")
                active_count = sum(1 for a in assessments if a['is_active'])
                inactive_count = len(assessments) - active_count
                
                print(f"📈 Total assessments: {len(assessments)}")
                print(f"✅ Active assessments: {active_count}")
                print(f"❌ Inactive assessments: {inactive_count}")
                
                # Breakdown by type
                type_counts = {}
                for assessment in assessments:
                    atype = assessment['assessment_type']
                    type_counts[atype] = type_counts.get(atype, 0) + 1
                
                print(f"\n📊 Breakdown by type:")
                for atype, count in type_counts.items():
                    print(f"   {atype}: {count}")
                
                # Student participation
                unique_students = set(a['student_id'] for a in assessments if a['student_id'])
                print(f"\n👥 Unique students participated: {len(unique_students)}")
                
            else:
                print("❌ Tidak ada data ditemukan dalam tabel career_assessments")
                
            return assessments
            
    except Error as e:
        print(f"❌ Error koneksi database: {e}")
        return None
        
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()
            print(f"\n✅ Koneksi database ditutup")

def get_data_from_api():
    """Ambil data melalui API endpoint"""
    print("\n\n=== MENGAMBIL DATA MELALUI API ===")
    
    try:
        # Test koneksi API
        response = requests.get(f"{API_BASE}/career-assessments")
        
        if response.status_code == 200:
            data = response.json()
            assessments = data.get('data', [])
            total_count = data.get('totalCount', len(assessments))
            
            print(f"📊 API Response Status: {response.status_code}")
            print(f"📊 Total assessments from API: {total_count}")
            print(f"📊 Data received: {len(assessments)}")
            
            if assessments:
                print(f"\n=== SAMPLE DATA DARI API ===")
                for i, assessment in enumerate(assessments[:3], 1):  # Show first 3
                    print(f"\n{i}. {assessment.get('id')}")
                    print(f"   Student: {assessment.get('studentName', 'N/A')} ({assessment.get('studentId')})")
                    print(f"   Type: {assessment.get('type')}")
                    print(f"   Date: {assessment.get('date')}")
                    print(f"   Interests: {assessment.get('interests', [])}")
                    print(f"   Paths: {assessment.get('recommendedPaths', [])}")
                
                if len(assessments) > 3:
                    print(f"\n... dan {len(assessments) - 3} data lainnya")
                
            return assessments
            
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error API request: {e}")
        return None

def export_to_json(data, filename):
    """Export data ke file JSON"""
    if not data:
        print("❌ Tidak ada data untuk di-export")
        return
        
    try:
        # Convert datetime objects to strings for JSON serialization
        json_data = []
        for item in data:
            json_item = {}
            for key, value in item.items():
                if isinstance(value, datetime):
                    json_item[key] = value.isoformat()
                else:
                    json_item[key] = value
            json_data.append(json_item)
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Data berhasil di-export ke: {filename}")
        
    except Exception as e:
        print(f"❌ Error exporting data: {e}")

def main():
    """Main function"""
    print("🔍 SCRIPT PENGAMBILAN DATA CAREER ASSESSMENTS")
    print("=" * 60)
    
    # Method 1: Ambil data langsung dari database
    db_data = get_data_from_database()
    
    # Method 2: Ambil data melalui API (jika backend berjalan)
    api_data = get_data_from_api()
    
    # Export data jika berhasil
    if db_data:
        export_to_json(db_data, "career_assessments_from_database.json")
    
    if api_data:
        export_to_json(api_data, "career_assessments_from_api.json")
    
    print(f"\n📋 RINGKASAN:")
    print(f"   Database: {'✅ Success' if db_data else '❌ Failed'} ({len(db_data) if db_data else 0} records)")
    print(f"   API: {'✅ Success' if api_data else '❌ Failed'} ({len(api_data) if api_data else 0} records)")
    
    print("\n🎉 Script selesai dijalankan!")

if __name__ == "__main__":
    main()
