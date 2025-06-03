import mysql.connector

def fix_behavior_records_table():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub',
            user='root',
            password=''
        )
        cursor = connection.cursor(dictionary=True)
        
        print("=== Current Table Structure ===")
        cursor.execute("DESCRIBE behavior_records")
        columns = cursor.fetchall()
        
        for col in columns:
            print(f"  {col['Field']}: {col['Type']} - Key: {col['Key']} - Extra: {col['Extra']}")
        
        print("\n=== Checking Current Records ===")
        cursor.execute("SELECT * FROM behavior_records LIMIT 3")
        records = cursor.fetchall()
        
        for record in records:
            print(f"Record: {record}")
        
        # Check if record_id is auto_increment
        cursor.execute("SHOW CREATE TABLE behavior_records")
        create_table = cursor.fetchone()
        print(f"\n=== Table Definition ===")
        print(create_table['Create Table'])
        
        # Fix the issue by making record_id auto_increment
        print("\n=== Fixing record_id to be AUTO_INCREMENT ===")
        
        # First, let's see if we need to modify the table
        if "AUTO_INCREMENT" not in create_table['Create Table']:
            print("Adding AUTO_INCREMENT to record_id...")
            
            # Drop foreign key constraints temporarily if any
            cursor.execute("""
                ALTER TABLE behavior_records 
                MODIFY COLUMN record_id varchar(50) NOT NULL AUTO_INCREMENT
            """)
            print("✅ Modified record_id to AUTO_INCREMENT")
        else:
            print("record_id already has AUTO_INCREMENT")
        
        connection.commit()
        
        # Test insert with null record_id to let it auto-generate
        print("\n=== Testing Insert with Auto-Generated ID ===")
        insert_query = """
            INSERT INTO behavior_records 
            (student_id, date, behavior_type, category, description, severity, action_taken, reporter_id, follow_up_required)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(insert_query, (
            '1103210016',
            '2024-12-31',
            'positive',
            'participation',
            'Test with auto-generated ID',
            'positive',
            'Praised in class',
            'ADM-2025-001',
            False
        ))
        
        connection.commit()
        print("✅ Successfully inserted record with auto-generated ID!")
        
        # Get the last inserted record
        cursor.execute("SELECT * FROM behavior_records ORDER BY created_at DESC LIMIT 1")
        new_record = cursor.fetchone()
        print(f"New record: {new_record}")
        
    except Exception as e:
        print(f"Error: {e}")
        if 'connection' in locals():
            connection.rollback()
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'connection' in locals():
            connection.close()

if __name__ == "__main__":
    fix_behavior_records_table()
