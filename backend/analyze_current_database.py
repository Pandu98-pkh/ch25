"""
Analyze Current Database Structure
Script untuk menganalisis struktur database CounselorHub yang sudah ada
dan menghasilkan informasi untuk memperbarui create_counselorhub_database.py
"""
import mysql.connector
from mysql.connector import Error
import json

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'admin',
    'password': 'admin',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}

def analyze_database():
    """Analyze current database structure"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("🔍 Analyzing CounselorHub Database Structure")
        print("=" * 60)
        
        # Get all tables
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        
        print(f"\n📋 Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table}")
        
        database_structure = {}
        
        # Analyze each table
        for table in tables:
            print(f"\n🔍 Analyzing table: {table}")
            print("-" * 40)
            
            # Get table structure
            cursor.execute(f"DESCRIBE {table}")
            columns = cursor.fetchall()
            
            # Get CREATE TABLE statement
            cursor.execute(f"SHOW CREATE TABLE {table}")
            create_statement = cursor.fetchone()[1]
            
            # Get foreign keys
            cursor.execute(f"""
                SELECT 
                    COLUMN_NAME,
                    REFERENCED_TABLE_NAME,
                    REFERENCED_COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = 'counselorhub' 
                AND TABLE_NAME = '{table}' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            """)
            foreign_keys = cursor.fetchall()
            
            # Get indexes
            cursor.execute(f"SHOW INDEX FROM {table}")
            indexes = cursor.fetchall()
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            row_count = cursor.fetchone()[0]
            
            database_structure[table] = {
                'columns': columns,
                'create_statement': create_statement,
                'foreign_keys': foreign_keys,
                'indexes': indexes,
                'row_count': row_count
            }
            
            print(f"  Columns: {len(columns)}")
            print(f"  Foreign Keys: {len(foreign_keys)}")
            print(f"  Indexes: {len(indexes)}")
            print(f"  Rows: {row_count}")
            
            # Show columns
            print("  Column Structure:")
            for col in columns:
                field, type_, null, key, default, extra = col
                print(f"    {field}: {type_} {'NOT NULL' if null == 'NO' else 'NULL'} {key} {extra}")
            
            # Show foreign keys
            if foreign_keys:
                print("  Foreign Keys:")
                for fk in foreign_keys:
                    print(f"    {fk[0]} -> {fk[1]}.{fk[2]}")
        
        return database_structure
        
    except Error as e:
        print(f"❌ Error analyzing database: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def generate_create_statements(database_structure):
    """Generate CREATE TABLE statements based on current structure"""
    print("\n📝 Generating CREATE TABLE statements:")
    print("=" * 60)
    
    create_statements = {}
    
    for table_name, structure in database_structure.items():
        print(f"\n-- {table_name.upper()} TABLE")
        print("-" * 30)
        
        # Clean up the CREATE statement (remove AUTO_INCREMENT values, etc.)
        create_statement = structure['create_statement']
        
        # Remove AUTO_INCREMENT=n part
        import re
        create_statement = re.sub(r'AUTO_INCREMENT=\d+\s*', '', create_statement)
        
        print(create_statement)
        create_statements[table_name] = create_statement
    
    return create_statements

def analyze_sample_data(database_structure):
    """Analyze sample data in tables"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        print("\n📊 Sample Data Analysis:")
        print("=" * 60)
        
        sample_data = {}
        
        for table_name in database_structure.keys():
            print(f"\n📋 {table_name}:")
            
            # Get sample rows
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 3")
            rows = cursor.fetchall()
            
            # Get column names
            cursor.execute(f"DESCRIBE {table_name}")
            columns = [col[0] for col in cursor.fetchall()]
            
            sample_data[table_name] = {
                'columns': columns,
                'sample_rows': rows
            }
            
            if rows:
                print(f"  Columns: {', '.join(columns)}")
                for i, row in enumerate(rows, 1):
                    print(f"  Row {i}: {row}")
            else:
                print("  No data found")
        
        return sample_data
        
    except Error as e:
        print(f"❌ Error analyzing sample data: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

def save_analysis_to_file(database_structure, create_statements, sample_data):
    """Save analysis results to files"""
    
    # Save structure analysis
    with open('database_structure_analysis.json', 'w', encoding='utf-8') as f:
        # Convert non-serializable objects to strings
        serializable_structure = {}
        for table, data in database_structure.items():
            serializable_structure[table] = {
                'columns': [list(col) for col in data['columns']],
                'create_statement': data['create_statement'],
                'foreign_keys': [list(fk) for fk in data['foreign_keys']],
                'indexes': [list(idx) for idx in data['indexes']],
                'row_count': data['row_count']
            }
        
        json.dump(serializable_structure, f, indent=2, ensure_ascii=False)
    
    # Save CREATE statements
    with open('database_create_statements.sql', 'w', encoding='utf-8') as f:
        f.write("-- CounselorHub Database CREATE Statements\n")
        f.write("-- Generated from current database structure\n\n")
        
        for table_name, statement in create_statements.items():
            f.write(f"-- {table_name.upper()} TABLE\n")
            f.write(f"{statement};\n\n")
    
    # Save sample data
    with open('database_sample_data.json', 'w', encoding='utf-8') as f:
        # Convert non-serializable objects to strings
        serializable_data = {}
        for table, data in sample_data.items():
            serializable_data[table] = {
                'columns': data['columns'],
                'sample_rows': [list(row) for row in data['sample_rows']]
            }
        
        json.dump(serializable_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Analysis saved to files:")
    print(f"  - database_structure_analysis.json")
    print(f"  - database_create_statements.sql") 
    print(f"  - database_sample_data.json")

def main():
    """Main analysis function"""
    print("🚀 Starting Database Analysis")
    
    # Analyze database structure
    database_structure = analyze_database()
    if not database_structure:
        print("❌ Failed to analyze database structure")
        return
    
    # Generate CREATE statements
    create_statements = generate_create_statements(database_structure)
    
    # Analyze sample data
    sample_data = analyze_sample_data(database_structure)
    if not sample_data:
        print("❌ Failed to analyze sample data")
        return
    
    # Save analysis to files
    save_analysis_to_file(database_structure, create_statements, sample_data)
    
    print(f"\n✅ Database analysis completed successfully!")
    print(f"📊 Summary:")
    print(f"  - Tables analyzed: {len(database_structure)}")
    print(f"  - Total rows: {sum(data['row_count'] for data in database_structure.values())}")

if __name__ == '__main__':
    main()
