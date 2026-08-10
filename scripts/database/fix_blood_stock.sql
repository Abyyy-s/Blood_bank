-- Fix blood_stock table
USE blood_bank_db;

-- Add missing columns
ALTER TABLE blood_stock ADD COLUMN component_type VARCHAR(50) NOT NULL DEFAULT 'Whole Blood';
ALTER TABLE blood_stock ADD COLUMN expiry_date DATE NOT NULL DEFAULT CURDATE();

-- Clear old data and insert proper sample data
DELETE FROM blood_stock;

INSERT INTO blood_stock (bank_id, blood_group, component_type, expiry_date, quantity_units, status) VALUES
(1, 'A+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 45, 'Available'),
(1, 'A-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 12, 'Available'),
(1, 'B+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 38, 'Available'),
(1, 'B-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 8, 'Low'),
(1, 'AB+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 15, 'Available'),
(1, 'AB-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 5, 'Low'),
(1, 'O+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 52, 'Available'),
(1, 'O-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 18, 'Available'),
(2, 'A+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 32, 'Available'),
(2, 'A-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 9, 'Low'),
(2, 'B+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 28, 'Available'),
(2, 'B-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 6, 'Low'),
(2, 'AB+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 11, 'Available'),
(2, 'AB-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 4, 'Low'),
(2, 'O+', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 44, 'Available'),
(2, 'O-', 'Whole Blood', DATE_ADD(CURDATE(), INTERVAL 35 DAY), 14, 'Available');

SELECT 'Blood stock table fixed!' as Status;