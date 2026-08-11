from flask import Flask, jsonify, request, send_from_directory, session, redirect
from flask_cors import CORS
from flask_mysqldb import MySQL
from MySQLdb.cursors import DictCursor
from werkzeug.security import generate_password_hash, check_password_hash
import os
import traceback
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static")
app.secret_key = os.getenv("FLASK_SECRET_KEY")
CORS(app)

app.config['MYSQL_HOST'] = os.getenv("MYSQL_HOST")
app.config['MYSQL_USER'] = os.getenv("MYSQL_USER")
app.config['MYSQL_PASSWORD'] = os.getenv("MYSQL_PASSWORD")
app.config['MYSQL_DB'] = os.getenv("MYSQL_DB")

mysql = MySQL(app)

def init_db():
    cur = mysql.connection.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role ENUM('Admin','Staff','Hospital') NOT NULL,
            hospital_id INT DEFAULT NULL,
            contact_number VARCHAR(15) DEFAULT NULL,
            last_login DATETIME DEFAULT NULL
        )
    """)
    for col_sql in [
        "ALTER TABLE users ADD COLUMN contact_number VARCHAR(15) DEFAULT NULL",
        "ALTER TABLE users ADD COLUMN last_login DATETIME DEFAULT NULL",
    ]:
        try:
            cur.execute(col_sql)
        except Exception:
            pass
    try:
        cur.execute("ALTER TABLE blood_stock ADD COLUMN component_type VARCHAR(50) NOT NULL DEFAULT 'Whole Blood'")
        mysql.connection.commit()
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE blood_stock DROP FOREIGN KEY blood_stock_ibfk_1")
    except Exception:
        pass
    for idx in ['uq_bank_blood', 'unique_bank_blood', 'uq_stock']:
        try:
            cur.execute(f"ALTER TABLE blood_stock DROP INDEX {idx}")
        except Exception:
            pass
    try:
        cur.execute("ALTER TABLE blood_stock ADD UNIQUE KEY uq_stock (bank_id, blood_group, component_type)")
    except Exception:
        pass
    try:
        cur.execute("ALTER TABLE blood_stock ADD CONSTRAINT blood_stock_ibfk_1 FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)")
    except Exception:
        pass
    mysql.connection.commit()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS notification (
            notification_id INT PRIMARY KEY AUTO_INCREMENT,
            target_role ENUM('Admin','Staff','Hospital') NOT NULL,
            hospital_id INT DEFAULT NULL,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
        )
    """)
    try:
        cur.execute("ALTER TABLE notification MODIFY COLUMN target_role ENUM('Admin','Staff','Hospital') NOT NULL")
    except Exception:
        pass
    mysql.connection.commit()
    default_users = [
        ('Administrator', 'admin@lifelink.com',    'Admin',    'admin123',    None, '1234567890'),
        ('Staff Member',  'staff@lifelink.com',    'Staff',    'staff123',    None, '0987654321'),
        ('Hospital User', 'hospital@lifelink.com', 'Hospital', 'hospital123', 1,    '5555555555'),
    ]
    for name, email, role, plain, hospid, contact in default_users:
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        if not cur.fetchone():
            hashed = generate_password_hash(plain)
            cur.execute("INSERT INTO users (name,email,password,role,hospital_id,contact_number) VALUES (%s,%s,%s,%s,%s,%s)",
                        (name, email, hashed, role, hospid, contact))
    mysql.connection.commit()
    cur.close()

def create_notification(target_role, message, hospital_id=None):
    try:
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO notification (target_role, hospital_id, message) VALUES (%s,%s,%s)",
                    (target_role, hospital_id, message))
        mysql.connection.commit()
        cur.close()
    except Exception:
        pass

with app.app_context():
    init_db()

@app.route("/")
def home():
    return send_from_directory("static", "loading.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "GET":
        return send_from_directory("static", "login.html")
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")
    if not email or not password or not role:
        return jsonify({"error": "Missing credentials"}), 400
    cur = mysql.connection.cursor(DictCursor)
    cur.execute("SELECT * FROM users WHERE email=%s AND role=%s", (email, role))
    user = cur.fetchone()
    if user and check_password_hash(user["password"], password):
        cur2 = mysql.connection.cursor()
        cur2.execute("UPDATE users SET last_login=NOW() WHERE id=%s", (user["id"],))
        mysql.connection.commit()
        cur2.close()
        session["user"] = {"id": user["id"], "name": user["name"], "role": user["role"],
                           "hospital_id": user["hospital_id"], "email": user["email"],
                           "contact_number": user["contact_number"]}
        cur.close()
        return jsonify({"message": "Login successful", "role": user["role"]})
    cur.close()
    return jsonify({"error": "Invalid credentials"}), 401

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.before_request
def protect_routes():
    allowed = ["/login", "/", "/api/me", "/api/profile"]
    if request.path.startswith("/static"):
        return
    if request.path in allowed:
        return
    if not session.get("user"):
        return redirect("/login")

@app.route("/admin-dashboard")
def admin_dashboard():
    if session.get("user", {}).get("role") != "Admin":
        return redirect("/login")
    return send_from_directory("static", "index.html")

@app.route("/staff-dashboard")
def staff_dashboard():
    if session.get("user", {}).get("role") != "Staff":
        return redirect("/login")
    return send_from_directory("static", "index.html")

@app.route("/hospital-dashboard")
def hospital_dashboard():
    if session.get("user", {}).get("role") != "Hospital":
        return redirect("/login")
    return send_from_directory("static", "requests.html")

@app.route("/api/me")
def me():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user)

@app.route("/api/profile")
def profile():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT id, name, email, role, contact_number, last_login FROM users WHERE id=%s", (user["id"],))
        user_info = cur.fetchone()
        role = user["role"]
        if role in ("Admin", "Staff"):
            profile_data = {"type": role.lower(), "name": user_info["name"], "email": user_info["email"],
                            "role": user_info["role"], "contact_number": user_info["contact_number"],
                            "last_login": str(user_info["last_login"]) if user_info["last_login"] else "Never"}
        elif role == "Hospital":
            hospital_id = user["hospital_id"]
            cur.execute("SELECT hospital_id, hospital_name, location FROM hospital WHERE hospital_id=%s", (hospital_id,))
            hospital_info = cur.fetchone()
            profile_data = {"type": "hospital", "contact_person_name": user_info["name"],
                            "contact_email": user_info["email"], "contact_number": user_info["contact_number"],
                            "hospital_name": hospital_info["hospital_name"] if hospital_info else "N/A",
                            "hospital_id": hospital_id,
                            "location": hospital_info["location"] if hospital_info else "N/A",
                            "last_login": str(user_info["last_login"]) if user_info["last_login"] else "Never"}
        else:
            profile_data = user_info
        cur.close()
        return jsonify(profile_data)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/api/profile/update", methods=['PUT'])
def update_profile():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        data = request.json
        name = data.get("name")
        contact_number = data.get("contact_number")

        if not name or not contact_number:
            return jsonify({"error": "Missing required fields"}), 400

        cur = mysql.connection.cursor()
        cur.execute("UPDATE users SET name=%s, contact_number=%s WHERE id=%s",
                    (name, contact_number, user["id"]))
        mysql.connection.commit()
        cur.close()

        # Update session
        session["user"]["name"] = name
        session["user"]["contact_number"] = contact_number

        return jsonify({"message": "Profile updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/api/profile/change-password", methods=['POST'])
def change_password():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        data = request.json
        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({"error": "Missing required fields"}), 400

        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT password FROM users WHERE id=%s", (user["id"],))
        user_record = cur.fetchone()

        if not user_record or not check_password_hash(user_record["password"], current_password):
            cur.close()
            return jsonify({"error": "Current password is incorrect"}), 401

        hashed_password = generate_password_hash(new_password)
        cur2 = mysql.connection.cursor()
        cur2.execute("UPDATE users SET password=%s WHERE id=%s",
                     (hashed_password, user["id"]))
        mysql.connection.commit()
        cur2.close()
        cur.close()

        return jsonify({"message": "Password changed successfully"})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/api/profile/notification-preferences", methods=['PUT'])
def update_notification_preferences():
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        data = request.json
        # Note: Currently preferences are just acknowledged
        # In future, store these in a user_preferences table
        return jsonify({"message": "Notification preferences updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/dashboard", methods=['GET'])
def get_dashboard():
    try:
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT COUNT(*) as total FROM donor")
        total_donors = cur.fetchone()['total']
        cur.execute("SELECT COUNT(*) as total FROM donation")
        total_donations = cur.fetchone()['total']
        cur.execute("SELECT blood_group, SUM(quantity_units) as total_units FROM blood_stock GROUP BY blood_group ORDER BY blood_group")
        stock_by_group = cur.fetchall()
        cur.execute("SELECT COUNT(*) as total FROM blood_request WHERE status = 'Pending'")
        pending_requests = cur.fetchone()['total']
        cur.close()
        return jsonify({"total_donors": total_donors, "total_donations": total_donations,
                        "stock_by_group": stock_by_group, "pending_requests": pending_requests})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/donors", methods=['GET'])
def api_get_donors():
    try:
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT * FROM donor")
        donors = cur.fetchall()
        cur.close()
        return jsonify(donors)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/donors", methods=['POST'])
def api_register_donor():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data received"}), 400
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO donor (name, age, gender, blood_group, phone, email, address, city) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                    (data.get('name'), data.get('age'), data.get('gender'), data.get('blood_group'),
                     data.get('phone'), data.get('email'), data.get('address'), data.get('city')))
        mysql.connection.commit()
        donor_id = cur.lastrowid
        cur.close()
        return jsonify({"message": "Donor registered", "donor_id": donor_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/donors/<int:donor_id>", methods=["GET", "PUT", "DELETE"])
def api_manage_donor(donor_id):
    try:
        if request.method == "GET":
            cur = mysql.connection.cursor(DictCursor)
            cur.execute("SELECT * FROM donor WHERE donor_id = %s", (donor_id,))
            donor = cur.fetchone()
            cur.close()
            if not donor:
                return jsonify({"error": "Donor not found"}), 404
            return jsonify(donor)
        if request.method == "PUT":
            data = request.json
            cur = mysql.connection.cursor()
            cur.execute("UPDATE donor SET name=%s,age=%s,gender=%s,blood_group=%s,phone=%s,email=%s,address=%s,city=%s WHERE donor_id=%s",
                        (data.get("name"), data.get("age"), data.get("gender"), data.get("blood_group"),
                         data.get("phone"), data.get("email"), data.get("address"), data.get("city"), donor_id))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Donor updated successfully"})
        if request.method == "DELETE":
            cur = mysql.connection.cursor()
            cur.execute("DELETE FROM donor WHERE donor_id = %s", (donor_id,))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Donor deleted"})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/blood_banks", methods=['GET'])
def api_get_blood_banks():
    try:
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT bank_id, bank_name, location FROM blood_bank")
        banks = cur.fetchall()
        cur.close()
        return jsonify(banks)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/blood_banks", methods=['POST'])
def api_add_blood_bank():
    try:
        data = request.json
        if not data.get('bank_name'):
            return jsonify({"error": "Bank name is required"}), 400
        cur = mysql.connection.cursor()
        cur.execute("INSERT INTO blood_bank (bank_name, location) VALUES (%s, %s)", (data.get('bank_name'), data.get('location')))
        mysql.connection.commit()
        bank_id = cur.lastrowid
        cur.close()
        return jsonify({"message": "Blood bank added successfully", "bank_id": bank_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/blood_banks/<int:bank_id>", methods=['DELETE'])
def api_delete_blood_bank(bank_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM blood_bank WHERE bank_id = %s", (bank_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Blood bank deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/hospitals", methods=['GET', 'POST'])
def hospitals():
    try:
        if request.method == 'GET':
            cur = mysql.connection.cursor(DictCursor)
            cur.execute("SELECT * FROM hospital ORDER BY hospital_name")
            data = cur.fetchall()
            cur.close()
            return jsonify(data)
        if request.method == 'POST':
            data = request.json
            if not data.get('hospital_name'):
                return jsonify({"error": "Hospital name is required"}), 400
            # insert hospital record first
            cur = mysql.connection.cursor()
            cur.execute("INSERT INTO hospital (hospital_name, location) VALUES (%s, %s)",
                        (data.get('hospital_name'), data.get('location')))
            mysql.connection.commit()
            hospital_id = cur.lastrowid

            cur.close()
            return jsonify({"message": "Hospital added successfully", "hospital_id": hospital_id}), 201
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/hospitals/<int:hospital_id>", methods=['DELETE'])
def api_delete_hospital(hospital_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM hospital WHERE hospital_id = %s", (hospital_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Hospital deleted"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/donations", methods=['GET', 'POST'])
def donations():
    try:
        cur = mysql.connection.cursor(DictCursor)
        if request.method == 'GET':
            cur.execute("""
                SELECT d.*, dn.name AS donor_name, dn.blood_group AS blood_group, bb.bank_name AS bank_name
                FROM donation d
                JOIN donor dn ON d.donor_id = dn.donor_id
                JOIN blood_bank bb ON d.bank_id = bb.bank_id
                ORDER BY d.donation_date DESC
            """)
            data = cur.fetchall()
            cur.close()
            return jsonify(data)
        if request.method == 'POST':
            data = request.json
            if not data:
                return jsonify({"error": "No JSON data received"}), 400
            cur.execute("SELECT blood_group FROM donor WHERE donor_id = %s", (data.get('donor_id'),))
            donor = cur.fetchone()
            if not donor:
                return jsonify({"error": "Donor not found"}), 404
            blood_group = donor['blood_group']
            bank_id   = int(data.get('bank_id'))
            qty       = int(data.get('quantity_units'))
            component = data.get('component_type', 'Whole Blood')
            expiry_days = {'Whole Blood': 35, 'RBC': 42, 'Platelets': 5, 'Plasma': 365}.get(component, 35)
            donation_date = data.get('donation_date') or None
            cur2 = mysql.connection.cursor()
            if donation_date:
                cur2.execute("""
                    INSERT INTO donation (donor_id, blood_group, bank_id, screening_id, donation_date,
                     component_type, quantity_units, expiry_date)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,DATE_ADD(%s, INTERVAL %s DAY))
                """, (data.get('donor_id'), blood_group, bank_id, data.get('screening_id'),
                      donation_date, component, qty, donation_date, expiry_days))
            else:
                cur2.execute("""
                    INSERT INTO donation (donor_id, blood_group, bank_id, screening_id, donation_date,
                     component_type, quantity_units, expiry_date)
                    VALUES (%s,%s,%s,%s,CURDATE(),%s,%s,DATE_ADD(CURDATE(), INTERVAL %s DAY))
                """, (data.get('donor_id'), blood_group, bank_id, data.get('screening_id'),
                      component, qty, expiry_days))
            
            cur2.execute("""
    INSERT INTO blood_stock (
        bank_id,
        blood_group,
        component_type,
        expiry_date,
        quantity_units,
        status
    )
    VALUES (
        %s,
        %s,
        %s,
        DATE_ADD(COALESCE(%s, CURDATE()), INTERVAL %s DAY),
        %s,
        CASE
            WHEN %s <= 0 THEN 'Out of Stock'
            WHEN %s <= 5 THEN 'Low'
            ELSE 'Available'
        END
    )
    ON DUPLICATE KEY UPDATE
        quantity_units = quantity_units + VALUES(quantity_units),
        status = CASE
            WHEN quantity_units + VALUES(quantity_units) = 0 THEN 'Out of Stock'
            WHEN quantity_units + VALUES(quantity_units) <= 5 THEN 'Low'
            ELSE 'Available'
        END
""", (
    bank_id,
    blood_group,
    component,
    donation_date,
    expiry_days,
    qty,
    qty,
    qty
))
            mysql.connection.commit()
            cur2.close()
            cur.close()
            return jsonify({"message": "Donation recorded and stock updated"}), 201
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/donor_health", methods=['GET', 'POST'])
def donor_health():
    try:
        if request.method == 'GET':
            cur = mysql.connection.cursor(DictCursor)
            cur.execute("""
                SELECT h.health_id, h.donor_id, h.hemoglobin_level, h.screening_date,
                       h.bp, h.weight, h.disease_detected, h.eligibility_status, d.name, d.age
                FROM donor_health h
                JOIN donor d ON h.donor_id = d.donor_id
                ORDER BY h.health_id ASC
            """)
            data = cur.fetchall()
            cur.close()
            return jsonify(data)
        if request.method == 'POST':
            data = request.json
            if not data.get('donor_id'):
                return jsonify({"error": "donor_id is required"}), 400
            if not data.get('eligibility_status'):
                return jsonify({"error": "eligibility_status is required"}), 400
            cur = mysql.connection.cursor()
            cur.execute("""
                INSERT INTO donor_health (donor_id, hemoglobin_level, screening_date, bp, weight, disease_detected, eligibility_status)
                VALUES (%s,%s,CURDATE(),%s,%s,%s,%s)
            """, (data.get('donor_id'), data.get('hemoglobin_level'), data.get('bp'),
                  data.get('weight'), data.get('disease_detected'), data.get('eligibility_status')))
            mysql.connection.commit()
            new_id = cur.lastrowid
            cur.close()
            return jsonify({"message": "Health screening recorded", "health_id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/stock", methods=['GET'])
def get_stock():
    try:
        blood_group    = request.args.get('blood_group')
        bank_id        = request.args.get('bank_id')
        component_type = request.args.get('component_type')
        cur = mysql.connection.cursor(DictCursor)
        query = """
            SELECT s.stock_id, s.bank_id, b.bank_name, b.location, s.blood_group, s.component_type,
                   s.quantity_units,
                   CASE WHEN s.quantity_units=0 THEN 'Out of Stock' WHEN s.quantity_units<=5 THEN 'Low' ELSE 'Available' END AS status
            FROM blood_stock s
            JOIN blood_bank b ON s.bank_id = b.bank_id
        """
        conditions, params = [], []
        if blood_group:
            conditions.append("s.blood_group = %s"); params.append(blood_group)
        if bank_id:
            conditions.append("s.bank_id = %s"); params.append(bank_id)
        if component_type:
            conditions.append("s.component_type = %s"); params.append(component_type)
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY b.bank_name, s.blood_group, s.component_type"
        cur.execute(query, params)
        stock = cur.fetchall()
        cur.close()
        return jsonify(stock)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/notifications", methods=['GET'])
def list_notifications():
    user = session.get('user')
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    try:
        cur = mysql.connection.cursor(DictCursor)
        if user['role'] == 'Hospital':
            cur.execute("""
                SELECT * FROM notification
                WHERE target_role = 'Hospital' AND (hospital_id = %s OR hospital_id IS NULL)
                ORDER BY created_at DESC
            """, (user.get('hospital_id'),))
        else:
            cur.execute("SELECT * FROM notification WHERE target_role = %s ORDER BY created_at DESC", (user['role'],))
        notes = cur.fetchall()
        cur.close()
        return jsonify(notes)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/notifications/<int:notification_id>/read", methods=['POST'])
def mark_notification_read(notification_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("UPDATE notification SET is_read = TRUE WHERE notification_id = %s", (notification_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({"message": "Marked as read"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/requests", methods=['GET'])
def list_requests():
    try:
        status      = request.args.get('status')
        blood_group = request.args.get('blood_group')
        user        = session.get('user')
        cur = mysql.connection.cursor(DictCursor)
        query = "SELECT r.*, h.hospital_name, h.location FROM blood_request r JOIN hospital h ON r.hospital_id = h.hospital_id"
        conditions, params = [], []
        if status:
            conditions.append("r.status = %s"); params.append(status)
        if blood_group:
            conditions.append("r.blood_group = %s"); params.append(blood_group)
        if user and user.get('role') == 'Hospital' and user.get('hospital_id'):
            conditions.append("r.hospital_id = %s"); params.append(user.get('hospital_id'))
        if conditions:
            query += " WHERE " + " AND ".join(conditions)
        query += " ORDER BY r.request_date DESC"
        cur.execute(query, params)
        requests_data = cur.fetchall()
        cur.close()
        return jsonify(requests_data)
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/requests", methods=['POST'])
def create_request():
    try:
        user = session.get('user')
        if not user:
            return jsonify({"error": "Not authenticated"}), 401
        data = request.json
        if not data:
            return jsonify({"error": "No data received"}), 400
        if user['role'] == 'Hospital':
            hospital_id = user.get('hospital_id')
            if not hospital_id:
                return jsonify({"error": "Hospital account has no linked hospital"}), 400
        elif user['role'] in ('Admin', 'Staff'):
            hospital_id = data.get('hospital_id')
            if not hospital_id:
                return jsonify({"error": "Please select a hospital"}), 400
            hospital_id = int(hospital_id)
        else:
            return jsonify({"error": "Unauthorized"}), 403
        requested_group     = data.get('blood_group')
        requested_component = data.get('component_type')
        requested_qty       = int(data.get('quantity_units', 1))
        urgency             = data.get('urgency_level')
        if not all([requested_group, requested_component, requested_qty, urgency]):
            return jsonify({"error": "Missing required fields"}), 400
        cur_check = mysql.connection.cursor(DictCursor)
        cur_check.execute("SELECT SUM(quantity_units) AS total FROM blood_stock WHERE blood_group=%s AND component_type=%s",
                          (requested_group, requested_component))
        exact_total = int((cur_check.fetchone()['total'] or 0))
        cur_check.execute("""
            SELECT component_type, SUM(quantity_units) AS total FROM blood_stock
            WHERE blood_group=%s GROUP BY component_type HAVING SUM(quantity_units)>0
        """, (requested_group,))
        available_components = cur_check.fetchall()
        cur_check.close()
        stock_warning = None
        if exact_total == 0:
            if available_components:
                available_list = ", ".join(f"{r['component_type']} ({r['total']} units)" for r in available_components)
                stock_warning = f"⚠ No {requested_group} {requested_component} in stock. Available for {requested_group}: {available_list}. Request queued for staff review."
            else:
                stock_warning = f"⚠ No {requested_group} blood of any component in stock. Request queued for staff review."
        elif exact_total < requested_qty:
            stock_warning = f"⚠ Only {exact_total} unit(s) of {requested_group} {requested_component} available but {requested_qty} requested."
        cur = mysql.connection.cursor()
        cur.execute("""
            INSERT INTO blood_request (hospital_id, blood_group, component_type, quantity_units, urgency_level, status, request_date)
            VALUES (%s,%s,%s,%s,%s,'Pending',CURDATE())
        """, (hospital_id, requested_group, requested_component, requested_qty, urgency))
        mysql.connection.commit()
        new_id = cur.lastrowid
        cur.close()
        notif_msg = f"🩸 New blood request #{new_id}: {requested_group} {requested_component} x{requested_qty} units — Urgency: {urgency}"
        create_notification('Staff', notif_msg)
        create_notification('Admin', notif_msg)
        # Also notify the hospital that submitted the request
        hospital_notif = f"✅ Your blood request #{new_id} for {requested_group} {requested_component} x{requested_qty} units has been submitted successfully."
        create_notification('Hospital', hospital_notif, hospital_id=hospital_id)
        response_body = {"message": "Request submitted successfully", "request_id": new_id}
        if stock_warning:
            response_body["warning"] = stock_warning
        return jsonify(response_body), 201
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.route("/requests/<int:request_id>", methods=["PUT", "DELETE"])
def update_request(request_id):
    user = session.get("user")
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    if request.method == "DELETE":
        try:
            cur = mysql.connection.cursor(DictCursor)
            cur.execute("SELECT * FROM blood_request WHERE request_id = %s", (request_id,))
            req = cur.fetchone()
            cur.close()
            if not req:
                return jsonify({"error": "Request not found"}), 404
            if user['role'] == 'Hospital':
                if req['hospital_id'] != user.get('hospital_id'):
                    return jsonify({"error": "You can only cancel your own requests"}), 403
                if req['status'] != 'Pending':
                    return jsonify({"error": "Only pending requests can be cancelled"}), 400
            elif user['role'] not in ('Admin', 'Staff'):
                return jsonify({"error": "Unauthorized"}), 403
            cur2 = mysql.connection.cursor()
            cur2.execute("DELETE FROM blood_request WHERE request_id = %s", (request_id,))
            mysql.connection.commit()
            cur2.close()
            create_notification('Hospital', f'Request #{request_id} has been cancelled.', hospital_id=req['hospital_id'])
            return jsonify({"message": "Request cancelled"})
        except Exception as e:
            return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500
    if user["role"] not in ("Staff", "Admin"):
        return jsonify({"error": "Only Staff or Admin can update request status"}), 403
    try:
        data       = request.json
        new_status = data.get("status")
        if new_status not in ("Fulfilled", "Rejected", "Pending"):
            return jsonify({"error": "Invalid status"}), 400
        cur = mysql.connection.cursor(DictCursor)
        cur.execute("SELECT * FROM blood_request WHERE request_id=%s", (request_id,))
        req = cur.fetchone()
        if not req:
            cur.close()
            return jsonify({"error": "Request not found"}), 404
        if req['status'] != 'Pending' and new_status != 'Pending':
            cur.close()
            return jsonify({"error": "Only Pending requests can be processed"}), 400
        if new_status == 'Fulfilled':
            requested_group     = req['blood_group']
            requested_component = req['component_type']
            qty_needed          = req['quantity_units']
            cur.execute("SELECT SUM(quantity_units) AS total FROM blood_stock WHERE blood_group=%s AND component_type=%s",
                        (requested_group, requested_component))
            available = int((cur.fetchone()['total'] or 0))
            if available == 0:
                cur.execute("""
                    SELECT component_type, SUM(quantity_units) AS total FROM blood_stock
                    WHERE blood_group=%s GROUP BY component_type HAVING SUM(quantity_units)>0
                """, (requested_group,))
                others = cur.fetchall()
                if others:
                    available_list = ", ".join(f"{r['component_type']} ({r['total']} units)" for r in others)
                    cur.execute("UPDATE blood_request SET status='Rejected' WHERE request_id=%s", (request_id,))
                    mysql.connection.commit()
                    cur.close()
                    create_notification('Hospital',
                        f"❌ Request #{request_id} rejected: No {requested_group} {requested_component} in stock. Available: {available_list}.",
                        hospital_id=req['hospital_id'])
                    return jsonify({"message": "Rejected — component mismatch",
                                    "warning": f"No {requested_group} {requested_component} in stock. Available for {requested_group}: {available_list}."}), 200
                else:
                    cur.execute("UPDATE blood_request SET status='Rejected' WHERE request_id=%s", (request_id,))
                    mysql.connection.commit()
                    cur.close()
                    create_notification('Hospital', f"❌ Request #{request_id} rejected: No {requested_group} blood in stock.", hospital_id=req['hospital_id'])
                    return jsonify({"message": "Rejected — no stock",
                                    "warning": f"No {requested_group} blood of any type is currently in stock."}), 200
            if available < qty_needed:
                cur.close()
                return jsonify({"error": f"Insufficient stock. Need {qty_needed} units of {requested_group} {requested_component} but only {available} available."}), 400
            cur2 = mysql.connection.cursor(DictCursor)
            cur2.execute("""
                SELECT stock_id, quantity_units FROM blood_stock
                WHERE blood_group=%s AND component_type=%s AND quantity_units>0
                ORDER BY quantity_units ASC
            """, (requested_group, requested_component))
            remaining = qty_needed
            for row in cur2.fetchall():
                if remaining <= 0:
                    break
                take = min(row['quantity_units'], remaining)
                new_qty = row['quantity_units'] - take
                cur2.execute("""
                    UPDATE blood_stock
                    SET quantity_units = %s,
                        status = CASE
                            WHEN %s = 0 THEN 'Out of Stock'
                            WHEN %s <= 5 THEN 'Low'
                            ELSE 'Available'
                        END
                    WHERE stock_id = %s
                """, (new_qty, new_qty, new_qty, row['stock_id']))
                remaining -= take
            cur2.close()
            cur.execute("UPDATE blood_request SET status='Fulfilled' WHERE request_id=%s", (request_id,))
            mysql.connection.commit()
            cur.close()
            create_notification('Hospital',
                f"✅ Request #{request_id} for {requested_group} {requested_component} x{qty_needed} units has been fulfilled.",
                hospital_id=req['hospital_id'])
            # Notify staff/admin about fulfillment
            staff_notif = f"✅ Request #{request_id} fulfilled: {requested_group} {requested_component} x{qty_needed} units issued to {req['hospital_name']}."
            create_notification('Staff', staff_notif)
            create_notification('Admin', staff_notif)
            return jsonify({"message": f"Request fulfilled. {qty_needed} units deducted from stock."})
        elif new_status == 'Rejected':
            cur.execute("UPDATE blood_request SET status='Rejected' WHERE request_id=%s", (request_id,))
            mysql.connection.commit()
            cur.close()
            create_notification('Hospital', f"❌ Request #{request_id} has been rejected by staff.", hospital_id=req['hospital_id'])
            # Notify staff/admin about rejection
            staff_notif = f"❌ Request #{request_id} rejected: {req['blood_group']} {req['component_type']} x{req['quantity_units']} units from {req['hospital_name']}."
            create_notification('Staff', staff_notif)
            create_notification('Admin', staff_notif)
            return jsonify({"message": "Request rejected"})
        elif new_status == 'Pending':
            if user['role'] != 'Admin':
                cur.close()
                return jsonify({"error": "Only Admins can reset to Pending"}), 403
            cur.execute("UPDATE blood_request SET status='Pending' WHERE request_id=%s", (request_id,))
            mysql.connection.commit()
            cur.close()
            return jsonify({"message": "Request reset to Pending"})
    except Exception as e:
        return jsonify({"error": str(e), "trace": traceback.format_exc()}), 500

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(debug=True)
