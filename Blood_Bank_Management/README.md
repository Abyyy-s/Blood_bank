# Life Link — Blood Bank Management System

A web-based platform for managing blood donations, inventory, and hospital blood requests. Built as a Database Systems (DBS) mini project using Python Flask and MySQL.

---

## What it does

Hospitals and blood banks currently track donations on paper, with no way to check stock levels in real time or coordinate requests digitally. Life Link replaces that with a single web application where:

- Staff register donors and record health screenings before donations
- Donations are recorded against a blood bank — stock updates automatically
- Hospitals submit blood requests and track their status
- Staff fulfill or reject requests — stock decrements the moment a request is fulfilled
- Everyone sees the same data, in real time

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3, Flask |
| Database | MySQL 8.0 |
| DB Connector | Flask-MySQLdb (DictCursor) |
| Auth | Flask Session + Werkzeug password hashing |
| CORS | Flask-CORS |

---

## Prerequisites

- Python 3.8+
- MySQL 8.0
- pip

---

## Getting started

**1. Clone the repo**
```bash
git clone https://github.com/krishna0743/lifelink-blood-bank.git
cd lifelink-blood-bank
```

**2. Install dependencies**
```bash
pip install flask flask-mysqldb flask-cors werkzeug
```

**3. Set up the database**

Open MySQL Workbench (or the MySQL CLI) and run:
```sql
CREATE DATABASE blood_bank_db;
USE blood_bank_db;
```

Then run the schema file:
```bash
mysql -u root -p blood_bank_db < database_schema.sql
```

**4. Configure the database connection**

Open `app.py` and update these lines with your MySQL credentials:
```python
app.config['MYSQL_HOST']     = 'localhost'
app.config['MYSQL_USER']     = 'root'
app.config['MYSQL_PASSWORD'] = 'your_password'
app.config['MYSQL_DB']       = 'blood_bank_db'
```

**5. Run the app**
```bash
python app.py
```

Visit `http://127.0.0.1:5000` in your browser.

---

## Default login credentials

| Role | Email | 
|---|---|---|
| Admin | admin@lifelink.com | 
| Staff | staff@lifelink.com | 
| Hospital | hospital@lifelink.com | 

---

## Project structure

```
lifelink-blood-bank/
├── app.py                  # Flask application — all routes and business logic
├── schema.sql              # Database schema and seed data
├── static/
│   ├── index.html          # Dashboard
│   ├── donors.html         # Donor management
│   ├── donor_health.html   # Health screening
│   ├── donations.html      # Donation recording
│   ├── stock.html          # Blood stock inventory
│   ├── requests.html       # Blood requests (hospital portal)
│   ├── hospitals.html      # Hospital and blood bank management
│   ├── notifications.html  # Notification centre
│   ├── login.html
│   ├── profile.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── dashboard.js
│       ├── donors.js
│       ├── health.js
│       ├── donations.js
│       ├── stock.js
│       ├── requests.js
│       ├── hospitals.js
│       ├── notifications.js
│       ├── sidebar.js
│       └── auth.js
└── README.md
```

---

## Database schema

The database `blood_bank_db` has 8 tables. Every table has a single responsibility and connects to others through foreign keys.

```
donor ──────────────── donor_health
  │                         │
  │                         │ (screening_id)
  └──────── donation ────────┘
                │
                ├──── blood_bank ──── blood_stock
                │
hospital ─── blood_request
    │
  users (Hospital role)
```

### Tables

| Table | Primary Key | Purpose |
|---|---|---|
| `donor` | `donor_id` | Donor personal details — root entity |
| `donor_health` | `health_id` | Health screening per donor (weak entity) |
| `donation` | `donation_id` | Individual donation records |
| `blood_bank` | `bank_id` | Registered blood banks |
| `blood_stock` | `stock_id` | Real-time inventory per bank, blood group, component |
| `blood_request` | `request_id` | Hospital blood requests |
| `hospital` | `hospital_id` | Registered hospitals |
| `users` | `id` | Login accounts (Admin / Staff / Hospital) |

**Key constraint:**
`blood_stock` has a `UNIQUE KEY (bank_id, blood_group, component_type)` — one row per combination. Stock is updated using `ON DUPLICATE KEY UPDATE` rather than separate insert/update logic.

---

## How stock stays accurate

Stock is never edited directly. It changes in exactly two places:

1. **Donation recorded** → Flask runs `ON DUPLICATE KEY UPDATE` on `blood_stock`, adding the donated units
2. **Request fulfilled** → Flask deducts the requested quantity from `blood_stock` and recalculates the status

```sql
-- On donation
INSERT INTO blood_stock (bank_id, blood_group, component_type, quantity_units, status)
VALUES (%s, %s, %s, %s, ...)
ON DUPLICATE KEY UPDATE
    quantity_units = quantity_units + VALUES(quantity_units),
    status = CASE
        WHEN quantity_units + VALUES(quantity_units) = 0 THEN 'Out of Stock'
        WHEN quantity_units + VALUES(quantity_units) <= 5 THEN 'Low'
        ELSE 'Available' END;
```

---

## User roles

| Role | What they can do |
|---|---|
| **Admin** | Everything — donors, screenings, donations, stock, requests, hospitals, blood banks, user management |
| **Staff** | Donors, screenings, donations, stock, requests (fulfill/reject) |
| **Hospital** | Submit blood requests, track their own requests, view notifications |

Role is enforced server-side. Flask reads `session['user']['role']` on every protected route. Hospital users can only see their own requests — the backend filters by `session hospital_id` automatically.

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Login and create session |
| `GET` | `/logout` | Clear session |
| `GET` | `/api/me` | Current user from session |
| `GET` | `/dashboard` | Aggregate stats — donor count, donations, pending requests, stock by group |
| `GET/POST` | `/donors` | List all donors / register new donor |
| `GET/PUT/DELETE` | `/donors/<id>` | Get, update, or delete donor |
| `GET/POST` | `/donor_health` | List screenings / record new screening |
| `GET/POST` | `/donations` | List donations / record donation (also updates stock) |
| `GET` | `/stock` | Blood stock with optional `blood_group`, `component_type`, `bank_id` filters |
| `GET/POST` | `/requests` | List requests / submit new request |
| `PUT/DELETE` | `/requests/<id>` | Fulfill or reject (also updates stock) / cancel |
| `GET/POST` | `/hospitals` | List hospitals / add hospital |
| `DELETE` | `/hospitals/<id>` | Delete hospital |
| `GET/POST` | `/blood_banks` | List banks / add bank |
| `DELETE` | `/blood_banks/<id>` | Delete bank |
| `GET` | `/notifications` | Role-filtered notifications |
| `POST` | `/notifications/<id>/read` | Mark notification as read |
| `GET` | `/api/profile` | Full profile for current user |

---

## Component expiry rules

When a donation is recorded, the expiry date is calculated automatically:

| Component | Shelf Life |
|---|---|
| Whole Blood | 35 days |
| RBC | 42 days |
| Platelets | 5 days |
| Plasma | 365 days |




