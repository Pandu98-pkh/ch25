import mysql.connector

def check_action_taken_field():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub',
            user='root',
            password=''
        )
        cursor = connection.cursor(dictionary=True)
        
        print("=== Checking behavior_records table structure ===")
        cursor.execute("DESCRIBE behavior_records")
        columns = cursor.fetchall()
        
        action_taken_found = False
        for col in columns:
            print(f"  {col['Field']}: {col['Type']}")
            if col['Field'] == 'action_taken':
                action_taken_found = True
                print(f"    ✅ action_taken field found: {col['Type']}")
        
        if not action_taken_found:
            print("    ❌ action_taken field NOT FOUND!")
            return
        
        print("\n=== Checking current behavior records ===")
        cursor.execute("SELECT record_id, description, action_taken, reporter_id FROM behavior_records ORDER BY created_at DESC LIMIT 5")
        records = cursor.fetchall()
        
        print(f"Found {len(records)} recent records:")
        for record in records:
            action_taken = record['action_taken'] or "(NULL/EMPTY)"
            print(f"  ID: {record['record_id']}")
            print(f"  Description: {record['description'][:50]}...")
            print(f"  Action Taken: {action_taken}")
            print(f"  Reporter: {record['reporter_id']}")
            print("  ---")
        
        print("\n=== Testing direct database insert ===")
        test_record = {
            "record_id": f"test-action-{int(__import__('time').time())}",
            "student_id": "1103210016",
            "date": "2024-12-31",
            "behavior_type": "positive",
            "description": "TEST - Student helped with class project",
            "severity": "positive",
            "action_taken": "TEST ACTION TAKEN - Praised publicly and given certificate",
            "reporter_id": "ADM-2025-001",
            "category": "participation"
        }
        
        insert_query = """
        INSERT INTO behavior_records 
        (record_id, student_id, date, behavior_type, description, severity, action_taken, reporter_id, category)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            test_record["record_id"],
            test_record["student_id"],
            test_record["date"],
            test_record["behavior_type"],
            test_record["description"],
            test_record["severity"],
            test_record["action_taken"],
            test_record["reporter_id"],
            test_record["category"]
        ))
        
        connection.commit()
        print(f"✅ Test record created with ID: {test_record['record_id']}")
        
        # Verify the record was saved with action_taken
        cursor.execute("SELECT * FROM behavior_records WHERE record_id = %s", (test_record["record_id"],))
        saved_record = cursor.fetchone()
        
        print(f"\n=== Verification ===")
        print(f"Saved action_taken: '{saved_record['action_taken']}'")
        print(f"Length: {len(saved_record['action_taken']) if saved_record['action_taken'] else 0}")
        
        if saved_record['action_taken'] == test_record["action_taken"]:
            print("✅ action_taken saved correctly!")
        else:
            print("❌ action_taken NOT saved correctly!")
            print(f"Expected: '{test_record['action_taken']}'")
            print(f"Got: '{saved_record['action_taken']}'")
        
    except Exception as e:
        print(f"Database error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    check_action_taken_field()
