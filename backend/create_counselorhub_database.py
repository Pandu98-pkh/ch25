"""
CounselorHub Database Creation Script - Revised to match SQL structure
Creates the complete database structure for the student counseling system
with all tables and sample data using MySQL with admin credentials.
Updated June 2025 - Generated from actual database structure.
"""
import mysql.connector
from mysql.connector import Error
import bcrypt
import uuid
import json
from datetime import datetime, date

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'charset': 'utf8',
    'use_unicode': True
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
        cursor.execute(f"CREATE DATABASE {DATABASE_NAME} CHARACTER SET utf8 COLLATE utf8_unicode_ci")
        
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
        
        # Users table - exactly as in SQL
        users_table = """
        CREATE TABLE `users` (
            `user_id` varchar(50) NOT NULL,
            `username` varchar(50) NOT NULL,
            `email` varchar(120) NOT NULL,
            `password_hash` varchar(255) NOT NULL,
            `name` varchar(100) NOT NULL,
            `role` enum('admin','counselor','student') NOT NULL,
            `photo` text DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`user_id`),
            UNIQUE KEY `username` (`username`),
            UNIQUE KEY `email` (`email`),
            KEY `idx_user_id` (`user_id`),            
            KEY `idx_username` (`username`),
            KEY `idx_email` (`email`),
            KEY `idx_role` (`role`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Classes table - exactly as in SQL
        classes_table = """
        CREATE TABLE `classes` (
            `class_id` varchar(50) NOT NULL,
            `name` varchar(100) NOT NULL,
            `grade_level` varchar(10) NOT NULL,
            `student_count` int(11) DEFAULT 0,
            `academic_year` varchar(10) NOT NULL,
            `teacher_name` varchar(100) DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`class_id`),            KEY `idx_class_id` (`class_id`),
            KEY `idx_grade_level` (`grade_level`),
            KEY `idx_academic_year` (`academic_year`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Students table - exactly as in SQL
        students_table = """
        CREATE TABLE `students` (
            `student_id` varchar(50) NOT NULL,
            `academic_status` enum('good','warning','critical') DEFAULT 'good',
            `program` varchar(50) DEFAULT NULL,
            `mental_health_score` int(11) DEFAULT NULL,
            `last_counseling` timestamp NULL DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            `class_id` varchar(50) DEFAULT NULL,
            `user_id` varchar(50) NOT NULL,
            PRIMARY KEY (`student_id`),
            KEY `class_id` (`class_id`),
            KEY `idx_student_id` (`student_id`),
            KEY `idx_user_id` (`user_id`),
            KEY `idx_academic_status` (`academic_status`),            CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE SET NULL,
            CONSTRAINT `students_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Counseling Sessions table - exactly as in SQL
        sessions_table = """
        CREATE TABLE `counseling_sessions` (
            `session_id` varchar(50) NOT NULL,
            `student_id` varchar(50) NOT NULL,
            `counselor_id` varchar(50) NOT NULL,
            `date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
            `notes` text DEFAULT NULL,
            `session_type` enum('academic','behavioral','mental-health','career','social') NOT NULL,
            `outcome` enum('positive','neutral','negative') NOT NULL,
            `next_steps` text DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            `approval_status` enum('pending','approved','rejected') DEFAULT 'pending',
            `approved_by` varchar(50) DEFAULT NULL,
            `approved_at` timestamp NULL DEFAULT NULL,
            `rejection_reason` text DEFAULT NULL,
            `follow_up` text DEFAULT NULL,
            PRIMARY KEY (`session_id`),
            KEY `idx_session_id` (`session_id`),
            KEY `idx_student_id` (`student_id`),
            KEY `idx_counselor_id` (`counselor_id`),
            KEY `idx_date` (`date`),
            KEY `idx_session_type` (`session_type`),
            KEY `fk_approved_by` (`approved_by`),
            KEY `idx_approval_status` (`approval_status`),
            CONSTRAINT `counseling_sessions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,            CONSTRAINT `counseling_sessions_ibfk_2` FOREIGN KEY (`counselor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
            CONSTRAINT `fk_approved_by` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Mental Health Assessments table - exactly as in SQL
        assessments_table = """
        CREATE TABLE `mental_health_assessments` (
            `assessment_id` varchar(50) NOT NULL,
            `student_id` varchar(50) NOT NULL,
            `assessor_id` varchar(50) NOT NULL,
            `date` timestamp NOT NULL DEFAULT current_timestamp(),
            `score` int(11) NOT NULL,
            `notes` text DEFAULT NULL,
            `assessment_type` varchar(50) NOT NULL COMMENT 'DASS-21, PHQ-9, GAD-7',
            `risk_level` enum('low','moderate','high') NOT NULL,
            `category` varchar(50) NOT NULL,
            `responses` text DEFAULT NULL COMMENT 'Assessment responses as JSON string',
            `recommendations` text DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`assessment_id`),            CONSTRAINT `mental_health_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
            CONSTRAINT `mental_health_assessments_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Behavior Records table - exactly as in SQL
        behavior_table = """
        CREATE TABLE `behavior_records` (
            `record_id` varchar(50) NOT NULL,
            `student_id` varchar(50) NOT NULL,
            `reporter_id` varchar(50) NOT NULL,
            `date` timestamp NOT NULL DEFAULT current_timestamp(),
            `behavior_type` enum('positive','negative') NOT NULL,
            `description` text NOT NULL,
            `severity` enum('positive','neutral','minor','major') NOT NULL,
            `category` varchar(50) DEFAULT NULL COMMENT 'attendance, discipline, participation, social',
            `action_taken` text DEFAULT NULL,
            `follow_up_required` tinyint(1) DEFAULT 0,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`record_id`),
            KEY `idx_record_id` (`record_id`),
            KEY `idx_student_id` (`student_id`),
            KEY `idx_reporter_id` (`reporter_id`),
            KEY `idx_behavior_type` (`behavior_type`),
            KEY `idx_severity` (`severity`),            CONSTRAINT `behavior_records_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
            CONSTRAINT `behavior_records_ibfk_2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Career Assessments table - exactly as in SQL
        career_table = """
        CREATE TABLE `career_assessments` (
            `assessment_id` varchar(50) NOT NULL,
            `student_id` varchar(50) NOT NULL,
            `date` timestamp NOT NULL DEFAULT current_timestamp(),
            `assessment_type` varchar(50) NOT NULL COMMENT 'mbti, riasec, holland',
            `interests` text DEFAULT NULL,
            `skills` text DEFAULT NULL,
            `values_data` text DEFAULT NULL,
            `recommended_paths` text DEFAULT NULL,
            `notes` text DEFAULT NULL,
            `results` text DEFAULT NULL COMMENT 'Detailed assessment results as JSON string',
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`assessment_id`),
            KEY `idx_assessment_id` (`assessment_id`),
            KEY `idx_student_id` (`student_id`),
            KEY `idx_assessment_type` (`assessment_type`),            CONSTRAINT `career_assessments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Career Resources table - exactly as in SQL
        resources_table = """
        CREATE TABLE `career_resources` (
            `resource_id` varchar(50) NOT NULL,
            `title` varchar(200) NOT NULL,
            `description` text DEFAULT NULL,
            `resource_type` varchar(50) NOT NULL COMMENT 'article, video, assessment, etc.',
            `url` varchar(500) DEFAULT NULL,
            `tags` text DEFAULT NULL,
            `date_published` timestamp NULL DEFAULT NULL,
            `author` varchar(100) DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`resource_id`),            KEY `idx_resource_id` (`resource_id`),
            KEY `idx_resource_type` (`resource_type`),
            KEY `idx_title` (`title`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Notifications table - exactly as in SQL
        notifications_table = """
        CREATE TABLE `notifications` (
            `notification_id` varchar(50) NOT NULL,
            `user_id` varchar(50) NOT NULL,
            `title` varchar(200) NOT NULL,
            `message` text NOT NULL,
            `notification_type` varchar(50) NOT NULL,
            `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
            `is_read` tinyint(1) DEFAULT 0,
            `action_url` varchar(500) DEFAULT NULL,
            `expires_at` timestamp NULL DEFAULT NULL,
            `is_active` tinyint(1) DEFAULT 1,
            `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
            `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
            PRIMARY KEY (`notification_id`),
            KEY `idx_notification_id` (`notification_id`),
            KEY `idx_user_id` (`user_id`),            KEY `idx_is_read` (`is_read`),
            KEY `idx_priority` (`priority`),
            CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
        """
        
        # Execute table creation in correct order (respecting foreign keys)
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
    """Insert comprehensive sample data matching SQL structure"""
    connection = create_database_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
          # Create password hashes - all users use password123
        default_password = bcrypt.hashpw('password123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Use same password for all users
        admin_password = default_password
        counselor1_password = default_password
        counselor2_password = default_password
        
        # Create student passwords - all use password123
        student_passwords = {}
        for i in range(1, 9):
            student_passwords[f'STU00{i}'] = default_password
        
        # Insert Users (following the pattern from SQL)
        users_data = [
            ('ADM-2025-001', 'admin', 'admin@counselorhub.edu', admin_password, 'Administrator', 'admin'),
            ('KSL-2025-001', 'counselor1', 'sarah.johnson@counselorhub.edu', counselor1_password, 'Dr. Sarah Johnson', 'counselor'),
            ('KSL-2025-002', 'counselor2', 'michael.chen@counselorhub.edu', counselor2_password, 'Dr. Michael Chen', 'counselor'),
            ('1103250001', 'alice.smith', 'alice.smith@student.edu', student_passwords['STU001'], 'Alice Smith', 'student'),
            ('1103250002', 'bob.johnson', 'bob.johnson@student.edu', student_passwords['STU002'], 'Bob Johnson', 'student'),
            ('1103250003', 'carol.davis', 'carol.davis@student.edu', student_passwords['STU003'], 'Carol Davis', 'student'),
            ('1103250004', 'david.wilson', 'david.wilson@student.edu', student_passwords['STU004'], 'David Wilson', 'student'),
            ('1103250005', 'emma.brown', 'emma.brown@student.edu', student_passwords['STU005'], 'Emma Brown', 'student'),
            ('1103250006', 'frank.miller', 'frank.miller@student.edu', student_passwords['STU006'], 'Frank Miller', 'student'),
            ('1103250007', 'grace.lee', 'grace.lee@student.edu', student_passwords['STU007'], 'Grace Lee', 'student'),
            ('1103250008', 'henry.zhang', 'henry.zhang@student.edu', student_passwords['STU008'], 'Henry Zhang', 'student'),
        ]
        
        cursor.executemany("""
            INSERT INTO users (user_id, username, email, password_hash, name, role) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, users_data)
        print("✓ Users inserted successfully")
        
        # Insert Classes (matching SQL data)
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
        print("✓ Classes inserted successfully")
        
        # Insert Students (using user_id to match users table)
        students_data = [
            ('1103250001', 'good', 'Science', 75, 'CLS001', '1103250001'),
            ('1103250002', 'warning', 'Science', 65, 'CLS001', '1103250002'),
            ('1103250003', 'good', 'Social Sciences', 85, 'CLS003', '1103250003'),
            ('1103250004', 'critical', 'Arts', 55, 'CLS002', '1103250004'),
            ('1103250005', 'good', 'Science', 80, 'CLS004', '1103250005'),
            ('1103250006', 'good', 'Business', 78, 'CLS005', '1103250006'),
            ('1103250007', 'warning', 'Arts', 68, 'CLS001', '1103250007'),
            ('1103250008', 'good', 'Technology', 82, 'CLS003', '1103250008'),
        ]
        
        cursor.executemany("""
            INSERT INTO students (student_id, academic_status, program, mental_health_score, class_id, user_id) 
            VALUES (%s, %s, %s, %s, %s, %s)
        """, students_data)
        print("✓ Students inserted successfully")
        
        # Insert Counseling Sessions
        sessions_data = [
            (f'CS-20250101-{uuid.uuid4().hex[:6].upper()}', '1103250001', 'KSL-2025-001', '2024-01-15 10:00:00', 45, 'Initial counseling session. Student adjusting well to new grade.', 'academic', 'positive', 'Continue monitoring academic progress'),
            (f'CS-20250101-{uuid.uuid4().hex[:6].upper()}', '1103250002', 'KSL-2025-001', '2024-01-20 14:30:00', 60, 'Academic stress discussion. Provided study techniques.', 'mental-health', 'neutral', 'Follow-up session scheduled for next week'),
            (f'CS-20250101-{uuid.uuid4().hex[:6].upper()}', '1103250003', 'KSL-2025-002', '2024-01-25 11:15:00', 50, 'Career guidance session. Discussed future academic paths.', 'career', 'positive', 'Explore university programs'),
            (f'CS-20250101-{uuid.uuid4().hex[:6].upper()}', '1103250004', 'KSL-2025-002', '2024-01-28 09:00:00', 55, 'Addressed attendance issues and time management.', 'behavioral', 'neutral', 'Weekly check-ins for next month'),
        ]
        
        cursor.executemany("""
            INSERT INTO counseling_sessions (session_id, student_id, counselor_id, date, duration, notes, session_type, outcome, next_steps) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, sessions_data)
        print("✓ Counseling sessions inserted successfully")
        
        # Insert Mental Health Assessments
        assessments_data = [
            (f'MHA-{uuid.uuid4().hex[:8].upper()}', '1103250001', '1103250001', '2024-01-15 10:00:00', 5, 'Mild anxiety levels detected', 'GAD-7', 'low', 'anxiety', '{"q1": 1, "q2": 1, "q3": 0, "q4": 1, "q5": 1, "q6": 0, "q7": 1}', 'Regular check-ins, stress management techniques'),
            (f'MHA-{uuid.uuid4().hex[:8].upper()}', '1103250002', '1103250002', '2024-01-20 14:30:00', 8, 'Minimal depressive symptoms', 'PHQ-9', 'moderate', 'depression', '{"q1": 1, "q2": 1, "q3": 1, "q4": 1, "q5": 1, "q6": 0, "q7": 1, "q8": 1, "q9": 1}', 'Continue monitoring, lifestyle modifications'),
            (f'MHA-{uuid.uuid4().hex[:8].upper()}', '1103250004', '1103250004', '2024-01-28 09:00:00', 12, 'Elevated stress levels requiring intervention', 'DASS-21', 'high', 'stress', '{"depression": 4, "anxiety": 3, "stress": 5}', 'Immediate counseling sessions and stress reduction plan'),
        ]
        
        cursor.executemany("""
            INSERT INTO mental_health_assessments (assessment_id, student_id, assessor_id, date, score, notes, assessment_type, risk_level, category, responses, recommendations) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, assessments_data)
        print("✓ Mental health assessments inserted successfully")
        
        # Insert Behavior Records
        behavior_data = [
            (f'BEH-{uuid.uuid4().hex[:8].upper()}', '1103250001', 'KSL-2025-001', '2024-01-10 08:00:00', 'positive', 'Helped a classmate with studies', 'positive', 'participation', 'Positive reinforcement provided', 0),
            (f'BEH-{uuid.uuid4().hex[:8].upper()}', '1103250002', 'KSL-2025-001', '2024-01-18 14:00:00', 'negative', 'Late submission of assignments', 'minor', 'discipline', 'Discussed time management strategies', 1),
            (f'BEH-{uuid.uuid4().hex[:8].upper()}', '1103250004', 'KSL-2025-002', '2024-01-22 09:30:00', 'negative', 'Frequent absences from class', 'major', 'attendance', 'Parent meeting scheduled, attendance plan created', 1),
        ]
        
        cursor.executemany("""
            INSERT INTO behavior_records (record_id, student_id, reporter_id, date, behavior_type, description, severity, category, action_taken, follow_up_required) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, behavior_data)
        print("✓ Behavior records inserted successfully")
        
        # Insert Career Assessments
        career_data = [
            (f'CAR-{uuid.uuid4().hex[:8].upper()}', '1103250003', '2024-01-25 11:15:00', 'riasec', 'Investigative,Realistic', 'mathematics,problem_solving,logical_thinking', 'achievement,independence,intellectual_stimulation', 'Engineering,Computer Science,Data Science', 'Strong aptitude for STEM fields', '{"realistic": 85, "investigative": 90, "artistic": 45, "social": 60, "enterprising": 55, "conventional": 70}'),
            (f'CAR-{uuid.uuid4().hex[:8].upper()}', '1103250005', '2024-01-30 15:00:00', 'riasec', 'Artistic,Social', 'creativity,communication,artistic_ability', 'creativity,helping_others,self_expression', 'Graphic Design,Psychology,Creative Writing', 'Strong creative and social inclinations', '{"realistic": 40, "investigative": 55, "artistic": 92, "social": 85, "enterprising": 60, "conventional": 45}'),
        ]
        
        cursor.executemany("""
            INSERT INTO career_assessments (assessment_id, student_id, date, assessment_type, interests, skills, values_data, recommended_paths, notes, results) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, career_data)
        print("✓ Career assessments inserted successfully")
        
        # Insert Sample Notifications
        notifications_data = [
            (f'NOT-{uuid.uuid4().hex[:8].upper()}', 'KSL-2025-001', 'New Student Assessment Required', 'Student Alice Smith requires mental health assessment follow-up', 'assessment', 'high', 0, '/students/1103250001/assessments'),
            (f'NOT-{uuid.uuid4().hex[:8].upper()}', 'KSL-2025-002', 'Behavior Follow-up Needed', 'David Wilson requires follow-up on attendance issues', 'behavior', 'medium', 0, '/students/1103250004/behavior'),
            (f'NOT-{uuid.uuid4().hex[:8].upper()}', 'ADM-2025-001', 'System Update Completed', 'CounselorHub system has been updated with new features', 'system', 'low', 0, '/settings'),
        ]
        
        cursor.executemany("""
            INSERT INTO notifications (notification_id, user_id, title, message, notification_type, priority, is_read, action_url) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, notifications_data)
        print("✓ Notifications inserted successfully")
        
        connection.commit()
        print("✓ All sample data inserted successfully")
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
            # All users now use password123
            password = 'password123'
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
        return
    
    # Step 5: Show information
    show_database_info()
    
    print("\n✅ CounselorHub database setup completed successfully!")
    print("\nNext steps:")
    print("1. Update your application's database configuration")
    print("2. Test the database connection")
    print("3. Start your application server")

if __name__ == '__main__':
    main()
