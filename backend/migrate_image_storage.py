"""
Database schema migration to support file-based image storage
This script updates the database to use image URLs instead of base64 data
"""

import mysql.connector
from mysql.connector import Error
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'counselorhub_user',
    'password': 'counselorhub_password_2024',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def get_db_connection():
    """Create database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        return connection
    except Error as e:
        logger.error(f"Error connecting to database: {e}")
        return None

def migrate_image_storage():
    """
    Migrate database schema to support both base64 and file-based image storage
    """
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # 1. Add new columns for file-based image storage
        logger.info("Adding new image storage columns...")
        
        # For users table
        try:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN avatar_type ENUM('base64', 'file', 'url') DEFAULT 'base64',
                ADD COLUMN avatar_filename VARCHAR(255) NULL,
                ADD COLUMN avatar_url VARCHAR(500) NULL
            """)
            logger.info("✅ Added image columns to users table")
        except Error as e:
            if "Duplicate column name" in str(e):
                logger.info("⚠️ Image columns already exist in users table")
            else:
                raise e
        
        # For students table
        try:
            cursor.execute("""
                ALTER TABLE students 
                ADD COLUMN avatar_type ENUM('base64', 'file', 'url') DEFAULT 'base64',
                ADD COLUMN avatar_filename VARCHAR(255) NULL,
                ADD COLUMN avatar_url VARCHAR(500) NULL
            """)
            logger.info("✅ Added image columns to students table")
        except Error as e:
            if "Duplicate column name" in str(e):
                logger.info("⚠️ Image columns already exist in students table")
            else:
                raise e
        
        # 2. Create image metadata table for better management
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS image_metadata (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                original_filename VARCHAR(255) NOT NULL,
                file_size INT NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_by_table VARCHAR(50) NULL,
                used_by_id VARCHAR(50) NULL,
                is_active BOOLEAN DEFAULT TRUE,
                INDEX idx_filename (filename),
                INDEX idx_used_by (used_by_table, used_by_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        logger.info("✅ Created image_metadata table")
        
        # 3. Add indexes for better performance
        try:
            cursor.execute("CREATE INDEX idx_users_avatar_type ON users (avatar_type)")
            cursor.execute("CREATE INDEX idx_students_avatar_type ON students (avatar_type)")
            logger.info("✅ Added performance indexes")
        except Error as e:
            if "Duplicate key name" in str(e):
                logger.info("⚠️ Performance indexes already exist")
            else:
                logger.warning(f"Could not add indexes: {e}")
        
        connection.commit()
        logger.info("🎉 Database migration completed successfully!")
        return True
        
    except Error as e:
        logger.error(f"❌ Error during migration: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def migrate_existing_base64_data():
    """
    Update existing records to mark them as base64 type
    """
    connection = get_db_connection()
    if not connection:
        return False
    
    try:
        cursor = connection.cursor()
        
        # Update users table
        cursor.execute("""
            UPDATE users 
            SET avatar_type = 'base64' 
            WHERE photo IS NOT NULL AND photo != '' AND avatar_type IS NULL
        """)
        users_updated = cursor.rowcount
        
        # Update students table  
        cursor.execute("""
            UPDATE students 
            SET avatar_type = 'base64' 
            WHERE avatar IS NOT NULL AND avatar != '' AND avatar_type IS NULL
        """)
        students_updated = cursor.rowcount
        
        connection.commit()
        
        logger.info(f"✅ Updated {users_updated} user records and {students_updated} student records")
        return True
        
    except Error as e:
        logger.error(f"❌ Error updating existing data: {e}")
        connection.rollback()
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def show_migration_status():
    """Show the current migration status"""
    connection = get_db_connection()
    if not connection:
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        # Check if migration columns exist
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'counselorhub' 
            AND TABLE_NAME = 'users' 
            AND COLUMN_NAME IN ('avatar_type', 'avatar_filename', 'avatar_url')
        """)
        user_columns = [row['COLUMN_NAME'] for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'counselorhub' 
            AND TABLE_NAME = 'students' 
            AND COLUMN_NAME IN ('avatar_type', 'avatar_filename', 'avatar_url')
        """)
        student_columns = [row['COLUMN_NAME'] for row in cursor.fetchall()]
        
        # Check image_metadata table
        cursor.execute("""
            SELECT COUNT(*) as count 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'counselorhub' 
            AND TABLE_NAME = 'image_metadata'
        """)
        metadata_table_exists = cursor.fetchone()['count'] > 0
        
        # Show status
        print("\n" + "="*50)
        print("📊 MIGRATION STATUS")
        print("="*50)
        print(f"Users table columns: {', '.join(user_columns) if user_columns else 'Not migrated'}")
        print(f"Students table columns: {', '.join(student_columns) if student_columns else 'Not migrated'}")
        print(f"Image metadata table: {'✅ Exists' if metadata_table_exists else '❌ Missing'}")
        
        # Show data statistics
        if user_columns:
            cursor.execute("SELECT avatar_type, COUNT(*) as count FROM users WHERE photo IS NOT NULL GROUP BY avatar_type")
            user_stats = cursor.fetchall()
            print(f"User avatar types: {user_stats}")
        
        if student_columns:
            cursor.execute("SELECT avatar_type, COUNT(*) as count FROM students WHERE avatar IS NOT NULL GROUP BY avatar_type")
            student_stats = cursor.fetchall()
            print(f"Student avatar types: {student_stats}")
        
        print("="*50)
        
    except Error as e:
        logger.error(f"Error checking migration status: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    print("🚀 Starting database migration for image storage...")
    
    # Show current status
    show_migration_status()
    
    # Run migration
    if migrate_image_storage():
        # Update existing data
        migrate_existing_base64_data()
        
        # Show final status
        print("\n🎉 Migration completed!")
        show_migration_status()
    else:
        print("❌ Migration failed!")
