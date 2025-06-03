#!/usr/bin/env python3
import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost', user='admin', password='admin', database='counselorhub')
    cursor = conn.cursor()
    
    # Show complete table structure
    cursor.execute('SHOW CREATE TABLE users')
    result = cursor.fetchone()
    print('Current users table structure:')
    print(result[1])
    
    # Check all indexes
    cursor.execute('SHOW INDEX FROM users')
    indexes = cursor.fetchall()
    print('\nAll indexes on users table:')
    for idx in indexes:
        print(f'  {idx[2]}: {idx[4]} (unique: {idx[1] == 0})')
    
    # Check foreign keys pointing to users
    cursor.execute("""
        SELECT 
            TABLE_NAME,
            COLUMN_NAME,
            CONSTRAINT_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
        AND REFERENCED_TABLE_NAME = 'users'
    """)
    fks = cursor.fetchall()
    print('\nForeign keys referencing users:')
    for fk in fks:
        print(f'  {fk[0]}.{fk[1]} -> {fk[3]}.{fk[4]} ({fk[2]})')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
