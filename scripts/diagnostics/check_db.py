import mysql.connector

conn = mysql.connector.connect(host='localhost', user='root', password='sIndhu@72Sriyu', database='blood_bank_db')
cur = conn.cursor(dictionary=True)

print("Hospital users:")
cur.execute('SELECT * FROM users WHERE role="Hospital"')
users = cur.fetchall()
for user in users:
    print(user)

print("\nHospitals:")
cur.execute('SELECT * FROM hospital')
hospitals = cur.fetchall()
for hosp in hospitals:
    print(hosp)

cur.close()
conn.close()