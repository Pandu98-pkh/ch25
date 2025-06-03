#!/usr/bin/env python3
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', 
    user='admin', 
    password='admin', 
    database='counselorhub'
)

cursor = conn.cursor(dictionary=True)

print('=== Students in Class 1 ===')
cursor.execute('SELECT s.student_id, s.user_id, s.class_id, u.name, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id WHERE s.class_id = 1')
class1_students = cursor.fetchall()
for student in class1_students:
    print(f'Student ID: {student["student_id"]}, User ID: {student["user_id"]}, Class ID: {student["class_id"]}, Name: {student["name"]}, Email: {student["email"]}')

print('\n=== All Classes ===')
cursor.execute('SELECT * FROM classes')
classes = cursor.fetchall()
for cls in classes:
    print(f'Class ID: {cls["id"]}, School ID: {cls["school_id"]}, Name: {cls["name"]}')

print('\n=== Count Students per Class ===')
cursor.execute('SELECT class_id, COUNT(*) as count FROM students GROUP BY class_id')
class_counts = cursor.fetchall()
for count in class_counts:
    print(f'Class ID: {count["class_id"]}, Student Count: {count["count"]}')

conn.close()
