"""
Minimal fix script to repair the app.py file
"""

import re

def fix_app_py():
    """Fix the corrupted app.py file"""
    
    print("🔧 Fixing app.py file...")
    
    # Read the corrupted file
    with open('d:/Backup/Downloads/project/backend/app.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix common issues
    fixes = [
        # Fix missing newlines after try statements
        (r'try:\s*cursor = connection\.cursor', 'try:\n        cursor = connection.cursor'),
        
        # Fix missing newlines after function definitions
        (r'"""([^"]+)"""\s*connection = get_db_connection\(\)', '"""\1"""\n    connection = get_db_connection()'),
        
        # Fix missing newlines in if statements
        (r'get_db_connection\(\)\s*if not connection:', 'get_db_connection()\n    if not connection:'),
        
        # Fix indentation issues
        (r'except Error as e:\s*logger\.error', 'except Error as e:\n        logger.error'),
        (r'finally:\s*if connection\.is_connected', 'finally:\n        if connection.is_connected'),
    ]
    
    for pattern, replacement in fixes:
        content = re.sub(pattern, replacement, content)
    
    # Write the fixed content
    with open('d:/Backup/Downloads/project/backend/app_fixed.py', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✅ Fixed version saved as app_fixed.py")

if __name__ == '__main__':
    fix_app_py()
