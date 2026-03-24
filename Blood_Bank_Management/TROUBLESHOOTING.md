# 🔧 Troubleshooting Guide - Blood Bank System

## Issue: 500 Internal Server Error on /register_donor

### Root Cause
The error occurs when there's a mismatch between the database schema and what the backend expects.

### Solutions (Try in order):

---

## Solution 1: Run the Database Schema Script (RECOMMENDED)

### Step 1: Import the SQL Schema
```bash
# Open MySQL command line or MySQL Workbench and run:
mysql -u root -p blood_bank_db < database_schema.sql
```

**OR** Open `database_schema.sql` in MySQL Workbench and execute it.

### Step 2: Restart Flask
```bash
# Stop the Flask app (Ctrl+C)
# Then restart:
python app.py
```

### Step 3: Test Again
- Try registering a donor from the frontend
- The issue should be resolved!

---

## Solution 2: Check Your Database Schema

### Verify the donor table has these columns:
```sql
USE blood_bank_db;
DESCRIBE donor;
```

**Expected columns:**
- `donor_id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR)
- `age` (INT)
- `gender` (VARCHAR/ENUM)
- `blood_group` (VARCHAR)
- `phone` (VARCHAR)
- `email` (VARCHAR)
- `address` (TEXT)
- `city` (VARCHAR) ← **This might be missing!**
- `is_active` (BOOLEAN/TINYINT)
- `donor_type` (VARCHAR)

### If city column is missing:
```sql
ALTER TABLE donor ADD COLUMN city VARCHAR(50) AFTER address;
```

---

## Solution 3: Check Flask Console for Detailed Errors

The updated backend now prints detailed error messages. Check your Flask terminal for:
```
ERROR in register_donor: <error message>
Full traceback: <detailed error>
```

Common errors and fixes:

### Error: "Table 'blood_bank_db.donor' doesn't exist"
**Fix:** Run the `database_schema.sql` script

### Error: "Unknown column 'city' in 'field list'"
**Fix:** The backend now handles this automatically by trying without the city column

### Error: "Access denied for user"
**Fix:** Check MySQL credentials in `app.py`:
```python
app.config['MYSQL_USER'] = 'root'  # Your MySQL username
app.config['MYSQL_PASSWORD'] = 'A1d2h3i4*x'  # Your MySQL password
```

### Error: "Can't connect to MySQL server"
**Fix:** 
1. Start MySQL service
2. Verify it's running on port 3306

---

## Solution 4: Quick Database Setup from Scratch

If you need to recreate everything:

```sql
-- Drop existing database (CAUTION: This deletes all data!)
DROP DATABASE IF EXISTS blood_bank_db;

-- Create fresh database
CREATE DATABASE blood_bank_db;
USE blood_bank_db;

-- Then run the database_schema.sql script
```

---

## Solution 5: Test Database Connection

Create a test file `test_db.py`:

```python
from flask import Flask
from flask_mysqldb import MySQL

app = Flask(__name__)
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'A1d2h3i4*x'
app.config['MYSQL_DB'] = 'blood_bank_db'

mysql = MySQL(app)

with app.app_context():
    cur = mysql.connection.cursor()
    cur.execute("SHOW TABLES")
    tables = cur.fetchall()
    print("Tables in database:")
    for table in tables:
        print(f"  - {table[0]}")
    cur.close()
    print("✅ Database connection successful!")
```

Run:
```bash
python test_db.py
```

---

## Current Status: Backend Updated ✅

The backend has been updated with:
- ✅ Better error handling
- ✅ Automatic fallback if 'city' column is missing
- ✅ Detailed error logging to console
- ✅ More informative error messages

---

## Quick Checklist

- [ ] MySQL server is running
- [ ] Database `blood_bank_db` exists
- [ ] All tables are created (run `database_schema.sql`)
- [ ] MySQL credentials in `app.py` are correct
- [ ] Flask app is running without errors on startup
- [ ] Frontend can connect to http://localhost:5000

---

## Still Having Issues?

### Check Flask Startup
The Flask console should show:
```
 * Serving Flask app 'app'
 * Debug mode: on
WARNING: This is a development server.
 * Running on http://127.0.0.1:5000
```

If you see any errors on startup, those need to be fixed first!

### Test with curl
```bash
curl -X POST http://localhost:5000/register_donor \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"age\":25,\"gender\":\"Male\",\"blood_group\":\"A+\",\"contact\":\"1234567890\"}"
```

Expected response:
```json
{
  "message": "Donor registered successfully",
  "donor_id": 1
}
```

---

## Contact Points

1. **Check Flask terminal** for error messages
2. **Check MySQL logs** for database errors
3. **Check browser console** for frontend errors
4. **Review** `database_schema.sql` was executed successfully

---

**Once fixed, your system should work perfectly! The frontend is already beautiful and ready to go! 🚀**
