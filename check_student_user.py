#!/usr/bin/env python3
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', 
    user='admin', 
    password='admin', 
    database='counselorhub'
)

cursor = conn.cursor(dictionary=True)

# Get student data
cursor.execute('SELECT * FROM students WHERE student_id = %s', ('TST999',))
student = cursor.fetchone()

print('Student data:')
for k, v in student.items():
    print(f'{k}: {v}')

# Get user data
cursor.execute('SELECT * FROM users WHERE id = %s', (student['user_id'],))
user = cursor.fetchone()

print('\nUser data:')
for k, v in user.items():
    print(f'{k}: {v}')

conn.close()
