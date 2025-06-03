import sqlite3

conn = sqlite3.connect('backend/counseling_system.db')
cursor = conn.cursor()

print('=== DATABASE TABLES ===')
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
for table in tables:
    print('Table:', table[0])

print('\n=== CHECKING FOR CAREER-RELATED TABLES ===')
for table in tables:
    table_name = table[0]
    if 'career' in table_name.lower():
        print(f'\nFound career table: {table_name}')
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        print('Columns:')
        for col in columns:
            print(f"  {col[1]} ({col[2]})")
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f'Records count: {count}')
        
        if count > 0:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            records = cursor.fetchall()
            print('Sample records:')
            for record in records:
                print(f"  {record}")

conn.close()
