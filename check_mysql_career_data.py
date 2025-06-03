import mysql.connector
from mysql.connector import Error

def check_mysql_database():
    """Check MySQL database for career assessments"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='counselorhub',
            user='counselorhub_user',
            password='counselorhub_password_2024'
        )
        
        if connection.is_connected():
            cursor = connection.cursor(dictionary=True)
            
            print('=== CONNECTED TO MYSQL DATABASE ===')
            print('Database: counselorhub')
            
            # Check career_assessments table
            print('\n=== CAREER ASSESSMENTS TABLE ===')
            cursor.execute("SELECT COUNT(*) as count FROM career_assessments WHERE is_active = TRUE")
            count_result = cursor.fetchone()
            print(f"Total active career assessments: {count_result['count']}")
            
            if count_result['count'] > 0:
                cursor.execute("""
                    SELECT ca.assessment_id, ca.student_id, ca.assessment_type, 
                           ca.interests, ca.recommended_paths, ca.date, ca.notes
                    FROM career_assessments ca 
                    WHERE ca.is_active = TRUE 
                    ORDER BY ca.date DESC 
                    LIMIT 5
                """)
                assessments = cursor.fetchall()
                
                print('\nSample career assessments:')
                for assessment in assessments:
                    print(f"- ID: {assessment['assessment_id']}")
                    print(f"  Student: {assessment['student_id']}")
                    print(f"  Type: {assessment['assessment_type']}")
                    print(f"  Date: {assessment['date']}")
                    print(f"  Interests: {assessment['interests']}")
                    print(f"  Recommended: {assessment['recommended_paths']}")
                    print(f"  Notes: {assessment['notes'][:100]}..." if assessment['notes'] and len(assessment['notes']) > 100 else f"  Notes: {assessment['notes']}")
                    print()
            
            # Check career_resources table  
            print('\n=== CAREER RESOURCES TABLE ===')
            cursor.execute("SELECT COUNT(*) as count FROM career_resources WHERE is_active = TRUE")
            count_result = cursor.fetchone()
            print(f"Total active career resources: {count_result['count']}")
            
            if count_result['count'] > 0:
                cursor.execute("""
                    SELECT resource_id, title, resource_type, tags, date_published
                    FROM career_resources 
                    WHERE is_active = TRUE 
                    ORDER BY created_at DESC 
                    LIMIT 3
                """)
                resources = cursor.fetchall()
                
                print('\nSample career resources:')
                for resource in resources:
                    print(f"- ID: {resource['resource_id']}")
                    print(f"  Title: {resource['title']}")
                    print(f"  Type: {resource['resource_type']}")
                    print(f"  Tags: {resource['tags']}")
                    print(f"  Published: {resource['date_published']}")
                    print()
                    
    except Error as e:
        print(f"Error connecting to MySQL database: {e}")
        
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == "__main__":
    check_mysql_database()
