import mysql.connector

def check_behavior_records_structure():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub',
            user='root',
            password=''
        )
        cursor = connection.cursor(dictionary=True)
        
        print("=== Behavior Records Table Structure ===")
        cursor.execute("DESCRIBE behavior_records")
        columns = cursor.fetchall()
        
        print("Behavior Records columns:")
        for col in columns:
            print(f"  {col['Field']}: {col['Type']}")
        
        print("\n=== Creating Test Behavior Record with Correct Columns ===")
        
        # Use valid reporter_id from previous check
        valid_reporter_id = 'ADM-2025-001'  # Administrator
        valid_student_id = '1103210016'  # Haky
        
        # Create record with only existing columns
        insert_query = """
        INSERT INTO behavior_records 
        (student_id, date, description, severity, reporter_id, action_taken, category)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            valid_student_id,
            "2024-12-31",
            "Test behavior record - positive behavior in class",
            "positive",
            valid_reporter_id,
            "Praised in front of class",
            "participation"
        ))
        
        connection.commit()
        print("✅ Successfully created behavior record!")
        
        # Check what was created
        cursor.execute("SELECT * FROM behavior_records ORDER BY record_id DESC LIMIT 1")
        new_record = cursor.fetchone()
        print(f"New record: {new_record}")
        
        print(f"\n🎉 SOLUTION FOUND!")
        print(f"- Use reporter_id: {valid_reporter_id} (or any admin/counselor user_id)")
        print(f"- Remove 'type' column from behavior record creation")
        print(f"- Backend should be fixed to handle this correctly")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    check_behavior_records_structure()
