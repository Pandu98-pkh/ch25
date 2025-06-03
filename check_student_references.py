#!/usr/bin/env python3
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', user='admin', password='admin', database='counselorhub'
)
cursor = conn.cursor(dictionary=True)

# Check which tables reference students.id
cursor.execute("""
    SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
    AND REFERENCED_TABLE_NAME = 'students'
    AND REFERENCED_COLUMN_NAME = 'id'
""")

fks = cursor.fetchall()
print('Tables referencing students.id:')
for fk in fks:
    print(f'  {fk["TABLE_NAME"]}.{fk["COLUMN_NAME"]} -> students.id ({fk["CONSTRAINT_NAME"]})')

# Also check what columns in those tables store student references
print('\nChecking column types in referencing tables:')
for fk in fks:
    cursor.execute(f"DESCRIBE {fk['TABLE_NAME']}")
    columns = cursor.fetchall()
    for col in columns:
        if col['Field'] == fk['COLUMN_NAME']:
            print(f'  {fk["TABLE_NAME"]}.{fk["COLUMN_NAME"]}: {col["Type"]}')

cursor.close()
conn.close()
