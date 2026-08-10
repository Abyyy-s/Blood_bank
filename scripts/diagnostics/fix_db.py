import mysql.connector

conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='sIndhu@72Sriyu',
    database='blood_bank_db'
)
cur = conn.cursor()

# Check current columns
cur.execute('DESCRIBE blood_stock')
columns = [row[0] for row in cur.fetchall()]
print(f'Current columns: {columns}')

# Add missing columns
if 'component_type' not in columns:
    try:
        cur.execute('ALTER TABLE blood_stock ADD COLUMN component_type VARCHAR(50) NOT NULL DEFAULT "Whole Blood"')
        print('Added component_type column')
    except Exception as e:
        print(f'Error adding component_type: {e}')

if 'expiry_date' not in columns:
    try:
        cur.execute('ALTER TABLE blood_stock ADD COLUMN expiry_date DATE NOT NULL DEFAULT CURDATE()')
        print('Added expiry_date column')
    except Exception as e:
        print(f'Error adding expiry_date: {e}')

# Clear old data
cur.execute('DELETE FROM blood_stock')

# Insert sample data
data = [
    (1, 'A+', 'Whole Blood', '2026-04-14', 45, 'Available'),
    (1, 'A-', 'Whole Blood', '2026-04-14', 12, 'Available'),
    (1, 'B+', 'Whole Blood', '2026-04-14', 38, 'Available'),
    (1, 'B-', 'Whole Blood', '2026-04-14', 8, 'Low'),
    (1, 'AB+', 'Whole Blood', '2026-04-14', 15, 'Available'),
    (1, 'AB-', 'Whole Blood', '2026-04-14', 5, 'Low'),
    (1, 'O+', 'Whole Blood', '2026-04-14', 52, 'Available'),
    (1, 'O-', 'Whole Blood', '2026-04-14', 18, 'Available'),
    (2, 'A+', 'Whole Blood', '2026-04-14', 32, 'Available'),
    (2, 'A-', 'Whole Blood', '2026-04-14', 9, 'Low'),
    (2, 'B+', 'Whole Blood', '2026-04-14', 28, 'Available'),
    (2, 'B-', 'Whole Blood', '2026-04-14', 6, 'Low'),
    (2, 'AB+', 'Whole Blood', '2026-04-14', 11, 'Available'),
    (2, 'AB-', 'Whole Blood', '2026-04-14', 4, 'Low'),
    (2, 'O+', 'Whole Blood', '2026-04-14', 44, 'Available'),
    (2, 'O-', 'Whole Blood', '2026-04-14', 14, 'Available')
]

cur.executemany('''
INSERT INTO blood_stock (bank_id, blood_group, component_type, expiry_date, quantity_units, status)
VALUES (%s, %s, %s, %s, %s, %s)
''', data)

conn.commit()
cur.close()
conn.close()
print('Database fixed and sample data inserted')