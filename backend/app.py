#!/usr/bin/env python3
"""
CounselorHub Backend API Server
Flask REST API server for the CounselorHub student counseling system
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import bcrypt
import uuid
from datetime import datetime, date
import json
import logging
from image_service import image_service
from werkzeug.exceptions import RequestEntityTooLarge
from flask import send_file, abort
import os
import time

app = Flask(__name__)
# Konfigurasi CORS yang lebih spesifik untuk ngrok
CORS(app, 
     origins=['https://counselor-hub.netlify.app', 'http://localhost:3000'],
     allow_headers=['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Get database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return None

def dict_factory(cursor, row):
    """Convert MySQL row to dictionary"""
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))

# Error handlers
@app.errorhandler(400)
def bad_request(error):
    return jsonify({'error': 'Bad request'}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    connection = get_db_connection()
    if connection:
        connection.close()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'timestamp': datetime.now().isoformat()
        }), 500

# User Management Endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, username, email, name, role, photo, is_active, created_at
            FROM users 
            WHERE is_active = TRUE
            ORDER BY role, name
        """)
        
        users = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for user in users:
            result.append({
                'userId': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'photo': user['photo'],
                'id': user['user_id']  # For compatibility
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching users: {e}")
        return jsonify({'error': 'Failed to fetch users'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, username, email, name, role, photo, is_active, created_at
            FROM users 
            WHERE user_id = %s AND is_active = TRUE
        """, (user_id,))
        
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        result = {
            'userId': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'photo': user['photo'],
            'id': user['user_id']  # For compatibility
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching user {user_id}: {e}")
        return jsonify({'error': 'Failed to fetch user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['name', 'email', 'role']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Use provided userId or generate one
        user_id = data.get('userId')
        
        # Check if userId, email, or username already exists
        if user_id:
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
            if cursor.fetchone():
                return jsonify({'error': f'User ID {user_id} already exists'}), 400
        
        cursor.execute("""
            SELECT user_id FROM users 
            WHERE email = %s OR username = %s
        """, (data['email'], data.get('username', '')))
        
        if cursor.fetchone():
            return jsonify({'error': 'User with this email or username already exists'}), 400
        
        # Generate user_id if not provided
        if not user_id:
            role = data['role'].lower()
            if role == 'admin':
                cursor.execute("SELECT user_id FROM users WHERE user_id LIKE 'ADM%' ORDER BY user_id DESC LIMIT 1")
                last_admin = cursor.fetchone()
                if last_admin:
                    last_num = int(last_admin['user_id'][3:])
                    user_id = f"ADM{str(last_num + 1).zfill(3)}"
                else:
                    user_id = "ADM001"
            elif role == 'counselor':
                cursor.execute("SELECT user_id FROM users WHERE user_id LIKE 'USR%' ORDER BY user_id DESC LIMIT 1")
                last_user = cursor.fetchone()
                if last_user:
                    last_num = int(last_user['user_id'][3:])
                    user_id = f"USR{str(last_num + 1).zfill(3)}"
                else:
                    user_id = "USR004"  # Start from USR004 since USR001-003 exist
            else:
                user_id = f"STU{uuid.uuid4().hex[:5].upper()}"
        
        # Generate username if not provided
        username = data.get('username')
        if not username:
            base_username = data['name'].lower().replace(' ', '')
            username = base_username
            counter = 1
            while True:
                cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
                if not cursor.fetchone():
                    break
                username = f"{base_username}{counter}"
                counter += 1
        
        # Hash password
        password = data.get('password', 'password123')
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert new user
        cursor.execute("""
            INSERT INTO users (user_id, username, email, password_hash, name, role, photo)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            user_id, 
            username, 
            data['email'], 
            password_hash,
            data['name'], 
            data['role'], 
            data.get('photo')
        ))
        
        connection.commit()
        
        # Return the created user
        result = {
            'userId': user_id,
            'username': username,
            'email': data['email'],
            'name': data['name'],
            'role': data['role'],
            'photo': data.get('photo'),
            'id': user_id  # For compatibility
        }
        
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Error creating user: {e}")
        return jsonify({'error': 'Failed to create user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update an existing user"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Check if user exists
        cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'User not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = %s')
            update_values.append(data['name'])
        
        if 'email' in data:
            # Check if email is already used by another user
            cursor.execute("SELECT user_id FROM users WHERE email = %s AND user_id != %s", (data['email'], user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Email already in use by another user'}), 400
            update_fields.append('email = %s')
            update_values.append(data['email'])
        
        if 'username' in data:
            # Check if username is already used by another user
            cursor.execute("SELECT user_id FROM users WHERE username = %s AND user_id != %s", (data['username'], user_id))
            if cursor.fetchone():
                return jsonify({'error': 'Username already in use by another user'}), 400
            update_fields.append('username = %s')
            update_values.append(data['username'])
        
        if 'role' in data:
            update_fields.append('role = %s')
            update_values.append(data['role'])
        
        if 'photo' in data:
            update_fields.append('photo = %s')
            update_values.append(data['photo'])
        
        if 'password' in data and data['password']:
            password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            update_fields.append('password_hash = %s')
            update_values.append(password_hash)
        
        if not update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Add updated_at
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.append(user_id)
        
        # Execute update
        query = f"UPDATE users SET {', '.join(update_fields)} WHERE user_id = %s"
        cursor.execute(query, update_values)
        connection.commit()
        
        # Return updated user
        cursor.execute("""
            SELECT user_id, username, email, name, role, photo, is_active, created_at
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        user = cursor.fetchone()
        result = {
            'userId': user['user_id'],
            'username': user['username'],
            'email': user['email'],
            'name': user['name'],
            'role': user['role'],
            'photo': user['photo'],
            'id': user['user_id']  # For compatibility
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating user {user_id}: {e}")
        return jsonify({'error': 'Failed to update user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete a user (soft delete)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists and get their role
        cursor.execute("SELECT role FROM users WHERE user_id = %s AND is_active = TRUE", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent deleting the last admin
        if user['role'] == 'admin':
            cursor.execute("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND is_active = TRUE")
            admin_count = cursor.fetchone()['count']
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        # Soft delete the user
        cursor.execute("UPDATE users SET is_active = FALSE WHERE user_id = %s", (user_id,))
        connection.commit()
        
        return jsonify({'message': 'User deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting user {user_id}: {e}")
        return jsonify({'error': 'Failed to delete user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Authentication endpoint
@app.route('/api/users/auth/login', methods=['POST'])
def login():
    """Authenticate user login"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get user by username
        cursor.execute("""
            SELECT user_id, username, email, password_hash, name, role, photo
            FROM users 
            WHERE username = %s AND is_active = TRUE
        """, (data['username'],))
        
        user = cursor.fetchone()
        if not user:
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Verify password
        if not bcrypt.checkpw(data['password'].encode('utf-8'), user['password_hash'].encode('utf-8')):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Return user data (excluding password)
        result = {
            'user': {
                'userId': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'photo': user['photo'],
                'id': user['user_id']  # For compatibility
            }
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error during authentication: {e}")
        return jsonify({'error': 'Authentication failed'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Counselors Endpoint
@app.route('/api/counselors', methods=['GET'])
def get_counselors():
    """Get all active counselors"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, name, email, photo
            FROM users 
            WHERE role = 'counselor' AND is_active = TRUE
            ORDER BY name
        """)
        
        counselors = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for counselor in counselors:
            result.append({
                'id': counselor['user_id'],
                'name': counselor['name'],
                'email': counselor['email'],
                'photo': counselor['photo']
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching counselors: {e}")
        return jsonify({'error': 'Failed to fetch counselors'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Classes Management Endpoints
@app.route('/api/classes', methods=['GET'])
def get_classes():
    """Get all classes with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters for filtering
        search_query = request.args.get('searchQuery', '')
        grade = request.args.get('grade', '')
        academic_year = request.args.get('academicYear', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 12))
        
        # Build WHERE clause
        where_conditions = ['is_active = TRUE']
        params = []
        
        if search_query:
            where_conditions.append('name LIKE %s')
            params.append(f'%{search_query}%')
        
        if grade:
            where_conditions.append('grade_level = %s')
            params.append(grade)
        
        if academic_year:
            where_conditions.append('academic_year = %s')
            params.append(academic_year)
        
        where_clause = ' AND '.join(where_conditions)
        
        # Count total records
        count_query = f"SELECT COUNT(*) as total FROM classes WHERE {where_clause}"
        cursor.execute(count_query, params)
        total_records = cursor.fetchone()['total']
        
        # Calculate pagination
        offset = (page - 1) * limit
        total_pages = (total_records + limit - 1) // limit
        # Get classes with pagination
        query = f"""
            SELECT class_id, name, grade_level, student_count, academic_year, 
                   teacher_name, created_at
            FROM classes 
            WHERE {where_clause}
            ORDER BY grade_level, name
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        classes = cursor.fetchall()
          # Convert to frontend format
        result = []
        for class_item in classes:
            result.append({
                'id': class_item['class_id'],  # Use class_id as the primary identifier
                'classId': class_item['class_id'],  # Frontend expects classId
                'schoolId': class_item['class_id'],  # For backward compatibility
                'name': class_item['name'],
                'gradeLevel': class_item['grade_level'],
                'studentCount': class_item['student_count'],
                'academicYear': class_item['academic_year'],
                'teacherName': class_item['teacher_name']
            })
        
        return jsonify({
            'data': result,
            'totalPages': total_pages,
            'currentPage': page,
            'totalRecords': total_records
        })
        
    except Error as e:
        logger.error(f"Error fetching classes: {e}")
        return jsonify({'error': 'Failed to fetch classes'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/classes/<class_id>', methods=['GET'])
def get_class(class_id):
    """Get a specific class by ID"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT class_id, name, grade_level, student_count, academic_year, 
                   teacher_name, created_at
            FROM classes 
            WHERE class_id = %s AND is_active = TRUE
        """, (class_id,))
        
        class_item = cursor.fetchone()
        if not class_item:
            return jsonify({'error': 'Class not found'}), 404
        
        result = {
            'id': class_item['class_id'],
            'schoolId': class_item['class_id'],  # For backward compatibility
            'name': class_item['name'],
            'gradeLevel': class_item['grade_level'],
            'studentCount': class_item['student_count'],
            'academicYear': class_item['academic_year'],
            'teacherName': class_item['teacher_name']
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching class {class_id}: {e}")
        return jsonify({'error': 'Failed to fetch class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/classes', methods=['POST'])
def create_class():
    """Create a new class"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    required_fields = ['name', 'gradeLevel', 'academicYear']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Generate class_id if not provided
        class_id = data.get('schoolId')
        if not class_id:
            # Generate format: C{year}-{grade}-{name}
            year = data['academicYear'].split('/')[0]
            grade = data['gradeLevel']
            name_short = data['name'].replace(' ', '').replace('-', '').upper()
            class_id = f"C{year}-{grade}-{name_short}"
        
        # Check if class_id already exists
        cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (class_id,))
        if cursor.fetchone():
            return jsonify({'error': 'Class with this ID already exists'}), 400
        
        # Insert new class
        cursor.execute("""
            INSERT INTO classes (class_id, name, grade_level, academic_year, teacher_name, student_count)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            class_id,
            data['name'],
            data['gradeLevel'],
            data['academicYear'],
            data.get('teacherName', ''),
            data.get('studentCount', 0)
        ))
        
        connection.commit()
        
        # Return the created class
        result = {
            'id': class_id,
            'schoolId': class_id,  # For backward compatibility
            'name': data['name'],
            'gradeLevel': data['gradeLevel'],
            'studentCount': data.get('studentCount', 0),
            'academicYear': data['academicYear'],
            'teacherName': data.get('teacherName', '')
        }
        
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Error creating class: {e}")
        return jsonify({'error': 'Failed to create class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/classes/<class_id>', methods=['PUT'])
def update_class(class_id):
    """Update an existing class"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if class exists
        cursor.execute("SELECT class_id FROM classes WHERE class_id = %s", (class_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Class not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        update_values = []
        
        if 'name' in data:
            update_fields.append('name = %s')
            update_values.append(data['name'])
        
        if 'gradeLevel' in data:
            update_fields.append('grade_level = %s')
            update_values.append(data['gradeLevel'])
        
        if 'academicYear' in data:
            update_fields.append('academic_year = %s')
            update_values.append(data['academicYear'])
        
        if 'teacherName' in data:
            update_fields.append('teacher_name = %s')
            update_values.append(data['teacherName'])
        
        if 'studentCount' in data:
            update_fields.append('student_count = %s')
            update_values.append(data['studentCount'])
        
        if not update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Add updated_at
        update_fields.append('updated_at = CURRENT_TIMESTAMP')
        update_values.append(class_id)
        
        # Execute update
        query = f"UPDATE classes SET {', '.join(update_fields)} WHERE class_id = %s"
        cursor.execute(query, update_values)
        connection.commit()
        
        # Return updated class
        cursor.execute("""
            SELECT class_id, name, grade_level, student_count, academic_year, 
                   teacher_name, created_at
            FROM classes 
            WHERE class_id = %s
        """, (class_id,))
        
        class_item = cursor.fetchone()
        result = {
            'id': class_item['class_id'],
            'schoolId': class_item['class_id'],  # For backward compatibility
            'name': class_item['name'],
            'gradeLevel': class_item['grade_level'],
            'studentCount': class_item['student_count'],
            'academicYear': class_item['academic_year'],
            'teacherName': class_item['teacher_name']
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating class {class_id}: {e}")
        return jsonify({'error': 'Failed to update class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/classes/<class_id>', methods=['DELETE'])
def delete_class(class_id):
    """Delete a class (soft delete)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if class exists
        cursor.execute("SELECT class_id FROM classes WHERE class_id = %s AND is_active = TRUE", (class_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Class not found'}), 404
        
        # Check if class has students
        cursor.execute("SELECT COUNT(*) as count FROM students WHERE class_id = %s AND is_active = TRUE", (class_id,))
        student_count = cursor.fetchone()['count']
        if student_count > 0:
            return jsonify({'error': f'Cannot delete class with {student_count} students. Remove students first.'}), 400
        
        # Soft delete the class
        cursor.execute("UPDATE classes SET is_active = FALSE WHERE class_id = %s", (class_id,))
        connection.commit()
        
        return jsonify({'message': 'Class deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting class {class_id}: {e}")
        return jsonify({'error': 'Failed to delete class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/classes/deleted', methods=['GET'])
def get_deleted_classes():
    """Get all deleted classes (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get deleted classes
        cursor.execute("""
            SELECT class_id, name, grade_level, academic_year, teacher_name, student_count,
                   created_at, updated_at
            FROM classes
            WHERE is_active = 0
            ORDER BY updated_at DESC
        """)
        
        deleted_classes = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for class_item in deleted_classes:
            result.append({
                'id': class_item['class_id'],
                'schoolId': class_item['class_id'],  # For backward compatibility
                'name': class_item['name'] if class_item['name'] else 'Unknown Class',
                'gradeLevel': class_item['grade_level'],
                'academicYear': class_item['academic_year'],
                'teacherName': class_item['teacher_name'],
                'studentCount': class_item['student_count'] if class_item['student_count'] else 0,
                'isActive': False,
                'createdAt': class_item['created_at'].isoformat() if class_item['created_at'] else None,
                'deletedAt': class_item['updated_at'].isoformat() if class_item['updated_at'] else None
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error getting deleted classes: {e}")
        return jsonify({'error': 'Failed to get deleted classes'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/classes/<class_id>/restore', methods=['PUT'])
def restore_class(class_id):
    """Restore a deleted class (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if class exists and is deleted
        cursor.execute("""
            SELECT class_id, name, grade_level, academic_year, is_active
            FROM classes
            WHERE class_id = %s
        """, (class_id,))
        
        class_item = cursor.fetchone()
        
        if not class_item:
            return jsonify({'error': 'Class not found'}), 404
        
        if class_item['is_active']:
            return jsonify({'error': 'Class is already active'}), 400
        
        # Restore the class
        cursor.execute("""
            UPDATE classes 
            SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE class_id = %s
        """, (class_id,))
        
        connection.commit()
        
        # Get updated class info
        cursor.execute("""
            SELECT class_id, name, grade_level, academic_year, teacher_name, student_count
            FROM classes
            WHERE class_id = %s
        """, (class_id,))
        
        restored_class = cursor.fetchone()
        
        result = {
            'id': restored_class['class_id'],
            'name': restored_class['name'] if restored_class['name'] else 'Unknown Class',
            'gradeLevel': restored_class['grade_level'],
            'academicYear': restored_class['academic_year'],
            'teacherName': restored_class['teacher_name'],
            'studentCount': restored_class['student_count'] if restored_class['student_count'] else 0
        }
        
        return jsonify({
            'message': f'Class {restored_class["name"] if restored_class["name"] else "Unknown"} restored successfully',
            'class': result
        })
        
    except Error as e:
        logger.error(f"Error restoring class {class_id}: {e}")
        return jsonify({'error': 'Failed to restore class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/classes/<class_id>/hard-delete', methods=['DELETE'])
def hard_delete_class(class_id):
    """Permanently delete a class (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if class exists
        cursor.execute("""
            SELECT class_id, name
            FROM classes
            WHERE class_id = %s
        """, (class_id,))
        
        class_item = cursor.fetchone()
        
        if not class_item:
            return jsonify({'error': 'Class not found'}), 404
        
        # Check if class has any students (even deleted ones)
        cursor.execute("SELECT COUNT(*) as count FROM students WHERE class_id = %s", (class_id,))
        student_count = cursor.fetchone()['count']
        if student_count > 0:
            return jsonify({'error': f'Cannot permanently delete class with {student_count} student records. Remove all student records first.'}), 400
        
        # Permanently delete the class
        cursor.execute("DELETE FROM classes WHERE class_id = %s", (class_id,))
        
        connection.commit()
        
        return jsonify({
            'message': f'Class {class_item["name"] if class_item["name"] else "Unknown"} permanently deleted from database',
            'warning': 'This action cannot be undone.'
        })
        
    except Error as e:
        logger.error(f"Error hard deleting class {class_id}: {e}")
        return jsonify({'error': 'Failed to permanently delete class'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/classes/<class_id>/students', methods=['GET'])
def get_class_students(class_id):
    """Get students in a specific class with detailed user information"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)        # Get students in the class with their user information
        cursor.execute("""
            SELECT s.student_id, s.academic_status, s.program,
                   s.mental_health_score, s.is_active, s.created_at, s.updated_at,
                   u.user_id, u.username, u.email, u.name, u.photo,
                   c.grade_level as tingkat, c.name as kelas            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.class_id = %s AND s.is_active = 1
            ORDER BY u.name
        """, (class_id,))
        
        students = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for student in students:
            result.append({
                'id': student['student_id'],
                'studentId': student['student_id'],
                'name': student['name'] if student['name'] else f'Student {student["student_id"]}',
                'email': student['email'] if student['email'] else '',
                'username': student['username'] if student['username'] else '',
                'tingkat': student['tingkat'],
                'kelas': student['kelas'],
                'grade': student['tingkat'],
                'class': student['kelas'],
                'academicStatus': student['academic_status'],
                'program': student['program'],
                'mentalHealthScore': student['mental_health_score'],
                'photo': student['photo'],
                'avatar': student['photo'],
                'isActive': bool(student['is_active']),
                'createdAt': student['created_at'].isoformat() if student['created_at'] else None,
                'updatedAt': student['updated_at'].isoformat() if student['updated_at'] else None,
                'userId': student['user_id']
            })
        
        return jsonify({
            'students': result,
            'count': len(result)
        })
        
    except Error as e:
        logger.error(f"Error getting students for class {class_id}: {e}")
        return jsonify({'error': 'Failed to get class students'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Students Management Endpoints
@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)        # Get query parameters for filtering
        search_query = request.args.get('searchQuery', '')
        grade_level = request.args.get('tingkat', '')  # renamed from tingkat to match classes table
        class_name = request.args.get('kelas', '')     # renamed from kelas to match classes table
        academic_status = request.args.get('academicStatus', '')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))  # Changed default from 12 to 50 for better performance
        
        # Build WHERE clause
        where_conditions = ['s.is_active = TRUE']
        params = []
        
        if search_query:
            where_conditions.append('(u.name LIKE %s OR u.email LIKE %s OR s.student_id LIKE %s)')
            params.extend([f'%{search_query}%', f'%{search_query}%', f'%{search_query}%'])
        
        if grade_level:
            where_conditions.append('c.grade_level = %s')
            params.append(grade_level)
        
        if class_name:
            where_conditions.append('c.name LIKE %s')
            params.append(f'%{class_name}%')
            
        if academic_status:
            where_conditions.append('s.academic_status = %s')
            params.append(academic_status)
        
        where_clause = ' AND '.join(where_conditions)
        # Count total records
        count_query = f"""
            SELECT COUNT(*) as total            FROM students s
            JOIN users u ON s.user_id = u.user_id 
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE {where_clause}
        """
        cursor.execute(count_query, params)
        total_records = cursor.fetchone()['total']
        
        # Calculate pagination
        offset = (page - 1) * limit
        total_pages = (total_records + limit - 1) // limit
        # Get students with pagination using JOIN
        query = f"""
            SELECT 
                s.student_id, s.academic_status, s.class_id,
                s.program, s.mental_health_score, s.last_counseling, s.created_at,
                u.name, u.email, u.photo as avatar,
                c.grade_level as tingkat, c.name as kelas
            FROM students s            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE {where_clause}
            ORDER BY c.grade_level, c.name, u.name
            LIMIT %s OFFSET %s
        """
        cursor.execute(query, params + [limit, offset])
        students = cursor.fetchall()
        # Convert to frontend format
        result = []
        for student in students:
            result.append({
                'id': student['student_id'],  # Use student_id as primary key
                'studentId': student['student_id'],
                'name': student['name'],
                'email': student['email'],
                'tingkat': student['tingkat'],
                'kelas': student['kelas'],
                'academicStatus': student['academic_status'],
                'avatar': student['avatar'],
                'grade': student['tingkat'],  # For compatibility
                'class': student['kelas'],    # For compatibility
                'photo': student['avatar'],   # For compatibility
                'program': student['program'],
                'mentalHealthScore': student['mental_health_score'],
                'lastCounseling': student['last_counseling'].isoformat() if student['last_counseling'] else None
            })
        
        return jsonify({
            'data': result,
            'totalPages': total_pages,
            'currentPage': page,
            'totalRecords': total_records,
            'count': len(result)
        })
        
    except Error as e:
        logger.error(f"Error fetching students: {e}")
        return jsonify({'error': 'Failed to fetch students'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/<student_id>', methods=['GET'])
def get_student(student_id):
    """Get a specific student by ID"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)          # Get student data with user info via JOIN
        cursor.execute("""
            SELECT 
                s.student_id, s.academic_status, s.class_id,
                s.program, s.mental_health_score, s.last_counseling, s.created_at,
                u.name, u.email, u.photo as avatar,
                c.grade_level as tingkat, c.name as kelas            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s AND s.is_active = TRUE
        """, (student_id,))
        
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        # Convert to frontend format
        result = {
            'id': student['student_id'],  # Use student_id as primary key
            'studentId': student['student_id'],
            'name': student['name'],
            'email': student['email'],
            'tingkat': student['tingkat'],
            'kelas': student['kelas'],
            'academicStatus': student['academic_status'],
            'avatar': student['avatar'],
            'grade': student['tingkat'],  # For compatibility
            'class': student['kelas'],    # For compatibility
            'photo': student['avatar'],   # For compatibility
            'program': student['program'],
            'mentalHealthScore': student['mental_health_score'],
            'lastCounseling': student['last_counseling'].isoformat() if student['last_counseling'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching student {student_id}: {e}")
        return jsonify({'error': 'Failed to fetch student'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/by-user/<user_id>', methods=['GET'])
def get_student_by_user_id(user_id):
    """Get a student by their user_id"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get student data by user_id with user info via JOIN
        cursor.execute("""
            SELECT 
                s.student_id, s.academic_status, s.class_id,
                s.program, s.mental_health_score, s.last_counseling, s.created_at,
                u.name, u.email, u.photo as avatar,
                c.grade_level as tingkat, c.name as kelas
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.user_id = %s AND s.is_active = TRUE
        """, (user_id,))
        
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': 'Student not found for this user'}), 404
            
        # Convert to frontend format
        result = {
            'id': student['student_id'],  # Use student_id as primary key
            'studentId': student['student_id'],
            'name': student['name'],
            'email': student['email'],
            'tingkat': student['tingkat'],
            'kelas': student['kelas'],
            'academicStatus': student['academic_status'],
            'avatar': student['avatar'],
            'grade': student['tingkat'],  # For compatibility
            'class': student['kelas'],    # For compatibility
            'photo': student['avatar'],   # For compatibility
            'program': student['program'],
            'mentalHealthScore': student['mental_health_score'],
            'lastCounseling': student['last_counseling'].isoformat() if student['last_counseling'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching student for user {user_id}: {e}")
        return jsonify({'error': 'Failed to fetch student'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students', methods=['POST'])
def create_student():
    """Create a new student with normalized schema (user_id foreign key)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    required_fields = ['name', 'email', 'classId']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Generate student_id if not provided
        student_id = data.get('studentId')
        if not student_id:
            # Generate format: S{year}{random}
            current_year = datetime.now().year
            student_id = f"S{current_year}{uuid.uuid4().hex[:5].upper()}"
        
        # Check if student_id already exists
        cursor.execute("SELECT student_id FROM students WHERE student_id = %s", (student_id,))
        if cursor.fetchone():
            return jsonify({'error': 'Student with this ID already exists'}), 400          # Check if email already exists in users table
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (data['email'],))
        existing_user = cursor.fetchone()
        if existing_user:
            user_id = existing_user['user_id']# Check if this user is already a student
            cursor.execute("SELECT student_id FROM students WHERE user_id = %s", (user_id,))
            if cursor.fetchone():
                return jsonify({
                    'error': 'USER_ALREADY_EXISTS',
                    'message': 'User dengan email ini sudah terdaftar sebagai siswa',
                    'showModal': True
                }), 409  # Use 409 Conflict status
        else:
            # Create new user record first            # Generate user_id for student
            # Look for numeric student IDs first (STU001, STU002, etc.)
            cursor.execute("SELECT user_id FROM users WHERE user_id REGEXP '^STU[0-9]+$' ORDER BY user_id DESC LIMIT 1")
            last_numeric_student = cursor.fetchone()
            
            if last_numeric_student:
                # Extract numeric part and increment
                last_num = int(last_numeric_student['user_id'][3:])
                user_id_str = f"STU{str(last_num + 1).zfill(3)}"
            else:
                # No numeric IDs found, start from STU001
                user_id_str = "STU001"
            
            # Ensure the generated ID doesn't already exist
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (user_id_str,))
            if cursor.fetchone():
                # If it exists, generate a random hex-based ID as fallback
                import random
                import string
                hex_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
                user_id_str = f"STU{hex_part}"
              # Generate username
            base_username = data['name'].lower().replace(' ', '')
            username = base_username
            counter = 1            
            while True:
                cursor.execute("SELECT user_id FROM users WHERE username = %s", (username,))
                if not cursor.fetchone():
                    break
                username = f"{base_username}{counter}"
                counter += 1
              # Hash default password
            password_hash = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Insert new user
            cursor.execute("""
                INSERT INTO users (user_id, username, email, password_hash, name, role, photo)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                user_id_str,
                username,
                data['email'],
                password_hash,
                data['name'],
                'student',
                data.get('avatar', '')
            ))
            
            user_id = user_id_str  # Use the user_id string we just inserted
        # Insert new student record with user_id foreign key
        cursor.execute("""
            INSERT INTO students (student_id, user_id, class_id, academic_status, program)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            student_id,
            user_id,
            data.get('classId'),
            data.get('academicStatus', 'good'),
            data.get('program', '')
        ))
        
        student_db_id = cursor.lastrowid
        connection.commit()        # Return the created student with joined user data
        cursor.execute("""
            SELECT s.student_id, s.academic_status, s.class_id,
                   s.program, s.mental_health_score, s.last_counseling, s.created_at,
                   u.name, u.email, u.photo as avatar,
                   c.grade_level as tingkat, c.name as kelas            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        """, (student_id,))
        
        created_student = cursor.fetchone()
        result = {
            'id': created_student['student_id'],  # Use student_id as primary key
            'studentId': created_student['student_id'],
            'name': created_student['name'],
            'email': created_student['email'],
            'tingkat': created_student['tingkat'],
            'kelas': created_student['kelas'],
            'academicStatus': created_student['academic_status'],
            'avatar': created_student['avatar'],
            'grade': created_student['tingkat'],  # For compatibility
            'class': created_student['kelas'],    # For compatibility
            'photo': created_student['avatar'],   # For compatibility
            'program': created_student['program'],
            'mentalHealthScore': created_student['mental_health_score'],
            'lastCounseling': created_student['last_counseling'].isoformat() if created_student['last_counseling'] else None
        }
        
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Error creating student: {e}")
        return jsonify({'error': 'Failed to create student'}), 500    
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/batch', methods=['POST'])
def create_students_batch():
    """
    Create multiple students in batch using existing User IDs
    IMPORTANT: This endpoint now expects existing User IDs from the users table
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    students_data = data.get('students', [])
    if not students_data:
        return jsonify({'error': 'No students data provided'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        created_students = []
        errors = []
        
        for i, student_data in enumerate(students_data):
            try:
                # Validate required fields - now including userId
                required_fields = ['userId', 'name', 'email', 'tingkat', 'kelas']
                for field in required_fields:
                    if field not in student_data:
                        errors.append(f'Student {i+1}: Missing required field: {field}')
                        continue
                
                # CRITICAL: Use the provided userId as studentId (no generation)
                user_id = student_data['userId']
                student_id = user_id  # Use existing User ID as Student ID
                
                # Verify that the user exists in the users table
                cursor.execute("SELECT user_id, name, email, role FROM users WHERE user_id = %s", (user_id,))
                existing_user = cursor.fetchone()
                if not existing_user:
                    errors.append(f'Student {i+1}: User with ID {user_id} does not exist in users table')
                    continue
                
                # Check if this user is already a student
                cursor.execute("SELECT student_id FROM students WHERE user_id = %s OR student_id = %s", (user_id, student_id))
                if cursor.fetchone():
                    errors.append(f'Student {i+1}: User with ID {user_id} is already registered as a student')
                    continue
                
                # Find or create class_id based on tingkat and kelas
                cursor.execute("SELECT class_id FROM classes WHERE grade_level = %s AND name = %s", 
                             (student_data['tingkat'], student_data['kelas']))
                class_record = cursor.fetchone()
                
                if not class_record:
                    errors.append(f'Student {i+1}: Class {student_data["tingkat"]}-{student_data["kelas"]} not found')
                    continue
                
                class_id = class_record['class_id']                
                # Insert new student record using existing user_id as student_id
                cursor.execute("""
                    INSERT INTO students (student_id, user_id, class_id, academic_status, program)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    student_id,  # Use the existing user_id as student_id
                    user_id,     # Reference to the existing user
                    class_id,
                    student_data.get('academicStatus', 'good'),
                    student_data.get('program', '')
                ))
                
                # Get the created student with joined user data
                cursor.execute("""
                    SELECT s.student_id, s.academic_status, s.class_id,
                           s.program, s.mental_health_score, s.last_counseling, s.created_at,
                           u.name, u.email, u.photo as avatar,
                           c.grade_level as tingkat, c.name as kelas
                    FROM students s
                    JOIN users u ON s.user_id = u.user_id
                    LEFT JOIN classes c ON s.class_id = c.class_id
                    WHERE s.student_id = %s
                """, (student_id,))
                
                created_student = cursor.fetchone()
                result = {
                    'id': created_student['student_id'],  # Use student_id as primary key
                    'studentId': created_student['student_id'],
                    'name': created_student['name'],
                    'email': created_student['email'],
                    'tingkat': created_student['tingkat'],
                    'kelas': created_student['kelas'],
                    'academicStatus': created_student['academic_status'],
                    'avatar': created_student['avatar'],
                    'grade': created_student['tingkat'],  # For compatibility
                    'class': created_student['kelas'],    # For compatibility
                    'photo': created_student['avatar'],   # For compatibility
                    'program': created_student['program'],
                    'mentalHealthScore': created_student['mental_health_score'],
                    'lastCounseling': created_student['last_counseling'].isoformat() if created_student['last_counseling'] else None
                }
                
                created_students.append(result)
                
            except Error as e:
                logger.error(f"Error creating student {i+1}: {e}")
                errors.append(f'Student {i+1}: Failed to create student - {str(e)}')
                continue
        
        # Commit all successful creations
        connection.commit()
        
        # Return results
        response = {
            'success': True,
            'created': created_students,
            'createdCount': len(created_students),
            'totalRequested': len(students_data),
            'errors': errors
        }
        
        # Return 207 Multi-Status if there were some errors, 201 if all successful
        status_code = 207 if errors else 201
        return jsonify(response), status_code
        
    except Error as e:
        logger.error(f"Error in batch student creation: {e}")
        return jsonify({'error': 'Failed to create students in batch'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/<student_id>', methods=['PUT'])
def update_student(student_id):
    """Update an existing student with normalized schema (user_id foreign key)"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get student and user data
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.user_id as user_table_id
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.student_id = %s AND s.is_active = TRUE
        """, (student_id,))
        
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Separate fields for students table and users table
        student_update_fields = []
        student_update_values = []
        user_update_fields = []
        user_update_values = []
        
        # Handle user data updates
        if 'name' in data:
            user_update_fields.append('name = %s')
            user_update_values.append(data['name'])
        
        if 'email' in data:
            # Check if email is already used by another user
            cursor.execute("""
                SELECT user_id FROM users 
                WHERE email = %s AND user_id != %s
            """, (data['email'], student['user_table_id']))
            if cursor.fetchone():
                return jsonify({'error': 'Email already exists'}), 400
            
            user_update_fields.append('email = %s')
            user_update_values.append(data['email'])
        
        if 'avatar' in data:
            user_update_fields.append('photo = %s')
            user_update_values.append(data['avatar'])
        # Handle student-specific data updates
        if 'academicStatus' in data:
            student_update_fields.append('academic_status = %s')
            student_update_values.append(data['academicStatus'])
            
        if 'program' in data:
            student_update_fields.append('program = %s')
            student_update_values.append(data['program'])
        
        # Note: tingkat (grade level) and kelas (class name) are stored in the classes table
        # To update these, we would need to update the class_id or modify the classes table
        # For now, we'll skip these fields as they should be handled through class assignment
        
        if not student_update_fields and not user_update_fields:
            return jsonify({'error': 'No valid fields to update'}), 400
        
        # Update users table if needed
        if user_update_fields:
            user_update_fields.append('updated_at = CURRENT_TIMESTAMP')
            user_update_values.append(student['user_table_id'])
            
            user_query = f"UPDATE users SET {', '.join(user_update_fields)} WHERE user_id = %s"
            cursor.execute(user_query, user_update_values)
        
        # Update students table if needed
        if student_update_fields:
            student_update_fields.append('updated_at = CURRENT_TIMESTAMP')
            student_update_values.append(student['student_id'])
            
            student_query = f"UPDATE students SET {', '.join(student_update_fields)} WHERE student_id = %s"
            cursor.execute(student_query, student_update_values)
        
        connection.commit()
        # Return updated student with joined data
        cursor.execute("""
            SELECT s.student_id, s.academic_status,
                   s.program, s.mental_health_score, s.last_counseling, s.created_at,
                   u.name, u.email, u.photo as avatar,
                   c.grade_level as tingkat, c.name as kelas
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        """, (student['student_id'],))
        
        updated_student = cursor.fetchone()
        result = {
            'id': updated_student['student_id'],  # Use student_id as primary key
            'studentId': updated_student['student_id'],
            'name': updated_student['name'],
            'email': updated_student['email'],
            'tingkat': updated_student['tingkat'],
            'kelas': updated_student['kelas'],
            'academicStatus': updated_student['academic_status'],
            'avatar': updated_student['avatar'],
            'grade': updated_student['tingkat'],  # For compatibility
            'class': updated_student['kelas'],    # For compatibility
            'photo': updated_student['avatar'],   # For compatibility
            'program': updated_student['program'],
            'mentalHealthScore': updated_student['mental_health_score'],
            'lastCounseling': updated_student['last_counseling'].isoformat() if updated_student['last_counseling'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating student {student_id}: {e}")
        return jsonify({'error': 'Failed to update student'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/<student_id>', methods=['DELETE'])
def delete_student(student_id):
    """Delete a student (soft delete)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Check if student exists and get user name
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.name            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.student_id = %s AND s.is_active = TRUE AND u.is_active = TRUE
        """, (student_id,))
        student = cursor.fetchone()
        if not student:
            return jsonify({'error': 'Student not found'}), 404
          
        # Soft delete the student only (do not delete the user)
        cursor.execute("""
            UPDATE students 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
            WHERE student_id = %s
        """, (student['student_id'],))
        
        connection.commit()
        
        return jsonify({
            'message': f'Student {student["name"]} deleted successfully'
        })
        
    except Error as e:
        logger.error(f"Error deleting student {student_id}: {e}")
        return jsonify({'error': 'Failed to delete student'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# ===== ADMIN STUDENT ENDPOINTS =====

@app.route('/api/admin/students/deleted', methods=['GET'])
def get_deleted_students():
    """Get all deleted students (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)          # Get deleted students with their user information
        cursor.execute("""
            SELECT s.student_id, s.academic_status, s.program,
                   s.mental_health_score, s.is_active, s.created_at, s.updated_at,
                   u.user_id, u.username, u.email, u.name, u.photo,
                   c.grade_level as tingkat, c.name as kelas            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.is_active = 0
            ORDER BY s.updated_at DESC
        """)
        
        deleted_students = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for student in deleted_students:
            result.append({
                'studentId': student['student_id'],
                'name': student['name'] if student['name'] else 'Unknown Student',
                'email': student['email'] if student['email'] else '',
                'username': student['username'] if student['username'] else '',
                'grade': f"{student['tingkat']}{student['kelas']}" if student['tingkat'] and student['kelas'] else '',
                'academicStatus': student['academic_status'],
                'program': student['program'],
                'mentalHealthScore': student['mental_health_score'],
                'photo': student['photo'],
                'isActive': bool(student['is_active']),
                'createdAt': student['created_at'].isoformat() if student['created_at'] else None,
                'deletedAt': student['updated_at'].isoformat() if student['updated_at'] else None,
                'userId': student['user_id'],
                'id': student['student_id']  # For compatibility
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error getting deleted students: {e}")
        return jsonify({'error': 'Failed to get deleted students'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/students/<student_id>/restore', methods=['PUT'])
def restore_student(student_id):
    """Restore a deleted student (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)        # Check if student exists and is deleted
        cursor.execute("""
            SELECT s.student_id, s.academic_status, s.is_active,
                   u.name, u.email,
                   c.grade_level as tingkat, c.name as kelas
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        """, (student_id,))
        
        student = cursor.fetchone()
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        if student['is_active']:
            return jsonify({'error': 'Student is already active'}), 400
        
        # Restore the student
        cursor.execute("""
            UPDATE students 
            SET is_active = 1, updated_at = CURRENT_TIMESTAMP 
            WHERE student_id = %s
        """, (student_id,))
        
        connection.commit()
        
        # Get updated student info
        cursor.execute("""
            SELECT s.student_id, s.academic_status, s.program,
                   u.name, u.email, u.username,
                   c.grade_level as tingkat, c.name as kelas
            FROM students s
            LEFT JOIN users u ON s.user_id = u.user_id
            LEFT JOIN classes c ON s.class_id = c.class_id
            WHERE s.student_id = %s
        """, (student_id,))
        
        restored_student = cursor.fetchone()
        
        result = {
            'studentId': restored_student['student_id'],
            'name': restored_student['name'] if restored_student['name'] else 'Unknown Student',
            'email': restored_student['email'] if restored_student['email'] else '',
            'username': restored_student['username'] if restored_student['username'] else '',
            'grade': f"{restored_student['tingkat']}{restored_student['kelas']}" if restored_student['tingkat'] and restored_student['kelas'] else '',
            'academicStatus': restored_student['academic_status'],
            'program': restored_student['program'],
            'id': restored_student['student_id']
        }
        
        return jsonify({
            'message': f'Student {restored_student["name"] if restored_student["name"] else "Unknown"} restored successfully',
            'student': result
        })
        
    except Error as e:
        logger.error(f"Error restoring student {student_id}: {e}")
        return jsonify({'error': 'Failed to restore student'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/students/<student_id>/hard-delete', methods=['DELETE'])
def hard_delete_student(student_id):
    """Permanently delete a student and associated user account (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if student exists and get student info
        cursor.execute("""
            SELECT s.student_id, s.user_id, u.name 
            FROM students s 
            LEFT JOIN users u ON s.user_id = u.user_id 
            WHERE s.student_id = %s
        """, (student_id,))
        
        student = cursor.fetchone()
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        # Count related records for confirmation
        cursor.execute("SELECT COUNT(*) as count FROM counseling_sessions WHERE student_id = %s", (student_id,))
        counseling_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM mental_health_assessments WHERE student_id = %s", (student_id,))
        assessment_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM behavior_records WHERE student_id = %s", (student_id,))
        behavior_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM career_assessments WHERE student_id = %s", (student_id,))
        career_count = cursor.fetchone()['count']
        
        # Delete associated records first (respecting foreign key constraints)
        # Order matters: delete child records before parent records
        
        # 1. Delete counseling sessions
        if counseling_count > 0:
            cursor.execute("DELETE FROM counseling_sessions WHERE student_id = %s", (student_id,))
            logger.info(f"Deleted {counseling_count} counseling sessions for student {student_id}")
        
        # 2. Delete mental health assessments
        if assessment_count > 0:
            cursor.execute("DELETE FROM mental_health_assessments WHERE student_id = %s", (student_id,))
            logger.info(f"Deleted {assessment_count} mental health assessments for student {student_id}")
        
        # 3. Delete behavior records
        if behavior_count > 0:
            cursor.execute("DELETE FROM behavior_records WHERE student_id = %s", (student_id,))
            logger.info(f"Deleted {behavior_count} behavior records for student {student_id}")
        
        # 4. Delete career assessments
        if career_count > 0:
            cursor.execute("DELETE FROM career_assessments WHERE student_id = %s", (student_id,))
            logger.info(f"Deleted {career_count} career assessments for student {student_id}")
        
        # 5. Delete any notifications related to the user
        if student['user_id']:
            cursor.execute("DELETE FROM notifications WHERE user_id = %s", (student['user_id'],))
          # 6. Delete the student record (this will also remove the foreign key reference)
        cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
        logger.info(f"Deleted student record {student_id}")
        
        # Note: User record is preserved (not deleted) to maintain user account integrity
        
        connection.commit()
        
        # Prepare detailed response
        total_records = counseling_count + assessment_count + behavior_count + career_count
        
        return jsonify({
            'message': f'Student {student["name"] if student["name"] else "Unknown"} permanently deleted from database',
            'details': {
                'student_id': student_id,
                'user_id': student['user_id'],
                'deleted_records': {
                    'counseling_sessions': counseling_count,
                    'mental_health_assessments': assessment_count,
                    'behavior_records': behavior_count,
                    'career_assessments': career_count,
                    'total': total_records
                }
            },
            'warning': 'This action cannot be undone. Student academic data was permanently deleted, but user account was preserved.'        })
        
    except Error as e:
        logger.error(f"Error hard deleting student {student_id}: {e}")
        connection.rollback()
        return jsonify({'error': f'Failed to permanently delete student: {str(e)}'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/students/bulk-hard-delete', methods=['DELETE'])
def bulk_hard_delete_students():
    """Permanently delete multiple students and their associated data (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        # Get student IDs from request body
        data = request.get_json()
        if not data or 'studentIds' not in data:
            return jsonify({'error': 'Student IDs are required'}), 400
        
        student_ids = data['studentIds']
        if not isinstance(student_ids, list) or not student_ids:
            return jsonify({'error': 'Student IDs must be a non-empty list'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Track results
        deleted_students = []
        not_found = []
        total_records_deleted = {
            'counseling_sessions': 0,
            'mental_health_assessments': 0,
            'behavior_records': 0,
            'career_assessments': 0,
            'notifications': 0
        }
        
        for student_id in student_ids:
            # Check if student exists and get student info
            cursor.execute("""
                SELECT s.student_id, s.user_id, u.name 
                FROM students s 
                LEFT JOIN users u ON s.user_id = u.user_id 
                WHERE s.student_id = %s
            """, (student_id,))
            
            student = cursor.fetchone()
            
            if not student:
                not_found.append(student_id)
                continue
            
            # Count and delete related records for this student
            
            # 1. Delete counseling sessions
            cursor.execute("SELECT COUNT(*) as count FROM counseling_sessions WHERE student_id = %s", (student_id,))
            counseling_count = cursor.fetchone()['count']
            if counseling_count > 0:
                cursor.execute("DELETE FROM counseling_sessions WHERE student_id = %s", (student_id,))
                total_records_deleted['counseling_sessions'] += counseling_count
            
            # 2. Delete mental health assessments
            cursor.execute("SELECT COUNT(*) as count FROM mental_health_assessments WHERE student_id = %s", (student_id,))
            assessment_count = cursor.fetchone()['count']
            if assessment_count > 0:
                cursor.execute("DELETE FROM mental_health_assessments WHERE student_id = %s", (student_id,))
                total_records_deleted['mental_health_assessments'] += assessment_count
            
            # 3. Delete behavior records
            cursor.execute("SELECT COUNT(*) as count FROM behavior_records WHERE student_id = %s", (student_id,))
            behavior_count = cursor.fetchone()['count']
            if behavior_count > 0:
                cursor.execute("DELETE FROM behavior_records WHERE student_id = %s", (student_id,))
                total_records_deleted['behavior_records'] += behavior_count
            
            # 4. Delete career assessments
            cursor.execute("SELECT COUNT(*) as count FROM career_assessments WHERE student_id = %s", (student_id,))
            career_count = cursor.fetchone()['count']
            if career_count > 0:
                cursor.execute("DELETE FROM career_assessments WHERE student_id = %s", (student_id,))
                total_records_deleted['career_assessments'] += career_count
            
            # 5. Delete notifications related to the user
            if student['user_id']:
                cursor.execute("SELECT COUNT(*) as count FROM notifications WHERE user_id = %s", (student['user_id'],))
                notification_count = cursor.fetchone()['count']
                if notification_count > 0:
                    cursor.execute("DELETE FROM notifications WHERE user_id = %s", (student['user_id'],))
                    total_records_deleted['notifications'] += notification_count
            
            # 6. Delete the student record
            cursor.execute("DELETE FROM students WHERE student_id = %s", (student_id,))
            
            # Track successful deletion
            deleted_students.append({
                'student_id': student_id,
                'name': student['name'] if student['name'] else 'Unknown Student',
                'user_id': student['user_id'],
                'deleted_records': {
                    'counseling_sessions': counseling_count,
                    'mental_health_assessments': assessment_count,
                    'behavior_records': behavior_count,
                    'career_assessments': career_count
                }
            })
            
            logger.info(f"Hard deleted student {student_id} with all associated data")
        
        connection.commit()
        
        # Prepare response
        total_deleted = len(deleted_students)
        total_records = sum(total_records_deleted.values())
        
        response = {
            'message': f'Successfully permanently deleted {total_deleted} student(s) and {total_records} associated records',
            'deleted_students': deleted_students,
            'total_deleted': total_deleted,
            'total_records_deleted': total_records_deleted,
            'total_records': total_records,
            'warning': 'This action cannot be undone. Student academic data was permanently deleted, but user accounts were preserved.'
        }
        
        if not_found:
            response['not_found'] = not_found
            response['message'] += f' ({len(not_found)} student(s) not found)'
        
        return jsonify(response)
        
    except Error as e:
        logger.error(f"Error bulk hard deleting students: {e}")
        connection.rollback()
        return jsonify({'error': f'Failed to permanently delete students: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error in bulk hard delete: {e}")
        connection.rollback()
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Additional admin endpoints for user management
@app.route('/api/admin/users/deleted', methods=['GET'])
def get_deleted_users():
    """Get all deleted users (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT user_id, username, email, name, role, photo, is_active, created_at, updated_at
            FROM users 
            WHERE is_active = FALSE
            ORDER BY updated_at DESC
        """)
        
        deleted_users = cursor.fetchall()
        
        # Convert to frontend format
        result = []
        for user in deleted_users:
            result.append({
                'userId': user['user_id'],
                'username': user['username'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role'],
                'photo': user['photo'],
                'isActive': user['is_active'],
                'createdAt': user['created_at'].isoformat() if user['created_at'] else None,
                'deletedAt': user['updated_at'].isoformat() if user['updated_at'] else None,
                'id': user['user_id']  # For compatibility
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error getting deleted users: {e}")
        return jsonify({'error': 'Failed to get deleted users'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/users/<user_id>/restore', methods=['PUT'])
def restore_user(user_id):
    """Restore a deleted user (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists and is deleted
        cursor.execute("SELECT user_id, name, is_active FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user['is_active']:
            return jsonify({'error': 'User is already active'}), 400
        
        # Restore the user
        cursor.execute("UPDATE users SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP WHERE user_id = %s", (user_id,))
        connection.commit()
        
        # Return restored user data
        cursor.execute("""
            SELECT user_id, username, email, name, role, photo, is_active, created_at
            FROM users 
            WHERE user_id = %s
        """, (user_id,))
        
        restored_user = cursor.fetchone()
        result = {
            'userId': restored_user['user_id'],
            'username': restored_user['username'],
            'email': restored_user['email'],
            'name': restored_user['name'],
            'role': restored_user['role'],
            'photo': restored_user['photo'],
            'id': restored_user['user_id']  # For compatibility
        }
        
        return jsonify({
            'message': f'User {user["name"]} restored successfully',
            'user': result
        })
        
    except Error as e:
        logger.error(f"Error restoring user {user_id}: {e}")
        return jsonify({'error': 'Failed to restore user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/users/<user_id>/hard-delete', methods=['DELETE'])
def hard_delete_user(user_id):
    """Permanently delete a user from database (admin only - USE WITH CAUTION)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute("SELECT user_id, name, role FROM users WHERE user_id = %s", (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Prevent hard deleting admin users
        if user['role'] == 'admin':
            return jsonify({'error': 'Cannot permanently delete admin users for security reasons'}), 403
        
        # Permanently delete the user
        cursor.execute("DELETE FROM users WHERE user_id = %s", (user_id,))
        connection.commit()
        
        return jsonify({
            'message': f'User {user["name"]} permanently deleted from database',
            'warning': 'This action cannot be undone'
        })
        
    except Error as e:
        logger.error(f"Error hard deleting user {user_id}: {e}")
        return jsonify({'error': 'Failed to permanently delete user'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/students/bulk-delete', methods=['POST'])
def bulk_delete_students():
    """Bulk delete multiple students (soft delete)"""
    data = request.get_json()
    
    if not data or 'studentIds' not in data:
        return jsonify({'error': 'No student IDs provided'}), 400
    
    student_ids = data['studentIds']
    if not isinstance(student_ids, list) or len(student_ids) == 0:
        return jsonify({'error': 'Student IDs must be a non-empty list'}), 400
    
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get student names for response
        placeholders = ','.join(['%s'] * len(student_ids))
        cursor.execute(f"""            SELECT s.student_id, u.name 
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE s.student_id IN ({placeholders}) AND s.is_active = TRUE
        """, student_ids)
        
        existing_students = cursor.fetchall()
        existing_ids = [s['student_id'] for s in existing_students]
        
        if not existing_students:
            return jsonify({'error': 'No valid students found'}), 404
        
        # Bulk soft delete students
        cursor.execute(f"""
            UPDATE students 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
            WHERE student_id IN ({placeholders}) AND is_active = TRUE
        """, existing_ids)
        
        affected_rows = cursor.rowcount
        connection.commit()
        
        # Prepare response
        deleted_names = [s['name'] for s in existing_students]
        not_found_ids = [sid for sid in student_ids if sid not in existing_ids]
        
        response = {
            'message': f'Successfully deleted {affected_rows} student(s)',
            'deletedStudents': deleted_names,
            'deletedCount': affected_rows
        }
        
        if not_found_ids:
            response['notFound'] = not_found_ids
            response['message'] += f'. {len(not_found_ids)} student(s) not found or already deleted.'
        
        return jsonify(response)
        
    except Error as e:
        logger.error(f"Error bulk deleting students: {e}")
        return jsonify({'error': 'Failed to delete students'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Mental Health Assessment Endpoints

@app.route('/api/mental-health/assessments', methods=['GET'])
def get_mental_health_assessments():
    """Get mental health assessments with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        student_id = request.args.get('studentId')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        
        # Build query based on parameters
        base_query = """
            SELECT mha.*, u.name as assessor_name, s.name as student_name
            FROM mental_health_assessments mha
            LEFT JOIN users u ON mha.assessor_id = u.user_id
            LEFT JOIN students st ON mha.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            WHERE 1=1
        """
        
        params = []
        if student_id:
            base_query += " AND mha.student_id = %s"
            params.append(student_id)
        
        base_query += " ORDER BY mha.date DESC"
        
        # Get total count
        count_query = base_query.replace(
            "SELECT mha.*, u.name as assessor_name, s.name as student_name", 
            "SELECT COUNT(*) as total"
        )
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        paginated_query = base_query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        cursor.execute(paginated_query, params)
        
        assessments = cursor.fetchall()
          # Transform to frontend format
        formatted_assessments = []
        for assessment in assessments:
            formatted_assessment = {
                'id': str(assessment['assessment_id']),
                'studentId': assessment['student_id'],
                'type': assessment['assessment_type'],
                'score': assessment['score'],
                'risk': assessment['risk_level'],
                'notes': assessment['notes'] or '',
                'date': assessment['date'].strftime('%Y-%m-%d') if assessment['date'] else '',
                'category': assessment['category'] or 'general',
                'assessor': {
                    'id': assessment['assessor_id'] or 'system',
                    'name': assessment['assessor_name'] or 'System'
                }
            }
            formatted_assessments.append(formatted_assessment)
        
        # Get total count
        count_query = "SELECT COUNT(*) as total FROM mental_health_assessments"
        count_params = []
        if student_id:
            count_query += " WHERE student_id = %s"
            count_params.append(student_id)
        
        cursor.execute(count_query, count_params)
        total_count = cursor.fetchone()['total']
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'data': formatted_assessments,
            'count': len(formatted_assessments),
            'totalPages': (total_count + limit - 1) // limit,
            'currentPage': page
        })
        
    except Exception as e:
        print(f"Error fetching assessments: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mental-health/assessments', methods=['POST'])
def create_mental_health_assessment():
    try:
        data = request.get_json()
        
        connection = get_db_connection()
        if not connection:
            return jsonify({'error': 'Database connection failed'}), 500
        
        cursor = connection.cursor()
        
        # Extract studentId from request data (handles both camelCase and snake_case)
        student_id = data.get('studentId') or data.get('student_id')
        if not student_id:
            return jsonify({'error': 'studentId is required'}), 400
        
        # Extract assessment type from request data (handles both camelCase and snake_case)
        assessment_type = data.get('type') or data.get('assessment_type', 'mental-health')
        
        # Generate assessment_id following the pattern: type-timestamp-studentid
        timestamp = str(int(time.time()))
        assessment_id = f"{assessment_type}-{timestamp}-{student_id}"
          # For assessor_id, we need a valid user_id from the users table
        # First try to find the user_id that corresponds to this student
        assessor_query = """
        SELECT u.user_id FROM users u 
        JOIN students s ON u.user_id = s.user_id 
        WHERE s.student_id = %s AND u.is_active = TRUE
        """
        cursor.execute(assessor_query, (student_id,))
        assessor_result = cursor.fetchone()
        
        if assessor_result:
            assessor_id = assessor_result[0]
        else:
            # Fallback: use any active counselor or admin as assessor
            cursor.execute("SELECT user_id FROM users WHERE role IN ('counselor', 'admin') AND is_active = TRUE LIMIT 1")
            fallback_result = cursor.fetchone()
            if fallback_result:
                assessor_id = fallback_result[0]
            else:
                # Last resort: use the first active user
                cursor.execute("SELECT user_id FROM users WHERE is_active = TRUE LIMIT 1")
                last_resort = cursor.fetchone()
                if last_resort:
                    assessor_id = last_resort[0]
                else:
                    return jsonify({'error': 'No valid assessor found in database'}), 500
        
        # Prepare the insert query
        insert_query = """
        INSERT INTO mental_health_assessments 
        (assessment_id, student_id, assessment_type, score, risk_level, notes, date, category, 
         assessor_id, responses, recommendations)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            assessment_id,
            student_id,
            assessment_type,
            data.get('score', 0),
            data.get('risk') or data.get('risk_level', 'unknown'),
            data.get('notes', ''),
            data.get('date', datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            data.get('category', 'self-assessment'),            assessor_id,  # Use the valid assessor_id we found
            json.dumps(data.get('responses', {})),
            json.dumps(data.get('recommendations', []))
        )
        
        cursor.execute(insert_query, values)
        connection.commit()
        
        cursor.close()
        connection.close()
        
        return jsonify({
            'id': assessment_id,
            'studentId': student_id,
            'student_id': student_id,
            'type': assessment_type,
            'assessment_type': assessment_type,
            'status': 'created'
        }), 201
        
    except Exception as e:
        print(f"Error creating mental health assessment: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mental-health/assessments/<assessment_id>', methods=['PUT'])
def update_mental_health_assessment(assessment_id):
    """Update a mental health assessment"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.get_json()
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists
        cursor.execute("SELECT assessment_id FROM mental_health_assessments WHERE assessment_id = %s", (assessment_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        if 'score' in data:
            update_fields.append("score = %s")
            values.append(data['score'])
        
        if 'notes' in data:
            update_fields.append("notes = %s")
            values.append(data['notes'])
        
        if 'assessment_type' in data:
            update_fields.append("assessment_type = %s")
            values.append(data['assessment_type'])
        
        if 'risk_level' in data:
            update_fields.append("risk_level = %s")
            values.append(data['risk_level'])
        
        if 'category' in data:
            update_fields.append("category = %s")
            values.append(data['category'])
        
        if 'responses' in data:
            update_fields.append("responses = %s")
            values.append(json.dumps(data['responses']))
        
        if 'recommendations' in data:
            update_fields.append("recommendations = %s")
            values.append(data['recommendations'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add updated timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        values.append(assessment_id)
        update_query = f"UPDATE mental_health_assessments SET {', '.join(update_fields)} WHERE assessment_id = %s"
        cursor.execute(update_query, values)
        connection.commit()
        
        # Fetch updated assessment
        cursor.execute("""
            SELECT mha.*, u.name as assessor_name, s.name as student_name
            FROM mental_health_assessments mha
            LEFT JOIN users u ON mha.assessor_id = u.user_id
            LEFT JOIN students st ON mha.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            WHERE mha.assessment_id = %s
        """, (assessment_id,))
        
        updated_assessment = cursor.fetchone()
        
        # Parse responses for response
        responses = {}
        if updated_assessment['responses']:
            try:
                responses = json.loads(updated_assessment['responses'])
            except:
                responses = {}
        result = {
            'id': updated_assessment['assessment_id'],
            'assessment_id': updated_assessment['assessment_id'],
            'student_id': updated_assessment['student_id'],
            'student_name': updated_assessment['student_name'],
            'assessor_id': updated_assessment['assessor_id'],
            'assessor_name': updated_assessment['assessor_name'],
            'date': updated_assessment['date'].isoformat() if updated_assessment['date'] else None,
            'score': updated_assessment['score'],
            'notes': updated_assessment['notes'],
            'assessment_type': updated_assessment['assessment_type'],
            'risk_level': updated_assessment['risk_level'],            'category': updated_assessment['category'],
            'responses': responses,
            'recommendations': updated_assessment['recommendations']
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating mental health assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to update mental health assessment'}), 500
    finally:
        if connection and connection.is_connected():
            if 'cursor' in locals():
                cursor.close()
            connection.close()

@app.route('/api/mental-health/assessments/<assessment_id>', methods=['DELETE'])
def delete_mental_health_assessment(assessment_id):
    """Delete a mental health assessment"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:        
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists
        cursor.execute("SELECT assessment_id FROM mental_health_assessments WHERE assessment_id = %s", (assessment_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Delete the assessment
        cursor.execute("DELETE FROM mental_health_assessments WHERE assessment_id = %s", (assessment_id,))
        connection.commit()
        
        return jsonify({'message': 'Assessment deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting mental health assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to delete mental health assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/mental-health/trends', methods=['GET'])
def get_mental_health_trends():
    """Get mental health trends for a student"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        student_id = request.args.get('student_id')
        if not student_id:
            return jsonify({'error': 'student_id parameter is required'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Get assessments for trend analysis
        cursor.execute("""
            SELECT date, score, assessment_type
            FROM mental_health_assessments
            WHERE student_id = %s
            ORDER BY date ASC
        """, (student_id,))
        
        assessments = cursor.fetchall()
        
        # Format for trends
        dates = []
        scores = []
        
        for assessment in assessments:
            dates.append(assessment['date'].isoformat() if assessment['date'] else '')
            scores.append(assessment['score'])
        
        return jsonify({
            'dates': dates,
            'scores': scores
        })
        
    except Error as e:
        logger.error(f"Error fetching mental health trends: {e}")
        return jsonify({'error': 'Failed to fetch mental health trends'}), 500
    finally:
        if connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

# Career Assessment Endpoints
@app.route('/api/career-assessments', methods=['GET'])
def get_career_assessments():
    """Get career assessments with optional student filter"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        student_id = request.args.get('student')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        
        # Build query based on parameters
        base_query = """
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.is_active = TRUE
        """
        
        params = []
        if student_id:
            base_query += " AND ca.student_id = %s"
            params.append(student_id)
        
        base_query += " ORDER BY ca.date DESC"
        
        # Get total count
        count_query = base_query.replace(
            "SELECT ca.*, u.name as student_name, u.email as student_email", 
            "SELECT COUNT(*) as total"
        )
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        paginated_query = base_query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        cursor.execute(paginated_query, params)
        
        assessments = cursor.fetchall()
        
        # Format response
        result = []
        for assessment in assessments:
            result.append({
                'id': assessment['assessment_id'],
                'studentId': assessment['student_id'],
                'studentName': assessment['student_name'],
                'studentEmail': assessment['student_email'],
                'date': assessment['date'].isoformat() if assessment['date'] else None,
                'type': assessment['assessment_type'],
                'interests': assessment['interests'].split(',') if assessment['interests'] else [],
                'skills': assessment['skills'].split(',') if assessment['skills'] else [],
                'values': assessment['values_data'].split(',') if assessment['values_data'] else [],
                'recommendedPaths': assessment['recommended_paths'].split(',') if assessment['recommended_paths'] else [],
                'notes': assessment['notes'],
                'results': json.loads(assessment['results']) if assessment['results'] else {},
                'createdAt': assessment['created_at'].isoformat() if assessment['created_at'] else None,
                'updatedAt': assessment['updated_at'].isoformat() if assessment['updated_at'] else None
            })
        
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'data': result,
            'count': len(result),
            'totalPages': total_pages,
            'currentPage': page,
            'totalCount': total_count
        })
        
    except Error as e:
        logger.error(f"Error fetching career assessments: {e}")
        return jsonify({'error': 'Failed to fetch career assessments'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-assessments', methods=['POST'])
def create_career_assessment():
    """Create a new career assessment"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['studentId', 'type', 'interests', 'recommendedPaths']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Generate unique assessment ID
        assessment_id = f"{data['type']}-{int(time.time())}-{data['studentId']}"
        
        # Convert arrays to comma-separated strings
        interests_str = ','.join(data['interests']) if isinstance(data['interests'], list) else str(data['interests'])
        skills_str = ','.join(data.get('skills', [])) if isinstance(data.get('skills', []), list) else str(data.get('skills', ''))
        values_str = ','.join(data.get('values', [])) if isinstance(data.get('values', []), list) else str(data.get('values', ''))
        paths_str = ','.join(data['recommendedPaths']) if isinstance(data['recommendedPaths'], list) else str(data['recommendedPaths'])
        
        # Convert results to JSON string
        results_json = json.dumps(data.get('results', {}))
        
        # Insert into database
        cursor.execute("""
            INSERT INTO career_assessments 
            (assessment_id, student_id, assessment_type, interests, skills, values_data, 
             recommended_paths, notes, results)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            assessment_id,
            data['studentId'],
            data['type'],
            interests_str,
            skills_str,
            values_str,
            paths_str,
            data.get('notes', ''),
            results_json
        ))
        
        connection.commit()
        
        # Get the created assessment
        cursor.execute("""
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.assessment_id = %s
        """, (assessment_id,))
        
        assessment = cursor.fetchone()
        
        # Format response
        result = {
            'id': assessment['assessment_id'],
            'studentId': assessment['student_id'],
            'studentName': assessment['student_name'],
            'studentEmail': assessment['student_email'],
            'date': assessment['date'].isoformat() if assessment['date'] else None,
            'type': assessment['assessment_type'],
            'interests': assessment['interests'].split(',') if assessment['interests'] else [],
            'skills': assessment['skills'].split(',') if assessment['skills'] else [],
            'values': assessment['values_data'].split(',') if assessment['values_data'] else [],
            'recommendedPaths': assessment['recommended_paths'].split(',') if assessment['recommended_paths'] else [],
            'notes': assessment['notes'],
            'results': json.loads(assessment['results']) if assessment['results'] else {},
            'createdAt': assessment['created_at'].isoformat() if assessment['created_at'] else None,
            'updatedAt': assessment['updated_at'].isoformat() if assessment['updated_at'] else None
        }
        
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Error creating career assessment: {e}")
        return jsonify({'error': 'Failed to create career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-assessments/<assessment_id>', methods=['GET'])
def get_career_assessment(assessment_id):
    """Get a specific career assessment"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.assessment_id = %s AND ca.is_active = TRUE
        """, (assessment_id,))
        
        assessment = cursor.fetchone()
        
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Format response
        result = {
            'id': assessment['assessment_id'],
            'studentId': assessment['student_id'],
            'studentName': assessment['student_name'],
            'studentEmail': assessment['student_email'],
            'date': assessment['date'].isoformat() if assessment['date'] else None,
            'type': assessment['assessment_type'],
            'interests': assessment['interests'].split(',') if assessment['interests'] else [],
            'skills': assessment['skills'].split(',') if assessment['skills'] else [],
            'values': assessment['values_data'].split(',') if assessment['values_data'] else [],
            'recommendedPaths': assessment['recommended_paths'].split(',') if assessment['recommended_paths'] else [],
            'notes': assessment['notes'],
            'results': json.loads(assessment['results']) if assessment['results'] else {},
            'createdAt': assessment['created_at'].isoformat() if assessment['created_at'] else None,
            'updatedAt': assessment['updated_at'].isoformat() if assessment['updated_at'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching career assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to fetch career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-assessments/<assessment_id>', methods=['PUT'])
def update_career_assessment(assessment_id):
    """Update a career assessment"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists
        cursor.execute("""
            SELECT id FROM career_assessments 
            WHERE assessment_id = %s AND is_active = TRUE
        """, (assessment_id,))
        
        if not cursor.fetchone():
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        if 'interests' in data:
            interests_str = ','.join(data['interests']) if isinstance(data['interests'], list) else str(data['interests'])
            update_fields.append("interests = %s")
            params.append(interests_str)
        
        if 'skills' in data:
            skills_str = ','.join(data['skills']) if isinstance(data['skills'], list) else str(data['skills'])
            update_fields.append("skills = %s")
            params.append(skills_str)
        
        if 'values' in data:
            values_str = ','.join(data['values']) if isinstance(data['values'], list) else str(data['values'])
            update_fields.append("values_data = %s")
            params.append(values_str)
        
        if 'recommendedPaths' in data:
            paths_str = ','.join(data['recommendedPaths']) if isinstance(data['recommendedPaths'], list) else str(data['recommendedPaths'])
            update_fields.append("recommended_paths = %s")
            params.append(paths_str)
        
        if 'notes' in data:
            update_fields.append("notes = %s")
            params.append(data['notes'])
        
        if 'results' in data:
            results_json = json.dumps(data['results'])
            update_fields.append("results = %s")
            params.append(results_json)
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(assessment_id)
        
        # Execute update
        update_query = f"""
            UPDATE career_assessments 
            SET {', '.join(update_fields)}
            WHERE assessment_id = %s
        """
        
        cursor.execute(update_query, params)
        connection.commit()
        
        # Get updated assessment
        cursor.execute("""
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.assessment_id = %s
        """, (assessment_id,))
        
        assessment = cursor.fetchone()
        
        # Format response
        result = {
            'id': assessment['assessment_id'],
            'studentId': assessment['student_id'],
            'studentName': assessment['student_name'],
            'studentEmail': assessment['student_email'],
            'date': assessment['date'].isoformat() if assessment['date'] else None,
            'type': assessment['assessment_type'],
            'interests': assessment['interests'].split(',') if assessment['interests'] else [],
            'skills': assessment['skills'].split(',') if assessment['skills'] else [],
            'values': assessment['values_data'].split(',') if assessment['values_data'] else [],
            'recommendedPaths': assessment['recommended_paths'].split(',') if assessment['recommended_paths'] else [],
            'notes': assessment['notes'],
            'results': json.loads(assessment['results']) if assessment['results'] else {},
            'createdAt': assessment['created_at'].isoformat() if assessment['created_at'] else None,
            'updatedAt': assessment['updated_at'].isoformat() if assessment['updated_at'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating career assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to update career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-assessments/<assessment_id>', methods=['DELETE'])
def delete_career_assessment(assessment_id):
    """Delete a career assessment (soft delete)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists
        cursor.execute("""
            SELECT assessment_id FROM career_assessments 
            WHERE assessment_id = %s AND is_active = TRUE
        """, (assessment_id,))
        
        if not cursor.fetchone():
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Soft delete the assessment
        cursor.execute("""
            UPDATE career_assessments 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        connection.commit()
        
        return jsonify({'message': 'Assessment deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting career assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to delete career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Admin endpoints for career assessments
@app.route('/api/admin/career-assessments/deleted', methods=['GET'])
def get_deleted_career_assessments():
    """Get all deleted career assessments (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.is_active = FALSE
            ORDER BY ca.updated_at DESC
        """)
        
        assessments = cursor.fetchall()
        
        # Format response
        result = []
        for assessment in assessments:
            result.append({
                'id': assessment['assessment_id'],
                'studentId': assessment['student_id'],
                'studentName': assessment['student_name'],
                'studentEmail': assessment['student_email'],
                'date': assessment['date'].isoformat() if assessment['date'] else None,
                'type': assessment['assessment_type'],
                'interests': assessment['interests'].split(',') if assessment['interests'] else [],
                'skills': assessment['skills'].split(',') if assessment['skills'] else [],
                'values': assessment['values_data'].split(',') if assessment['values_data'] else [],
                'recommendedPaths': assessment['recommended_paths'].split(',') if assessment['recommended_paths'] else [],
                'notes': assessment['notes'],
                'results': json.loads(assessment['results']) if assessment['results'] else {},
                'createdAt': assessment['created_at'].isoformat() if assessment['created_at'] else None,
                'deletedAt': assessment['updated_at'].isoformat() if assessment['updated_at'] else None
            })
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching deleted career assessments: {e}")
        return jsonify({'error': 'Failed to fetch deleted career assessments'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/career-assessments/<assessment_id>/restore', methods=['PUT'])
def restore_career_assessment(assessment_id):
    """Restore a deleted career assessment (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists and is deleted
        cursor.execute("""
            SELECT assessment_id, assessment_type, is_active
            FROM career_assessments
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        assessment = cursor.fetchone()
        
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404
        
        if assessment['is_active']:
            return jsonify({'error': 'Assessment is already active'}), 400
        
        # Restore the assessment
        cursor.execute("""
            UPDATE career_assessments 
            SET is_active = TRUE, updated_at = CURRENT_TIMESTAMP 
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        connection.commit()
        
        # Get updated assessment
        cursor.execute("""
            SELECT ca.*, u.name as student_name, u.email as student_email
            FROM career_assessments ca
            LEFT JOIN students s ON ca.student_id = s.student_id
            LEFT JOIN users u ON s.user_id = u.user_id
            WHERE ca.assessment_id = %s
        """, (assessment_id,))
        
        restored = cursor.fetchone()
        
        # Format response
        result = {
            'id': restored['assessment_id'],
            'studentId': restored['student_id'],
            'studentName': restored['student_name'],
            'studentEmail': restored['student_email'],
            'date': restored['date'].isoformat() if restored['date'] else None,
            'type': restored['assessment_type'],
            'interests': restored['interests'].split(',') if restored['interests'] else [],
            'skills': restored['skills'].split(',') if restored['skills'] else [],
            'values': restored['values_data'].split(',') if restored['values_data'] else [],
            'recommendedPaths': restored['recommended_paths'].split(',') if restored['recommended_paths'] else [],
            'notes': restored['notes']
        }
        
        return jsonify({
            'message': f'Career assessment restored successfully',
            'assessment': result
        })
        
    except Error as e:
        logger.error(f"Error restoring career assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to restore career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/admin/career-assessments/<assessment_id>/hard-delete', methods=['DELETE'])
def hard_delete_career_assessment(assessment_id):
    """Permanently delete a career assessment (admin only)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if assessment exists
        cursor.execute("""
            SELECT assessment_id, assessment_type
            FROM career_assessments
            WHERE assessment_id = %s
        """, (assessment_id,))
        
        assessment = cursor.fetchone()
        
        if not assessment:
            return jsonify({'error': 'Assessment not found'}), 404
        
        # Permanently delete the assessment
        cursor.execute("DELETE FROM career_assessments WHERE assessment_id = %s", (assessment_id,))
        
        connection.commit()
        
        return jsonify({
            'message': f'Career assessment permanently deleted from database',
            'warning': 'This action cannot be undone'
        })
        
    except Error as e:
        logger.error(f"Error hard deleting career assessment {assessment_id}: {e}")
        return jsonify({'error': 'Failed to permanently delete career assessment'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Career Resources Endpoints
@app.route('/api/career-resources', methods=['GET'])
def get_career_resources():
    """Get career resources with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        resource_type = request.args.get('type')
        tags = request.args.get('tags')
        
        # Build query based on parameters
        base_query = """
            SELECT * FROM career_resources
            WHERE is_active = TRUE
        """
        
        params = []
        if resource_type:
            base_query += " AND resource_type = %s"
            params.append(resource_type)
        
        if tags:
            base_query += " AND tags LIKE %s"
            params.append(f"%{tags}%")
        
        base_query += " ORDER BY date_published DESC"
        
        # Get total count
        count_query = base_query.replace("SELECT *", "SELECT COUNT(*) as total")
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        paginated_query = base_query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        cursor.execute(paginated_query, params)
        
        resources = cursor.fetchall()
        
        # Format response
        result = []
        for resource in resources:
            result.append({
                'id': resource['resource_id'],
                'title': resource['title'],
                'description': resource['description'],
                'type': resource['resource_type'],
                'url': resource['url'],
                'tags': json.loads(resource['tags']) if resource['tags'] else [],
                'datePublished': resource['date_published'].isoformat() if resource['date_published'] else None,
                'author': resource['author'],
                'createdAt': resource['created_at'].isoformat() if resource['created_at'] else None,
                'updatedAt': resource['updated_at'].isoformat() if resource['updated_at'] else None
            })
        
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'results': result,
            'count': len(result),
            'totalPages': total_pages,
            'currentPage': page,
            'totalCount': total_count
        })
        
    except Error as e:
        logger.error(f"Error fetching career resources: {e}")
        return jsonify({'error': 'Failed to fetch career resources'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-resources', methods=['POST'])
def create_career_resource():
    """Create a new career resource"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['title', 'description', 'type', 'url']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Generate unique resource ID
        resource_id = f"RES-{int(time.time())}-{uuid.uuid4().hex[:8].upper()}"
        
        # Convert tags array to JSON string
        tags_json = json.dumps(data.get('tags', []))
        
        # Insert into database
        cursor.execute("""
            INSERT INTO career_resources 
            (resource_id, title, description, resource_type, url, tags, author)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            resource_id,
            data['title'],
            data['description'],
            data['type'],
            data['url'],
            tags_json,
            data.get('author', '')
        ))
        
        connection.commit()
        
        # Get the created resource
        cursor.execute("""
            SELECT * FROM career_resources
            WHERE resource_id = %s
        """, (resource_id,))
        
        resource = cursor.fetchone()
        
        # Format response
        result = {
            'id': resource['resource_id'],
            'title': resource['title'],
            'description': resource['description'],
            'type': resource['resource_type'],
            'url': resource['url'],
            'tags': json.loads(resource['tags']) if resource['tags'] else [],
            'datePublished': resource['date_published'].isoformat() if resource['date_published'] else None,
            'author': resource['author'],
            'createdAt': resource['created_at'].isoformat() if resource['created_at'] else None,
            'updatedAt': resource['updated_at'].isoformat() if resource['updated_at'] else None
        }
        
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Error creating career resource: {e}")
        return jsonify({'error': 'Failed to create career resource'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-resources/<resource_id>', methods=['GET'])
def get_career_resource(resource_id):
    """Get a specific career resource"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM career_resources
            WHERE resource_id = %s AND is_active = TRUE
        """, (resource_id,))
        
        resource = cursor.fetchone()
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        # Format response
        result = {
            'id': resource['resource_id'],
            'title': resource['title'],
            'description': resource['description'],
            'type': resource['resource_type'],
            'url': resource['url'],
            'tags': json.loads(resource['tags']) if resource['tags'] else [],
            'datePublished': resource['date_published'].isoformat() if resource['date_published'] else None,
            'author': resource['author'],
            'createdAt': resource['created_at'].isoformat() if resource['created_at'] else None,
            'updatedAt': resource['updated_at'].isoformat() if resource['updated_at'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching career resource {resource_id}: {e}")
        return jsonify({'error': 'Failed to fetch career resource'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-resources/<resource_id>', methods=['PUT'])
def update_career_resource(resource_id):
    """Update a career resource"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = connection.cursor(dictionary=True)
        
        # Check if resource exists
        cursor.execute("""
            SELECT id FROM career_resources 
            WHERE resource_id = %s AND is_active = TRUE
        """, (resource_id,))
        
        if not cursor.fetchone():
            return jsonify({'error': 'Resource not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        params = []
        
        if 'title' in data:
            update_fields.append("title = %s")
            params.append(data['title'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            params.append(data['description'])
        
        if 'type' in data:
            update_fields.append("resource_type = %s")
            params.append(data['type'])
        
        if 'url' in data:
            update_fields.append("url = %s")
            params.append(data['url'])
        
        if 'tags' in data:
            tags_json = json.dumps(data['tags'])
            update_fields.append("tags = %s")
            params.append(tags_json)
        
        if 'author' in data:
            update_fields.append("author = %s")
            params.append(data['author'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        # Add updated_at timestamp
        update_fields.append("updated_at = CURRENT_TIMESTAMP")
        params.append(resource_id)
        
        # Execute update
        update_query = f"""
            UPDATE career_resources 
            SET {', '.join(update_fields)}
            WHERE resource_id = %s
        """
        
        cursor.execute(update_query, params)
        connection.commit()
        
        # Get updated resource
        cursor.execute("""
            SELECT * FROM career_resources
            WHERE resource_id = %s
        """, (resource_id,))
        
        resource = cursor.fetchone()
        
        # Format response
        result = {
            'id': resource['resource_id'],
            'title': resource['title'],
            'description': resource['description'],
            'type': resource['resource_type'],
            'url': resource['url'],
            'tags': json.loads(resource['tags']) if resource['tags'] else [],
            'datePublished': resource['date_published'].isoformat() if resource['date_published'] else None,
            'author': resource['author'],
            'createdAt': resource['created_at'].isoformat() if resource['created_at'] else None,
            'updatedAt': resource['updated_at'].isoformat() if resource['updated_at'] else None
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating career resource {resource_id}: {e}")
        return jsonify({'error': 'Failed to update career resource'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/career-resources/<resource_id>', methods=['DELETE'])
def delete_career_resource(resource_id):
    """Delete a career resource (soft delete)"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if resource exists
        cursor.execute("""
            SELECT resource_id FROM career_resources 
            WHERE resource_id = %s AND is_active = TRUE
        """, (resource_id,))
        
        if not cursor.fetchone():
            return jsonify({'error': 'Resource not found'}), 404
        
        # Soft delete the resource
        cursor.execute("""
            UPDATE career_resources 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE resource_id = %s
        """, (resource_id,))
        
        connection.commit()
        
        return jsonify({'message': 'Resource deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting career resource {resource_id}: {e}")
        return jsonify({'error': 'Failed to delete career resource'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
        
# Behavior Records Endpoints
@app.route('/api/behavior-records', methods=['GET'])
def get_behavior_records():
    """Get behavior records with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        # Get query parameters
        student_id = request.args.get('student')
        behavior_type = request.args.get('type')
        category = request.args.get('category')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        
        # Build query
        base_query = """
            SELECT br.*, s.name as student_name, u.name as recorder_name
            FROM behavior_records br
            LEFT JOIN students st ON br.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users u ON br.reporter_id = u.user_id
            WHERE br.is_active = TRUE
        """
        
        params = []
        if student_id:
            base_query += " AND br.student_id = %s"
            params.append(student_id)
        
        if behavior_type:
            base_query += " AND br.behavior_type = %s"
            params.append(behavior_type)
        
        if category:
            base_query += " AND br.category = %s"
            params.append(category)
        
        if start_date:
            base_query += " AND br.date >= %s"
            params.append(start_date)
        
        if end_date:
            base_query += " AND br.date <= %s"
            params.append(end_date)
        
        base_query += " ORDER BY br.date DESC"
        
        # Get total count
        count_query = base_query.replace(
            "SELECT br.*, s.name as student_name, u.name as recorder_name",
            "SELECT COUNT(*) as total"
        )
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        paginated_query = base_query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        cursor.execute(paginated_query, params)
        
        records = cursor.fetchall()        # Format response
        result = []
        for record in records:
            result.append({
                'id': record['record_id'],
                'studentId': record['student_id'],
                'student': {
                    'id': record['student_id'],
                    'name': record['student_name'] or 'Unknown Student'
                },
                'date': record['date'].isoformat() if record['date'] else None,
                'type': record['behavior_type'],
                'category': record['category'],
                'description': record['description'],
                'severity': record['severity'],
                'actionTaken': record['action_taken'],
                'reporter': {
                    'id': record['reporter_id'],
                    'name': record['recorder_name'] or 'System'
                },
                'followUpRequired': bool(record['follow_up_required'])
            })
        
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'results': result,
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page
        })
        
    except Error as e:
        logger.error(f"Error fetching behavior records: {e}")
        return jsonify({'error': 'Failed to fetch behavior records'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/behavior-records', methods=['POST'])
def create_behavior_record():
    """Create a new behavior record"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['studentId', 'date', 'type', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
                
        cursor = connection.cursor()
        
        # Generate custom format record_id: behavior-{Date & Time}-{StudentId}
        from datetime import datetime
        current_datetime = datetime.now().strftime("%Y%m%d-%H%M%S")
        record_id = f"behavior-{current_datetime}-{data['studentId']}"
        
        # Insert behavior record
        insert_query = """
            INSERT INTO behavior_records 
            (record_id, student_id, date, behavior_type, category, description, severity, action_taken, reporter_id, follow_up_required)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """        
        values = (
            record_id,
            data['studentId'],
            data['date'],
            data['type'],
            data.get('category', 'general'),
            data['description'],
            data.get('severity', 'neutral'),
            data.get('actionTaken') or data.get('action_taken', ''),  # Support both camelCase and snake_case
            data.get('reporter_id', 'ADM-2025-001'),  # Default to valid admin user
            data.get('follow_up_required', False)
        )
        cursor.execute(insert_query, values)
        connection.commit()
        
        cursor.close()
        
        # Fetch the created record using record_id
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT br.*, s.name as student_name, u.name as recorder_name
            FROM behavior_records br
            LEFT JOIN students st ON br.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users u ON br.reporter_id = u.user_id
            WHERE br.record_id = %s
        """, (record_id,))
        created_record = cursor.fetchone()        
        result = {
            'id': created_record['record_id'],
            'studentId': created_record['student_id'],
            'student': {
                'id': created_record['student_id'],
                'name': created_record['student_name'] or 'Unknown Student'
            },
            'date': created_record['date'].isoformat() if created_record['date'] else None,
            'type': created_record['behavior_type'],
            'category': created_record['category'],
            'description': created_record['description'],
            'severity': created_record['severity'],
            'actionTaken': created_record['action_taken'],
            'reporter': {
                'id': created_record['reporter_id'],
                'name': created_record['recorder_name'] or 'System'
            },
            'followUpRequired': bool(created_record['follow_up_required'])
        }
        
        return jsonify(result), 201
    except Error as e:        
        logger.error(f"Error creating behavior record: {e}")
        return jsonify({'error': 'Failed to create behavior record'}), 500
    finally:
        if connection and connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

@app.route('/api/behavior-records/<record_id>', methods=['PUT'])
def update_behavior_record(record_id):
    """Update a behavior record"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    try:
        data = request.get_json()
        cursor = connection.cursor()
          # Check if record exists
        cursor.execute("SELECT record_id FROM behavior_records WHERE record_id = %s", (record_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Record not found'}), 404
        # Build update query dynamically
        update_fields = []
        values = []
        
        if 'type' in data:
            update_fields.append("behavior_type = %s")
            values.append(data['type'])
        
        if 'category' in data:
            update_fields.append("category = %s")
            values.append(data['category'])
        
        if 'description' in data:
            update_fields.append("description = %s")
            values.append(data['description'])
        
        if 'severity' in data:
            update_fields.append("severity = %s")
            values.append(data['severity'])
        if 'action_taken' in data:
            update_fields.append("action_taken = %s")
            values.append(data['action_taken'])
        elif 'actionTaken' in data:
            update_fields.append("action_taken = %s")
            values.append(data['actionTaken'])
        
        if 'follow_up_required' in data:
            update_fields.append("follow_up_required = %s")
            values.append(data['follow_up_required'])
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        values.append(record_id)
        
        update_query = f"UPDATE behavior_records SET {', '.join(update_fields)} WHERE record_id = %s"
        cursor.execute(update_query, values)
        connection.commit()
        
        # Close current cursor and create a new dictionary cursor for fetching
        cursor.close()
        cursor = connection.cursor(dictionary=True)
        
        # Fetch updated record
        cursor.execute("""
            SELECT br.*, s.name as student_name, u.name as recorder_name
            FROM behavior_records br
            LEFT JOIN students st ON br.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users u ON br.reporter_id = u.user_id
            WHERE br.record_id = %s
        """, (record_id,))
        updated_record = cursor.fetchone()
        result = {
            'id': updated_record['record_id'],
            'student_id': updated_record['student_id'],
            'student_name': updated_record['student_name'],
            'date': updated_record['date'].isoformat() if updated_record['date'] else None,
            'behavior_type': updated_record['behavior_type'],
            'category': updated_record['category'],
            'description': updated_record['description'],
            'severity': updated_record['severity'],
            'action_taken': updated_record['action_taken'],
            'reporter_id': updated_record['reporter_id'],
            'recorder_name': updated_record['recorder_name'],
            'follow_up_required': bool(updated_record['follow_up_required'])
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating behavior record {record_id}: {e}")
        return jsonify({'error': 'Failed to update behavior record'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/behavior-records/<record_id>', methods=['DELETE'])
def delete_behavior_record(record_id):
    """Delete a behavior record"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
          # Check if record exists
        cursor.execute("SELECT record_id FROM behavior_records WHERE record_id = %s", (record_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Record not found'}), 404
        
        # Delete the record
        cursor.execute("DELETE FROM behavior_records WHERE record_id = %s", (record_id,))
        connection.commit()
        
        return jsonify({'message': 'Record deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting behavior record {record_id}: {e}")
        return jsonify({'error': 'Failed to delete behavior record'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/behavior-records/summary', methods=['GET'])
def get_behavior_summary():
    """Get behavior summary for a student"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        student_id = request.args.get('student')
        if not student_id:
            return jsonify({'error': 'student parameter is required'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Get total count
        cursor.execute("""
            SELECT COUNT(*) as total FROM behavior_records WHERE student_id = %s
        """, (student_id,))
        total = cursor.fetchone()['total']
        
        # Get by category
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM behavior_records 
            WHERE student_id = %s
            GROUP BY category
        """, (student_id,))
        category_results = cursor.fetchall()
        
        by_category = {'positive': 0, 'negative': 0}
        for result in category_results:
            if result['category'] in ['positive', 'achievement', 'improvement']:
                by_category['positive'] += result['count']
            else:
                by_category['negative'] += result['count']
        
        # Get by severity
        cursor.execute("""
            SELECT severity, COUNT(*) as count
            FROM behavior_records 
            WHERE student_id = %s
            GROUP BY severity
        """, (student_id,))
        severity_results = cursor.fetchall()
        
        by_severity = {'minor': 0, 'major': 0, 'positive': 0, 'neutral': 0}
        for result in severity_results:
            severity = result['severity']
            if severity in by_severity:
                by_severity[severity] = result['count']
        
        # Average session duration
        cursor.execute("SELECT AVG(duration) as avg_duration FROM counseling_sessions cs WHERE student_id = %s", (student_id,))
        avg_duration_result = cursor.fetchone()
        avg_duration = round(avg_duration_result['avg_duration'] or 0, 1)
        
        # Monthly sessions (last 6 months)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(cs.date, '%Y-%m') as month,
                COUNT(*) as count
            FROM counseling_sessions cs 
            WHERE student_id = %s
            AND cs.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(cs.date, '%Y-%m')
            ORDER BY month
        """, (student_id,))
        monthly_results = cursor.fetchall()
        
        monthly_sessions = []
        for result in monthly_results:
            monthly_sessions.append({
                'month': result['month'],
                'count': result['count']
            })
        
        return jsonify({
            'total': total,
            'byCategory': by_category,
            'bySeverity': by_severity,
            'averageDuration': avg_duration,
            'monthlySessions': monthly_sessions
        })
        
    except Error as e:
        logger.error(f"Error fetching behavior summary: {e}")
        return jsonify({'error': 'Failed to fetch behavior summary'}), 500
    finally:
        if connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

# Counseling Sessions Endpoints
@app.route('/api/counseling-sessions', methods=['GET'])
def get_counseling_sessions():
    """Get counseling sessions with optional filtering"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)        # Get query parameters
        student_id = request.args.get('student')
        session_type = request.args.get('type')
        outcome = request.args.get('outcome')
        approval_status = request.args.get('approvalStatus')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        offset = (page - 1) * limit
        
        # Build query
        base_query = """
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.is_active = TRUE
        """
        
        params = []
        if student_id:
            base_query += " AND cs.student_id = %s"
            params.append(student_id)
        if session_type:
            base_query += " AND cs.session_type = %s"
            params.append(session_type)
        
        if outcome:
            base_query += " AND cs.outcome = %s"
            params.append(outcome)
        
        if approval_status:
            base_query += " AND cs.approval_status = %s"
            params.append(approval_status)
        
        if start_date:
            base_query += " AND cs.date >= %s"
            params.append(start_date)
        
        if end_date:
            base_query += " AND cs.date <= %s"
            params.append(end_date)
        
        base_query += " ORDER BY cs.date DESC"
        
        # Get total count
        count_query = base_query.replace(
            "SELECT cs.*, s.name as student_name, c.name as counselor_name",
            "SELECT COUNT(*) as total"
        )
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()['total']
        
        # Get paginated results
        paginated_query = base_query + " LIMIT %s OFFSET %s"
        params.extend([limit, offset])
        cursor.execute(paginated_query, params)
        
        sessions = cursor.fetchall()
          # Format response
        result = []
        for session in sessions:
            result.append({
                'id': session['session_id'],
                'studentId': session['student_id'],
                'student': {
                    'id': session['student_id'],
                    'name': session['student_name'] or 'Unknown Student'
                },
                'date': session['date'].isoformat() if session['date'] else None,
                'duration': session['duration'],
                'type': session['session_type'],
                'notes': session['notes'],
                'outcome': session['outcome'],
                'nextSteps': session['next_steps'],
                'followUp': session.get('follow_up', ''),
                'approvalStatus': session.get('approval_status', 'pending'),
                'approvedBy': session.get('approved_by'),
                'approvedAt': session['approved_at'].isoformat() if session.get('approved_at') else None,
                'rejectionReason': session.get('rejection_reason'),
                'counselor': {
                    'id': session['counselor_id'],
                    'name': session['counselor_name'] or 'Unknown Counselor'
                }
            })
        
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'results': result,
            'count': total_count,
            'total_pages': total_pages,
            'current_page': page
        })
        
    except Error as e:
        logger.error(f"Error fetching counseling sessions: {e}")
        return jsonify({'error': 'Failed to fetch counseling sessions'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/counseling-sessions', methods=['POST'])
def create_counseling_session():
    """Create a new counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        logger.info(f"Creating counseling session with data: {data}")
        
        # Validate required fields
        required_fields = ['studentId', 'date', 'duration', 'type', 'notes']
        for field in required_fields:
            if field not in data:
                logger.error(f"Missing required field: {field}")
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        cursor = connection.cursor()
        
        # Generate custom format session_id: CS-{Date & Time}-{StudentId}
        from datetime import datetime
        current_datetime = datetime.now().strftime("%Y%m%d-%H%M%S")
        session_id = f"CS-{current_datetime}-{data['studentId']}"
        logger.info(f"Generated session_id: {session_id}")
        
        # Parse the date to separate date and time if needed
        session_date = data['date']
        if 'T' in session_date:
            # Convert ISO string to MySQL datetime format
            session_datetime = datetime.fromisoformat(session_date.replace('Z', '+00:00'))
            session_date = session_datetime.strftime('%Y-%m-%d %H:%M:%S')
        
        # Extract counselor ID - handle both nested object and flat field formats
        counselor_id = None
        if 'counselor' in data and isinstance(data['counselor'], dict):
            counselor_id = data['counselor'].get('id')
            logger.info(f"Found counselor ID from nested object: {counselor_id}")
        elif 'counselorId' in data:
            counselor_id = data['counselorId']
            logger.info(f"Found counselor ID from flat field: {counselor_id}")
        
        # Default to valid counselor if none provided        if not counselor_id:
            counselor_id = 'KSL-2025-001'
            logger.info(f"Using default counselor ID: {counselor_id}")
        else:
            logger.info(f"Using provided counselor ID: {counselor_id}")
        
        # Insert counseling session
        insert_query = """
            INSERT INTO counseling_sessions 
            (session_id, student_id, counselor_id, date, duration, session_type, notes, outcome, next_steps, approval_status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        values = (
            session_id,
            data['studentId'],
            counselor_id,
            session_date,
            data['duration'],
            data['type'],
            data['notes'],
            data.get('outcome', 'neutral'),
            data.get('nextSteps', ''),
            data.get('approvalStatus', 'pending')  # Default to pending
        )
        
        logger.info(f"Executing insert with values: {values}")
        cursor.execute(insert_query, values)
        connection.commit()
        
        cursor.close()
        
        # Fetch the created session using session_id
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.session_id = %s
        """, (session_id,))        
        created_session = cursor.fetchone()
        
        result = {
            'id': created_session['session_id'],
            'studentId': created_session['student_id'],
            'student': {
                'id': created_session['student_id'],
                'name': created_session['student_name'] or 'Unknown Student'
            },
            'date': created_session['date'].isoformat() if created_session['date'] else None,
            'duration': created_session['duration'],
            'type': created_session['session_type'],
            'notes': created_session['notes'],
            'outcome': created_session['outcome'],
            'nextSteps': created_session['next_steps'],
            'followUp': created_session.get('follow_up', ''),
            'approvalStatus': created_session.get('approval_status', 'pending'),
            'approvedBy': created_session.get('approved_by'),
            'approvedAt': created_session['approved_at'].isoformat() if created_session.get('approved_at') else None,
            'rejectionReason': created_session.get('rejection_reason'),
            'counselor': {
                'id': created_session['counselor_id'],
                'name': created_session['counselor_name'] or 'Unknown Counselor'
            }
        }
        return jsonify(result), 201
        
    except Error as e:
        logger.error(f"Database error creating counseling session: {e}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error creating counseling session: {e}")
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500
    finally:
        if connection and connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/<session_id>', methods=['GET'])
def get_counseling_session(session_id):
    """Get a specific counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute("""
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.session_id = %s AND cs.is_active = TRUE
        """, (session_id,))
        
        session = cursor.fetchone()
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        result = {
            'id': session['session_id'],
            'studentId': session['student_id'],
            'student': {
                'id': session['student_id'],
                'name': session['student_name'] or 'Unknown Student'
            },
            'date': session['date'].isoformat() if session['date'] else None,
            'duration': session['duration'],
            'type': session['session_type'],
            'notes': session['notes'],
            'outcome': session['outcome'],
            'nextSteps': session['next_steps'],
            'counselor': {
                'id': session['counselor_id'],
                'name': session['counselor_name'] or 'Unknown Counselor'
            }
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error fetching counseling session {session_id}: {e}")
        return jsonify({'error': 'Failed to fetch counseling session'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/<session_id>', methods=['PUT'])
def update_counseling_session(session_id):
    """Update a counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        data = request.get_json()
        cursor = connection.cursor()
        
        # Check if session exists
        cursor.execute("SELECT session_id FROM counseling_sessions WHERE session_id = %s", (session_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Session not found'}), 404
        
        # Build update query dynamically
        update_fields = []
        values = []
        
        if 'date' in data:
            session_date = data['date']
            if 'T' in session_date:
                # Convert ISO string to MySQL datetime format
                from datetime import datetime
                session_datetime = datetime.fromisoformat(session_date.replace('Z', '+00:00'))
                session_date = session_datetime.strftime('%Y-%m-%d %H:%M:%S')
            update_fields.append("date = %s")
            values.append(session_date)
        
        if 'duration' in data:
            update_fields.append("duration = %s")
            values.append(data['duration'])
        
        if 'type' in data:
            update_fields.append("session_type = %s")
            values.append(data['type'])
        
        if 'notes' in data:
            update_fields.append("notes = %s")
            values.append(data['notes'])
        
        if 'outcome' in data:
            update_fields.append("outcome = %s")
            values.append(data['outcome'])
        
        if 'nextSteps' in data:
            update_fields.append("next_steps = %s")
            values.append(data['nextSteps'])
        
        if 'counselor' in data and 'id' in data['counselor']:
            update_fields.append("counselor_id = %s")
            values.append(data['counselor']['id'])
        
        if not update_fields:
            return jsonify({'error': 'No fields to update'}), 400
        
        values.append(session_id)
        
        update_query = f"UPDATE counseling_sessions SET {', '.join(update_fields)} WHERE session_id = %s"
        cursor.execute(update_query, values)
        connection.commit()
        
        # Close current cursor and create a new dictionary cursor for fetching
        cursor.close()
        cursor = connection.cursor(dictionary=True)
        
        # Fetch updated session
        cursor.execute("""
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.session_id = %s
        """, (session_id,))
        updated_session = cursor.fetchone()
        result = {
            'id': updated_session['session_id'],
            'studentId': updated_session['student_id'],
            'student': {
                'id': updated_session['student_id'],
                'name': updated_session['student_name'] or 'Unknown Student'
            },
            'date': updated_session['date'].isoformat() if updated_session['date'] else None,
            'duration': updated_session['duration'],
            'type': updated_session['session_type'],
            'notes': updated_session['notes'],
            'outcome': updated_session['outcome'],
            'nextSteps': updated_session['next_steps'],
            'followUp': updated_session.get('follow_up', ''),
            'approvalStatus': updated_session.get('approval_status', 'pending'),
            'approvedBy': updated_session.get('approved_by'),
            'approvedAt': updated_session['approved_at'].isoformat() if updated_session.get('approved_at') else None,
            'rejectionReason': updated_session.get('rejection_reason'),
            'counselor': {
                'id': updated_session['counselor_id'],
                'name': updated_session['counselor_name'] or 'Unknown Counselor'
            }
        }
        
        return jsonify(result)
        
    except Error as e:
        logger.error(f"Error updating counseling session {session_id}: {e}")
        return jsonify({'error': 'Failed to update counseling session'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/<session_id>', methods=['DELETE'])
def delete_counseling_session(session_id):
    """Delete a counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor()
        
        # Check if session exists
        cursor.execute("SELECT session_id FROM counseling_sessions WHERE session_id = %s", (session_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Session not found'}), 404
        
        # Soft delete the session by setting is_active = FALSE
        cursor.execute("UPDATE counseling_sessions SET is_active = FALSE WHERE session_id = %s", (session_id,))
        connection.commit()
        return jsonify({'message': 'Session deleted successfully'})
        
    except Error as e:
        logger.error(f"Error deleting counseling session {session_id}: {e}")
        return jsonify({'error': 'Failed to delete counseling session'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/<session_id>/approve', methods=['PUT'])
def approve_counseling_session(session_id):
    """Approve a counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        
        if not approver_id:
            return jsonify({'error': 'Approver ID is required'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if session exists
        cursor.execute("SELECT session_id FROM counseling_sessions WHERE session_id = %s AND is_active = TRUE", (session_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Session not found'}), 404
        
        # Update approval status
        cursor.execute("""
            UPDATE counseling_sessions 
            SET approval_status = 'approved', 
                approved_by = %s, 
                approved_at = CURRENT_TIMESTAMP,
                rejection_reason = NULL
            WHERE session_id = %s
        """, (approver_id, session_id))
        
        connection.commit()
        
        # Fetch updated session with full details
        cursor.execute("""
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.session_id = %s
        """, (session_id,))
        
        session = cursor.fetchone()
        
        if not session:
            return jsonify({'error': 'Session not found after update'}), 404
        
        return jsonify({
            'id': session['session_id'],
            'studentId': session['student_id'],
            'date': session['date'].isoformat() if session['date'] else None,
            'duration': session['duration'],
            'type': session['session_type'],
            'notes': session['notes'],
            'outcome': session['outcome'],
            'nextSteps': session['next_steps'],
            'followUp': session.get('follow_up', ''),
            'approvalStatus': session['approval_status'],
            'approvedBy': session['approved_by'],
            'approvedAt': session['approved_at'].isoformat() if session.get('approved_at') else None,
            'rejectionReason': session.get('rejection_reason'),
            'counselor': {
                'id': session['counselor_id'],
                'name': session['counselor_name'] or 'Unknown Counselor'
            }
        })
        
    except Error as e:
        logger.error(f"Error approving counseling session {session_id}: {e}")
        return jsonify({'error': 'Failed to approve counseling session'}), 500
    finally:
        if connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/<session_id>/reject', methods=['PUT'])
def reject_counseling_session(session_id):
    """Reject a counseling session"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    cursor = None
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        rejection_reason = data.get('reason', '')
        
        if not approver_id:
            return jsonify({'error': 'Approver ID is required'}), 400
        
        cursor = connection.cursor(dictionary=True)
        
        # Check if session exists
        cursor.execute("SELECT session_id FROM counseling_sessions WHERE session_id = %s AND is_active = TRUE", (session_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Session not found'}), 404
        
        # Update approval status with rejection
        cursor.execute("""
            UPDATE counseling_sessions 
            SET approval_status = 'rejected', 
                approved_by = %s, 
                approved_at = CURRENT_TIMESTAMP,
                rejection_reason = %s
            WHERE session_id = %s
        """, (approver_id, rejection_reason, session_id))
        
        connection.commit()
        
        # Fetch updated session with full details
        cursor.execute("""
            SELECT cs.*, s.name as student_name, c.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students st ON cs.student_id = st.student_id
            LEFT JOIN users s ON st.user_id = s.user_id
            LEFT JOIN users c ON cs.counselor_id = c.user_id
            WHERE cs.session_id = %s
        """, (session_id,))
        
        session = cursor.fetchone()
        
        if not session:
            return jsonify({'error': 'Session not found after update'}), 404
        
        return jsonify({
            'id': session['session_id'],
            'studentId': session['student_id'],
            'date': session['date'].isoformat() if session['date'] else None,
            'duration': session['duration'],
            'type': session['session_type'],
            'notes': session['notes'],
            'outcome': session['outcome'],
            'nextSteps': session['next_steps'],
            'followUp': session.get('follow_up', ''),
            'approvalStatus': session['approval_status'],
            'approvedBy': session['approved_by'],
            'approvedAt': session['approved_at'].isoformat() if session.get('approved_at') else None,
            'rejectionReason': session.get('rejection_reason'),
            'counselor': {
                'id': session['counselor_id'],
                'name': session['counselor_name'] or 'Unknown Counselor'
            }
        })
        
    except Error as e:
        logger.error(f"Error rejecting counseling session {session_id}: {e}")
        return jsonify({'error': 'Failed to reject counseling session'}), 500
    finally:
        if connection.is_connected():
            if cursor:
                cursor.close()
            connection.close()

@app.route('/api/counseling-sessions/analytics', methods=['GET'])
def get_counseling_analytics():
    """Get counseling sessions analytics"""
    connection = get_db_connection()
    if not connection:
        return jsonify({'error': 'Database connection failed'}), 500
    
    try:
        cursor = connection.cursor(dictionary=True)
        student_id = request.args.get('student')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        
        # Base conditions
        base_conditions = "WHERE cs.is_active = TRUE"
        params = []
        
        if student_id:
            base_conditions += " AND cs.student_id = %s"
            params.append(student_id)
        
        if start_date:
            base_conditions += " AND cs.date >= %s"
            params.append(start_date)
        
        if end_date:
            base_conditions += " AND cs.date <= %s"
            params.append(end_date)
        
        # Total sessions count
        cursor.execute(f"SELECT COUNT(*) as total FROM counseling_sessions cs {base_conditions}", params)
        total_sessions = cursor.fetchone()['total']
        
        # Sessions by type
        cursor.execute(f"""
            SELECT session_type, COUNT(*) as count
            FROM counseling_sessions cs 
            {base_conditions}
            GROUP BY session_type
        """, params)
        type_results = cursor.fetchall()
        
        sessions_by_type = {}
        for result in type_results:
            sessions_by_type[result['session_type']] = result['count']
        
        # Sessions by outcome
        cursor.execute(f"""
            SELECT outcome, COUNT(*) as count
            FROM counseling_sessions cs 
            {base_conditions}
            GROUP BY outcome
        """, params)
        outcome_results = cursor.fetchall()
        
        sessions_by_outcome = {}
        for result in outcome_results:
            sessions_by_outcome[result['outcome']] = result['count']
        
        # Average session duration
        cursor.execute("SELECT AVG(duration) as avg_duration FROM counseling_sessions cs WHERE student_id = %s", (student_id,))
        avg_duration_result = cursor.fetchone()
        avg_duration = round(avg_duration_result['avg_duration'] or 0, 1)
        
        # Monthly sessions (last 6 months)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(cs.date, '%Y-%m') as month,
                COUNT(*) as count
            FROM counseling_sessions cs 
            WHERE student_id = %s
            AND cs.date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(cs.date, '%Y-%m')
            ORDER BY month
        """, (student_id,))
        monthly_results = cursor.fetchall()
        
        monthly_sessions = []
        for result in monthly_results:
            monthly_sessions.append({
                'month': result['month'],
                'count': result['count']
            })
        
        return jsonify({
            'totalSessions': total_sessions,
            'sessionsByType': sessions_by_type,
            'sessionsByOutcome': sessions_by_outcome,
            'averageDuration': avg_duration,
            'monthlySessions': monthly_sessions
        })
        
    except Error as e:
        logger.error(f"Error fetching counseling analytics: {e}")
        return jsonify({'error': 'Failed to fetch counseling analytics'}), 500
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    # Test database connection on startup
    connection = get_db_connection()
    if connection:
        connection.close()
        print("✅ Database connection successful!")
        print("🚀 Starting CounselorHub API server...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("❌ Database connection failed! Please check your database configuration.")
        exit(1)