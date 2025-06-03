import mysql.connector
import json

def check_users_and_fix_reporter():
    # Try different password combinations
    password_options = ['', 'password', 'root', '123456']
    
    connection = None
    cursor = None
    
    for password in password_options:
        try:
            print(f"Trying to connect with password: {'(empty)' if password == '' else password}")
            # Koneksi ke database
            connection = mysql.connector.connect(
                host='localhost',
                database='counselorhub',
                user='root',
                password=password
            )
            print(f"✅ Successfully connected with password: {'(empty)' if password == '' else password}")
            break
        except Exception as e:
            print(f"❌ Failed with password {'(empty)' if password == '' else password}: {e}")
            continue
    
    if not connection:
        print("❌ Could not connect to database with any password option")
        return
    
    try:
        cursor = connection.cursor(dictionary=True)
        
        print("=== Checking Users Table ===")
        cursor.execute("SELECT * FROM users LIMIT 10")
        users = cursor.fetchall()
        
        print(f"Found {len(users)} users:")
        for user in users:
            print(f"ID: {user['user_id']}, Name: {user['name']}, Role: {user['role']}")
        
        print("\n=== Checking Students Table ===")
        cursor.execute("SELECT * FROM students LIMIT 5")
        students = cursor.fetchall()
        
        print(f"Found {len(students)} students:")
        for student in students:
            print(f"ID: {student['student_id']}, Name: {student['name']}")
        
        print("\n=== Current Behavior Records ===")
        cursor.execute("SELECT * FROM behavior_records LIMIT 5")
        behavior_records = cursor.fetchall()
        
        print(f"Found {len(behavior_records)} behavior records:")
        for record in behavior_records:
            print(f"ID: {record['record_id']}, Student: {record['student_id']}, Reporter: {record['reporter_id']}")
        
        # Cari user yang bukan student untuk dijadikan reporter
        print("\n=== Finding Non-Student Users for Reporter ===")
        cursor.execute("SELECT user_id, name, role FROM users WHERE role != 'student' LIMIT 5")
        non_student_users = cursor.fetchall()
        
        print(f"Found {len(non_student_users)} non-student users:")
        for user in non_student_users:
            print(f"ID: {user['user_id']}, Name: {user['name']}, Role: {user['role']}")
        
        # Test create behavior record dengan reporter_id yang valid
        if non_student_users:
            valid_reporter_id = non_student_users[0]['user_id']
            print(f"\n=== Testing with valid reporter_id: {valid_reporter_id} ===")
            
            if students:
                valid_student_id = students[0]['student_id']
                
                test_record = {
                    "student_id": valid_student_id,
                    "date": "2024-12-31",
                    "type": "positive",
                    "description": "Test behavior record from script",
                    "severity": "positive",
                    "reporter_id": valid_reporter_id,
                    "action_taken": "Test action",
                    "category": "participation"
                }
                
                try:
                    insert_query = """
                    INSERT INTO behavior_records 
                    (student_id, date, type, description, severity, reporter_id, action_taken, category)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    cursor.execute(insert_query, (
                        test_record["student_id"],
                        test_record["date"],
                        test_record["type"],
                        test_record["description"],
                        test_record["severity"],
                        test_record["reporter_id"],
                        test_record["action_taken"],
                        test_record["category"]
                    ))
                    
                    connection.commit()
                    print("✅ Successfully created test behavior record!")
                    
                    # Ambil record yang baru dibuat
                    cursor.execute("SELECT * FROM behavior_records ORDER BY record_id DESC LIMIT 1")
                    new_record = cursor.fetchone()
                    print(f"New record: {new_record}")
                    
                except Exception as e:
                    print(f"❌ Error creating test record: {e}")
                    connection.rollback()
            else:
                print("❌ No students found to test with")
        else:
            print("❌ No non-student users found for reporter")
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

if __name__ == "__main__":
    check_users_and_fix_reporter()
