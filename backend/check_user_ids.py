import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='localhost',
        database='test',
        user='root',
        password='',
        autocommit=True
    )
    cursor = connection.cursor(dictionary=True)
    
    print('Current student user IDs:')
    cursor.execute("SELECT user_id FROM users WHERE user_id LIKE 'STU%' ORDER BY user_id DESC LIMIT 10")
    student_users = cursor.fetchall()
    for user in student_users:
        print(f"  {user['user_id']}")
    
    print('\nNumeric student user IDs:')
    cursor.execute("SELECT user_id FROM users WHERE user_id REGEXP '^STU[0-9]+$' ORDER BY user_id DESC LIMIT 5")
    numeric_students = cursor.fetchall()
    for user in numeric_students:
        print(f"  {user['user_id']}")
        
    cursor.close()
    connection.close()
    
except Error as e:
    print(f'Error: {e}')
