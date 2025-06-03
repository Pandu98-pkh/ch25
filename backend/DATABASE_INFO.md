# CounselorHub Database Configuration

## Database Information

- **Database Name**: `counselorhub`
- **Host**: `localhost`
- **Port**: `3306`
- **Charset**: `utf8mb4`

## User Accounts

### Admin Account (Database Admin)
- **Username**: `admin`
- **Password**: `admin`
- **Privileges**: Full database server access

### Application Account
- **Username**: `counselorhub_user`
- **Password**: `counselorhub_password_2024`
- **Privileges**: Full access to `counselorhub` database only

## System Login Accounts

### Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@counselorhub.edu`
- **Role**: `admin`

### Counselors
1. **Dr. Sarah Johnson**
   - **Username**: `counselor1`
   - **Password**: `counselor123`
   - **Email**: `sarah.johnson@counselorhub.edu`
   - **Role**: `counselor`

2. **Dr. Michael Chen**
   - **Username**: `counselor2`
   - **Password**: `counselor456`
   - **Email**: `michael.chen@counselorhub.edu`
   - **Role**: `counselor`

## Database Tables

1. **users** - User accounts and authentication
2. **classes** - Academic classes and sections
3. **students** - Student information and academic status
4. **counseling_sessions** - Counseling session records
5. **mental_health_assessments** - Mental health assessment data
6. **behavior_records** - Student behavior tracking
7. **career_assessments** - Career guidance assessments
8. **career_resources** - Career guidance resources
9. **notifications** - System notifications

## Sample Data

The database includes comprehensive sample data:
- 3 user accounts (1 admin, 2 counselors)
- 5 classes across grades 10-12
- 8 students with varying academic statuses
- Multiple counseling sessions and assessments
- Behavior records and career assessments
- Notification samples

## Connection Strings

### For Python Applications
```python
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'counselorhub_user',
    'password': 'counselorhub_password_2024',
    'database': 'counselorhub',
    'charset': 'utf8mb4'
}
```

### SQLAlchemy URL
```
mysql+pymysql://counselorhub_user:counselorhub_password_2024@localhost:3306/counselorhub
```

### For Node.js Applications
```javascript
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'counselorhub_user',
  password: 'counselorhub_password_2024',
  database: 'counselorhub',
  charset: 'utf8mb4'
};
```

## Security Features

- ✅ Password hashing using bcrypt
- ✅ Role-based access control
- ✅ Proper foreign key relationships
- ✅ Indexed columns for performance
- ✅ Dedicated application user with limited privileges

## Usage Notes

1. The admin account (`admin`/`admin`) should only be used for database administration
2. Applications should connect using the `counselorhub_user` account
3. All user passwords are hashed using bcrypt
4. JSON data is stored as TEXT for MariaDB compatibility
5. The database uses UTF-8 encoding for international character support
