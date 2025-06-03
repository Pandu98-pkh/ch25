#!/usr/bin/env python3
import mysql.connector
from mysql.connector import Error
import json
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def check_counseling_sessions_table_structure():
    """Check the structure of the counseling_sessions table"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Check if the table exists
        cursor.execute("SHOW TABLES LIKE 'counseling_sessions'")
        table_exists = cursor.fetchone()
        
        if not table_exists:
            print("❌ Table 'counseling_sessions' does not exist!")
            print("\nAttempting to check similar table names...")
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            counseling_tables = [table for table in tables if 'counseling' in str(table).lower() or 'session' in str(table).lower()]
            if counseling_tables:
                print("Found similar tables:")
                for table in counseling_tables:
                    print(f"  - {list(table.values())[0]}")
            else:
                print("No similar tables found.")
            return
        
        print("✅ Table 'counseling_sessions' exists!")
        print("\n" + "="*60)
        print("COUNSELING SESSIONS TABLE STRUCTURE")
        print("="*60)
        
        # Get table structure
        cursor.execute("DESCRIBE counseling_sessions")
        columns = cursor.fetchall()
        
        print(f"{'Field':<20} {'Type':<25} {'Null':<8} {'Key':<8} {'Default':<15}")
        print("-" * 80)
        for col in columns:
            default_val = str(col['Default']) if col['Default'] is not None else 'NULL'
            print(f"{col['Field']:<20} {col['Type']:<25} {col['Null']:<8} {col['Key']:<8} {default_val:<15}")
        
        # Check expected columns based on CounselingSession interface
        expected_columns = [
            'id', 'studentId', 'date', 'duration', 'notes', 
            'type', 'outcome', 'nextSteps', 'followUp'
        ]
        
        existing_columns = [col['Field'] for col in columns]
        
        print("\n" + "="*60)
        print("COLUMN VALIDATION")
        print("="*60)
        for expected_col in expected_columns:
            if expected_col in existing_columns:
                print(f"✅ {expected_col}")
            else:
                # Check for common naming variations
                variations = {
                    'studentId': ['student_id', 'studentid'],
                    'nextSteps': ['next_steps', 'nextsteps'],
                    'followUp': ['follow_up', 'followup']
                }
                found_variation = False
                if expected_col in variations:
                    for variation in variations[expected_col]:
                        if variation in existing_columns:
                            print(f"⚠️  {expected_col} (found as '{variation}')")
                            found_variation = True
                            break
                if not found_variation:
                    print(f"❌ {expected_col} (missing)")
        
        # Check for counselor-related columns
        counselor_columns = [col for col in existing_columns if 'counselor' in col.lower()]
        if counselor_columns:
            print(f"\n📋 Counselor-related columns found: {', '.join(counselor_columns)}")
        
        return True
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_counseling_sessions_data():
    """Retrieve and display counseling sessions data"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "="*60)
        print("COUNSELING SESSIONS DATA")
        print("="*60)
        
        # Get total count
        cursor.execute("SELECT COUNT(*) as total FROM counseling_sessions")
        total_count = cursor.fetchone()['total']
        print(f"Total sessions: {total_count}")
        
        if total_count == 0:
            print("\n📭 No counseling sessions found in the database.")
            return
          # Get recent sessions (limit 10)
        cursor.execute("""
            SELECT * FROM counseling_sessions 
            ORDER BY date DESC, session_id DESC 
            LIMIT 10
        """)
        sessions = cursor.fetchall()
        
        print(f"\n📋 Showing {len(sessions)} most recent sessions:")
        print("-" * 80)
        
        for i, session in enumerate(sessions, 1):
            print(f"\n🔸 Session #{i}")
            for key, value in session.items():
                # Format datetime values
                if key == 'date' and value:
                    try:
                        if isinstance(value, str):
                            formatted_date = datetime.fromisoformat(value.replace('Z', '+00:00')).strftime('%Y-%m-%d %H:%M:%S')
                        else:
                            formatted_date = value.strftime('%Y-%m-%d %H:%M:%S')
                        print(f"  {key}: {formatted_date}")
                    except:
                        print(f"  {key}: {value}")
                elif isinstance(value, str) and len(value) > 50:
                    print(f"  {key}: {value[:47]}...")
                else:
                    print(f"  {key}: {value}")
        
        # Get session type distribution        print("\n" + "="*60)
        print("SESSION TYPE DISTRIBUTION")
        print("="*60)
        
        cursor.execute("""
            SELECT session_type, COUNT(*) as count 
            FROM counseling_sessions 
            GROUP BY session_type 
            ORDER BY count DESC
        """)
        type_stats = cursor.fetchall()
        
        for stat in type_stats:
            print(f"📊 {stat['session_type']}: {stat['count']} sessions")
        
        # Get outcome distribution
        print("\n" + "="*60)
        print("SESSION OUTCOME DISTRIBUTION")
        print("="*60)
        
        cursor.execute("""
            SELECT outcome, COUNT(*) as count 
            FROM counseling_sessions 
            GROUP BY outcome 
            ORDER BY count DESC
        """)
        outcome_stats = cursor.fetchall()
        
        for stat in outcome_stats:
            print(f"📈 {stat['outcome']}: {stat['count']} sessions")
        
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def test_database_connection():
    """Test the database connection with alternative configurations"""
    print("🔄 Testing database connection...")
    
    # Try different configurations
    configs = [
        {
            'host': 'localhost',
            'user': 'admin',
            'password': 'admin',
            'database': 'counselorhub',
            'charset': 'utf8mb4'
        },
        {
            'host': 'localhost',
            'user': 'root',
            'password': '',
            'database': 'counselorhub',
            'charset': 'utf8mb4'
        },
        {
            'host': 'localhost',
            'user': 'root',
            'password': 'admin',
            'database': 'counselorhub',
            'charset': 'utf8mb4'
        }
    ]
    
    for i, config in enumerate(configs, 1):
        try:
            print(f"\n🔧 Trying configuration {i}: user='{config['user']}', password='{config['password']}'")
            connection = mysql.connector.connect(**config)
            print("✅ Connection successful!")
            
            cursor = connection.cursor()
            cursor.execute("SELECT DATABASE()")
            db_name = cursor.fetchone()[0]
            print(f"📍 Connected to database: {db_name}")
            
            # Update global config with working configuration
            global DB_CONFIG
            DB_CONFIG = config
            
            cursor.close()
            connection.close()
            return True
            
        except Error as e:
            print(f"❌ Failed: {e}")
    
    print("\n❌ All connection attempts failed!")
    return False

def search_sessions_by_student(student_id):
    """Search for sessions by student ID"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Try different column name variations
        student_id_columns = ['studentId', 'student_id', 'studentid']
        
        for col_name in student_id_columns:
            try:
                query = f"SELECT * FROM counseling_sessions WHERE {col_name} = %s ORDER BY date DESC"
                cursor.execute(query, (student_id,))
                sessions = cursor.fetchall()
                
                if sessions:
                    print(f"\n🔍 Found {len(sessions)} sessions for student ID '{student_id}' (using column '{col_name}'):")
                    for session in sessions:
                        print(f"  📅 {session.get('date', 'N/A')} - {session.get('type', 'N/A')} ({session.get('outcome', 'N/A')})")
                    return sessions
                    
            except Error as e:
                if "Unknown column" in str(e):
                    continue
                else:
                    print(f"Error with column {col_name}: {e}")
        
        print(f"\n🔍 No sessions found for student ID '{student_id}'")
        return []
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return []
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def check_existing_students_and_counselors():
    """Check what students and counselors exist in the database"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "="*60)
        print("CHECKING EXISTING STUDENTS AND COUNSELORS")
        print("="*60)
        
        # Check students
        cursor.execute("SELECT student_id, user_id FROM students WHERE is_active = 1 LIMIT 10")
        students = cursor.fetchall()
        
        print(f"\n👥 Found {len(students)} active students:")
        if students:
            for student in students[:5]:  # Show first 5
                print(f"  Student ID: {student['student_id']}, User ID: {student['user_id']}")
            if len(students) > 5:
                print(f"  ... and {len(students) - 5} more")
        else:
            print("  No active students found!")
        
        # Check counselors/users who could be counselors
        cursor.execute("""
            SELECT user_id, name, role 
            FROM users 
            WHERE role IN ('admin', 'counselor', 'teacher') 
            AND is_active = 1 
            LIMIT 10
        """)
        counselors = cursor.fetchall()
        
        print(f"\n🧑‍⚕️ Found {len(counselors)} potential counselors:")
        if counselors:
            for counselor in counselors:
                print(f"  User ID: {counselor['user_id']}, Name: {counselor['name']}, Role: {counselor['role']}")
        else:
            print("  No counselors found!")
        
        return students, counselors
        
    except Error as e:
        print(f"❌ Database error: {e}")
        return [], []
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def create_sample_sessions():
    """Create some sample counseling sessions for testing"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n" + "="*60)
        print("CREATING SAMPLE COUNSELING SESSIONS")
        print("="*60)
        
        # Check if sessions already exist
        cursor.execute("SELECT COUNT(*) FROM counseling_sessions")
        existing_count = cursor.fetchone()[0]
        
        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing sessions. Skipping sample data creation.")
            return
        
        # Get existing students and counselors
        students, counselors = check_existing_students_and_counselors()
        
        if not students:
            print("❌ No students found! Cannot create sample sessions without valid student IDs.")
            return
        
        if not counselors:
            print("❌ No counselors found! Cannot create sample sessions without valid counselor IDs.")
            return
        
        # Use the first few students and counselors for sample data
        student_ids = [s['student_id'] for s in students[:3]]
        counselor_ids = [c['user_id'] for c in counselors[:2]]
        
        print(f"📝 Using student IDs: {student_ids}")
        print(f"📝 Using counselor IDs: {counselor_ids}")
        
        # Sample sessions data based on actual existing IDs
        sample_sessions = [
            {
                'session_id': 'SESS001',
                'student_id': student_ids[0],
                'counselor_id': counselor_ids[0],
                'date': '2025-06-01 10:00:00',
                'duration': 45,
                'notes': 'Discussion about academic progress and study strategies. Student shows good motivation.',
                'session_type': 'academic',
                'outcome': 'positive',
                'next_steps': 'Follow up in 2 weeks to check on assignment progress and study habits.'
            },
            {
                'session_id': 'SESS002',
                'student_id': student_ids[1] if len(student_ids) > 1 else student_ids[0],
                'counselor_id': counselor_ids[0],
                'date': '2025-05-28 14:30:00',
                'duration': 60,
                'notes': 'Career counseling session. Explored interests in computer science and engineering.',
                'session_type': 'career',
                'outcome': 'neutral',
                'next_steps': 'Research university programs and arrange for industry mentorship.'
            },
            {
                'session_id': 'SESS003',
                'student_id': student_ids[2] if len(student_ids) > 2 else student_ids[0],
                'counselor_id': counselor_ids[1] if len(counselor_ids) > 1 else counselor_ids[0],
                'date': '2025-05-25 09:15:00',
                'duration': 30,
                'notes': 'Brief check-in about social interactions and peer relationships.',
                'session_type': 'social',
                'outcome': 'positive',
                'next_steps': 'Continue encouraging participation in group activities.'
            }
        ]
        
        # Insert sample sessions
        insert_query = """
            INSERT INTO counseling_sessions 
            (session_id, student_id, counselor_id, date, duration, notes, session_type, outcome, next_steps)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        for session in sample_sessions:
            cursor.execute(insert_query, (
                session['session_id'],
                session['student_id'], 
                session['counselor_id'],
                session['date'],
                session['duration'],
                session['notes'],
                session['session_type'],
                session['outcome'],
                session['next_steps']
            ))
            print(f"✅ Created session {session['session_id']} for student {session['student_id']}")
        
        connection.commit()
        print(f"\n🎉 Successfully created {len(sample_sessions)} sample counseling sessions!")
        
    except Error as e:
        print(f"❌ Error creating sample sessions: {e}")
        if connection:
            connection.rollback()
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_sessions_by_type():
    """Get sessions grouped by type with detailed information"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "="*60)
        print("DETAILED SESSION ANALYSIS BY TYPE")
        print("="*60)
        
        # Get sessions by type with additional details
        cursor.execute("""
            SELECT 
                session_type,
                COUNT(*) as total_sessions,
                AVG(duration) as avg_duration,
                SUM(CASE WHEN outcome = 'positive' THEN 1 ELSE 0 END) as positive_outcomes,
                SUM(CASE WHEN outcome = 'neutral' THEN 1 ELSE 0 END) as neutral_outcomes,
                SUM(CASE WHEN outcome = 'negative' THEN 1 ELSE 0 END) as negative_outcomes
            FROM counseling_sessions 
            WHERE is_active = 1
            GROUP BY session_type 
            ORDER BY total_sessions DESC
        """)
        
        results = cursor.fetchall()
        
        if not results:
            print("📭 No active sessions found for analysis.")
            return
        
        for result in results:
            session_type = result['session_type']
            total = result['total_sessions']
            avg_duration = result['avg_duration']
            positive = result['positive_outcomes']
            neutral = result['neutral_outcomes']
            negative = result['negative_outcomes']
            
            print(f"\n📊 {session_type.upper()} SESSIONS:")
            print(f"  Total Sessions: {total}")
            print(f"  Average Duration: {avg_duration:.1f} minutes")
            print(f"  Outcomes: ✅{positive} | ⚪{neutral} | ❌{negative}")
            
            # Calculate success rate
            if total > 0:
                success_rate = (positive / total) * 100
                print(f"  Success Rate: {success_rate:.1f}%")
        
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def get_student_session_summary():
    """Get a summary of sessions per student"""
    connection = None
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("\n" + "="*60)
        print("STUDENT SESSION SUMMARY")
        print("="*60)
        
        cursor.execute("""
            SELECT 
                student_id,
                COUNT(*) as total_sessions,
                MAX(date) as last_session,
                MIN(date) as first_session,
                SUM(duration) as total_duration,
                GROUP_CONCAT(DISTINCT session_type) as session_types
            FROM counseling_sessions 
            WHERE is_active = 1
            GROUP BY student_id 
            ORDER BY total_sessions DESC, last_session DESC
        """)
        
        results = cursor.fetchall()
        
        if not results:
            print("📭 No student session data found.")
            return
        
        print(f"{'Student ID':<12} {'Sessions':<10} {'Total Time':<12} {'Last Session':<12} {'Types'}")
        print("-" * 80)
        
        for result in results:
            student_id = result['student_id']
            total_sessions = result['total_sessions']
            total_duration = result['total_duration']
            last_session = result['last_session'].strftime('%Y-%m-%d') if result['last_session'] else 'N/A'
            session_types = result['session_types'][:30] + '...' if len(result['session_types']) > 30 else result['session_types']
            
            print(f"{student_id:<12} {total_sessions:<10} {total_duration} min{'':<6} {last_session:<12} {session_types}")
        
    except Error as e:
        print(f"❌ Database error: {e}")
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def main():
    """Main function to run all checks"""
    print("🏥 COUNSELING SESSIONS TABLE CHECKER")
    print("="*60)
    
    # Test connection first
    if not test_database_connection():
        return
    
    # Check table structure
    if check_counseling_sessions_table_structure():
        # Create sample data if table is empty
        create_sample_sessions()
        
        # Get sessions data
        get_counseling_sessions_data()
        
        # Additional analysis
        get_sessions_by_type()
        get_student_session_summary()
          # Example search for a specific student
        print("\n" + "="*60)
        print("EXAMPLE STUDENT SEARCH")
        print("="*60)
        search_sessions_by_student("1103210016")  # Search for an actual student ID
    
    print("\n✅ Database check completed!")

if __name__ == "__main__":
    main()