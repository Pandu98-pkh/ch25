"""
CounselorHub Database Creation Script
Creates the complete database structure for the student counseling system
with all tables and sample data using MySQL with admin credentials.
Updated June 2025 - Generated from current database structure analysis.
"""

import mysql.connector
from mysql.connector import Error
import bcrypt
import json
from datetime import datetime, date
import uuid

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'charset': 'utf8mb4',
    'collation': 'utf8mb4_unicode_ci'
}

DATABASE_NAME = 'counselorhub'

def create_database_connection(include_db=True):
    """Create database connection"""
    try:
        config = DB_CONFIG.copy()
        if include_db:
            config['database'] = DATABASE_NAME
        
        connection = mysql.connector.connect(**config)
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def create_database():
    """Create the CounselorHub database"""
    connection = create_database_connection(include_db=False)
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Drop database if exists and create new one
        cursor.execute(f"DROP DATABASE IF EXISTS {DATABASE_NAME}")
        cursor.execute(f"CREATE DATABASE {DATABASE_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        
        print(f"✓ Database '{DATABASE_NAME}' created successfully")
        return True
        
    except Error as e:
        print(f"Error creating database: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_tables():
    """Create all tables for the counseling system"""
    connection = create_database_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
          # Users table
        users_table = """
        CREATE TABLE users (
            user_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            role ENUM('admin', 'counselor', 'student') NOT NULL,
            photo TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_username (username),
            INDEX idx_email (email),
            INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Classes table
        classes_table = """
        CREATE TABLE classes (
            class_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            grade_level VARCHAR(10) NOT NULL,
            student_count INT DEFAULT 0,
            academic_year VARCHAR(10) NOT NULL,
            teacher_name VARCHAR(100),
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_class_id (class_id),
            INDEX idx_grade_level (grade_level),
            INDEX idx_academic_year (academic_year)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """        # Students table (normalized - user data accessed via users table)
        students_table = """
        CREATE TABLE students (
            student_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            academic_status ENUM('good', 'warning', 'critical') DEFAULT 'good',
            program VARCHAR(50),
            mental_health_score INT,
            last_counseling TIMESTAMP NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            class_id VARCHAR(50),
            user_id VARCHAR(50) NOT NULL,
            FOREIGN KEY (class_id) REFERENCES classes(class_id) ON DELETE SET NULL,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_student_id (student_id),
            INDEX idx_user_id (user_id),
            INDEX idx_academic_status (academic_status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Counseling Sessions table (Updated with approval system)
        sessions_table = """
        CREATE TABLE counseling_sessions (
            session_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            counselor_id VARCHAR(50) NOT NULL,
            date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            duration INT NOT NULL COMMENT 'Duration in minutes',
            notes TEXT,
            session_type ENUM('academic', 'behavioral', 'mental-health', 'career', 'social') NOT NULL,
            outcome ENUM('positive', 'neutral', 'negative') NOT NULL,
            next_steps TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
            approved_by VARCHAR(50),
            approved_at TIMESTAMP NULL,
            rejection_reason TEXT,
            follow_up TEXT,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (counselor_id) REFERENCES users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
            INDEX idx_session_id (session_id),
            INDEX idx_student_id (student_id),
            INDEX idx_counselor_id (counselor_id),
            INDEX idx_date (date),
            INDEX idx_session_type (session_type),
            INDEX idx_approval_status (approval_status),
            INDEX fk_approved_by (approved_by)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Mental Health Assessments table
        assessments_table = """
        CREATE TABLE mental_health_assessments (
            assessment_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            assessor_id VARCHAR(50) NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            score INT NOT NULL,
            notes TEXT,
            assessment_type VARCHAR(50) NOT NULL COMMENT 'DASS-21, PHQ-9, GAD-7',
            risk_level ENUM('low', 'moderate', 'high') NOT NULL,
            category VARCHAR(50) NOT NULL,
            responses TEXT COMMENT 'Assessment responses as JSON string',
            recommendations TEXT,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (assessor_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_assessment_id (assessment_id),
            INDEX idx_student_id (student_id),
            INDEX idx_assessor_id (assessor_id),
            INDEX idx_assessment_type (assessment_type),
            INDEX idx_risk_level (risk_level)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Behavior Records table
        behavior_table = """
        CREATE TABLE behavior_records (
            record_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            reporter_id VARCHAR(50) NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            behavior_type ENUM('positive', 'negative') NOT NULL,
            description TEXT NOT NULL,
            severity ENUM('positive', 'neutral', 'minor', 'major') NOT NULL,
            category VARCHAR(50) COMMENT 'attendance, discipline, participation, social',
            action_taken TEXT,
            follow_up_required TINYINT(1) DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_record_id (record_id),
            INDEX idx_student_id (student_id),
            INDEX idx_reporter_id (reporter_id),
            INDEX idx_behavior_type (behavior_type),
            INDEX idx_severity (severity)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Career Assessments table
        career_table = """
        CREATE TABLE career_assessments (
            assessment_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            student_id VARCHAR(50) NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            assessment_type VARCHAR(50) NOT NULL COMMENT 'mbti, riasec, holland',
            interests TEXT,
            skills TEXT,
            values_data TEXT,
            recommended_paths TEXT,
            notes TEXT,
            results TEXT COMMENT 'Detailed assessment results as JSON string',
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
            INDEX idx_assessment_id (assessment_id),
            INDEX idx_student_id (student_id),
            INDEX idx_assessment_type (assessment_type)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Career Resources table
        resources_table = """
        CREATE TABLE career_resources (
            resource_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            resource_type VARCHAR(50) NOT NULL COMMENT 'article, video, assessment, etc.',
            url VARCHAR(500),
            tags TEXT,
            date_published TIMESTAMP NULL,
            author VARCHAR(100),
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_resource_id (resource_id),
            INDEX idx_resource_type (resource_type),
            INDEX idx_title (title)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
          # Notifications table
        notifications_table = """
        CREATE TABLE notifications (
            notification_id VARCHAR(50) UNIQUE NOT NULL PRIMARY KEY,
            user_id VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            notification_type VARCHAR(50) NOT NULL,
            priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
            is_read TINYINT(1) DEFAULT 0,
            action_url VARCHAR(500),
            expires_at TIMESTAMP NULL,
            is_active TINYINT(1) DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
            INDEX idx_notification_id (notification_id),
            INDEX idx_user_id (user_id),
            INDEX idx_is_read (is_read),
            INDEX idx_priority (priority)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
        
        # Execute table creation
        tables = [
            ("users", users_table),
            ("classes", classes_table),
            ("students", students_table),
            ("counseling_sessions", sessions_table),
            ("mental_health_assessments", assessments_table),
            ("behavior_records", behavior_table),
            ("career_assessments", career_table),
            ("career_resources", resources_table),
            ("notifications", notifications_table)
        ]
        
        for table_name, table_sql in tables:
            cursor.execute(table_sql)
            print(f"✓ Table '{table_name}' created successfully")
        
        connection.commit()
        return True
        
    except Error as e:
        print(f"Error creating tables: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def insert_sample_data():
    """Insert comprehensive sample data"""
    connection = create_database_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
          # Create password hashes
        admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        counselor1_password = bcrypt.hashpw('counselor123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        counselor2_password = bcrypt.hashpw('counselor456'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create student passwords
        student_passwords = {}
        for i in range(1, 9):
            student_passwords[f'STU00{i}'] = bcrypt.hashpw(f'student{i}23'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insert Users (including student users)
        users_data = [
            ('USR001', 'admin', 'admin@counselorhub.edu', admin_password, 'Administrator', 'admin'),
            ('USR002', 'counselor1', 'sarah.johnson@counselorhub.edu', counselor1_password, 'Dr. Sarah Johnson', 'counselor'),
            ('USR003', 'counselor2', 'michael.chen@counselorhub.edu', counselor2_password, 'Dr. Michael Chen', 'counselor'),
            ('USR004', 'alice.smith', 'alice.smith@student.edu', student_passwords['STU001'], 'Alice Smith', 'student'),
            ('USR005', 'bob.johnson', 'bob.johnson@student.edu', student_passwords['STU002'], 'Bob Johnson', 'student'),
            ('USR006', 'carol.davis', 'carol.davis@student.edu', student_passwords['STU003'], 'Carol Davis', 'student'),
            ('USR007', 'david.wilson', 'david.wilson@student.edu', student_passwords['STU004'], 'David Wilson', 'student'),
            ('USR008', 'emma.brown', 'emma.brown@student.edu', student_passwords['STU005'], 'Emma Brown', 'student'),
            ('USR009', 'frank.miller', 'frank.miller@student.edu', student_passwords['STU006'], 'Frank Miller', 'student'),
            ('USR010', 'grace.lee', 'grace.lee@student.edu', student_passwords['STU007'], 'Grace Lee', 'student'),
            ('USR011', 'henry.zhang', 'henry.zhang@student.edu', student_passwords['STU008'], 'Henry Zhang', 'student'),
        ]
        
        cursor.executemany("""
            INSERT INTO users (user_id, username, email, password_hash, name, role) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, users_data)
        
        # Insert Classes
        classes_data = [
            ('CLS001', 'A', '10', 25, '2024-2025', 'Mrs. Anderson'),
            ('CLS002', 'B', '10', 24, '2024-2025', 'Mr. Thompson'),
            ('CLS003', 'A', '11', 23, '2024-2025', 'Dr. Roberts'),
            ('CLS004', 'B', '11', 22, '2024-2025', 'Ms. Wilson'),
            ('CLS005', 'A', '12', 21, '2024-2025', 'Mr. Davis'),
        ]
        
        cursor.executemany("""
            INSERT INTO classes (class_id, name, grade_level, student_count, academic_year, teacher_name) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, classes_data)
          # Insert Students (normalized - user data stored in users table)
        students_data = [
            ('STU001', 'good', 'Science', 75, 'CLS001', 'USR004'),      # user_id = USR004 (Alice Smith)
            ('STU002', 'warning', 'Science', 65, 'CLS001', 'USR005'),   # user_id = USR005 (Bob Johnson)
            ('STU003', 'good', 'Social Sciences', 85, 'CLS003', 'USR006'), # user_id = USR006 (Carol Davis)
            ('STU004', 'critical', 'Arts', 55, 'CLS002', 'USR007'),     # user_id = USR007 (David Wilson)
            ('STU005', 'good', 'Science', 80, 'CLS004', 'USR008'),      # user_id = USR008 (Emma Brown)
            ('STU006', 'good', 'Business', 78, 'CLS005', 'USR009'),     # user_id = USR009 (Frank Miller)
            ('STU007', 'warning', 'Arts', 68, 'CLS001', 'USR010'),     # user_id = USR010 (Grace Lee)
            ('STU008', 'good', 'Technology', 82, 'CLS003', 'USR011'),  # user_id = USR011 (Henry Zhang)
        ]
        
        cursor.executemany("""
            INSERT INTO students (student_id,  academic_status, program, mental_health_score, class_id, user_id) 
            VALUES (%s,  %s, %s, %s, %s, %s)
        """, students_data)
          # Insert Counseling Sessions (update to use string IDs)
        sessions_data = [
            (f'SES_{uuid.uuid4().hex[:8].upper()}', 'STU001', 'USR002', '2024-01-15 10:00:00', 45, 'Initial counseling session. Student adjusting well to new grade.', 'academic', 'positive', 'Continue monitoring academic progress'),
            (f'SES_{uuid.uuid4().hex[:8].upper()}', 'STU002', 'USR002', '2024-01-20 14:30:00', 60, 'Academic stress discussion. Provided study techniques.', 'mental-health', 'neutral', 'Follow-up session scheduled for next week'),
            (f'SES_{uuid.uuid4().hex[:8].upper()}', 'STU003', 'USR003', '2024-01-25 11:15:00', 50, 'Career guidance session. Discussed future academic paths.', 'career', 'positive', 'Explore university programs'),
            (f'SES_{uuid.uuid4().hex[:8].upper()}', 'STU004', 'USR003', '2024-01-28 09:00:00', 55, 'Addressed attendance issues and time management.', 'behavioral', 'neutral', 'Weekly check-ins for next month'),
        ]
        
        cursor.executemany("""
            INSERT INTO counseling_sessions (session_id, student_id, counselor_id, date, duration, notes, session_type, outcome, next_steps) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, sessions_data)
        
        # Insert Mental Health Assessments (update to use string IDs)
        assessments_data = [
            (f'MHA_{uuid.uuid4().hex[:8].upper()}', 'STU001', 'USR002', '2024-01-15 10:00:00', 5, 'GAD-7', 'low', 'anxiety', '{"q1": 1, "q2": 1, "q3": 0, "q4": 1, "q5": 1, "q6": 0, "q7": 1}', 'Mild anxiety levels detected', 'Regular check-ins, stress management techniques'),
            (f'MHA_{uuid.uuid4().hex[:8].upper()}', 'STU002', 'USR002', '2024-01-20 14:30:00', 8, 'PHQ-9', 'moderate', 'depression', '{"q1": 1, "q2": 1, "q3": 1, "q4": 1, "q5": 1, "q6": 0, "q7": 1, "q8": 1, "q9": 1}', 'Minimal depressive symptoms', 'Continue monitoring, lifestyle modifications'),
            (f'MHA_{uuid.uuid4().hex[:8].upper()}', 'STU004', 'USR003', '2024-01-28 09:00:00', 12, 'DASS-21', 'high', 'stress', '{"depression": 4, "anxiety": 3, "stress": 5}', 'Elevated stress levels requiring intervention', 'Immediate counseling sessions and stress reduction plan'),
        ]
          # Insert Behavior Records (update to use string IDs)
        behavior_data = [
            (f'BEH_{uuid.uuid4().hex[:8].upper()}', 'STU001', 'USR002', '2024-01-10 08:00:00', 'positive', 'Helped a classmate with studies', 'positive', 'participation', 'Positive reinforcement provided', 0),
            (f'BEH_{uuid.uuid4().hex[:8].upper()}', 'STU002', 'USR002', '2024-01-18 14:00:00', 'negative', 'Late submission of assignments', 'minor', 'discipline', 'Discussed time management strategies', 1),
            (f'BEH_{uuid.uuid4().hex[:8].upper()}', 'STU004', 'USR003', '2024-01-22 09:30:00', 'negative', 'Frequent absences from class', 'major', 'attendance', 'Parent meeting scheduled, attendance plan created', 1),
        ]
        cursor.executemany("""
            INSERT INTO behavior_records (record_id, student_id, reporter_id, date, behavior_type, description, severity, category, action_taken, follow_up_required) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, behavior_data)
        
        cursor.executemany("""
            INSERT INTO mental_health_assessments (assessment_id, student_id, assessor_id, date, score, assessment_type, risk_level, category, responses, notes, recommendations) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, assessments_data)
        
        cursor.executemany("""
            INSERT INTO career_assessments (assessment_id, student_id, date, assessment_type, interests, skills, values_data, recommended_paths, notes, results) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, career_data)
        
        # Insert Career Assessments (update to use string IDs)
        career_data = [
            (f'CAR_{uuid.uuid4().hex[:8].upper()}', 'STU003', '2024-01-25 11:15:00', 'riasec', '["Investigative", "Realistic"]', '["mathematics", "problem_solving", "logical_thinking"]', '["achievement", "independence", "intellectual_stimulation"]', '["Engineering", "Computer Science", "Data Science"]', 'Strong aptitude for STEM fields', '{"realistic": 85, "investigative": 90, "artistic": 45, "social": 60, "enterprising": 55, "conventional": 70}'),
            (f'CAR_{uuid.uuid4().hex[:8].upper()}', 'STU005', '2024-01-30 15:00:00', 'riasec', '["Artistic", "Social"]', '["creativity", "communication", "artistic_ability"]', '["creativity", "helping_others", "self_expression"]', '["Graphic Design", "Psychology", "Creative Writing"]', 'Strong creative and social inclinations', '{"realistic": 40, "investigative": 55, "artistic": 92, "social": 85, "enterprising": 60, "conventional": 45}'),
        ]
          # Insert Sample Notifications (update to use string IDs)
        notifications_data = [
            (f'NOT_{uuid.uuid4().hex[:8].upper()}', 'USR002', 'New Student Assessment Required', 'Student Alice Smith requires mental health assessment follow-up', 'assessment', 'high', 0, '/students/STU001/assessments'),
            (f'NOT_{uuid.uuid4().hex[:8].upper()}', 'USR003', 'Behavior Follow-up Needed', 'David Wilson requires follow-up on attendance issues', 'behavior', 'medium', 0, '/students/STU004/behavior'),
            (f'NOT_{uuid.uuid4().hex[:8].upper()}', 'USR001', 'System Update Completed', 'CounselorHub system has been updated with new features', 'system', 'low', 0, '/settings'),
        ]
        
        cursor.executemany("""
            INSERT INTO notifications (notification_id, user_id, title, message, notification_type, priority, is_read, action_url) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, notifications_data)
        
        connection.commit()
        print("✓ Sample data inserted successfully")
        return True
        
    except Error as e:
        print(f"Error inserting sample data: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def create_database_user():
    """Create database user with full privileges"""
    connection = create_database_connection(include_db=False)
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Create user with full privileges
        cursor.execute("DROP USER IF EXISTS 'counselorhub_user'@'localhost'")
        cursor.execute("CREATE USER 'counselorhub_user'@'localhost' IDENTIFIED BY 'counselorhub_password_2024'")
        cursor.execute(f"GRANT ALL PRIVILEGES ON {DATABASE_NAME}.* TO 'counselorhub_user'@'localhost'")
        cursor.execute("FLUSH PRIVILEGES")
        
        print("✓ Database user 'counselorhub_user' created with full privileges")
        return True
        
    except Error as e:
        print(f"Error creating database user: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def show_database_info():
    """Display database information and sample data"""
    connection = create_database_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        print("\n" + "="*60)
        print("COUNSELORHUB DATABASE CREATED SUCCESSFULLY")
        print("="*60)
        
        # Show table counts
        tables = ['users', 'students', 'classes', 'counseling_sessions', 
                 'mental_health_assessments', 'behavior_records', 
                 'career_assessments', 'career_resources', 'notifications']
        
        print("\nTable Statistics:")
        print("-" * 30)
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"{table:<25}: {count:>3} records")
        
        print("\nDatabase Connection Info:")
        print("-" * 30)
        print(f"Database Name: {DATABASE_NAME}")
        print(f"Host: {DB_CONFIG['host']}")
        print(f"Admin User: {DB_CONFIG['user']}")
        print(f"Admin Password: {DB_CONFIG['password']}")
        print(f"Application User: counselorhub_user")
        print(f"Application Password: counselorhub_password_2024")
        
        print("\nSample Login Accounts:")
        print("-" * 30)
        cursor.execute("SELECT username, role, email FROM users WHERE role IN ('admin', 'counselor')")
        users = cursor.fetchall()
        for username, role, email in users:
            if role == 'admin':
                password = 'admin123'
            else:
                password = 'counselor123' if '1' in username else 'counselor456'
            print(f"{role.capitalize():<10}: {username:<15} | {email:<30} | Password: {password}")
        print("\nSample Students:")
        print("-" * 30)
        cursor.execute("""
            SELECT s.student_id, u.name, s.class_id, s.academic_status 
            FROM students s 
            JOIN users u ON s.user_id = u.user_id 
            LIMIT 5
        """)
        students = cursor.fetchall()
        for student_id, name, class_id, status in students:
            print(f"{student_id}: {name:<15} | Class: {class_id:<5} | Status: {status}")
        
        print("\nDatabase URL for Applications:")
        print("-" * 30)
        print(f"mysql+pymysql://counselorhub_user:counselorhub_password_2024@localhost:3306/{DATABASE_NAME}")
        
    except Error as e:
        print(f"Error displaying database info: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def main():
    """Main function to create the complete database"""
    print("🚀 Creating CounselorHub Database with Full Access")
    print("=" * 60)
    
    # Step 1: Create database
    print("Step 1: Creating database...")
    if not create_database():
        print("❌ Failed to create database. Exiting.")
        return
    
    # Step 2: Create tables
    print("\nStep 2: Creating tables...")
    if not create_tables():
        print("❌ Failed to create tables. Exiting.")
        return
    
    # Step 3: Insert sample data
    print("\nStep 3: Inserting sample data...")
    if not insert_sample_data():
        print("❌ Failed to insert sample data. Exiting.")
        return
    
    # Step 4: Create database user
    print("\nStep 4: Creating database user...")
    if not create_database_user():
        print("❌ Failed to create database user. Exiting.")
        
    
    # Step 5: Show information
    show_database_info()
    
    print("\n✅ CounselorHub database setup completed successfully!")
    print("\nNext steps:")
    print("1. Update your application's database configuration")
    print("2. Test the database connection")
    print("3. Start your application server")

if __name__ == '__main__':
    main()
