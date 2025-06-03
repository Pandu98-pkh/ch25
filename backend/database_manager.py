#!/usr/bin/env python3
"""
CounselorHub Database Management Utility
Provides common database operations for the CounselorHub system
"""

import mysql.connector
from mysql.connector import Error
import bcrypt
import getpass
import sys
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'counselorhub_user',
    'password': 'counselorhub_password_2024',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_connection():
    """Get database connection"""
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def add_user(username, email, password, name, role):
    """Add a new user to the system"""
    connection = get_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
        if cursor.fetchone():
            print(f"❌ User with username '{username}' or email '{email}' already exists")
            return False
        
        # Hash password
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Generate user_id
        import uuid
        user_id = f"USR{uuid.uuid4().hex[:3].upper()}"
        
        # Insert user
        cursor.execute("""
            INSERT INTO users (user_id, username, email, password_hash, name, role) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, username, email, password_hash, name, role))
        
        connection.commit()
        print(f"✅ User '{username}' added successfully with ID: {user_id}")
        return True
        
    except Error as e:
        print(f"❌ Error adding user: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def list_users():
    """List all users in the system"""
    connection = get_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        cursor.execute("""
            SELECT user_id, username, email, name, role, is_active, created_at 
            FROM users 
            ORDER BY role, username
        """)
        
        users = cursor.fetchall()
        
        print("\n📋 Users in CounselorHub:")
        print("-" * 80)
        print(f"{'ID':<8} {'Username':<15} {'Role':<10} {'Name':<20} {'Email':<25} {'Status':<8}")
        print("-" * 80)
        
        for user_id, username, email, name, role, is_active, created_at in users:
            status = "Active" if is_active else "Inactive"
            print(f"{user_id:<8} {username:<15} {role:<10} {name:<20} {email:<25} {status:<8}")
        
        print(f"\nTotal: {len(users)} users")
        
    except Error as e:
        print(f"❌ Error listing users: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def get_database_stats():
    """Show database statistics"""
    connection = get_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        tables = ['users', 'students', 'classes', 'counseling_sessions', 
                 'mental_health_assessments', 'behavior_records', 
                 'career_assessments', 'career_resources', 'notifications']
        
        print("\n📊 Database Statistics:")
        print("-" * 40)
        
        total_records = 0
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            total_records += count
            print(f"{table:<25}: {count:>6} records")
        
        print("-" * 40)
        print(f"{'Total Records':<25}: {total_records:>6}")
        
        # Get database size
        cursor.execute("""
            SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS db_size_mb
            FROM information_schema.tables 
            WHERE table_schema = 'counselorhub'
        """)
        size = cursor.fetchone()[0]
        print(f"{'Database Size':<25}: {size:>6} MB")
        
    except Error as e:
        print(f"❌ Error getting statistics: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def backup_database():
    """Create a simple backup of the database structure and data"""
    print("📦 Creating database backup...")
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"counselorhub_backup_{timestamp}.sql"
    
    # Note: This would require mysqldump to be available
    print(f"💡 To create a backup, run:")
    print(f"   mysqldump -u counselorhub_user -p counselorhub > {backup_file}")

def main():
    """Main menu"""
    while True:
        print("\n" + "="*50)
        print("CounselorHub Database Management")
        print("="*50)
        print("1. List Users")
        print("2. Add New User")
        print("3. Database Statistics")
        print("4. Backup Info")
        print("5. Test Connection")
        print("0. Exit")
        
        choice = input("\nSelect an option (0-5): ").strip()
        
        if choice == '1':
            list_users()
        elif choice == '2':
            print("\n➕ Add New User")
            username = input("Username: ").strip()
            email = input("Email: ").strip()
            password = getpass.getpass("Password: ")
            name = input("Full Name: ").strip()
            
            print("Roles: admin, counselor, student")
            role = input("Role: ").strip().lower()
            
            if role not in ['admin', 'counselor', 'student']:
                print("❌ Invalid role. Must be admin, counselor, or student")
                continue
            
            add_user(username, email, password, name, role)
        elif choice == '3':
            get_database_stats()
        elif choice == '4':
            backup_database()
        elif choice == '5':
            connection = get_connection()
            if connection:
                print("✅ Database connection successful!")
                connection.close()
            else:
                print("❌ Database connection failed!")
        elif choice == '0':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid option. Please try again.")

if __name__ == '__main__':
    main()
