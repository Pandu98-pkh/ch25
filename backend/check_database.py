import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        autocommit=True
    )
    cursor = connection.cursor()
    
    print('Available databases:')
    cursor.execute("SHOW DATABASES")
    databases = cursor.fetchall()
    for db in databases:
        print(f"  {db[0]}")
    
    # Connect to counselorhub database
    cursor.execute("USE counselorhub")
    
    print('\nTables in counselorhub database:')
    cursor.execute("SHOW TABLES")
    tables = cursor.fetchall()
    for table in tables:
        print(f"  {table[0]}")
    
    # Check student user IDs
    cursor = connection.cursor(dictionary=True)
    print('\nCurrent student user IDs:')
    cursor.execute("SELECT user_id FROM users WHERE user_id LIKE 'STU%' ORDER BY user_id DESC LIMIT 10")
    student_users = cursor.fetchall()
    for user in student_users:
        print(f"  {user['user_id']}")
        
    cursor.close()
    connection.close()
    
except Error as e:
    print(f'Error: {e}')
