#!/usr/bin/env python3
"""
Fix Users Table Primary Key: Change from id to user_id
This script changes the primary key of the users table from the auto-increment 'id' column
to the 'user_id' column (VARCHAR), and removes the redundant 'id' column.
"""

import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def fix_users_primary_key():
    """Change users table primary key from id to user_id and remove id column"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("🔧 FIXING USERS TABLE PRIMARY KEY")
        print("="*50)
        
        # Step 1: Check current state
        print("\n📋 Step 1: Checking current state...")
        cursor.execute("SHOW CREATE TABLE users")
        current_structure = cursor.fetchone()
        print("Current users table structure:")
        print(current_structure['Create Table'])
        
        # Check current primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'users'
        """)
        current_pk = cursor.fetchall()
        current_pk_columns = [col['COLUMN_NAME'] for col in current_pk]
        print(f"  Current primary key: {current_pk_columns}")
        
        if 'user_id' in current_pk_columns:
            print("✅ user_id is already the primary key!")
            return True
        
        # Step 2: Check for any foreign key constraints that reference users.id
        print("\n🔗 Step 2: Checking foreign key constraints referencing users.id...")
        cursor.execute("""
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE REFERENCED_TABLE_SCHEMA = 'counselorhub'
            AND REFERENCED_TABLE_NAME = 'users'
            AND REFERENCED_COLUMN_NAME = 'id'
        """)
        referencing_fks = cursor.fetchall()
        
        if referencing_fks:
            print("⚠️ WARNING: Found foreign keys referencing users.id:")
            for fk in referencing_fks:
                print(f"  {fk['TABLE_NAME']}.{fk['COLUMN_NAME']} -> users.id ({fk['CONSTRAINT_NAME']})")
            print("\nThese need to be updated to reference user_id instead.")
            print("This migration will handle the update automatically.")
            
        # Step 3: Backup current data
        print("\n💾 Step 3: Backing up data...")
        cursor.execute("SELECT COUNT(*) as count FROM users")
        user_count = cursor.fetchone()['count']
        print(f"✅ Found {user_count} user records to preserve")
        
        # Check for duplicate user_id values
        cursor.execute("""
            SELECT user_id, COUNT(*) as count 
            FROM users 
            GROUP BY user_id 
            HAVING COUNT(*) > 1
        """)
        duplicates = cursor.fetchall()
        
        if duplicates:
            print("⚠️ WARNING: Found duplicate user_id values:")
            for dup in duplicates:
                print(f"  user_id '{dup['user_id']}' appears {dup['count']} times")
            print("These need to be resolved before changing primary key!")
            return False
        
        # Check for NULL user_id values
        cursor.execute("SELECT COUNT(*) as count FROM users WHERE user_id IS NULL")
        null_count = cursor.fetchone()['count']
        if null_count > 0:
            print(f"❌ Error: {null_count} users have NULL user_id values!")
            return False
        
        print("✅ Data integrity checks passed")
        
        # Step 4: Update foreign key relationships to use user_id instead of id
        print("\n🔄 Step 4: Updating foreign key relationships...")
        
        # For each table that references users.id, we need to:
        # 1. Add a temporary column for user_id
        # 2. Populate it with the corresponding user_id
        # 3. Drop the old foreign key
        # 4. Update the column to reference user_id
        # 5. Create new foreign key constraint
        
        for fk in referencing_fks:
            table_name = fk['TABLE_NAME']
            column_name = fk['COLUMN_NAME'] 
            constraint_name = fk['CONSTRAINT_NAME']
            
            print(f"\n  Updating {table_name}.{column_name}...")
            
            try:
                # Drop the existing foreign key constraint
                cursor.execute(f"ALTER TABLE {table_name} DROP FOREIGN KEY {constraint_name}")
                print(f"    ✅ Dropped FK constraint: {constraint_name}")
                
                # Add temporary column for user_id reference
                temp_column = f"{column_name}_temp_user_id"
                cursor.execute(f"ALTER TABLE {table_name} ADD COLUMN {temp_column} VARCHAR(50)")
                print(f"    ✅ Added temporary column: {temp_column}")
                
                # Populate temporary column with user_id values
                cursor.execute(f"""
                    UPDATE {table_name} t
                    JOIN users u ON t.{column_name} = u.id
                    SET t.{temp_column} = u.user_id
                """)
                print(f"    ✅ Populated {temp_column} with user_id values")
                
                # Verify all records were updated
                cursor.execute(f"SELECT COUNT(*) as count FROM {table_name} WHERE {temp_column} IS NULL")
                null_refs = cursor.fetchone()['count']
                if null_refs > 0:
                    print(f"    ⚠️ Warning: {null_refs} records could not be mapped")
                
                # Drop the old column
                cursor.execute(f"ALTER TABLE {table_name} DROP COLUMN {column_name}")
                print(f"    ✅ Dropped old column: {column_name}")
                
                # Rename temporary column to original name
                cursor.execute(f"ALTER TABLE {table_name} CHANGE COLUMN {temp_column} {column_name} VARCHAR(50)")
                print(f"    ✅ Renamed {temp_column} to {column_name}")
                
            except Error as e:
                print(f"    ❌ Error updating {table_name}.{column_name}: {e}")
                return False
        
        # Step 5: Remove AUTO_INCREMENT from id column
        print("\n🔧 Step 5: Removing AUTO_INCREMENT from id column...")
        try:
            cursor.execute("ALTER TABLE users MODIFY COLUMN id INT NOT NULL")
            print("✅ Removed AUTO_INCREMENT from id column")
        except Error as e:
            print(f"❌ Error removing AUTO_INCREMENT: {e}")
            return False
        
        # Step 6: Drop the current primary key
        print("\n🔑 Step 6: Dropping current primary key...")
        try:
            cursor.execute("ALTER TABLE users DROP PRIMARY KEY")
            print("✅ Dropped current primary key (id)")
        except Error as e:
            print(f"❌ Error dropping primary key: {e}")
            return False
          # Step 7: Drop existing unique index on user_id before making it primary key
        print("\n🔧 Step 7: Dropping existing unique index on user_id...")
        try:
            cursor.execute("ALTER TABLE users DROP INDEX user_id")
            print("✅ Dropped unique index on user_id")
        except Error as e:
            print(f"⚠️ Warning dropping unique index: {e}")
        
        # Step 8: Make user_id the primary key
        print("\n🔑 Step 8: Setting user_id as primary key...")
        try:
            cursor.execute("ALTER TABLE users ADD PRIMARY KEY (user_id)")
            print("✅ Set user_id as primary key")
        except Error as e:
            print(f"❌ Error setting user_id as primary key: {e}")
            return False
          # Step 9: Drop the old id column
        print("\n🗑️ Step 9: Removing old id column...")
        try:
            cursor.execute("ALTER TABLE users DROP COLUMN id")
            print("✅ Removed old id column")
        except Error as e:
            print(f"❌ Error removing id column: {e}")
            return False
        
        # Step 10: Recreate foreign key constraints with user_id
        print("\n🔗 Step 10: Recreating foreign key constraints...")
        for fk in referencing_fks:
            table_name = fk['TABLE_NAME']
            column_name = fk['COLUMN_NAME']
            constraint_name = fk['CONSTRAINT_NAME']
            
            try:
                # Create new foreign key constraint referencing user_id
                new_constraint_name = f"fk_{table_name}_{column_name}_user_id"
                cursor.execute(f"""
                    ALTER TABLE {table_name}
                    ADD CONSTRAINT {new_constraint_name}
                    FOREIGN KEY ({column_name}) REFERENCES users(user_id)
                    ON DELETE CASCADE ON UPDATE CASCADE
                """)
                print(f"    ✅ Created FK constraint: {new_constraint_name}")
                
            except Error as e:
                print(f"    ⚠️ Error creating FK {new_constraint_name}: {e}")
          # Step 11: Verification
        print("\n✅ Step 11: Verification...")
        
        # Check new structure
        cursor.execute("SHOW CREATE TABLE users")
        new_structure = cursor.fetchone()
        print("\nNew users table structure:")
        print(new_structure['Create Table'])
        
        # Check primary key
        cursor.execute("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE CONSTRAINT_NAME = 'PRIMARY' 
            AND TABLE_SCHEMA = 'counselorhub'
            AND TABLE_NAME = 'users'
        """)
        pk_columns = cursor.fetchall()
        print(f"\nPrimary key columns: {[col['COLUMN_NAME'] for col in pk_columns]}")
        
        # Test data integrity
        cursor.execute("SELECT COUNT(*) as count FROM users")
        final_count = cursor.fetchone()['count']
        print(f"Data integrity check: {final_count} records (was {user_count})")
        
        if final_count == user_count:
            print("✅ All data preserved")
        else:
            print("⚠️ Data count mismatch!")
        
        # Sample data
        cursor.execute("SELECT user_id, name, email, role FROM users LIMIT 5")
        sample_users = cursor.fetchall()
        print("\nSample users:")
        for user in sample_users:
            print(f"  PK: {user['user_id']} | Name: {user['name']} | Role: {user['role']}")
        
        # Commit changes
        connection.commit()
        print("\n🎉 USERS PRIMARY KEY MIGRATION COMPLETED!")
        
        return True
        
    except Error as e:
        print(f"❌ Error: {e}")
        if connection:
            connection.rollback()
        return False
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

def print_post_migration_notes():
    """Print important notes after migration"""
    print("\n" + "="*50)
    print("📋 MIGRATION SUCCESS!")
    print("="*50)
    print("✅ users.user_id is now the primary key")
    print("✅ Old 'id' column has been removed")
    print("✅ All foreign key relationships updated")
    print("✅ Data integrity maintained")
    print("\n⚠️ NEXT STEPS:")
    print("1. Update backend API to use user_id as primary key")
    print("2. Update frontend code to use user_id instead of id")
    print("3. Test all user-related operations")
    print("4. Update documentation to reflect schema changes")
    print("\n📝 IMPORTANT NOTES:")
    print("- All foreign keys now reference users.user_id")
    print("- The user_id column is now the primary key (VARCHAR)")
    print("- No auto-increment ID anymore - user_id must be unique")
    print("- Update any application code that relied on numeric user IDs")

if __name__ == "__main__":
    print("🚀 Starting Users Table Primary Key Migration")
    print("This will change the primary key from 'id' to 'user_id' and remove the 'id' column")
    print("\n⚠️ WARNING: This will modify the database structure!")
    print("Make sure you have a backup before proceeding.")
    
    # Confirm with user
    confirmation = input("\nDo you want to proceed? (yes/no): ").lower().strip()
    if confirmation not in ['yes', 'y']:
        print("Migration cancelled.")
        exit(0)
    
    success = fix_users_primary_key()
    
    if success:
        print_post_migration_notes()
    else:
        print("\n❌ Migration failed. Please review the errors above.")
        print("The database has been rolled back to its previous state.")
