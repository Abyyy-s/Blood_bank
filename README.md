# Life Link — Blood Bank Management System

A full-stack blood bank management system for managing donors, donations, blood inventory, hospital requests, notifications, and role-based access.

Built with **Python, Flask, MySQL, HTML, CSS, and Vanilla JavaScript**.

## ✨ Features

- 👤 Donor registration and management
- 🩸 Donation recording with component expiry tracking
- 📦 Blood stock and inventory management
- 🏥 Hospital registration and blood requests
- 🔔 Role-aware notifications
- 🔐 Admin, Staff, and Hospital roles
- 📊 Dashboard with operational statistics
- 🧪 Donor health-screening records
- 🔎 Search, filtering, and request management
- 🗄️ MySQL database with relational constraints

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Python 3, Flask |
| Database | MySQL 8 |
| Database driver | Flask-MySQLdb |
| Authentication | Flask sessions + Werkzeug password hashing |
| Cross-origin support | Flask-CORS |

## 📁 Project Structure

```text
Blood_bank/
├── app.py
├── requirements.txt
├── database_schema.sql
├── .env.example
├── .gitignore
│
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── donations.js
│   │   ├── donor_health.js
│   │   ├── donors.js
│   │   ├── hospitals.js
│   │   ├── notifications.js
│   │   ├── profile.js
│   │   ├── requests.js
│   │   ├── settings.js
│   │   ├── sidebar.js
│   │   └── stock.js
│   └── *.html
│
├── docs/
│   ├── PROJECT_SUMMARY.md
│   ├── FINAL_SUMMARY.md
│   └── TROUBLESHOOTING.md
│
└── scripts/
    ├── database/
    │   ├── complete_database_fix.sql
    │   ├── fix_blood_stock.sql
    │   ├── fix_donation_constraint.sql
    │   └── fix_gender_column.sql
    └── diagnostics/
        ├── check_db.py
        ├── check_notifications.py
        └── fix_db.py
```

## 🚀 Getting Started

### 1. Prerequisites

- Python 3.8+
- MySQL 8.0+
- pip

### 2. Clone the repository

```bash
git clone https://github.com/Abyyy-s/Blood_bank.git
cd Blood_bank
```

### 3. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate       # Linux/macOS
# venv\Scripts\activate      # Windows
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure MySQL

Create the database and apply the schema:

```bash
mysql -u root -p -e "CREATE DATABASE blood_bank_db;"
mysql -u root -p blood_bank_db < database_schema.sql
```

Configure the MySQL connection in your local environment before running the application. **Do not commit database passwords or other secrets to Git.**

### 6. Run the application

```bash
python app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## 👥 User Roles

| Role | Access |
|---|---|
| **Admin** | Full system administration and management |
| **Staff** | Donors, screenings, donations, inventory, and requests |
| **Hospital** | Submit and track blood requests and view notifications |

Access to protected operations is enforced by the Flask backend using the authenticated session role.

## 🗄️ Database

The main schema contains entities for:

- Users
- Donors
- Donor health screenings
- Donations
- Blood banks
- Blood stock
- Hospitals
- Blood requests
- Notifications

Blood stock is linked to a blood bank, blood group, and component type so inventory can be tracked at the appropriate level of detail.

## 🩸 Component Expiry

| Component | Shelf life |
|---|---:|
| Whole Blood | 35 days |
| RBC | 42 days |
| Platelets | 5 days |
| Plasma | 365 days |

## 🛠️ Development Notes

The `docs/` directory contains project documentation and troubleshooting notes. The `scripts/` directory contains database repair/migration utilities and diagnostic scripts used during development.

For a clean setup, use `database_schema.sql` first. The scripts under `scripts/database/` are historical repair utilities and should only be run when their specific migration/fix is required.

## 🔒 Security

Never commit real credentials, API keys, session secrets, or production database passwords. Use environment variables or a local `.env` file for development secrets, and keep `.env` ignored by Git.

## 📌 Project Status

This project is a functional academic database/web application and is intended for learning, demonstration, and further development. Production deployment would require additional hardening such as stronger secret management, HTTPS, CSRF protection, rate limiting, and deployment-specific configuration.

## 📄 License

No license has currently been specified for this repository.