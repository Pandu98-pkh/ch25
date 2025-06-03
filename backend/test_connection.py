#!/usr/bin/env python3
"""
Test script to verify CounselorHub database connection and data
"""

import mysql.connector
from mysql.connector import Error

def test_connection():
    """Test database connection and display some data"""
    try:
        # Test admin connection
        admin_connection = mysql.connector.connect(
            host='localhost',
            user='admin',
            password='admin',
            database='counselorhub'
        )
        
        if admin_connection.is_connected():
            print("✅ Admin connection successful!")
            
            cursor = admin_connection.cursor()
            
            # Test basic queries
            print("\n📊 Database Tables:")
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            for table in tables:
                print(f"  - {table[0]}")
            
            print("\n👥 Users in the system:")
            cursor.execute("SELECT username, role, email FROM users")
            users = cursor.fetchall()
            for username, role, email in users:
                print(f"  - {username} ({role}): {email}")
            
            print("\n🎓 Students by Class:")
            cursor.execute("""
                SELECT s.name, s.kelas, s.academic_status, c.name as class_name 
                FROM students s 
                LEFT JOIN classes c ON s.class_id = c.id 
                ORDER BY s.kelas, s.name
            """)
            students = cursor.fetchall()
            for name, kelas, status, class_name in students:
                print(f"  - {name} (Class: {kelas}) - Status: {status}")
            
            cursor.close()
            admin_connection.close()
        
        # Test application user connection
        app_connection = mysql.connector.connect(
            host='localhost',
            user='counselorhub_user',
            password='counselorhub_password_2024',
            database='counselorhub'
        )
        
        if app_connection.is_connected():
            print("\n✅ Application user connection successful!")
            app_connection.close()
            
    except Error as e:
        print(f"❌ Error connecting to database: {e}")

if __name__ == '__main__':
    print("🧪 Testing CounselorHub Database Connections")
    print("=" * 50)
    test_connection()
    print("\n🎉 Database testing completed!")
