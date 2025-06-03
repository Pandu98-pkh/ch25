#!/usr/bin/env python3
"""
Check if the default counselor KSL-2025-001 exists in the database
"""
import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def check_counselor():
    """Check if counselor KSL-2025-001 exists"""
    connection = get_db_connection()
    if not connection:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if counselor exists in users table
        cursor.execute("SELECT * FROM users WHERE user_id = %s", ('KSL-2025-001',))
        counselor = cursor.fetchone()
        
        if counselor:
            print("✅ Counselor KSL-2025-001 found in users table:")
            print(f"   Name: {counselor['name']}")
            print(f"   Email: {counselor['email']}")
            print(f"   Role: {counselor['role']}")
            print(f"   Active: {counselor.get('is_active', 'N/A')}")
            return True
        else:
            print("❌ Counselor KSL-2025-001 NOT found in users table")
            
            # Check if there are any users with 'counselor' role
            cursor.execute("SELECT user_id, name, email FROM users WHERE role = 'counselor'")
            counselors = cursor.fetchall()
            
            if counselors:
                print(f"\n📋 Found {len(counselors)} counselor(s) in the database:")
                for c in counselors:
                    print(f"   - {c['user_id']}: {c['name']} ({c['email']})")
            else:
                print("\n⚠️  No counselors found in the database")
            
            return False
            
    except Error as e:
        print(f"❌ Error checking counselor: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_default_counselor():
    """Create the default counselor KSL-2025-001"""
    connection = get_db_connection()
    if not connection:
        print("❌ Database connection failed")
        return False
    
    try:
        cursor = connection.cursor()
        
        # Check if counselor already exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", ('KSL-2025-001',))
        if cursor.fetchone():
            print("✅ Counselor KSL-2025-001 already exists")
            return True
        
        # Create the default counselor
        import bcrypt
        password_hash = bcrypt.hashpw('counselor123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute("""
            INSERT INTO users (user_id, username, email, password_hash, name, role)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            'KSL-2025-001',
            'default_counselor',
            'counselor@school.edu',
            password_hash,
            'Default Counselor',
            'counselor'
        ))
        
        connection.commit()
        print("✅ Default counselor KSL-2025-001 created successfully")
        print("   Username: default_counselor")
        print("   Email: counselor@school.edu")
        print("   Password: counselor123")
        return True
        
    except Error as e:
        print(f"❌ Error creating counselor: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    print("🔍 Checking for default counselor KSL-2025-001...")
    
    if not check_counselor():
        print("\n🔧 Creating default counselor...")
        if create_default_counselor():
            print("\n✅ Default counselor setup complete!")
        else:
            print("\n❌ Failed to create default counselor")
    else:
        print("\n✅ Default counselor already exists - no action needed")
