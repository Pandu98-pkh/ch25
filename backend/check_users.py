import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

try:
    connection = mysql.connector.connect(
        host=os.getenv('DB_HOST', 'localhost'),
        database=os.getenv('DB_NAME', 'student_portal'),
        user=os.getenv('DB_USER', 'root'),
        password=os.getenv('DB_PASSWORD', '')
    )
    
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT user_id, username, email, name, role FROM users WHERE is_active = TRUE LIMIT 5')
    users = cursor.fetchall()
    
    print('Available test users:')
    for user in users:
        print(f"- {user['username']} ({user['role']}) - {user['name']}")
        
except Exception as e:
    print(f'Error: {e}')
finally:
    if 'connection' in locals() and connection.is_connected():
        cursor.close()
        connection.close()
