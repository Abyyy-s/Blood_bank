-- Blood Bank Management System Database Schema
-- Run this script to create/update all tables

-- Create Database
CREATE DATABASE IF NOT EXISTS blood_bank_db;
USE blood_bank_db;

-- Table: BLOOD_BANK
CREATE TABLE IF NOT EXISTS blood_bank (
    bank_id INT PRIMARY KEY AUTO_INCREMENT,
    bank_name VARCHAR(100) NOT NULL,
    location VARCHAR(200)
);

-- Table: HOSPITAL
CREATE TABLE IF NOT EXISTS hospital (
    hospital_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_name VARCHAR(100) NOT NULL,
    location VARCHAR(200)
);

-- Table: DONOR
CREATE TABLE IF NOT EXISTS donor (
    donor_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100),
    address TEXT,
    city VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    donor_type VARCHAR(20) DEFAULT 'Voluntary'
);

-- Table: DONOR_HEALTH
CREATE TABLE IF NOT EXISTS donor_health (
    health_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    screening_date DATE,
    bp VARCHAR(20),
    weight DECIMAL(5,2),
    disease_detected VARCHAR(255),
    eligibility_status ENUM('Eligible', 'Not Eligible') NOT NULL,
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id) ON DELETE CASCADE
);

-- Table: DONATION
CREATE TABLE IF NOT EXISTS donation (
    donation_id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    bank_id INT NOT NULL,
    screening_id INT NOT NULL,
    donation_date DATE NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    quantity_units INT NOT NULL,
    expiry_date DATE NOT NULL,
    FOREIGN KEY (donor_id) REFERENCES donor(donor_id),
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id),
    FOREIGN KEY (screening_id) REFERENCES donor_health(health_id)
);

-- Table: BLOOD_STOCK
-- now tracks component_type and expiry_date so that requests can be
-- fulfilled according to component and shelf‑life.  Each donation adds a
-- row; quantities are decremented when items are issued.  Aggregation is
-- performed by queries when displaying stock.
CREATE TABLE IF NOT EXISTS blood_stock (
    stock_id INT PRIMARY KEY AUTO_INCREMENT,
    bank_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    component_type VARCHAR(50) NOT NULL DEFAULT 'Whole Blood',
    expiry_date DATE NOT NULL,
    quantity_units INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Available',
    FOREIGN KEY (bank_id) REFERENCES blood_bank(bank_id)
);

-- Table: BLOOD_REQUEST
CREATE TABLE IF NOT EXISTS blood_request (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    component_type VARCHAR(50) NOT NULL,
    urgency_level ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL,
    quantity_units INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    request_date DATE NOT NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- Insert sample blood banks
INSERT INTO blood_bank (bank_name, location) VALUES
('City Central Blood Bank', 'Downtown, Main Street'),
('Regional Blood Center', 'North District, Park Avenue'),
('Community Blood Bank', 'East Side, Medical Center')
ON DUPLICATE KEY UPDATE bank_name=bank_name;

-- Insert sample hospitals
INSERT INTO hospital (hospital_name, location) VALUES
('City General Hospital', 'Central District'),
('St. Mary Medical Center', 'West Side'),
('Regional Emergency Hospital', 'South District')
ON DUPLICATE KEY UPDATE hospital_name=hospital_name;

-- Table: USERS
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin','Staff','Hospital') NOT NULL,
    hospital_id INT DEFAULT NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospital(hospital_id)
);

-- Insert default users (passwords hashed using werkzeug.security)
INSERT INTO users (name, email, password, role) VALUES
('Administrator','admin@lifelink.com','scrypt:32768:8:1$IzSCttlS4XqZKto4$3c094393b14ab4e88eb4fc8ed391dc67952dcc3e0c3c99a6ccd2a637e43655fc39cce5d24e754dad12c95452a18f44fd3d400ef3d78a1a6fe5d824577ac1f81b','Admin'),
('Staff Member','staff@lifelink.com','scrypt:32768:8:1$m6fhLycU176Opv8s$b7aefea931db9a240202a48ca3a2ce9cd0917a2ec71792388ef813b58f64d05ead959a2bec28bc956f021a80f3cac5c01608d37bae46bc3e791e215389fe1d44','Staff'),
('Hospital User','hospital@lifelink.com','scrypt:32768:8:1$iGGEmIeeKXpiUdeq$26bcfbe048d853ad61bdbcb4fb5da89083b31b6b8eccdcb6d184b0e52e490d675521b296e16aa434c7b82b769c6494220ffcfd357d1207110c7a95d4c72a28f8','Hospital')
ON DUPLICATE KEY UPDATE email=email;

-- Insert sample blood stock (if not exists)
INSERT IGNORE INTO blood_stock (bank_id, blood_group, quantity_units, status) VALUES
(1, 'A+', 45, 'Available'),
(1, 'A-', 12, 'Available'),
(1, 'B+', 38, 'Available'),
(1, 'B-', 8, 'Low'),
(1, 'AB+', 15, 'Available'),
(1, 'AB-', 5, 'Low'),
(1, 'O+', 52, 'Available'),
(1, 'O-', 18, 'Available'),
(2, 'A+', 32, 'Available'),
(2, 'A-', 9, 'Low'),
(2, 'B+', 28, 'Available'),
(2, 'B-', 6, 'Low'),
(2, 'AB+', 11, 'Available'),
(2, 'AB-', 4, 'Low'),
(2, 'O+', 44, 'Available'),
(2, 'O-', 14, 'Available');

-- Create trigger to update stock after donation (optional)
-- Note: when the schema includes component_type and expiry_date, the
-- UNIQUE key should be (bank_id,blood_group,component_type,expiry_date)
-- so that each donation creates a separate entry.  You may later aggregate
-- or purge expired rows as needed.
--     If you remove the trigger you must restore manual updates in the
--     POST /donations handler or the stock will not change.  Do not update
--     stock in both places or quantities will double.
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_donation_insert
AFTER INSERT ON donation
FOR EACH ROW
BEGIN
    DECLARE comp VARCHAR(50);
    DECLARE expd DATE;
    SET comp = NEW.component_type;
    SET expd = NEW.expiry_date;

    INSERT INTO blood_stock (bank_id, blood_group, component_type, expiry_date, quantity_units, status)
    SELECT 
        NEW.bank_id,
        d.blood_group,
        comp,
        expd,
        NEW.quantity_units,
        'Available'
    FROM donor d
    WHERE d.donor_id = NEW.donor_id
    ON DUPLICATE KEY UPDATE 
        quantity_units = quantity_units + NEW.quantity_units,
        status = CASE 
            WHEN quantity_units + NEW.quantity_units < 10 THEN 'Low'
            ELSE 'Available'
        END;
END//
DELIMITER ;

SELECT 'Database schema created/updated successfully!' as Status;
