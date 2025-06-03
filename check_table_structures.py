#!/usr/bin/env python3
"""
Check table structures and data
"""

import mysql.connector
import os

def get_db_connection():
    """Get database connection"""
    config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'user': os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', 'admin123'),
        'database': os.getenv('DB_NAME', 'counselorhub'),
        'charset': 'utf8mb4',
        'collation': 'utf8mb4_unicode_ci'
    }
    
    try:
        connection = mysql.connector.connect(**config)
        return connection
    except mysql.connector.Error as err:
        print(f"❌ Database connection failed: {err}")
        return None

def check_table_structures():
    """Check table structures"""
    connection = get_db_connection()
    if not connection:
        return
    
    cursor = connection.cursor()
    
    tables = ['students', 'users', 'mental_health_assessments']
    
    for table in tables:
        print(f"\n📋 Structure of {table} table:")
        try:
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            
            for column in columns:
                field, type_info, null, key, default, extra = column
                print(f"   - {field}: {type_info}")
                
            # Get sample data
            print(f"\n📊 Sample data from {table}:")
            cursor.execute(f"SELECT * FROM {table} LIMIT 3")
            rows = cursor.fetchall()
            
            if rows:
                for i, row in enumerate(rows):
                    print(f"   Row {i+1}: {row}")
            else:
                print("   No data found")
                
        except Exception as e:
            print(f"❌ Error checking {table}: {e}")
    
    cursor.close()
    connection.close()

if __name__ == "__main__":
    check_table_structures()
