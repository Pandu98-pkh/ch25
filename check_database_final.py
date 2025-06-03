import mysql.connector
import json

def check_users_and_fix_reporter():
    try:
        # Koneksi ke database (kosong password works)
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub',
            user='root',
            password=''
        )
        cursor = connection.cursor(dictionary=True)
        
        print("=== Database Connection Success ===")
        
        print("\n=== Checking Users Table Structure ===")
        cursor.execute("DESCRIBE users")
        users_columns = cursor.fetchall()
        print("Users table columns:")
        for col in users_columns:
            print(f"  {col['Field']}: {col['Type']}")
        
        print("\n=== Checking Students Table Structure ===")
        cursor.execute("DESCRIBE students")
        students_columns = cursor.fetchall()
        print("Students table columns:")
        for col in students_columns:
            print(f"  {col['Field']}: {col['Type']}")
        
        print("\n=== All Users ===")
        cursor.execute("SELECT user_id, name, role FROM users")
        users = cursor.fetchall()
        
        print(f"Found {len(users)} users:")
        student_users = []
        non_student_users = []
        
        for user in users:
            print(f"ID: {user['user_id']}, Name: {user['name']}, Role: {user['role']}")
            if user['role'] == 'student':
                student_users.append(user)
            else:
                non_student_users.append(user)
        
        print(f"\nStudent users: {len(student_users)}")
        print(f"Non-student users: {len(non_student_users)}")
        
        # Jika tidak ada non-student users, buat satu
        if len(non_student_users) == 0:
            print("\n=== Creating Teacher User ===")
            try:
                insert_teacher = """
                INSERT INTO users (user_id, name, role, email, password_hash)
                VALUES (%s, %s, %s, %s, %s)
                """
                teacher_data = ('TEACHER001', 'Ms. Teacher', 'teacher', 'teacher@school.com', 'hashed_password')
                cursor.execute(insert_teacher, teacher_data)
                connection.commit()
                print("✅ Created teacher user successfully!")
                
                # Ambil user yang baru dibuat
                cursor.execute("SELECT user_id, name, role FROM users WHERE user_id = 'TEACHER001'")
                new_teacher = cursor.fetchone()
                non_student_users.append(new_teacher)
                print(f"New teacher: {new_teacher}")
                
            except Exception as e:
                print(f"❌ Error creating teacher: {e}")
                connection.rollback()
        
        print("\n=== All Students ===")
        cursor.execute("SELECT * FROM students LIMIT 5")
        students = cursor.fetchall()
        
        print(f"Found {len(students)} students:")
        for student in students:
            print(f"Student data: {student}")
        
        print("\n=== Current Behavior Records ===")
        cursor.execute("SELECT * FROM behavior_records LIMIT 5")
        behavior_records = cursor.fetchall()
        
        print(f"Found {len(behavior_records)} behavior records:")
        for record in behavior_records:
            print(f"Record: {record}")
        
        # Test create behavior record dengan reporter_id yang valid
        if non_student_users and students:
            valid_reporter_id = non_student_users[0]['user_id']
            valid_student_id = students[0]['student_id']
            
            print(f"\n=== Testing with valid reporter_id: {valid_reporter_id}, student_id: {valid_student_id} ===")
            
            test_record = {
                "student_id": valid_student_id,
                "date": "2024-12-31",
                "type": "positive",
                "description": "Test behavior record from script - SUCCESS!",
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
                
                print(f"\n🎉 SOLUTION: Use reporter_id = '{valid_reporter_id}' for creating behavior records!")
                
            except Exception as e:
                print(f"❌ Error creating test record: {e}")
                connection.rollback()
        else:
            print("❌ Missing required data for testing")
            
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    check_users_and_fix_reporter()
