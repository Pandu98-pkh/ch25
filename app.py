from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
from typing import List, Dict, Any
import logging

app = Flask(__name__)
# Configure CORS to handle all origins and methods
CORS(app, origins=["*"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

def handle_options():
    """Handle CORS preflight requests"""
    response = jsonify()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

@app.before_request
def before_request():
    """Handle CORS preflight requests for all routes"""
    if request.method == 'OPTIONS':
        return handle_options()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASE = 'school_management.db'

def get_db_connection():
    """Get database connection with row factory"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database tables"""
    conn = get_db_connection()
    
    # Create users table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE,
            name TEXT NOT NULL,
            email TEXT UNIQUE,
            username TEXT UNIQUE,
            role TEXT DEFAULT 'student',
            photo TEXT,
            isActive BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            deletedAt DATETIME
        )
    ''')
    
    # Create students table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT UNIQUE NOT NULL,
            name TEXT,
            email TEXT,
            username TEXT,
            grade TEXT,
            tingkat TEXT,
            kelas TEXT,
            academicStatus TEXT DEFAULT 'warning',
            program TEXT,
            mentalHealthScore INTEGER DEFAULT 0,
            photo TEXT,
            userId TEXT,
            isActive BOOLEAN DEFAULT 1,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            deletedAt DATETIME,
            FOREIGN KEY (userId) REFERENCES users (userId)
        )
    ''')
      # Create counseling_sessions table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS counseling_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT,
            counselorId TEXT,
            sessionDate DATETIME,
            notes TEXT,
            duration INTEGER DEFAULT 45,
            type TEXT DEFAULT 'academic',
            outcome TEXT DEFAULT 'neutral',
            nextSteps TEXT,
            followUp TEXT,
            approvalStatus TEXT DEFAULT 'pending',
            approvedBy TEXT,
            approvedAt DATETIME,
            rejectionReason TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students (studentId)
        )
    ''')
    
    # Create mental_health_assessments table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS mental_health_assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT,
            score INTEGER,
            assessment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (studentId) REFERENCES students (studentId)
        )
    ''')
    
    # Create behavior_records table
    conn.execute('''
        CREATE TABLE IF NOT EXISTS behavior_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT,
            type TEXT,
            description TEXT,
            recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (studentId) REFERENCES students (studentId)
        )
    ''')
    
    conn.commit()
    conn.close()

@app.before_request
def handle_preflight():
    """Handle CORS preflight requests"""
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

@app.route('/api/admin/students/deleted', methods=['GET', 'OPTIONS'])
def get_deleted_students():
    """Get all deleted students with user data enrichment"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    try:
        logger.info("Fetching deleted students...")
        conn = get_db_connection()
        
        # Get deleted students with LEFT JOIN to users table
        query = '''
            SELECT 
                s.*,
                u.id as userTableId,
                u.name as userTableName,
                u.email as userTableEmail,
                u.photo as userTablePhoto
            FROM students s
            LEFT JOIN users u ON s.userId = u.userId
            WHERE s.deletedAt IS NOT NULL
            ORDER BY s.deletedAt DESC
        '''
        
        students = conn.execute(query).fetchall()
        conn.close()
        
        # Convert to list of dictionaries
        result = []
        for student in students:
            student_dict = dict(student)
            result.append(student_dict)
        
        logger.info(f"Retrieved {len(result)} deleted students")
        return jsonify(result)
        
    except sqlite3.Error as e:
        logger.error(f"Database error fetching deleted students: {str(e)}")
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Error fetching deleted students: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/deleted', methods=['GET', 'OPTIONS'])
def get_deleted_users():
    """Get all deleted users (fallback endpoint)"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    try:
        conn = get_db_connection()
        
        query = '''
            SELECT * FROM users 
            WHERE deletedAt IS NOT NULL 
            ORDER BY deletedAt DESC
        '''
        
        users = conn.execute(query).fetchall()
        conn.close()
        
        result = [dict(user) for user in users]
        
        logger.info(f"Retrieved {len(result)} deleted users")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error fetching deleted users: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/students/<student_id>/restore', methods=['PUT', 'OPTIONS'])
def restore_student(student_id):
    """Restore a soft-deleted student"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    try:
        conn = get_db_connection()
        
        # Check if student exists and is deleted
        student = conn.execute(
            'SELECT * FROM students WHERE studentId = ? AND deletedAt IS NOT NULL',
            (student_id,)
        ).fetchone()
        
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found or not deleted'}), 404
        
        # Restore student
        conn.execute(
            'UPDATE students SET deletedAt = NULL, isActive = 1 WHERE studentId = ?',
            (student_id,)
        )
        
        # Also restore associated user if exists
        if student['userId']:
            conn.execute(
                'UPDATE users SET deletedAt = NULL, isActive = 1 WHERE userId = ?',
                (student['userId'],)
            )
        
        conn.commit()
        conn.close()
        
        logger.info(f"Student {student_id} restored successfully")
        return jsonify({'message': f'Student {student_id} restored successfully'})
        
    except Exception as e:
        logger.error(f"Error restoring student {student_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/students/<student_id>/hard-delete', methods=['DELETE', 'OPTIONS'])
def hard_delete_student(student_id):
    """Permanently delete a student and all associated data"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    try:
        conn = get_db_connection()
        
        # Check if student exists
        student = conn.execute(
            'SELECT * FROM students WHERE studentId = ?',
            (student_id,)
        ).fetchone()
        
        if not student:
            conn.close()
            return jsonify({'error': 'Student not found'}), 404
        
        # Delete associated data
        conn.execute('DELETE FROM counseling_sessions WHERE studentId = ?', (student_id,))
        conn.execute('DELETE FROM mental_health_assessments WHERE studentId = ?', (student_id,))
        conn.execute('DELETE FROM behavior_records WHERE studentId = ?', (student_id,))
        
        # Delete student record
        conn.execute('DELETE FROM students WHERE studentId = ?', (student_id,))
        
        # Note: We keep the user account for audit purposes
        
        conn.commit()
        conn.close()
        
        logger.info(f"Student {student_id} permanently deleted")
        return jsonify({
            'message': f'Student {student_id} permanently deleted from database',
            'warning': 'All academic data has been removed. User account preserved for audit.'
        })
        
    except Exception as e:
        logger.error(f"Error hard deleting student {student_id}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/students/bulk-hard-delete', methods=['DELETE', 'OPTIONS'])
def bulk_hard_delete_students():
    """Permanently delete multiple students and all associated data"""
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
            
        student_ids = data.get('studentIds', [])
        
        if not student_ids:
            return jsonify({'error': 'No student IDs provided'}), 400
        
        logger.info(f"Attempting to bulk delete students: {student_ids}")
        
        conn = get_db_connection()
        
        deleted_count = 0
        errors = []
        
        for student_id in student_ids:
            try:
                # Check if student exists
                student = conn.execute(
                    'SELECT * FROM students WHERE studentId = ?',
                    (student_id,)
                ).fetchone()
                
                if student:
                    # Delete associated data
                    conn.execute('DELETE FROM counseling_sessions WHERE studentId = ?', (student_id,))
                    conn.execute('DELETE FROM mental_health_assessments WHERE studentId = ?', (student_id,))
                    conn.execute('DELETE FROM behavior_records WHERE studentId = ?', (student_id,))
                    
                    # Delete student record
                    conn.execute('DELETE FROM students WHERE studentId = ?', (student_id,))
                    deleted_count += 1
                    logger.info(f"Successfully deleted student {student_id}")
                else:
                    errors.append(f"Student {student_id} not found")
                    logger.warning(f"Student {student_id} not found")
                    
            except Exception as e:
                errors.append(f"Error deleting student {student_id}: {str(e)}")
                logger.error(f"Error deleting student {student_id}: {str(e)}")
        
        conn.commit()
        conn.close()
        
        message = f'{deleted_count} students permanently deleted from database'
        if errors:
            message += f'. Errors: {"; ".join(errors)}'
        
        logger.info(f"Bulk delete completed: {deleted_count} deleted, {len(errors)} errors")
        
        response_data = {
            'message': message,
            'warning': 'All academic data has been removed. User accounts preserved for audit.',
            'deletedCount': deleted_count,
            'errors': errors
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Error in bulk hard delete: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Add a test endpoint to verify the server is running
# Counseling Sessions API endpoints
@app.route('/api/counseling-sessions', methods=['GET', 'OPTIONS'])
def get_counseling_sessions():
    if request.method == 'OPTIONS':
        return handle_options()
    
    try:
        conn = get_db_connection()
        
        # Get query parameters
        student_id = request.args.get('student')
        counselor_id = request.args.get('counselor')
        session_type = request.args.get('type')
        approval_status = request.args.get('status')
        start_date = request.args.get('startDate')
        end_date = request.args.get('endDate')
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 20))
        
        # Build query
        query = '''
        SELECT cs.*, s.name as student_name, u.name as counselor_name
        FROM counseling_sessions cs
        LEFT JOIN students s ON cs.studentId = s.studentId
        LEFT JOIN users u ON cs.counselorId = u.userId
        WHERE 1=1
        '''
        params = []
        
        if student_id:
            query += ' AND cs.studentId = ?'
            params.append(student_id)
        
        if counselor_id:
            query += ' AND cs.counselorId = ?'
            params.append(counselor_id)
        
        if session_type:
            query += ' AND cs.type = ?'
            params.append(session_type)
        
        if approval_status:
            query += ' AND cs.approvalStatus = ?'
            params.append(approval_status)
        
        if start_date:
            query += ' AND DATE(cs.sessionDate) >= DATE(?)'
            params.append(start_date)
        
        if end_date:
            query += ' AND DATE(cs.sessionDate) <= DATE(?)'
            params.append(end_date)
        
        query += ' ORDER BY cs.sessionDate DESC'
        
        # Execute query
        cursor = conn.execute(query, params)
        sessions = cursor.fetchall()
        
        # Format response
        results = []
        for session in sessions:
            results.append({
                'id': str(session['id']),
                'studentId': session['studentId'],
                'date': session['sessionDate'],
                'duration': session['duration'] or 45,
                'notes': session['notes'] or '',
                'type': session['type'] or 'academic',
                'outcome': session['outcome'] or 'neutral',
                'nextSteps': session['nextSteps'] or '',
                'followUp': session['followUp'] or '',
                'approvalStatus': session['approvalStatus'] or 'pending',
                'approvedBy': session['approvedBy'],
                'approvedAt': session['approvedAt'],
                'rejectionReason': session['rejectionReason'],
                'counselor': {
                    'id': session['counselorId'] or '',
                    'name': session['counselor_name'] or 'Unknown'
                }
            })
        
        # Apply pagination
        total_count = len(results)
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_results = results[start_idx:end_idx]
        
        conn.close()
        
        return jsonify({
            'results': paginated_results,
            'count': total_count,
            'current_page': page,
            'total_pages': (total_count + limit - 1) // limit
        })
        
    except Exception as e:
        logger.error(f"Error getting counseling sessions: {str(e)}")
        return jsonify({'error': 'Failed to fetch counseling sessions'}), 500

@app.route('/api/counseling-sessions', methods=['POST'])
def create_counseling_session():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['studentId', 'date', 'notes']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        conn = get_db_connection()
        
        # Insert new session with default pending status
        cursor = conn.execute('''
            INSERT INTO counseling_sessions 
            (studentId, counselorId, sessionDate, notes, duration, type, outcome, 
             nextSteps, followUp, approvalStatus)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['studentId'],
            data.get('counselor', {}).get('id'),
            data['date'],
            data['notes'],
            data.get('duration', 45),
            data.get('type', 'academic'),
            data.get('outcome', 'neutral'),
            data.get('nextSteps', ''),
            data.get('followUp', ''),
            'pending'  # Default status
        ))
        
        session_id = cursor.lastrowid
        conn.commit()
        
        # Fetch the created session
        cursor = conn.execute('''
            SELECT cs.*, s.name as student_name, u.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students s ON cs.studentId = s.studentId
            LEFT JOIN users u ON cs.counselorId = u.userId
            WHERE cs.id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        conn.close()
        
        if not session:
            return jsonify({'error': 'Session not found after creation'}), 500
        
        return jsonify({
            'id': str(session['id']),
            'studentId': session['studentId'],
            'date': session['sessionDate'],
            'duration': session['duration'] or 45,
            'notes': session['notes'] or '',
            'type': session['type'] or 'academic',
            'outcome': session['outcome'] or 'neutral',
            'nextSteps': session['nextSteps'] or '',
            'followUp': session['followUp'] or '',
            'approvalStatus': session['approvalStatus'] or 'pending',
            'approvedBy': session['approvedBy'],
            'approvedAt': session['approvedAt'],
            'rejectionReason': session['rejectionReason'],
            'counselor': {
                'id': session['counselorId'] or '',
                'name': session['counselor_name'] or 'Unknown'
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating counseling session: {str(e)}")
        return jsonify({'error': 'Failed to create counseling session'}), 500

@app.route('/api/counseling-sessions/<session_id>', methods=['PUT'])
def update_counseling_session(session_id):
    try:
        data = request.get_json()
        conn = get_db_connection()
        
        # Build update query
        update_fields = []
        params = []
        
        if 'notes' in data:
            update_fields.append('notes = ?')
            params.append(data['notes'])
        
        if 'duration' in data:
            update_fields.append('duration = ?')
            params.append(data['duration'])
        
        if 'type' in data:
            update_fields.append('type = ?')
            params.append(data['type'])
        
        if 'outcome' in data:
            update_fields.append('outcome = ?')
            params.append(data['outcome'])
        
        if 'nextSteps' in data:
            update_fields.append('nextSteps = ?')
            params.append(data['nextSteps'])
        
        if 'followUp' in data:
            update_fields.append('followUp = ?')
            params.append(data['followUp'])
        
        if 'date' in data:
            update_fields.append('sessionDate = ?')
            params.append(data['date'])
        
        if update_fields:
            params.append(session_id)
            query = f'UPDATE counseling_sessions SET {", ".join(update_fields)} WHERE id = ?'
            conn.execute(query, params)
            conn.commit()
        
        # Fetch updated session
        cursor = conn.execute('''
            SELECT cs.*, s.name as student_name, u.name as counselor_name
            FROM counseling_sessions cs
            LEFT JOIN students s ON cs.studentId = s.studentId
            LEFT JOIN users u ON cs.counselorId = u.userId
            WHERE cs.id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        conn.close()
        
        if not session:
            return jsonify({'error': 'Session not found'}), 404
        
        return jsonify({
            'id': str(session['id']),
            'studentId': session['studentId'],
            'date': session['sessionDate'],
            'duration': session['duration'] or 45,
            'notes': session['notes'] or '',
            'type': session['type'] or 'academic',
            'outcome': session['outcome'] or 'neutral',
            'nextSteps': session['nextSteps'] or '',
            'followUp': session['followUp'] or '',
            'approvalStatus': session['approvalStatus'] or 'pending',
            'approvedBy': session['approvedBy'],
            'approvedAt': session['approvedAt'],
            'rejectionReason': session['rejectionReason'],
            'counselor': {
                'id': session['counselorId'] or '',
                'name': session['counselor_name'] or 'Unknown'
            }
        })
        
    except Exception as e:
        logger.error(f"Error updating counseling session: {str(e)}")
        return jsonify({'error': 'Failed to update counseling session'}), 500

@app.route('/api/counseling-sessions/<session_id>/approve', methods=['PUT'])
def approve_counseling_session(session_id):
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        
        if not approver_id:
            return jsonify({'error': 'Approver ID is required'}), 400
        
        conn = get_db_connection()
        
        # Update approval status
        conn.execute('''
            UPDATE counseling_sessions 
            SET approvalStatus = 'approved', approvedBy = ?, approvedAt = CURRENT_TIMESTAMP,
                rejectionReason = NULL
            WHERE id = ?
        ''', (approver_id, session_id))
        
        conn.commit()
        
        if conn.total_changes == 0:
            conn.close()
            return jsonify({'error': 'Session not found'}), 404
        
        # Fetch updated session
        cursor = conn.execute('''
            SELECT cs.*, s.name as student_name, u.name as counselor_name, a.name as approver_name
            FROM counseling_sessions cs
            LEFT JOIN students s ON cs.studentId = s.studentId
            LEFT JOIN users u ON cs.counselorId = u.userId
            LEFT JOIN users a ON cs.approvedBy = a.userId
            WHERE cs.id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'id': str(session['id']),
            'studentId': session['studentId'],
            'date': session['sessionDate'],
            'duration': session['duration'] or 45,
            'notes': session['notes'] or '',
            'type': session['type'] or 'academic',
            'outcome': session['outcome'] or 'neutral',
            'nextSteps': session['nextSteps'] or '',
            'followUp': session['followUp'] or '',
            'approvalStatus': session['approvalStatus'],
            'approvedBy': session['approvedBy'],
            'approvedAt': session['approvedAt'],
            'rejectionReason': session['rejectionReason'],
            'counselor': {
                'id': session['counselorId'] or '',
                'name': session['counselor_name'] or 'Unknown'
            }
        })
        
    except Exception as e:
        logger.error(f"Error approving counseling session: {str(e)}")
        return jsonify({'error': 'Failed to approve counseling session'}), 500

@app.route('/api/counseling-sessions/<session_id>/reject', methods=['PUT'])
def reject_counseling_session(session_id):
    try:
        data = request.get_json()
        approver_id = data.get('approver_id')
        rejection_reason = data.get('reason', '')
        
        if not approver_id:
            return jsonify({'error': 'Approver ID is required'}), 400
        
        conn = get_db_connection()
        
        # Update approval status
        conn.execute('''
            UPDATE counseling_sessions 
            SET approvalStatus = 'rejected', approvedBy = ?, approvedAt = CURRENT_TIMESTAMP,
                rejectionReason = ?
            WHERE id = ?
        ''', (approver_id, rejection_reason, session_id))
        
        conn.commit()
        
        if conn.total_changes == 0:
            conn.close()
            return jsonify({'error': 'Session not found'}), 404
        
        # Fetch updated session
        cursor = conn.execute('''
            SELECT cs.*, s.name as student_name, u.name as counselor_name, a.name as approver_name
            FROM counseling_sessions cs
            LEFT JOIN students s ON cs.studentId = s.studentId
            LEFT JOIN users u ON cs.counselorId = u.userId
            LEFT JOIN users a ON cs.approvedBy = a.userId
            WHERE cs.id = ?
        ''', (session_id,))
        
        session = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'id': str(session['id']),
            'studentId': session['studentId'],
            'date': session['sessionDate'],
            'duration': session['duration'] or 45,
            'notes': session['notes'] or '',
            'type': session['type'] or 'academic',
            'outcome': session['outcome'] or 'neutral',
            'nextSteps': session['nextSteps'] or '',
            'followUp': session['followUp'] or '',
            'approvalStatus': session['approvalStatus'],
            'approvedBy': session['approvedBy'],
            'approvedAt': session['approvedAt'],
            'rejectionReason': session['rejectionReason'],
            'counselor': {
                'id': session['counselorId'] or '',
                'name': session['counselor_name'] or 'Unknown'
            }
        })
        
    except Exception as e:
        logger.error(f"Error rejecting counseling session: {str(e)}")
        return jsonify({'error': 'Failed to reject counseling session'}), 500

@app.route('/api/counseling-sessions/<session_id>', methods=['DELETE'])
def delete_counseling_session(session_id):
    try:
        conn = get_db_connection()
        
        # Delete the session
        conn.execute('DELETE FROM counseling_sessions WHERE id = ?', (session_id,))
        conn.commit()
        
        if conn.total_changes == 0:
            conn.close()
            return jsonify({'error': 'Session not found'}), 404
        
        conn.close()
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Error deleting counseling session: {str(e)}")
        return jsonify({'error': 'Failed to delete counseling session'}), 500

@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test_endpoint():
    """Test endpoint to verify server is running"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
        
    try:
        # Test database connection
        conn = get_db_connection()
        conn.execute('SELECT 1').fetchone()
        conn.close()
        db_status = "Connected"
    except Exception as e:
        db_status = f"Error: {str(e)}"
    
    return jsonify({
        'message': 'Server is running successfully! 🚀',
        'timestamp': datetime.datetime.now().isoformat(),
        'database_status': db_status,
        'endpoints': {
            'deleted_students': '/api/admin/students/deleted',
            'deleted_users': '/api/admin/users/deleted',
            'restore_student': '/api/admin/students/<id>/restore',
            'hard_delete_student': '/api/admin/students/<id>/hard-delete',
            'bulk_hard_delete': '/api/admin/students/bulk-hard-delete'
        },
        'cors_enabled': True
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

# Add startup message and error handling
if __name__ == '__main__':
    try:
        print("🚀 Starting Flask server...")
        print("📊 Initializing database...")
        init_db()
        print("✅ Database initialized successfully!")
        print("🌐 Server will be available at: http://localhost:5000")
        print("🔧 Test endpoint: http://localhost:5000/api/test")
        print("📡 CORS enabled for all origins")
        print("-" * 50)
        
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Failed to start server: {str(e)}")
        print("Please check if port 5000 is available or try a different port.")
