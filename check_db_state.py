#!/usr/bin/env python3
import mysql.connector

try:
    conn = mysql.connector.connect(host='localhost', user='admin', password='admin', database='counselorhub')
    cursor = conn.cursor()
    
    cursor.execute('SHOW TABLES')
    tables = cursor.fetchall()
    print('Available tables:', [t[0] for t in tables])
    
    cursor.execute('DESCRIBE users')
    columns = cursor.fetchall()
    print('\nCurrent users table structure:')
    for col in columns:
        print(f'  {col[0]}: {col[1]} {col[2]} {col[3]} {col[4]} {col[5]}')
    
    cursor.execute("SHOW INDEX FROM users WHERE Key_name = 'PRIMARY'")
    pk = cursor.fetchall()
    print('\nCurrent primary key:', [p[4] for p in pk])
    
    cursor.execute('SELECT COUNT(*) FROM users')
    count = cursor.fetchone()[0]
    print(f'\nUser count: {count}')
    
    conn.close()
except Exception as e:
    print(f'Error: {e}')
