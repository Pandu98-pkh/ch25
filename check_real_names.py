#!/usr/bin/env python3
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', 
    user='admin', 
    password='admin', 
    database='counselorhub'
)

cursor = conn.cursor(dictionary=True)

print('=== Students with Real Names ===')
cursor.execute("SELECT s.student_id, s.class_id, u.name, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE u.name NOT LIKE 'Student %' AND u.name IS NOT NULL")
real_name_students = cursor.fetchall()
for student in real_name_students:
    print(f'Student ID: {student["student_id"]}, Class ID: {student["class_id"]}, Name: {student["name"]}, Email: {student["email"]}')

conn.close()
