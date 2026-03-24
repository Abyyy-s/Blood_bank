import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='sIndhu@72Sriyu', database='blood_bank_db')
cur = conn.cursor(dictionary=True)
cur.execute('SELECT * FROM notification ORDER BY created_at DESC LIMIT 20')
for n in cur.fetchall():
    print(n)
cur.close()
conn.close()