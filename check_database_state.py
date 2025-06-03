#!/usr/bin/env python3
import mysql.connector

conn = mysql.connector.connect(
    host='localhost', 
    user='admin', 
    password='admin', 
    database='counselorhub'
)

cursor = conn.cursor(dictionary=True)

print('=== Students Table Data ===')
cursor.execute('SELECT id, student_id, user_id, tingkat, kelas FROM students LIMIT 10')
students = cursor.fetchall()
for student in students:
    print(f'ID: {student["id"]}, Student ID: {student["student_id"]}, User ID: {student["user_id"]}, Grade: {student["tingkat"]}, Class: {student["kelas"]}')

print('\n=== Users Table Data (Students Only) ===')
cursor.execute('SELECT id, user_id, name, email FROM users WHERE role = "student" LIMIT 10')
users = cursor.fetchall()
for user in users:
    print(f'ID: {user["id"]}, User ID: {user["user_id"]}, Name: {user["name"]}, Email: {user["email"]}')

print('\n=== JOIN Test ===')
cursor.execute('SELECT s.student_id, s.user_id, u.name, u.email FROM students s LEFT JOIN users u ON s.user_id = u.id LIMIT 10')
joined = cursor.fetchall()
for row in joined:
    print(f'Student ID: {row["student_id"]}, User ID: {row["user_id"]}, Name: {row["name"]}, Email: {row["email"]}')

conn.close()
